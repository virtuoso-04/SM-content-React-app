# Smart Content Studio AI

Smart Content Studio AI is a full-stack workspace that helps creative strategists, content teams, and indie game builders ideate, refine, and ship ideas faster. It pairs an Apple-inspired glass UI with production-ready AI tools powered by Google Gemini 2.0 Flash, a Firebase-authenticated React frontend, and a FastAPI backend.

## 🎯 Feature Status

### ✅ **Implemented Features**

#### 🔒 Security & Content Filtering
- ✓ **Prompt injection detection** - Advanced pattern matching for malicious inputs
- ✓ **Input sanitization** - Removes harmful characters and normalizes content
- ✓ **Rate limiting** - 60 requests per minute per client
- ✓ **Content validation** - Length limits and type checking
- ✓ **Security patterns** - Detects 20+ suspicious instruction patterns

#### 🎨 Custom AI Parameters
- ✓ **Temperature control** - Adjustable creativity (0.0-1.0 for Gemini, 0.0-2.0 for Grok)
- ✓ **Token limits** - Configurable max output (8192 tokens)
- ✓ **Tone selection** - 4 chat modes (Friendly, Professional, Playful, Expert)
- ✓ **Quality tiers** - 4 image quality levels (Fast, Balanced, High, Ultra)

#### 🔄 Streaming Support (Frontend Ready)
- ✓ **Frontend streaming component** - FormattedAIResponse with stream handling
- ⚠️ **Backend streaming** - Structure ready, needs SSE implementation
- ✓ **Progressive rendering** - Real-time content display capability

### 🚧 **Partially Implemented**

#### 🌍 Multi-language Support
- ⚠️ **Backend ready** - All text processing is language-agnostic
- ⚠️ **UI localization** - Needs i18n implementation
- ✓ **Unicode support** - Handles all character sets

#### 💡 Prompt Suggestions
- ⚠️ **Template structure** - Constants defined, needs UI implementation
- ⚠️ **Autocomplete** - Backend supports it, frontend needs component

### ❌ **Not Yet Implemented**

- ❌ **Real-time streaming responses** - Backend SSE endpoints needed
- ❌ **Multi-language UI** - i18n/react-intl integration required
- ❌ **Prompt suggestion UI** - Template selector component needed
- ❌ **Voice input** - Web Speech API integration needed

## Highlights

- **Unified creative cockpit** – Summarizer, Idea Generator, Content Refiner, Chatbot, GameForge, and Image Generator share one consistent dashboard.
- **Multi-model AI routing** – Smart provider selection across Google Gemini 2.0 Flash, xAI Grok, with automatic fallback for resilience.
- **Flexible image generation** – User chooses between Pollinations AI (fast, creative) or Gemini Imagen 3 (detailed, refined quality) for each render.
- **Professional architecture** – Modular backend with separation of concerns, custom hooks, and reusable components.
- **Apple-style sign-in** – Glassmorphism login with email/password flows plus Google OAuth via Firebase.
- **Responsive & accessible** – Tailwind-based layout adapts to any screen with sensible keyboard/focus states.
- **Enterprise security** – Prompt injection prevention, rate limiting, input sanitization, and validation.

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

## 🔐 Security Features Implementation

### Prompt Injection Prevention
The backend implements comprehensive security measures to prevent malicious prompt manipulation:

**Detection Patterns (20+ rules):**
- Instruction hijacking attempts ("ignore previous instructions", "disregard all")
- Role manipulation ("you are now", "act as", "pretend to be")
- System override attempts ("admin mode", "developer mode", "sudo")
- Code execution attempts ("execute code", "run command")
- Special token injection (`<|endoftext|>`, `[SYSTEM]`, `[ADMIN]`)

**Sanitization:**
- Removes null bytes and control characters
- Normalizes excessive whitespace (max 3 consecutive newlines/spaces)
- Strips zero-width characters used to hide injection attempts
- Enforces character limits (500-10000 based on field type)

