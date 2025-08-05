# Smart Content Studio AI - Backend API

A FastAPI-based backend service that provides AI-powered content tools using Google's Gemini 2.0 Flash model.

## Features

- **Text Summarization**: Generate concise summaries of long text content
- **Idea Generation**: Create innovative ideas based on topics or prompts
- **Content Refinement**: Improve text quality, grammar, and style
- **AI Chat**: Interactive conversation with AI assistant
- **GameForge AI**: Specialized game development content generation tools
- **CORS Support**: Configured for frontend integration
- **Error Handling**: Comprehensive error handling and logging

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health information

### AI Tools
- `POST /api/summarize` - Summarize text content
- `POST /api/generate-ideas` - Generate ideas for a topic
- `POST /api/refine-content` - Refine and improve content
- `POST /api/chat` - Chat with AI assistant

### GameForge Tools
- `POST /api/gamedev/story` - Generate game narratives and storylines
- `POST /api/gamedev/dialogue` - Create character dialogues and conversations
- `POST /api/gamedev/mechanics` - Design gameplay systems and mechanics
- `POST /api/gamedev/code` - Generate game code snippets or pseudocode
- `POST /api/gamedev/explain` - Explain game development concepts

## Installation

1. **Create a virtual environment** (recommended):
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   # or
   venv\Scripts\activate  # On Windows
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.template .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key and add it to your `.env` file

## Running the Server

### Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc

## Request/Response Examples

### Summarize Text
```bash
curl -X POST "http://localhost:8000/api/summarize" \
     -H "Content-Type: application/json" \
     -d '{"text": "Your long text content here..."}'
```

### Generate Ideas
```bash
curl -X POST "http://localhost:8000/api/generate-ideas" \
     -H "Content-Type: application/json" \
     -d '{"topic": "sustainable technology"}'
```

### Refine Content
```bash
curl -X POST "http://localhost:8000/api/refine-content" \
     -H "Content-Type: application/json" \
     -d '{"text": "Content to refine", "instruction": "make it more formal"}'
```

### Chat
```bash
curl -X POST "http://localhost:8000/api/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, how can you help me?"}'
```

### Generate Game Story
```bash
curl -X POST "http://localhost:8000/api/gamedev/story" \
     -H "Content-Type: application/json" \
     -d '{"game_genre": "fantasy", "length": "medium"}'
```

### Generate Game Dialogue
```bash
curl -X POST "http://localhost:8000/api/gamedev/dialogue" \
     -H "Content-Type: application/json" \
     -d '{"characters": ["hero", "villain"], "tone": "dramatic"}'
```

### Design Game Mechanics
```bash
curl -X POST "http://localhost:8000/api/gamedev/mechanics" \
     -H "Content-Type: application/json" \
     -d '{"mechanic_type": "puzzle", "difficulty": "hard"}'
```

### Generate Game Code
```bash
curl -X POST "http://localhost:8000/api/gamedev/code" \
     -H "Content-Type: application/json" \
     -d '{"programming_language": "python", "concept": "class structure for a game character"}'
```

### Explain Game Concept
```bash
curl -X POST "http://localhost:8000/api/gamedev/explain" \
     -H "Content-Type: application/json" \
     -d '{"concept": "level design", "details": "3 levels with increasing difficulty"}'
```

## Error Handling

The API includes comprehensive error handling:
- **400**: Bad Request (invalid input)
- **500**: Internal Server Error (AI service issues)
- **504**: Gateway Timeout (AI service timeout)

## Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI
- **httpx**: HTTP client for making requests to Gemini API
- **Pydantic**: Data validation using Python type annotations
- **python-dotenv**: Load environment variables from .env file

## Development

### Code Structure
```
backend/
├── main.py              # Main FastAPI application
├── requirements.txt     # Python dependencies
├── .env.template        # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

### Adding New Endpoints
1. Define request/response models using Pydantic
2. Create the endpoint function with proper error handling
3. Add the Gemini API call with appropriate prompting
4. Update this README with the new endpoint documentation

## Security Notes

- Keep your Gemini API key secure and never commit it to version control
- The API key is loaded from environment variables
- CORS is configured for local development (adjust for production)

## Troubleshooting

### Common Issues

1. **Import errors**: Make sure you've activated your virtual environment and installed dependencies
2. **API key errors**: Verify your Gemini API key is correctly set in the `.env` file
3. **CORS issues**: Check that your frontend URL is included in the CORS origins list
4. **Port conflicts**: Change the port number if 8000 is already in use

### Logs
The application uses Python's logging module. Check the console output for detailed error messages and debugging information.
