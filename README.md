# Smart Content Studio AI

A modern full-stack web application featuring AI-powered content creation tools with Google Firebase authentication and Python FastAPI backend integrated with Google Gemini 2.0 Flash AI.

## 🚀 Features

- **Google Authentication** - Secure sign-in using Firebase Auth
- **4 AI Content Tools**:
  - **Text Summarizer** - Condense long content into key points using Gemini AI
  - **Idea Generator** - Generate creative ideas for any topic with AI assistance
  - **Content Refiner** - Improve and polish your writing with AI-powered refinement
  - **AI Chatbot** - Interactive conversation with Gemini AI assistant
- **Responsive Design** - Works seamlessly on mobile and desktop
- **History Persistence** - All tool outputs saved locally
- **Modern UI** - Beautiful gradients and smooth animations
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Real AI Integration** - Powered by Google Gemini 2.0 Flash model

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern functional components with hooks
- **Firebase 12** - Authentication and services
- **Tailwind CSS** - Utility-first CSS framework
- **React Router Dom** - Client-side routing
- **React Icons** - Beautiful icon library
- **PWA Ready** - Progressive Web App capabilities

### Backend
- **FastAPI** - Modern Python web framework
- **Google Gemini 2.0 Flash** - AI language model
- **Uvicorn** - ASGI server for production
- **httpx** - Async HTTP client
- **Pydantic** - Data validation and serialization

## 📁 Project Structure

```
dolze-2/
├── public/                    # Static assets
│   ├── index.html            # Main HTML template
│   ├── manifest.json         # PWA manifest
│   ├── favicon.ico           # App icon
│   └── ...                   # Other static files
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── ErrorBoundary.js  # Error handling wrapper
│   │   ├── Header.js         # App header with user info
│   │   ├── Sidebar.js        # Navigation sidebar
│   │   ├── Loader.js         # Loading component
│   │   ├── Summarizer.js     # Text summarization tool
│   │   ├── IdeaGenerator.js  # Idea generation tool
│   │   ├── ContentRefiner.js # Content improvement tool
│   │   └── Chatbot.js        # AI chat interface
│   ├── services/             # External services
│   │   ├── firebase.js       # Firebase configuration
│   │   ├── api.js            # Mock API service (fallback)
│   │   └── realApi.js        # Real API integration
│   ├── App.js                # Main app component with routing
│   ├── index.js              # React app entry point
│   ├── index.css             # Global styles and animations
│   └── service-worker.js     # PWA service worker
├── backend/                  # Python FastAPI backend
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── .env.template        # Environment variables template
│   ├── start.sh             # Backend startup script
│   ├── README.md            # Backend documentation
│   └── .gitignore           # Backend Git ignore rules
├── package.json              # Frontend dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── DESIGN.md                 # Architecture documentation
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** and npm/yarn (for frontend)
- **Python 3.9+** and pip (for backend) 
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Run the setup script** (macOS/Linux)
   ```bash
   ./start.sh
   ```

   Or **manually setup**:
   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Setup environment variables
   cp .env.template .env
   # Edit .env and add your Gemini API key
   
   # Start the server
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Get your Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key and add it to `backend/.env`:
     ```
     GEMINI_API_KEY=your-actual-api-key-here
     ```

### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ../  # If you're in the backend directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Running Both Services

You'll need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
./start.sh  # or manually start with uvicorn
```

**Terminal 2 (Frontend):**
```bash
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📋 API Documentation

### Backend Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health information
- `POST /api/summarize` - Summarize text content
- `POST /api/generate-ideas` - Generate ideas for a topic
- `POST /api/refine-content` - Refine and improve content
- `POST /api/chat` - Chat with AI assistant

### Example API Usage

```bash
# Summarize text
curl -X POST "http://localhost:8000/api/summarize" \
     -H "Content-Type: application/json" \
     -d '{"text": "Your long text content here..."}'

# Generate ideas
curl -X POST "http://localhost:8000/api/generate-ideas" \
     -H "Content-Type: application/json" \
     -d '{"topic": "sustainable technology"}'

# Refine content
curl -X POST "http://localhost:8000/api/refine-content" \
     -H "Content-Type: application/json" \
     -d '{"text": "Content to refine", "instruction": "make it more formal"}'

# Chat with AI
curl -X POST "http://localhost:8000/api/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, how can you help me?"}'
```

## 🔧 Configuration

### Firebase Setup
The app uses Firebase for Google authentication. The configuration is in `src/services/firebase.js`.

### Environment Variables

**Backend (.env):**
```
GEMINI_API_KEY=your-gemini-api-key-here
ENVIRONMENT=development
```

**Frontend (optional .env):**
```
REACT_APP_API_URL=http://localhost:8000
```

### Available Scripts

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

**Backend:**
- `./start.sh` - Start backend with setup
- `uvicorn main:app --reload` - Start in development mode
- `uvicorn main:app` - Start in production mode

## 📱 Usage

1. **Sign In**: Use Google authentication to access the app
2. **Navigate**: Use the sidebar to switch between AI tools
3. **Create Content**: Use any of the 4 AI tools powered by Gemini AI
4. **View History**: All your work is automatically saved locally
5. **Real AI Power**: Experience actual AI-generated content, not mock responses

## 🛡️ Error Handling

The application includes comprehensive error handling:

**Frontend:**
- Error boundaries for component crashes
- localStorage error handling
- API error management with user-friendly messages
- Loading states and graceful fallbacks

**Backend:**
- Request validation using Pydantic models
- Gemini API error handling and retries
- Comprehensive logging for debugging
- HTTP status code management

## 🎨 UI/UX Features

- Responsive mobile-first design
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Loading states with visual feedback
- Accessibility features (ARIA labels)
- Real-time AI interaction

## 📦 Dependencies

### Frontend Dependencies
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Client-side routing
- `firebase` - Authentication and services
- `react-icons` - Icon library

### Backend Dependencies
- `fastapi` - Modern Python web framework
- `uvicorn` - ASGI server
- `httpx` - Async HTTP client for Gemini API
- `pydantic` - Data validation and serialization
- `python-dotenv` - Environment variable management

## 🚀 Deployment

### Frontend Production Build
```bash
npm run build
```

### Backend Production Deployment
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔍 Design Decisions

- **Full-Stack Architecture**: Separated frontend and backend for scalability
- **Real AI Integration**: Using Google Gemini 2.0 Flash for actual AI capabilities
- **Component-Based UI**: Modular React components for maintainability
- **Local Storage**: Client-side persistence for user convenience
- **Comprehensive Error Handling**: Graceful degradation and user feedback
- **Modern Tech Stack**: Latest versions of React, FastAPI, and supporting libraries

For detailed architecture documentation, see [DESIGN.md](DESIGN.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This application requires both frontend and backend services to be running for full functionality. The frontend will show errors if the backend is not accessible.

This creates a `build` folder with optimized production files ready for deployment.

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contact the maintainer for contribution guidelines.
