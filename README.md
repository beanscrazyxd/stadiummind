================================================================================
                        STADIUMMIND — SETUP GUIDE
================================================================================

Premium AI Operations Command Center for major sporting events
(FIFA World Cup, Olympics, ICC tournaments)

Monitors: gates, crowd density, queues, incidents, amenities
Provides: real-time data + AI recommendations via premium React dashboard

================================================================================
                            QUICK START
================================================================================

BACKEND SETUP (Terminal 1)
─────────────────────────

1. Install & activate Python environment

    cd stadiummind
    python -m venv venv
    source venv/bin/activate      # Windows: venv\Scripts\activate
    pip install -r requirements.txt

2. Add your API key (only file you touch)

    cp .env.example .env
    
    Open .env and:
    • Set PROVIDER to: mock, anthropic, gemini, or groq
    • Paste your key into the matching line (ANTHROPIC_API_KEY=, 
      GEMINI_API_KEY=, or GROQ_API_KEY=)
    
    That's it — nothing in the Python code needs to change.

3. Run backend

    uvicorn main:app --reload
    
    Backend runs at http://localhost:8000


FRONTEND SETUP (Terminal 2)
──────────────────────────

1. Install dependencies

    cd stadiummind-frontend
    pnpm install
    
    (or: npm install)

2. Add backend URL

    Create .env.local with:
    VITE_BACKEND_URL=http://localhost:8000

3. Run frontend

    pnpm dev
    
    (or: npm run dev)
    
    Dashboard opens at http://localhost:3000


BOTH RUNNING
────────────

Backend: http://localhost:8000 ✓
Frontend: http://localhost:3000 ✓

Open http://localhost:3000 in your browser and start monitoring.

================================================================================
                          PROVIDER OPTIONS
================================================================================

PROVIDER=mock
  • Cost: $0
  • API key: none needed
  • Returns: smart, route-aware canned answers using live simulated data
  • Best for: coding, testing, live demos with zero risk
  • No setup required — just use it

PROVIDER=gemini
  • Cost: free (permanent free tier, no card needed)
  • API key: get at https://aistudio.google.com
  • Model: Google's Gemini
  • Best for: live demos, production use
  • Setup: Copy API key to GEMINI_API_KEY= in .env

PROVIDER=groq
  • Cost: free (no card needed)
  • API key: get at https://console.groq.com
  • Model: Llama 3.3 70B (very fast)
  • Best for: live demos, production use
  • Setup: Copy API key to GROQ_API_KEY= in .env

PROVIDER=anthropic
  • Cost: new accounts get free trial credit (full demo day ~$1)
  • API key: get at https://platform.claude.com
  • Model: Claude (Haiku pricing)
  • Best for: production use, best quality
  • Setup: Copy API key to ANTHROPIC_API_KEY= in .env

================================================================================
                          PROJECT LAYOUT
================================================================================

BACKEND (stadiummind/)
─────────────────────

main.py
  • FastAPI backend
  • Endpoints: /ops/status, /ops/query, /safety/trigger_incident, /health

llm_client.py
  • Single ask_llm() wrapper
  • Swap providers via .env
  • Caches repeat questions (no double billing)

simulator.py
  • Fakes live gate/queue/incident data
  • Background thread keeps data fresh

ops_dashboard.py
  • Original Streamlit UI (optional)
  • Run with: streamlit run ops_dashboard.py

data/stadium_kb.json
  • Static gate/amenity/FAQ knowledge base

.env.example
  • Copy to .env and fill in
  • Only file with secrets


FRONTEND (stadiummind-frontend/)
────────────────────────────────

client/src/
  • components/ — Reusable UI components
  • pages/ — Page components
  • hooks/ — Custom React hooks (useOpsData for API calls)
  • App.tsx — Main app component
  • index.css — Global styles + premium animations

package.json
  • Dependencies: React 19, Tailwind CSS 4, Framer Motion, Lucide Icons

vite.config.ts
  • Build configuration

.env.local
  • Backend URL configuration

================================================================================
                      COST-CONTROL FEATURES
================================================================================

Already built in:

• In-memory cache — identical questions never billed twice
• Cheap model + MAX_TOKENS=250 by default
• LLM only explains/summarizes data Python already computed
  (never asked to "fetch" anything, so prompts stay short)

Result: Full demo day costs under $1 even with paid providers

================================================================================
                        DASHBOARD FEATURES
================================================================================

