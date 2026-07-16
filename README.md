# StadiumMind — Smart Stadium & Tournament Ops (FIFA World Cup 2026)

**🔴 Live demo:** https://stadiummind-production.up.railway.app

GenAI-powered fan assistant + ops command center + safety incident responder,
built on top of a simulated live data feed (no hardware needed). Backend and
dashboard run as a single service — one process, one URL.

## 1. Install

```bash
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip3 install -r requirements.txt
```

## 2. Add your API key (only file you touch)

```bash
cp .env.example .env
```

Open `.env` and:
1. Set `PROVIDER` to `mock`, `anthropic`, `gemini`, or `groq`.
2. Paste your key into the matching line (`ANTHROPIC_API_KEY=`, `GEMINI_API_KEY=`, or `GROQ_API_KEY=`).
3. If using Gemini, also set `MODEL=gemini-flash-latest`. If using Groq, set `MODEL=llama-3.3-70b-versatile`.

That's it — nothing in the Python code needs to change.

**`PROVIDER=mock`** costs $0 and needs no key at all — it returns smart,
route-aware canned answers using your live simulated data. Good default for
coding and even for a live demo if you want zero risk.

**`PROVIDER=groq`** is free, no card, very fast (Llama 3.3 70B).
Get a key at https://console.groq.com.

**`PROVIDER=gemini`** is a free, permanent no-card option too.
Get a key at https://aistudio.google.com.

**`PROVIDER=anthropic`** uses Claude directly. New accounts get free trial
credit at https://platform.claude.com — at Haiku pricing a full demo day
costs well under $1.

## 3. Run it — locally, one command

```bash
uvicorn main:app
```

Open **http://localhost:8000/** — this single URL serves both the API and
the full dashboard (`stadiummind-dashboard.html`), with the AI assistant
chat and incident simulator wired live to the backend.

Check the API directly if needed:
```bash
curl http://localhost:8000/health
```

A lighter Streamlit dashboard is also included for reference:
```bash
streamlit run ops_dashboard.py
```

## 4. Deployment

**Host: [Railway](https://railway.app)** (free tier, no card required)

Live at: **https://stadiummind-production.up.railway.app**

Deployed straight from this GitHub repo. Environment variables are set in
the Railway service's **Variables** tab (not committed to the repo):
```
PROVIDER=groq
GROQ_API_KEY=your-key
MODEL=llama-3.3-70b-versatile
MAX_TOKENS=250
```

Note: after changing any variable in Railway, the service needs a manual
**Redeploy** (Deployments tab → ⋮ → Redeploy) before the new value takes
effect — env vars are only read on process startup.

To verify the live deployment is running on the intended provider:
```bash
curl https://stadiummind-production.up.railway.app/health
```
should return `{"status":"ok","provider":"groq"}`.

## Project layout

```
main.py                      FastAPI backend + serves the dashboard at "/"
llm_client.py                 Single ask_llm() wrapper — swap providers via .env, caches repeat questions
simulator.py                  Fakes live gate/queue/incident data with a background thread
stadiummind-dashboard.html    3D ops dashboard (served directly by FastAPI, same origin)
ops_dashboard.py              Streamlit dashboard (lightweight alternative UI)
data/stadium_kb.json          Static gate/amenity/FAQ knowledge base
.env.example                  Copy to .env and fill in — the only file with secrets
```

## Cost-control features already built in

- In-memory cache — identical questions are never billed twice
- Cheap model + `MAX_TOKENS=250` by default
- The LLM only ever explains/summarizes data Python already computed —
  it's never asked to "fetch" anything, so prompts stay short
