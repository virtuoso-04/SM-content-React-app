# Smart Content Studio AI

Smart Content Studio AI is a full-stack workspace that helps creative strategists, content teams, and indie game builders ideate, refine, and ship ideas faster. It pairs an Apple-inspired glass UI with production-ready AI tools powered by Google Gemini 2.0 Flash, a Firebase-authenticated React frontend, and a FastAPI backend.

## Highlights

- **Unified creative cockpit** – Summarizer, Idea Generator, Content Refiner, Chatbot, GameForge, and Image Generator share one consistent dashboard.
- **Multi-model AI routing** – Smart provider selection across Google Gemini 2.0 Flash, xAI Grok, with automatic fallback for resilience.
- **Flexible image generation** – User chooses between Pollinations AI (fast, creative) or Gemini Imagen 3 (detailed, refined quality) for each render.
- **Authentic AI output** – Every tool streams real responses from production AI APIs with markdown/code formatting.
- **Apple-style sign-in** – Glassmorphism login with email/password flows plus Google OAuth via Firebase.
- **Responsive & accessible** – Tailwind-based layout adapts to any screen with sensible keyboard/focus states.
- **Resilient UX** – Error boundaries, loading shimmer, and optimistic messaging keep the experience polished.

## Tech Stack

**Frontend**
- React 19 with hooks and Suspense-ready patterns
- React Router DOM for client routing
- Tailwind CSS + custom glass utilities
- Firebase Authentication (email/password + Google provider)
- React Markdown + Remark/rehype pipeline for formatted AI responses
- Framer Motion accents in creative tools

**Backend**
- FastAPI + Uvicorn
- Multi-model AI routing:
  - **Text generation**: Google Gemini 2.0 Flash, xAI Grok (with fallback)
  - **Image generation**: Pollinations AI, Gemini Imagen 3, FAL.ai
- Pydantic for validation, CORS middleware, `.env` driven configuration

## Directory Map

```
SM-content-React-app/
├── README.md                    # This document
├── package.json                 # Frontend dependencies & scripts
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js
├── docs/                        # Documentation
│   ├── README.md
│   ├── DESIGN.md               # Product & UX decisions
│   └── BACKEND.md              # Backend setup guide
├── scripts/                     # Utility scripts
│   └── start.sh                # Backend startup script
├── benchmarks/                  # Image quality evaluation
│   ├── README.md
│   ├── BENCHMARKING.md
│   ├── benchmark_image_quality.py
│   └── benchmark_requirements.txt
├── public/                      # Static assets
├── src/                         # Frontend source
│   ├── App.js                  # Main app & routing
│   ├── index.js
│   ├── index.css
│   ├── service-worker.js
│   ├── assets/                 # Images & media
│   ├── components/             # React components
│   │   ├── Chatbot.js
│   │   ├── ContentRefiner.js
│   │   ├── ErrorBoundary.js
│   │   ├── FormattedAIResponse.js
│   │   ├── GameForge.js
│   │   ├── Header.js
│   │   ├── IdeaGenerator.js
│   │   ├── ImageGenerator.js
│   │   ├── Loader.js
│   │   ├── Sidebar.js
│   │   └── Summarizer.js
│   ├── services/               # API clients
│   │   ├── firebase.js
│   │   └── realApi.js
│   ├── utils/                  # Helper functions
│   ├── hooks/                  # Custom React hooks
│   └── constants/              # Constants & config
└── backend/                     # FastAPI backend
    ├── app.py                  # Main application
    ├── requirements.txt
    ├── .env.template
    ├── api/                    # API routes
    │   └── routes.py
    ├── models/                 # Pydantic models
    │   └── schemas.py
    ├── services/               # Business logic
    │   ├── ai_providers.py
    │   └── image_service.py
    ├── utils/                  # Utilities
    │   ├── security.py
    │   └── rate_limiter.py
    └── config/                 # Configuration
        └── settings.py
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- At least one AI API key:
  - Google Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey)
  - xAI Grok API key from [X.AI Console](https://console.x.ai/)
- Firebase project configured for Web auth (email/password + Google)

## Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.template .env      # add GEMINI_API_KEY and optional settings
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Or use the provided script:
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

Key environment variables (`backend/.env`):

```
# === AI Model Configuration ===
GEMINI_API_KEY=your-google-gemini-key
GROK_API_KEY=your-xai-grok-key

