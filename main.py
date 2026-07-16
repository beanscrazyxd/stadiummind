import json
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from llm_client import ask_llm
from simulator import live_state, start_simulator, trigger_incident

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("stadiummind")

@asynccontextmanager
async def lifespan(_: FastAPI):
    """Start the simulated live-data feed exactly once per application process."""
    start_simulator()
    logger.info("StadiumMind started. provider=%s", os.getenv("PROVIDER", "mock"))
    yield


app = FastAPI(title="StadiumMind", lifespan=lifespan)
_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000")
ALLOWED_ORIGINS = [origin.strip() for origin in _origins_env.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

KB_PATH = Path(__file__).parent / "data" / "stadium_kb.json"
KB = json.loads(KB_PATH.read_text())
MAX_MESSAGE_LEN = 500


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add browser protections to every response without exposing application internals."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'; "
        "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; "
        "font-src 'self' https://fonts.gstatic.com; "
        "connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'self'"
    )
    return response


# ---------- helpers (plain Python does the "fetching", LLM only explains) ----------

def find_shortest_queue(amenity_type: str, near_gate: Optional[str] = None):
    """Select the shortest amenity queue, preferring the visitor's gate when supplied."""
    candidates = [a for a in KB["amenities"] if a["type"] == amenity_type]
    if not candidates:
        raise HTTPException(status_code=404, detail=f"No amenities of type '{amenity_type}'")
    if near_gate:
        candidates.sort(key=lambda a: 0 if a["near_gate"] == near_gate else 1)
    best = min(candidates, key=lambda a: live_state["amenities"].get(a["id"], {}).get("queue_minutes", 99))
    wait = live_state["amenities"].get(best["id"], {}).get("queue_minutes", "?")
    return best, wait


def ops_summary_text() -> str:
    """Build the compact, current operations context used by the LLM."""
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


def safe_ask_llm(system_prompt: str, user_prompt: str) -> str:
    """Translate provider failures into a safe, user-facing HTTP response."""
    try:
        return ask_llm(system_prompt, user_prompt)
    except Exception as exc:
        logger.exception("LLM call failed")
        raise HTTPException(
            status_code=503,
            detail="AI assistant is temporarily unavailable. Please try again shortly.",
        ) from exc


# ---------- Fan assistant ----------

class FanChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LEN)
    seat_gate: Optional[str] = Field(default=None, max_length=10)
    language: str = Field(default="English", max_length=30)


@app.post("/fan/chat")
@limiter.limit("15/minute")
def fan_chat(request: Request, req: FanChatRequest):
    """Answer a fan request using live queues and the stadium knowledge base."""
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
    answer = safe_ask_llm(system_prompt, req.message)
    return {"answer": answer}


# ---------- Ops command center ----------

@app.get("/ops/status")
@limiter.limit("60/minute")
def ops_status(request: Request):
    """Return the current simulated stadium telemetry."""
    return live_state


class OpsQueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LEN)


@app.post("/ops/query")
@limiter.limit("15/minute")
def ops_query(request: Request, req: OpsQueryRequest):
    """Provide a concise, action-oriented answer for operations staff."""
    system_prompt = (
        "You are an operations assistant for stadium staff during the FIFA World Cup 2026. "
        "Given the live metrics below, answer the staff member's question concisely and, "
        "if relevant, recommend one concrete action (e.g. reroute staff, open another lane). "
        f"Live data:\n{ops_summary_text()}"
    )
    answer = safe_ask_llm(system_prompt, req.question)
    return {"answer": answer}


# ---------- Safety layer ----------

VALID_INCIDENT_TYPES = {"overcrowding", "medical", "security"}
VALID_GATES = {gate["id"] for gate in KB["gates"]}


class IncidentRequest(BaseModel):
    location: str = Field(..., min_length=1, max_length=10)
    incident_type: str = Field(..., min_length=1, max_length=30)


@app.post("/safety/trigger_incident")
@limiter.limit("10/minute")
def safety_trigger(request: Request, req: IncidentRequest):
    """Create a demo incident and return a concise incident-response plan."""
    if req.location not in VALID_GATES:
        raise HTTPException(status_code=400, detail=f"Unknown gate '{req.location}'")
    if req.incident_type not in VALID_INCIDENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unknown incident_type '{req.incident_type}'")
    incident = trigger_incident(req.location, req.incident_type)
    system_prompt = (
        "You are a stadium safety coordinator. An incident has just been flagged. "
        "In under 100 words: 1) summarize the situation in plain language, "
        "2) give a short numbered response checklist (nearest medical/security resource, "
        "crowd redirection). Be calm and directive."
    )
    user_prompt = f"Incident: {json.dumps(incident)}\nCurrent gate data: {live_state['gates'].get(req.location)}"
    answer = safe_ask_llm(system_prompt, user_prompt)
    logger.info("Incident triggered: gate=%s type=%s", req.location, req.incident_type)
    return {"incident": incident, "response_plan": answer}

@app.get("/")
def serve_dashboard():
    """Serve the operations command center."""
    return FileResponse(Path(__file__).parent / "stadiummind-dashboard.html")


@app.get("/fan")
def serve_fan_portal():
    """Serve the public fan-assistant portal."""
    return FileResponse(Path(__file__).parent / "fan.html")

@app.get("/health")
def health():
    """Provide a minimal health probe for Railway and uptime monitors."""
    return {"status": "ok", "provider": os.getenv("PROVIDER", "mock")}
