# Smart Content Studio AI

A modern full-stack web application featuring AI-powered content creation tools with Google Firebase authentication and Python FastAPI backend integrated with Google Gemini 2.0 Flash AI.

## ✨ Features

- **🔐 Google Authentication** - Secure sign-in using Firebase Auth
- **🤖 AI Content Tools**:
  - **Text Summarizer** - Condense long content into key points
  - **Idea Generator** - Generate creative ideas for any topic
  - **Content Refiner** - Improve and polish your writing
  - **AI Chatbot** - Interactive conversation with Gemini AI
- **📱 Responsive Design** - Works seamlessly on mobile and desktop
- **💾 History Persistence** - All tool outputs saved locally
- **🎨 Modern UI** - Beautiful gradients and smooth animations
- **⚡ Real AI Integration** - Powered by Google Gemini 2.0 Flash model

## 🛠 Tech Stack

**Frontend**
- React 19 - Modern functional components with hooks
- Firebase 12 - Authentication and services
- Tailwind CSS - Utility-first CSS framework
- React Router Dom - Client-side routing
- React Icons - Beautiful icon library

**Backend**
- FastAPI - Modern Python web framework
- Google Gemini 2.0 Flash - AI language model
- Uvicorn - ASGI server for production
- Pydantic - Data validation and serialization

## 📁 Project Structure

```
SM-content-React-app/
├── 📁 public/                   # Static assets and PWA files
│   ├── index.html              # Main HTML template
│   ├── manifest.json           # PWA manifest
│   ├── favicon.ico             # App favicon
│   ├── logo192.png             # App logo (192px)
│   ├── logo512.png             # App logo (512px)
│   └── robots.txt              # Search engine crawling rules
├── 📁 src/                      # Frontend source code
│   ├── 📁 components/           # React components (alphabetically organized)
│   │   ├── Chatbot.js          # 🤖 AI chat interface
│   │   ├── ContentRefiner.js   # ✨ Content improvement tool
│   │   ├── ErrorBoundary.js    # 🛡️ Error handling wrapper
│   │   ├── FormattedAIResponse.js # 📝 AI response formatter
│   │   ├── Header.js           # 🎯 App header with user info
│   │   ├── IdeaGenerator.js    # 💡 Idea generation tool
│   │   ├── Loader.js           # ⏳ Loading component
│   │   ├── Sidebar.js          # 📋 Navigation sidebar
│   │   └── Summarizer.js       # 📄 Text summarization tool
│   ├── 📁 services/             # External services
│   │   ├── firebase.js         # 🔐 Firebase configuration
│   │   └── realApi.js          # 🔗 API integration with backend
│   ├── App.js                  # Main app component with routing
│   ├── index.js                # React app entry point
│   ├── index.css               # Global styles and animations
│   └── service-worker.js       # PWA service worker
├── 📁 backend/                  # Python FastAPI backend
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── start.sh                # Backend startup script
│   ├── .env.template           # Environment variables template
│   └── README.md               # Backend documentation
├── package.json                # Frontend dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── .gitignore                  # Git ignore rules
└── DESIGN.md                   # Architecture documentation
```

### 🗂️ File Organization Principles

- **📁 Components**: Alphabetically organized React components with clear single responsibilities
- **📁 Services**: External integrations (Firebase auth, API calls) 
- **📁 Public**: Static assets, PWA configuration, and entry HTML
- **📁 Backend**: Separate Python FastAPI service with its own documentation
- **🧹 Clean Structure**: Removed mock/test files, keeping only production-ready code
- **📋 Naming**: Descriptive filenames that clearly indicate component purpose

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.9+ and pip
- Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Run the setup script**
   ```bash
   ./start.sh
   ```

   Or **manual setup**:
   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Setup environment variables
   cp .env.template .env
   # Edit .env and add your Gemini API key
   
   # Start the server
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Add your Gemini API Key to `backend/.env`**
   ```
   GEMINI_API_KEY=your-actual-api-key-here
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

### Running the Application

You'll need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend && ./start.sh
```

**Terminal 2 (Frontend):**
```bash
npm start
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📋 API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health information
- `POST /api/summarize` - Summarize text content
- `POST /api/generate-ideas` - Generate ideas for a topic
- `POST /api/refine-content` - Refine and improve content
- `POST /api/chat` - Chat with AI assistant

Visit `http://localhost:8000/docs` for interactive API documentation.

## ⚙️ Configuration

### Environment Variables

**Backend (`backend/.env`):**
```
GEMINI_API_KEY=your-gemini-api-key-here
ENVIRONMENT=development
```

**Frontend (optional `.env`):**
```
REACT_APP_API_URL=http://localhost:8000
```

### Available Scripts

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

**Backend:**
- `./start.sh` - Start backend with setup
- `uvicorn main:app --reload` - Development mode
- `uvicorn main:app` - Production mode

## 🎯 Usage

1. **Sign In** - Use Google authentication to access the app
2. **Navigate** - Use the sidebar to switch between AI tools
3. **Create Content** - Use any of the 4 AI tools powered by Gemini AI
4. **View History** - All your work is automatically saved locally

## 🛡️ Features

- **Error Handling** - Comprehensive error boundaries and user feedback
- **Responsive Design** - Mobile-first design with beautiful gradients
- **Real-time AI** - Actual AI-generated content, not mock responses
- **Local Storage** - Client-side persistence for user convenience

## 🚀 Deployment

### Frontend Production Build
```bash
npm run build
```

### Backend Production
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

##  License

This project is licensed under the MIT License.

---

**Note**: Both frontend and backend services must be running for full functionality.
