"""
Smart Content Studio AI - FastAPI Backend
Main FastAPI application with AI-powered endpoints using Gemini API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import logging
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Content Studio AI API",
    description="Backend API for AI-powered content tools using Gemini 2.0 Flash",
    version="1.0.0"
)

# CORS configuration to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002"],  # React dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your-gemini-api-key-here")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:generateContent"

# Request/Response models
class SummarizerRequest(BaseModel):
    text: str

class IdeaGeneratorRequest(BaseModel):
    topic: str

class ContentRefinerRequest(BaseModel):
    text: str
    instruction: Optional[str] = ""

class ChatbotRequest(BaseModel):
    message: str

class APIResponse(BaseModel):
    output: str

# Helper function to call Gemini API
async def call_gemini_api(prompt: str) -> str:
    """
    Makes a request to the Gemini API with the provided prompt
    """
    try:
        headers = {
            "Content-Type": "application/json",
        }
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 64,
                "topP": 0.95,
                "maxOutputTokens": 8192,
            }
        }
        
        # Make API request to Gemini
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"AI service error: {response.status_code}"
                )
            
            result = response.json()
            
            # Extract text from Gemini response
            if "candidates" in result and len(result["candidates"]) > 0:
                if "content" in result["candidates"][0]:
                    return result["candidates"][0]["content"]["parts"][0]["text"]
            
            raise HTTPException(status_code=500, detail="Unexpected AI service response format")
            
    except httpx.TimeoutException:
        logger.error("Gemini API timeout")
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"Gemini API call failed: {str(e)}")
        raise HTTPException(status_code=500, detail="AI service unavailable")

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Smart Content Studio AI API is running!"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Smart Content Studio AI API",
        "version": "1.0.0"
    }

@app.post("/api/summarize", response_model=APIResponse)
async def summarize_text(request: SummarizerRequest):
    """
    Summarize the provided text using Gemini AI
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Please provide text to summarize")
        
        prompt = f"""
        Please provide a concise and comprehensive summary of the following text. 
        Focus on the main points, key concepts, and important details. 
        Make the summary clear, well-structured, and easy to understand.
        
        Format your response with:
        - Use emojis where appropriate to make it more engaging 📝
        - Break down complex information into bullet points when helpful
        - Use proper formatting with line breaks for readability
        
        Text to summarize:
        {request.text.strip()}
        """
        
        summary = await call_gemini_api(prompt)
        return APIResponse(output=summary)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarizer error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to summarize text")

@app.post("/api/generate-ideas", response_model=APIResponse)
async def generate_ideas(request: IdeaGeneratorRequest):
    """
    Generate creative ideas based on the provided topic using Gemini AI
    """
    try:
        if not request.topic or not request.topic.strip():
            raise HTTPException(status_code=400, detail="Please provide a topic or prompt")
        
        prompt = f"""
        Generate 5-7 creative and diverse ideas related to the following topic: "{request.topic.strip()}"
        
        Please provide:
        - Creative and innovative approaches
        - Different perspectives and angles
        - Practical and actionable ideas
        - Mix of beginner and advanced concepts
        
        Format the response with:
        - Use appropriate emojis to make each idea engaging 💡
        - Format as a numbered list with brief explanations for each idea
        - Make it visually appealing and easy to scan
        - Use proper formatting with line breaks for readability
        """
        
        ideas = await call_gemini_api(prompt)
        return APIResponse(output=ideas)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Idea generator error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate ideas")

@app.post("/api/refine-content", response_model=APIResponse)
async def refine_content(request: ContentRefinerRequest):
    """
    Refine and improve the provided content using Gemini AI
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Please provide content to refine")
        
        # Build prompt based on instruction
        if request.instruction and request.instruction.strip():
            prompt = f"""
            Please refine and improve the following content based on this specific instruction: "{request.instruction.strip()}"
            
            Content to refine:
            {request.text.strip()}
            
            Please ensure the refined content:
            - Follows the specific instruction provided
            - Maintains the original meaning and intent
            - Improves clarity, flow, and readability
            - Uses appropriate tone and style
            - Include relevant emojis where appropriate to enhance engagement ✨
            - Use proper formatting with line breaks and structure for better readability
            """
        else:
            prompt = f"""
            Please refine and improve the following content for better clarity, flow, and readability:
            
            Content to refine:
            {request.text.strip()}
            
            Please ensure the refined content:
            - Maintains the original meaning and intent
            - Improves grammar and sentence structure
            - Enhances clarity and coherence
            - Uses appropriate tone and style
            - Include relevant emojis where appropriate to enhance engagement ✨
            - Use proper formatting with line breaks and structure for better readability
            """
        
        refined_content = await call_gemini_api(prompt)
        return APIResponse(output=refined_content)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Content refiner error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to refine content")

@app.post("/api/chat", response_model=APIResponse)
async def chat_with_ai(request: ChatbotRequest):
    """
    Chat with AI assistant using Gemini AI
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Please enter a message")
        
        prompt = f"""
        You are a helpful AI assistant for the Smart Content Studio application. 
        Please respond to the user's message in a friendly, informative, and engaging way.
        
        User message: {request.message.strip()}
        
        Please provide a thoughtful response that:
        - Addresses the user's question or comment directly
        - Is helpful and informative
        - Maintains a conversational and friendly tone
        - Uses appropriate emojis to make the response more engaging (but don't overuse them)
        - Uses proper formatting with line breaks, bullet points, or numbered lists when helpful
        - Encourages further discussion if appropriate
        
        Format your response to be visually appealing and easy to read.
        """
        
        response = await call_gemini_api(prompt)
        return APIResponse(output=response)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")

# Error handler for validation errors
@app.exception_handler(422)
async def validation_exception_handler(request, exc):
    return HTTPException(status_code=400, detail="Invalid request data")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
