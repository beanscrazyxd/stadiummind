import json
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llm_client import ask_llm
from simulator import live_state, start_simulator, trigger_incident

app = FastAPI(title="StadiumMind")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

KB_PATH = Path(__file__).parent / "data" / "stadium_kb.json"
KB = json.loads(KB_PATH.read_text())


@app.on_event("startup")
def startup():
    start_simulator()


# ---------- helpers (plain Python does the "fetching", LLM only explains) ----------

def find_shortest_queue(amenity_type: str, near_gate: str | None = None):
    candidates = [a for a in KB["amenities"] if a["type"] == amenity_type]
    if near_gate:
        candidates.sort(key=lambda a: 0 if a["near_gate"] == near_gate else 1)
    best = min(candidates, key=lambda a: live_state["amenities"].get(a["id"], {}).get("queue_minutes", 99))
    wait = live_state["amenities"].get(best["id"], {}).get("queue_minutes", "?")
    return best, wait


def ops_summary_text():
    lines = []
    for g in KB["gates"]:
        s = live_state["gates"].get(g["id"], {})
        lines.append(f"Gate {g['id']} ({g['zone']}): {s.get('density_pct')}% capacity, {s.get('queue_minutes')} min queue")
    for a in KB["amenities"]:
        s = live_state["amenities"].get(a["id"])
        if s:
            lines.append(f"{a['name']}: {s.get('queue_minutes')} min queue")
    if live_state["incidents"]:
        lines.append(f"Recent incident: {live_state['incidents'][0]}")
    return "\n".join(lines)


# ---------- Fan assistant ----------

class FanChatRequest(BaseModel):
    message: str
    seat_gate: str | None = None
    language: str = "English"


@app.post("/fan/chat")
def fan_chat(req: FanChatRequest):
    restroom, restroom_wait = find_shortest_queue("restroom", req.seat_gate)
    food, food_wait = find_shortest_queue("food", req.seat_gate)

    context = (
        f"Nearest restroom with shortest wait: {restroom['name']} ({restroom_wait} min).\n"
        f"Nearest food with shortest wait: {food['name']} ({food_wait} min).\n"
        f"FAQs: {json.dumps(KB['faqs'])}"
    )
    system_prompt = (
        f"You are a friendly stadium assistant for the FIFA World Cup 2026. "
        f"Answer briefly (2-3 sentences) in {req.language}. "
        f"Use the live data below when relevant, otherwise use the FAQs. "
        f"Data:\n{context}"
    )
    answer = ask_llm(system_prompt, req.message)
    return {"answer": answer}


# ---------- Ops command center ----------

@app.get("/ops/status")
def ops_status():
    return live_state


class OpsQueryRequest(BaseModel):
    question: str


@app.post("/ops/query")
def ops_query(req: OpsQueryRequest):
    system_prompt = (
        "You are an operations assistant for stadium staff during the FIFA World Cup 2026. "
        "Given the live metrics below, answer the staff member's question concisely and, "
        "if relevant, recommend one concrete action (e.g. reroute staff, open another lane). "
        f"Live data:\n{ops_summary_text()}"
    )
    answer = ask_llm(system_prompt, req.question)
    return {"answer": answer}


# ---------- Safety layer ----------

class IncidentRequest(BaseModel):
    location: str  # gate id, e.g. "C"
    incident_type: str  # e.g. "overcrowding", "medical", "security"


@app.post("/safety/trigger_incident")
def safety_trigger(req: IncidentRequest):
    incident = trigger_incident(req.location, req.incident_type)
    system_prompt = (
        "You are a stadium safety coordinator. An incident has just been flagged. "
        "In under 100 words: 1) summarize the situation in plain language, "
        "2) give a short numbered response checklist (nearest medical/security resource, "
        "crowd redirection). Be calm and directive."
    )
    user_prompt = f"Incident: {json.dumps(incident)}\nCurrent gate data: {live_state['gates'].get(req.location)}"
    answer = ask_llm(system_prompt, user_prompt)
    return {"incident": incident, "response_plan": answer}


@app.get("/health")
def health():
    return {"status": "ok", "provider": os.getenv("PROVIDER", "mock")}