**Implementation:**
```python
# Location: backend/utils/security.py
from utils import validate_and_sanitize

# All user inputs are sanitized
cleaned_text = validate_and_sanitize(request.text, "text", max_length=10000)
```

### Rate Limiting
- **Limit:** 60 requests per minute per client
- **Window:** Rolling 1-minute window
- **Response:** HTTP 429 with retry-after information
- **Location:** `backend/utils/rate_limiter.py`

### Custom AI Parameters

#### Temperature Control
Control AI creativity and randomness:
- **Gemini:** 0.0 (focused) to 1.0 (creative)
- **Grok:** 0.0 (focused) to 2.0 (highly creative)
- **Chatbot UI:** 4 creativity presets (0.3, 0.5, 0.7, 0.9)

#### Token Limits
- **Max output:** 8192 tokens per request
- **Configurable:** Can be adjusted in `backend/services/ai_providers.py`

#### Tone Selection (Chatbot)
- **Friendly:** Warm, upbeat, conversational
- **Professional:** Clear, confident, executive-ready
- **Playful:** Energetic, witty, emoji-rich
- **Expert:** Insightful, reference-driven, authoritative

#### Image Quality Tiers
- **⚡ Fast:** Instant generation with Pollinations
- **🎯 Balanced:** Enhanced prompting with Pollinations
- **✨ High:** Detailed images with Gemini Imagen 3
- **💎 Ultra:** Premium quality with Grok (future)

## 🚀 Streaming Implementation Status

### Frontend (✅ Ready)
The frontend has a complete streaming infrastructure:

**Component:** `FormattedAIResponse.js`
```javascript
// Handles streaming responses from ReadableStream
<FormattedAIResponse content={content} stream={stream} />
```

**Features:**
- Real-time character-by-character rendering
- Automatic stream cleanup
- Markdown formatting during stream
- Syntax highlighting for code blocks

### Backend (⚠️ Needs SSE)
To enable real-time streaming, implement Server-Sent Events (SSE):

**Required changes:**
1. Add streaming endpoints (e.g., `/api/summarize/stream`)
2. Use `StreamingResponse` from FastAPI
3. Yield chunks as they arrive from AI providers
4. Frontend connects via EventSource

**Example implementation:**
```python
from fastapi.responses import StreamingResponse

@router.get("/api/chat/stream")
async def chat_stream(message: str):
    async def generate():
        async for chunk in ai_provider.stream(message):
            yield f"data: {chunk}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")
```

## 🌍 Multi-language Support

### Current Status
- **Backend:** ✅ Language-agnostic processing (handles all Unicode)
- **UI:** ⚠️ English only (needs i18n implementation)

### Implementation Guide
Add internationalization with `react-i18next`:

```bash
npm install react-i18next i18next
```

Create language files in `src/locales/`:
```javascript
// src/locales/en.json
{
  "header.title": "Smart Content Studio",
  "sidebar.summarizer": "Summarizer"
}

// src/locales/es.json
{
  "header.title": "Estudio de Contenido Inteligente",
  "sidebar.summarizer": "Resumidor"
}
```

## 💡 Prompt Suggestions (Ready for UI)

### Backend Support
All endpoints accept any prompt format. No changes needed.

### Frontend Implementation Needed
Create a template selector component:

**Suggested Templates:**
```javascript
const templates = {
  summarizer: [
    "Summarize this in 3 bullet points",
    "Create an executive summary",
    "Extract key takeaways"
  ],
  ideaGenerator: [
    "10 innovative ideas for...",
    "Creative approaches to...",
    "Unique perspectives on..."
  ]
};
```

**Location:** Add to `src/constants/templates.js`

## 🎯 Quick Implementation Checklist

To complete the requested features:

- [ ] **Streaming Responses** - Add SSE endpoints (2-3 hours)
- [ ] **Multi-language UI** - Integrate react-i18next (4-5 hours)
- [ ] **Prompt Templates** - Build template selector UI (2-3 hours)
- [ ] **Voice Input** - Add Web Speech API (1-2 hours)

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
