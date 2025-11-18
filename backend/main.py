"""
Smart Content Studio AI - FastAPI Backend
Clean, robust backend with multi-model AI routing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import logging
from typing import Optional
from dotenv import load_dotenv
from model_router import router, TaskType

# Load environment variables
load_dotenv()

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Content Studio AI API",
    description="Backend API for AI-powered content tools with intelligent multi-model routing",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    logger.warning("⚠️  GEMINI_API_KEY not found in environment")
else:
    logger.info(f"✅ API Key loaded (length: {len(GEMINI_API_KEY)})")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class SummarizerRequest(BaseModel):
    text: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Your long text to summarize here..."
            }
        }

class IdeaGeneratorRequest(BaseModel):
    topic: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "topic": "AI in healthcare"
            }
        }

class ContentRefinerRequest(BaseModel):
    text: str
    instruction: Optional[str] = ""
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Your content to refine",
                "instruction": "Make it more professional"
            }
        }

class ChatbotRequest(BaseModel):
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "What is machine learning?"
            }
        }

class ImageGenerationRequest(BaseModel):
    prompt: str

    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Create a cinematic portrait of an astronaut walking on Mars"
            }
        }

class SmartRouteRequest(BaseModel):
    prompt: str
    task_type: Optional[str] = None
    speed_priority: Optional[bool] = False
    quality_priority: Optional[bool] = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Write a Python function to sort a list",
                "quality_priority": True
            }
        }

class APIResponse(BaseModel):
    output: str
    model_used: Optional[str] = None
    provider: Optional[str] = None

class SmartRouteResponse(APIResponse):
    success: bool
    task_type: Optional[str] = None
    fallback: Optional[bool] = False

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def call_gemini_api(prompt: str, temperature: float = 0.7) -> str:
    """
    Call Gemini API with robust error handling
    
    Args:
        prompt: The prompt to send to Gemini
        temperature: Control randomness (0.0-1.0)
        
    Returns:
        Generated text response
        
    Raises:
        HTTPException: On API errors
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key not configured. Please add GEMINI_API_KEY to .env file"
        )
    
    try:
        headers = {
            "Content-Type": "application/json",
        }
        
        request_body = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers=headers,
                json=request_body
            )
            
            if response.status_code != 200:
                error_detail = response.text
                logger.error(f"Gemini API error {response.status_code}: {error_detail}")
                raise HTTPException(
                    status_code=500,
                    detail=f"AI service error: {response.status_code}"
                )
            
            result = response.json()
            
            if "candidates" in result and len(result["candidates"]) > 0:
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                return text.strip()
            else:
                logger.error(f"Unexpected API response: {result}")
                raise HTTPException(
                    status_code=500,
                    detail="Unexpected response from AI service"
                )
                
    except httpx.TimeoutException:
        logger.error("Gemini API timeout")
        raise HTTPException(
            status_code=504,
            detail="AI service timeout. Please try again."
        )
    except httpx.RequestError as e:
        logger.error(f"Request error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to AI service"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

# ============================================================================
# HEALTH & INFO ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Smart Content Studio AI API",
        "version": "2.0.0",
        "status": "operational",
        "features": [
            "Text summarization",
            "Idea generation",
            "Content refinement",
            "AI chatbot",
            "Multi-model smart routing"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "gemini_configured": bool(GEMINI_API_KEY),
        "multi_model_available": True
    }

# ============================================================================
# CORE AI ENDPOINTS
# ============================================================================

@app.post("/api/summarize", response_model=APIResponse)
async def summarize_text(request: SummarizerRequest):
    """
    Summarize long text into concise key points
    
    **Input:** Text to summarize
    **Output:** Concise summary with main points
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text is required")
        
        if len(request.text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Text is too short to summarize")
        
        prompt = f"""Summarize the following text concisely, highlighting the main points and key information:

Text:
{request.text}

Provide a clear, structured summary."""
        
        summary = await call_gemini_api(prompt, temperature=0.5)
        logger.info(f"✅ Summarized {len(request.text)} chars")
        
        return APIResponse(output=summary, model_used="gemini-2.5-flash", provider="gemini")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarization error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to summarize text")

@app.post("/api/generate-ideas", response_model=APIResponse)
async def generate_ideas(request: IdeaGeneratorRequest):
    """
    Generate creative ideas based on a topic
    
    **Input:** Topic or subject
    **Output:** List of creative, actionable ideas
    """
    try:
        if not request.topic or not request.topic.strip():
            raise HTTPException(status_code=400, detail="Topic is required")
        
        prompt = f"""Generate 5-7 creative, unique, and actionable ideas about: {request.topic}

Requirements:
- Each idea should be practical and implementable
- Include brief explanations
- Be innovative and engaging
- Cover different angles or approaches

Format each idea clearly with a title and description."""
        
        ideas = await call_gemini_api(prompt, temperature=0.9)
        logger.info(f"✅ Generated ideas for: {request.topic}")
        
        return APIResponse(output=ideas, model_used="gemini-2.5-flash", provider="gemini")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Idea generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate ideas")

@app.post("/api/refine-content", response_model=APIResponse)
async def refine_content(request: ContentRefinerRequest):
    """
    Refine and improve content based on instructions
    
    **Input:** Content to refine + optional instructions
    **Output:** Improved, polished content
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Content is required")
        
        instruction_text = f"\n\nSpecific instruction: {request.instruction}" if request.instruction else ""
        
        prompt = f"""Refine and improve the following content. Make it more engaging, clear, and professional.{instruction_text}

Original content:
{request.text}

Refined version:"""
        
        refined = await call_gemini_api(prompt, temperature=0.7)
        logger.info(f"✅ Refined content ({len(request.text)} chars)")
        
        return APIResponse(output=refined, model_used="gemini-2.5-flash", provider="gemini")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Content refinement error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to refine content")

@app.post("/api/chat", response_model=APIResponse)
async def chat_with_ai(request: ChatbotRequest):
    """
    Chat with AI assistant
    
    **Input:** User message
    **Output:** AI response
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message is required")
        
        prompt = f"""You are a helpful AI assistant for Smart Content Studio. 
Respond to the user's message in a friendly, informative, and concise way.

User message: {request.message}

Your response:"""
        
        response = await call_gemini_api(prompt, temperature=0.8)
        logger.info(f"✅ Chat response generated")
        
        return APIResponse(output=response, model_used="gemini-2.5-flash", provider="gemini")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")

# ============================================================================
# MULTI-MODEL SMART ROUTING
# ============================================================================

@app.post("/api/generate-image", response_model=APIResponse)
async def generate_image(request: ImageGenerationRequest):
    """Generate an image URL using the multi-model router."""
    try:
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt is required")

        result = await router.route_and_execute(
            prompt=request.prompt.strip(),
            task_type=TaskType.IMAGE_GENERATION,
            preferences={"quality_priority": True}
        )

        logger.info(
            f"✅ Image generated via {result['model_used']} ({result['provider']})"
        )

        return APIResponse(
            output=result["output"],
            model_used=result.get("model_used"),
            provider=result.get("provider")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate image")

@app.post("/api/smart-route", response_model=SmartRouteResponse)
async def smart_route(request: SmartRouteRequest):
    """
    Intelligent multi-model routing endpoint
    
    Automatically selects the best AI model based on task type:
    - Code generation → Llama 3.3 70B (Groq)
    - Technical writing → Llama 3.3 70B or Mistral Large
    - Analysis → Gemini 2.0 Flash Thinking
    - Summarization → Gemini 2.5 Flash (fastest)
    - Creative writing → Gemini 2.0 Flash Thinking
    - Image generation → Pollinations.AI
    
    Falls back to Gemini if other models unavailable.
    """
    try:
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        # Convert task_type string to enum
        task_type = None
        if request.task_type:
            normalized_task = request.task_type.strip().lower().replace(" ", "_").replace("-", "_")
            try:
                task_type = TaskType(normalized_task)
            except ValueError:
                logger.warning(f"Invalid task_type: {request.task_type}")
        
        # Build preferences
        preferences = {
            "speed_priority": request.speed_priority,
            "quality_priority": request.quality_priority
        }
        
        # Route and execute
        result = await router.route_and_execute(
            prompt=request.prompt.strip(),
            task_type=task_type,
            preferences=preferences
        )
        
        logger.info(f"✅ Smart route: {result['model_used']} ({result['provider']}) - Task: {result['task_type']}")
        
        return SmartRouteResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Smart routing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Routing failed: {str(e)}")

@app.get("/api/available-models")
async def get_available_models():
    """
    Get list of available AI models, their capabilities, and usage statistics
    
    Returns:
    - models: List of configured models with quality scores and strengths
    - usage_stats: Per-model usage counts by task type
    """
    try:
        return {
            "models": router.get_available_models(),
            "usage_stats": router.get_usage_stats()
        }
    except Exception as e:
        logger.error(f"Error fetching models: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch model information")

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return {
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist",
        "docs": "/docs"
    }

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    logger.error(f"Internal error: {str(exc)}")
    return {
        "error": "Internal server error",
        "message": "An unexpected error occurred. Please try again."
    }

# ============================================================================
# STARTUP/SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Smart Content Studio AI Backend starting...")
    logger.info(f"📋 Gemini API: {'✅ Configured' if GEMINI_API_KEY else '❌ Not configured'}")
    logger.info(f"🤖 Multi-model routing: ✅ Active")
    logger.info(f"📚 API Documentation: http://localhost:8000/docs")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("🛑 Smart Content Studio AI Backend shutting down...")

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