# Primary AI provider (gemini or grok)
PRIMARY_AI_PROVIDER=gemini

# Enable automatic fallback to secondary provider if primary fails
ENABLE_AI_FALLBACK=true

# === Image Generation ===
IMAGE_API_PROVIDER=pollinations  # default (can be overridden per request)
IMAGE_API_KEY=                   # only for fal

ENVIRONMENT=development
```

**Routing behavior:**
- **Text AI**: If `PRIMARY_AI_PROVIDER=gemini` and `ENABLE_AI_FALLBACK=true`, requests go to Gemini first, then Grok if Gemini fails. If `PRIMARY_AI_PROVIDER=grok`, Grok is tried first with optional Gemini fallback. If only one key is set, that provider is used exclusively.
- **Image AI**: Users select their preferred provider (Pollinations or Gemini Imagen 3) in the UI for each generation. Pollinations requires no auth; Gemini uses the same `GEMINI_API_KEY`. FAL.ai is available by setting `IMAGE_API_KEY`.

API docs are available at `http://localhost:8000/docs`.

## Frontend Setup

```bash
npm install
npm start
```

Optional `.env` keys (create `.env` in the project root):

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=your-firebase-key
REACT_APP_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
(...other Firebase config values)
```

## Running the Stack Locally

1. Start the FastAPI service (see “Backend Setup”).
2. In a separate terminal, run `npm start` for the React dev server.
3. Visit `http://localhost:3000` for the UI and ensure the backend is reachable at `http://localhost:8000`.

## Available Scripts

- `npm start` – CRA development server with hot reload.
- `npm run build` – Production bundle (lints as part of the build).
- `npm run lint` – Optional script if added for static analysis (configure in `package.json`).
- `./backend/start.sh` – Helper script to bootstrap the API with one command.

## Feature Walkthrough

- **Login** – Email/password form with mode toggle and Google sign-in button, all wrapped in a glassmorphism hero that showcases `into.jpg`.
- **Dashboard shell** – `Sidebar` for navigation, `Header` for user info/sign-out, and glass `main` container hosting active tools.
- **Multi-model AI routing** – All text-generation endpoints intelligently route between Gemini and Grok with automatic failover if one provider is unavailable.
- **Summarizer / Idea Generator / Content Refiner** – Text-based workflows with saved history and markdown output.
- **Chatbot** – Streaming conversation with error-safe markdown rendering via `FormattedAIResponse`.
- **GameForge** – Multi-card experience for narrative, dialogue, mechanics tuning, and code snippets tailored to game creators.
- **Image Generator** – Framer Motion-enhanced prompt panel with provider selector: choose Pollinations AI for fast, creative renders or Gemini Imagen 3 for detailed, high-quality visuals.

## Image Quality Benchmarks

Smart Content Studio's multi-model router is backed by quantified quality metrics using industry-standard evaluation:

### Evaluation Metrics
- **CLIP Score**: Measures semantic alignment between prompts and generated images (higher = better prompt adherence)
- **FID Score**: Measures image quality compared to real-world images from MS-COCO dataset (lower = better quality)

### Why Multi-Model Matters

Rather than locking users into a single provider, our router empowers users to select the optimal model for each use case:

| Provider | Best For | Strengths |
|----------|----------|-----------|
| **Pollinations AI** | Quick ideation, rapid prototyping | Fast generation, creative variety, no rate limits |
| **Gemini Imagen 3** | Production assets, professional work | Photorealistic quality, fine detail, prompt precision |

### Running Benchmarks

To reproduce these results and evaluate performance yourself:

```bash
cd benchmarks
pip install -r benchmark_requirements.txt
cd ..
python benchmarks/benchmark_image_quality.py --quick  # Quick 4-prompt test
python benchmarks/benchmark_image_quality.py          # Full 12-prompt benchmark
```

