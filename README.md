# Smart Content Studio AI

AI-powered content tools with multi-model routing.

## Features

- **Summarizer** - Condense long text
- **Idea Generator** - Generate creative ideas
- **Content Refiner** - Improve content quality
- **Image Generator** - Multi-model visuals via Pollinations/Picsum
- **AI Chatbot** - Smart assistant that selects Gemini/Groq/Mistral automatically

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.template .env  # fill GEMINI/GROQ/MISTRAL keys
python main.py
```

### Frontend
```bash
cp .env.example .env  # provide Firebase + API base URL
npm install
npm start
```

## API Keys Required

Create `backend/.env`:
```
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
MISTRAL_API_KEY=your_key
```

Create `frontend/.env` (root `.env` for CRA):
```
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=...
# ...other Firebase values (see .env.example)
```

Get keys:
- Gemini: https://aistudio.google.com/app/apikey
- Groq: https://console.groq.com/
- Mistral: https://console.mistral.ai/

## Tech Stack

**Frontend:** React 18, Tailwind CSS, Firebase Auth  
**Backend:** FastAPI, Gemini 2.5, Groq (Llama 3.3), Mistral, Pollinations/Picsum  
**Routing:** Intelligent multi-model selection

## Endpoints

- `http://localhost:3000` - Frontend
- `http://localhost:8000/docs` - API Documentation