Real-Time Monitoring
  • Gate Status Cards — Live capacity %, queue times, crowd density
  • Color-Coded Alerts — Green (normal), Yellow (caution), Red (critical)
  • Amenities Dashboard — Restroom, food court, medical station queues
  • Incident Timeline — Recent incidents with timestamps

AI Assistant
  • Ask questions about gate status, queue times, incidents
  • Get AI-powered recommendations for staff deployment
  • ChatGPT Enterprise-style interface with message history

Incident Simulator
  • Trigger demo incidents to test response workflows
  • Simulate overcrowding, medical emergencies, security issues
  • View AI-generated response plans

Premium Design
  • Apple + FIFA + Linear aesthetic
  • White background with #0057FF blue gradients
  • Emerald accents for success states
  • Glassmorphism effects with soft shadows
  • Large border radius (20-24px) for premium feel
  • Smooth animations and micro-interactions

================================================================================
                          API ENDPOINTS
================================================================================

GET /health
  Returns: {"status": "ok"}

GET /ops/status
  Returns: live gate, amenity, incident data
  
POST /ops/query
  Body: {"question": "What's the status at Gate C?"}
  Returns: AI-powered answer

POST /safety/trigger_incident
  Body: {"location": "C", "incident_type": "overcrowding"}
  Returns: incident details + AI response plan

================================================================================
                        TROUBLESHOOTING
================================================================================

BACKEND ISSUES
──────────────

Backend won't start:
  • Check Python version: python --version (need 3.8+)
  • Check port 8000 is free: lsof -i :8000
  • Kill process: kill -9 <PID>
  • Try different port: uvicorn main:app --port 8001

API key not working:
  • Double-check key from provider (no extra spaces)
  • Verify PROVIDER name matches key name in .env
  • Try PROVIDER=mock first to test setup
  • Check key hasn't expired

No data showing:
  • Wait 5 seconds for simulator to generate data
  • Check backend logs in terminal


FRONTEND ISSUES
───────────────

Frontend won't connect:
  • Verify backend is running: curl http://localhost:8000/health
  • Check .env.local exists with VITE_BACKEND_URL=http://localhost:8000
  • Restart frontend: pnpm dev

Port 3000 already in use:
  • Kill process: kill -9 $(lsof -t -i :3000)
  • Or use different port: pnpm dev -- --port 3001

Dependencies not installing:
  • Clear cache: rm -rf node_modules pnpm-lock.yaml
  • Reinstall: pnpm install

No data on dashboard:
  • Check browser console (F12 → Console)
  • Check Network tab (F12 → Network) for API errors
  • Verify backend is responding: curl http://localhost:8000/ops/status

================================================================================
                      PRODUCTION DEPLOYMENT
================================================================================

FRONTEND BUILD
──────────────

  cd stadiummind-frontend
  pnpm build
  
  Output: dist/public/
  
  Deploy to:
    • Netlify
    • Vercel
    • AWS S3 + CloudFront
    • Any static host


BACKEND DEPLOYMENT
───────────────────

  cd stadiummind
  pip install gunicorn
  gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
  
  Deploy to:
    • Heroku
    • Railway
    • AWS EC2
    • DigitalOcean
    • Any Python hosting

================================================================================
                          TECH STACK
================================================================================

FRONTEND
────────
  • React 19 — UI framework
  • Tailwind CSS 4 — Styling
  • Framer Motion — Animations
  • Lucide Icons — Icon library
  • Vite — Build tool
  • TypeScript — Type safety

BACKEND
───────
  • FastAPI — Web framework
  • Python 3.8+ — Language
  • Uvicorn — ASGI server
  • Pydantic — Data validation
  • LLM APIs — Gemini, Groq, Claude, etc.

================================================================================
                          NEXT STEPS
================================================================================

Recommended enhancements:
  [ ] Add real stadium data integration
  [ ] Set up alert thresholds and notifications
  [ ] Add user authentication
  [ ] Create incident history dashboard
  [ ] Deploy to production
  [ ] Build mobile app

================================================================================
                          SUPPORT
================================================================================

For issues:
  1. Check Troubleshooting section above
  2. Review backend logs in terminal
  3. Check browser console (F12 → Console)
  4. Verify .env and .env.local files are correct

Common commands:
  Check backend: curl http://localhost:8000/health
  Check ops: curl http://localhost:8000/ops/status
  Kill port 8000: kill -9 $(lsof -t -i :8000)
  Kill port 3000: kill -9 $(lsof -t -i :3000)

================================================================================
                    Built for FIFA World Cup, Olympics, ICC Tournaments
================================================================================