Results are saved to `benchmarks/benchmark_results/` with per-provider CLIP/FID scores and generated images for visual comparison.

See [`benchmarks/BENCHMARKING.md`](benchmarks/BENCHMARKING.md) for detailed methodology, interpretation guide, and advanced usage.

**Key Insight**: By offering provider choice rather than a one-size-fits-all approach, Smart Content Studio delivers measurably better outcomes across diverse creative workflows.

## Deployment Notes

Frontend:

```bash
npm run build
```

Deploy the `build/` folder to any static host (Netlify, Vercel, S3, etc.). Set `homepage` in `package.json` if hosting at a subpath.

Backend:

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

For production, consider `gunicorn` + `uvicorn.workers.UvicornWorker`, HTTPS termination, and secret management for Gemini/Grok/Firebase keys.

## Troubleshooting

- **Auth issues** – Confirm Firebase web config matches the deployed domain and that Google sign-in is enabled.
- **AI provider errors** – Check that at least one of `GEMINI_API_KEY` or `GROK_API_KEY` is set. If using fallback, ensure both keys are valid and have sufficient quota.
- **Image generation fails** – For Pollinations (default), no key is needed; if using FAL, verify `IMAGE_API_KEY` is set and the account has credits.
- **Markdown warning** – `FormattedAIResponse` wraps `react-markdown` without deprecated props to avoid runtime errors.

## Security & Rate Limiting

Smart Content Studio includes built-in security measures to protect against prompt injection attacks and API abuse:

### Prompt Injection Prevention

The backend automatically detects and blocks malicious inputs that attempt to:
- Override system instructions (e.g., "ignore previous instructions")
- Inject special tokens or admin commands
- Execute code or scripts through prompts
- Manipulate AI behavior via roleplay/simulation tactics

**How it works:**
1. **Pattern Detection** – Regex-based scanning identifies suspicious instruction phrases, special tokens (`<|system|>`), and repeated keywords
2. **Input Sanitization** – Removes control characters, excessive whitespace, zero-width characters, and enforces length limits
3. **Automatic Rejection** – Requests containing injection patterns receive a 400 error with a security-focused message

**Configuration:**
- Patterns are defined in `backend/main.py` under `SUSPICIOUS_PATTERNS`
- Adjust `max_length` parameters in `validate_and_sanitize()` calls to change input size limits
- All user inputs (prompts, text, messages) are validated before reaching AI models

### Rate Limiting

To prevent API abuse and ensure fair usage:

- **Default limits**: 60 requests per minute per client
- **Tracking**: In-memory counter keyed by client IP (configurable to use user ID in production)
- **Headers**: Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` for client-side awareness
- **Graceful errors**: Rate-limited requests receive HTTP 429 with reset time

**Configuration (in `backend/main.py`):**
```python
RATE_LIMIT_REQUESTS = 60  # requests per window
RATE_LIMIT_WINDOW = timedelta(minutes=1)  # 1 minute
```

**Production recommendations:**
- Replace in-memory storage with Redis or similar for multi-instance deployments
- Implement user-based rate limits tied to Firebase authentication
- Add tiered limits (e.g., free vs. premium users)
- Monitor rate limit metrics for abuse detection

### Best Practices

1. **Environment Security**
   - Never commit `.env` files with real API keys
   - Rotate API keys regularly
   - Use different keys for development/production

2. **Frontend Integration**
   - Display friendly messages when rate limits are hit
   - Cache rate limit headers and show remaining quota to users
   - Implement client-side throttling to prevent unnecessary requests

3. **Monitoring**
   - Log blocked injection attempts for security audits
   - Track rate limit hits to identify legitimate high-usage patterns vs. abuse
   - Set up alerts for unusual traffic spikes

4. **API Key Protection**
   - Gemini/Grok/FAL keys should have usage quotas configured at the provider level
   - Consider implementing API key rotation for long-lived deployments

## License

MIT License – see the root `LICENSE` if present or add one for distribution.

---

Last updated: November 26, 2025
