# StadiumMind — Smart Stadium & Tournament Ops (FIFA World Cup 2026)

**🔴 Live demo:** https://stadiummind-production.up.railway.app

GenAI-powered fan assistant + ops command center + safety incident responder, built on top of a simulated live data feed (no hardware needed). Backend and dashboard run as a single service — one process, one URL.

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

1. Set `PROVIDER` to `mock` or `groq`.
2. Paste your key into `GROQ_API_KEY=`.
3. Set `MODEL=llama-3.3-70b-versatile`.

That's it — nothing in the Python code needs to change.

**`PROVIDER=mock`** costs $0 and needs no key at all — it returns smart, route-aware canned answers using your live simulated data. Good default for coding and even for a live demo if you want zero risk.

**`PROVIDER=groq`** is free, no card, very fast (Llama 3.3 70B). Get a key at https://console.groq.com.

## 3. Run it — locally, one command

```bash
uvicorn main:app
```

Open **http://localhost:8000/** — this single URL serves both the API and the full dashboard (`stadiummind-dashboard.html`), with the AI assistant chat and incident simulator wired live to the backend.

The public, multilingual fan portal is available at **http://localhost:8000/fan**. It connects directly to `/fan/chat` and lets visitors provide a nearby gate for queue-aware recommendations.

Check the API directly if needed:

```bash
curl http://localhost:8000/health
```

## Quality checks

Run the automated API and simulator tests with the free mock provider:

```bash
PROVIDER=mock pytest -v
```

Every push and pull request to `main` also runs this suite through GitHub Actions.
The dashboard includes keyboard-accessible controls, a skip link, live-region announcements,
an accessible incident dialog, reduced-motion support, and response security headers.

## Deploying to Railway

Railway redeploys automatically after a successful push to `main`. In Railway's service
variables, set `PROVIDER` and the matching provider API key (or use `mock`), then set
`ALLOWED_ORIGINS` to your public Railway URL. Keep `.env` out of Git.

## Project layout

| File | Purpose |
|---|---|
| `main.py` | FastAPI backend + serves the dashboard at `/` |
| `llm_client.py` | Single `ask_llm()` wrapper — swap providers via `.env`, caches repeat questions |
| `simulator.py` | Fakes live gate/queue/incident data with a background thread |
| `stadiummind-dashboard.html` | 3D ops dashboard (served directly by FastAPI, same origin) |
| `data/stadium_kb.json` | Static gate/amenity/FAQ knowledge base |
| `.env.example` | Copy to `.env` and fill in — the only file with secrets |

## Cost-control features already built in

- In-memory cache — identical questions are never billed twice
- Cheap model + `MAX_TOKENS=250` by default
- The LLM only ever explains/summarizes data Python already computed — it's never asked to "fetch" anything, so prompts stay short
