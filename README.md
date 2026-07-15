# StadiumMind — Smart Stadium & Tournament Ops (FIFA World Cup 2026)

GenAI-powered fan assistant + ops command center + safety incident responder,
built on top of a simulated live data feed (no hardware needed).

## 1. Install

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Add your API key (only file you touch)

```bash
cp .env.example .env
```

Open `.env` and:
1. Set `PROVIDER` to `mock`, `anthropic`, `gemini`, or `groq`.
2. Paste your key into the matching line (`ANTHROPIC_API_KEY=`, `GEMINI_API_KEY=`, or `GROQ_API_KEY=`).

That's it — nothing in the Python code needs to change.

**`PROVIDER=mock`** costs $0 and needs no key at all — it returns smart,
route-aware canned answers using your live simulated data. Good default for
coding and even for a live demo if you want zero risk.

**`PROVIDER=gemini`** is the best free *live* option: Google AI Studio gives
a permanent free tier, no card needed. Get a key at https://aistudio.google.com.

**`PROVIDER=groq`** is free, no card, very fast (Llama 3.3 70B).
Get a key at https://console.groq.com.

**`PROVIDER=anthropic`** uses Claude directly. New accounts get free trial
credit at https://platform.claude.com — at Haiku pricing a full demo day
costs well under $1.

## 3. Run it

Backend:
```bash
uvicorn main:app --reload
```

Dashboard (in a second terminal):
```bash
streamlit run ops_dashboard.py
```

Backend runs at http://localhost:8000, dashboard opens automatically in your browser.

## Project layout

```
main.py            FastAPI backend: /fan/chat, /ops/query, /ops/status, /safety/trigger_incident
llm_client.py       Single ask_llm() wrapper — swap providers via .env, caches repeat questions
simulator.py        Fakes live gate/queue/incident data with a background thread
ops_dashboard.py    Streamlit ops command center UI
data/stadium_kb.json  Static gate/amenity/FAQ knowledge base
.env.example        Copy to .env and fill in — the only file with secrets
```

## Cost-control features already built in

- In-memory cache — identical questions are never billed twice
- Cheap model + `MAX_TOKENS=250` by default
- The LLM only ever explains/summarizes data Python already computed —
  it's never asked to "fetch" anything, so prompts stay short
