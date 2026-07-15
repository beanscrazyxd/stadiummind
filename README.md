# StadiumMind — Premium AI Operations Dashboard

A premium AI-powered operations command center for major sporting events (FIFA World Cup, Olympics, ICC tournaments).

**Monitors:** gates, crowd density, queues, incidents, amenities  
**Provides:** real-time data + AI recommendations via premium React dashboard

---

## 🚀 Quick Start

### Backend Setup (Terminal 1)

```bash
# Install & activate Python environment
cd stadiummind
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Add your API key (only file you touch)
cp .env.example .env
# Open .env and set PROVIDER + API key (see Provider Options below)

# Run backend
uvicorn main:app --reload
```

Backend runs at: **http://localhost:8000**

### Frontend Setup (Terminal 2)

```bash
# Install dependencies
cd stadiummind-frontend
pnpm install
# or: npm install

# Add backend URL
# Create .env.local with:
echo "VITE_BACKEND_URL=http://localhost:8000" > .env.local

# Run frontend
pnpm dev
# or: npm run dev
```

Dashboard opens at: **http://localhost:3000**

### Both Running ✓

```
Backend:  http://localhost:8000 ✓
Frontend: http://localhost:3000 ✓
```

Open http://localhost:3000 in your browser and start monitoring.

---

## 🔑 Provider Options

| Provider | Cost | API Key | Best For |
|----------|------|---------|----------|
| **mock** | $0 | None | Testing, coding, live demos (zero risk) |
| **gemini** | Free | [Get here](https://aistudio.google.com) | Live demos, production |
| **groq** | Free | [Get here](https://console.groq.com) | Fast responses, production |
| **anthropic** | ~$1/demo | [Get here](https://platform.claude.com) | Best quality, production |

**Setup:** Copy your API key to `.env`:
```
PROVIDER=gemini
GEMINI_API_KEY=your_key_here
```

---

## 📁 Project Layout

### Backend (`stadiummind/`)

| File | Purpose |
|------|---------|
| `main.py` | FastAPI backend with endpoints: `/ops/status`, `/ops/query`, `/safety/trigger_incident`, `/health` |
| `llm_client.py` | Single `ask_llm()` wrapper — swap providers via `.env`, caches repeat questions |
| `simulator.py` | Fakes live gate/queue/incident data with background thread |
| `ops_dashboard.py` | Original Streamlit UI (optional) — run with: `streamlit run ops_dashboard.py` |
| `data/stadium_kb.json` | Static gate/amenity/FAQ knowledge base |
| `.env.example` | Copy to `.env` and fill in — only file with secrets |

### Frontend (`stadiummind-frontend/`)

| File | Purpose |
|------|---------|
| `client/src/components/` | Reusable UI components |
| `client/src/pages/` | Page components |
| `client/src/hooks/useOpsData.ts` | Custom hook for API calls |
| `client/src/App.tsx` | Main app component |
| `client/src/index.css` | Global styles + premium animations |
| `package.json` | Dependencies: React 19, Tailwind CSS 4, Framer Motion, Lucide Icons |
| `.env.local` | Backend URL configuration |

---

## 💰 Cost-Control Features

Already built in:

- **In-memory cache** — identical questions never billed twice
- **Cheap model + MAX_TOKENS=250** by default
- **LLM only explains/summarizes** data Python already computed (never asked to "fetch")

**Result:** Full demo day costs under $1 even with paid providers

---

## ✨ Dashboard Features

### Real-Time Monitoring
- Gate Status Cards — Live capacity %, queue times, crowd density
- Color-Coded Alerts — Green (normal), Yellow (caution), Red (critical)
- Amenities Dashboard — Restroom, food court, medical station queues
- Incident Timeline — Recent incidents with timestamps

### AI Assistant
- Ask questions about gate status, queue times, incidents
- Get AI-powered recommendations for staff deployment
- ChatGPT Enterprise-style interface with message history

### Incident Simulator
- Trigger demo incidents to test response workflows
- Simulate overcrowding, medical emergencies, security issues
- View AI-generated response plans

### Premium Design
- Apple + FIFA + Linear aesthetic
- White background with #0057FF blue gradients
- Emerald accents for success states
- Glassmorphism effects with soft shadows
- Large border radius (20-24px) for premium feel
- Smooth animations and micro-interactions

---

## 🔌 API Endpoints

### GET `/health`
```json
{"status": "ok"}
```

### GET `/ops/status`
Returns: live gate, amenity, incident data

### POST `/ops/query`
```json
{
  "question": "What's the status at Gate C?"
}
```
Returns: AI-powered answer

### POST `/safety/trigger_incident`
```json
{
  "location": "C",
  "incident_type": "overcrowding"
}
```
Returns: incident details + AI response plan

---

## 🐛 Troubleshooting

### Backend Issues

**Backend won't start:**
```bash
python --version              # Need 3.8+
lsof -i :8000                 # Check if port is free
kill -9 <PID>                 # Kill process using port
uvicorn main:app --port 8001  # Try different port
```

**API key not working:**
- Double-check key from provider (no extra spaces)
- Verify PROVIDER name matches key name in `.env`
- Try `PROVIDER=mock` first to test setup
- Check key hasn't expired

**No data showing:**
- Wait 5 seconds for simulator to generate data
- Check backend logs in terminal

### Frontend Issues

**Frontend won't connect:**
```bash
curl http://localhost:8000/health          # Verify backend is running
cat .env.local                              # Check backend URL
pnpm dev                                    # Restart frontend
```

**Port 3000 already in use:**
```bash
kill -9 $(lsof -t -i :3000)                # Kill process
pnpm dev -- --port 3001                    # Use different port
```

**Dependencies not installing:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**No data on dashboard:**
- Check browser console (F12 → Console)
- Check Network tab (F12 → Network) for API errors
- Verify backend: `curl http://localhost:8000/ops/status`

---

## 🚢 Production Deployment

### Frontend Build
```bash
cd stadiummind-frontend
pnpm build
# Output: dist/public/
```

Deploy to: Netlify, Vercel, AWS S3 + CloudFront, or any static host

### Backend Deployment
```bash
cd stadiummind
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

Deploy to: Heroku, Railway, AWS EC2, DigitalOcean, or any Python hosting

---

## 🛠 Tech Stack

**Frontend:**
- React 19 — UI framework
- Tailwind CSS 4 — Styling
- Framer Motion — Animations
- Lucide Icons — Icon library
- Vite — Build tool
- TypeScript — Type safety

**Backend:**
- FastAPI — Web framework
- Python 3.8+ — Language
- Uvicorn — ASGI server
- Pydantic — Data validation
- LLM APIs — Gemini, Groq, Claude, etc.

---

## 📋 Next Steps

Recommended enhancements:
- [ ] Add real stadium data integration
- [ ] Set up alert thresholds and notifications
- [ ] Add user authentication
- [ ] Create incident history dashboard
- [ ] Deploy to production
- [ ] Build mobile app

---

## 💬 Support

For issues:
1. Check **Troubleshooting** section above
2. Review backend logs in terminal
3. Check browser console (F12 → Console)
4. Verify `.env` and `.env.local` files are correct

**Common commands:**
```bash
curl http://localhost:8000/health           # Check backend
curl http://localhost:8000/ops/status       # Check ops data
kill -9 $(lsof -t -i :8000)                 # Kill port 8000
kill -9 $(lsof -t -i :3000)                 # Kill port 3000
```

---

**Built for FIFA World Cup, Olympics, ICC Tournaments** ⚽🏅🏏

