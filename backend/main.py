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
from typing import Optional, Tuple
from dotenv import load_dotenv
import uvicorn
from urllib.parse import quote_plus
import re
from collections import defaultdict
from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# === Security: Prompt Injection Prevention ===

# Suspicious patterns that may indicate prompt injection attempts
SUSPICIOUS_PATTERNS = [
    r"ignore (previous|all|above|prior) (instructions|prompts|commands)",
    r"disregard (previous|all|above|prior) (instructions|prompts|commands)",
    r"forget (previous|all|above|prior) (instructions|prompts|commands)",
    r"you are now",
    r"new (instructions|rules|role|personality)",
    r"system (prompt|message|role)",
    r"<\|.*?\|>",  # Special tokens like <|endoftext|>
    r"###\s*instruction",
    r"---\s*instruction",
    r"act as (if|though)",
    r"pretend (you are|to be)",
    r"roleplay as",
    r"simulate (being|a)",
    r"(execute|run) (code|command|script)",
    r"admin (mode|access|override)",
    r"developer (mode|access|override)",
    r"sudo",
    r"\[SYSTEM\]",
    r"\[ADMIN\]",
]

SUSPICIOUS_REGEX = re.compile('|'.join(SUSPICIOUS_PATTERNS), re.IGNORECASE)

# === Rate Limiting ===

# Simple in-memory rate limiter (for production, use Redis or similar)
request_counts = defaultdict(lambda: {"count": 0, "reset_time": datetime.now()})
RATE_LIMIT_REQUESTS = 60  # requests per window
RATE_LIMIT_WINDOW = timedelta(minutes=1)  # 1 minute window

def check_rate_limit(client_id: str) -> tuple[bool, dict]:
    """
    Check if client has exceeded rate limit.
    Returns (is_allowed, rate_limit_info)
    """
    current_time = datetime.now()
    client_data = request_counts[client_id]
    
    # Reset counter if window has passed
    if current_time >= client_data["reset_time"]:
        client_data["count"] = 0
        client_data["reset_time"] = current_time + RATE_LIMIT_WINDOW
    
    # Check if limit exceeded
    if client_data["count"] >= RATE_LIMIT_REQUESTS:
        return False, {
            "limit": RATE_LIMIT_REQUESTS,
            "remaining": 0,
            "reset_time": client_data["reset_time"].isoformat()
        }
    
    # Increment counter
    client_data["count"] += 1
    
    return True, {
        "limit": RATE_LIMIT_REQUESTS,
        "remaining": RATE_LIMIT_REQUESTS - client_data["count"],
        "reset_time": client_data["reset_time"].isoformat()
    }

def detect_prompt_injection(text: str) -> tuple[bool, str]:
    """
    Detects potential prompt injection attempts in user input.
    Returns (is_suspicious, reason)
    """
    if not text or not isinstance(text, str):
        return False, ""
    
    # Check for suspicious patterns
    if SUSPICIOUS_REGEX.search(text):
        return True, "Suspicious instruction patterns detected"
    
    # Check for excessive special characters that might break prompts
    special_char_ratio = sum(1 for c in text if c in '<>[]{}|#*`') / max(len(text), 1)
    if special_char_ratio > 0.15:  # More than 15% special chars
        return True, "Excessive special characters"
    
    # Check for repeated instruction-like phrases
    instruction_words = ['instruction', 'command', 'prompt', 'system', 'ignore', 'disregard']
    word_counts = {word: text.lower().count(word) for word in instruction_words}
    if any(count > 3 for count in word_counts.values()):
        return True, "Repeated suspicious keywords"
    
    return False, ""

def sanitize_user_input(text: str, max_length: int = 5000) -> str:
    """
    Sanitizes user input to prevent prompt injection and other attacks.
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Trim to max length
    text = text[:max_length]
    
    # Remove null bytes and other control characters except newlines/tabs
    text = ''.join(char for char in text if char.isprintable() or char in '\n\t')
    
    # Normalize whitespace (remove excessive newlines/spaces)
    text = re.sub(r'\n{4,}', '\n\n\n', text)  # Max 3 consecutive newlines
    text = re.sub(r' {4,}', '   ', text)  # Max 3 consecutive spaces
    
    # Remove zero-width characters that might be used to hide injection attempts
    text = text.replace('\u200b', '').replace('\u200c', '').replace('\u200d', '')
    
    return text.strip()

def validate_and_sanitize(text: str, field_name: str = "input", max_length: int = 5000) -> str:
    """
    Combined validation and sanitization with injection detection.
    Raises HTTPException if injection is detected.
    """
    if not text or not isinstance(text, str):
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}: must be a non-empty string")
    
    # Sanitize first
    cleaned = sanitize_user_input(text, max_length)
    
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_name.capitalize()} is empty after sanitization")
    
    # Check for injection attempts
    is_suspicious, reason = detect_prompt_injection(cleaned)
    if is_suspicious:
        logger.warning(f"Potential prompt injection detected in {field_name}: {reason}")
        raise HTTPException(
            status_code=400,
            detail=f"Your {field_name} contains patterns that may compromise security. Please rephrase your request."
        )
    
    return cleaned

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
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],  # Expose rate limit headers
)

# AI Model configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
GROK_IMAGE_API_KEY = os.getenv("GROK_IMAGE_API_KEY", "")  # Separate key for Grok image generation
PRIMARY_AI_PROVIDER = os.getenv("PRIMARY_AI_PROVIDER", "gemini").lower()
ENABLE_AI_FALLBACK = os.getenv("ENABLE_AI_FALLBACK", "true").lower() == "true"

# Print configuration for debugging
logger.info(f"Gemini API Key: {'✓ Configured' if GEMINI_API_KEY else '✗ Missing'}")
logger.info(f"Grok API Key: {'✓ Configured' if GROK_API_KEY else '✗ Missing'}")
logger.info(f"Grok Image API Key: {'✓ Configured' if GROK_IMAGE_API_KEY else '✗ Missing'}")
logger.info(f"Primary AI Provider: {PRIMARY_AI_PROVIDER}")
logger.info(f"AI Fallback: {'Enabled' if ENABLE_AI_FALLBACK else 'Disabled'}")

# Model endpoints
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

IMAGE_API_PROVIDER = os.getenv("IMAGE_API_PROVIDER", "pollinations").lower()
IMAGE_API_KEY = os.getenv("IMAGE_API_KEY", "")

ASPECT_RATIO_DIMENSIONS = {
    "square": (1024, 1024),
    "portrait": (832, 1216),
    "landscape": (1216, 832),
}

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
    tone: Optional[str] = "friendly"
    creativity: Optional[float] = 0.7

class ImageGenerationRequest(BaseModel):
    prompt: str
    style: Optional[str] = ""
    aspect_ratio: Optional[str] = "square"
    provider: Optional[str] = None  # Auto-routing based on quality if None
    quality: Optional[str] = "balanced"  # fast, balanced, high, ultra

class APIResponse(BaseModel):
    output: str

class ImageResponse(BaseModel):
    image_url: str
    provider: str
    
class GameDevRequest(BaseModel):
    prompt: str

# Helper function to call Gemini API
async def call_gemini_api(prompt: str, *, temperature: float = 0.7) -> str:
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
                "temperature": max(0.0, min(1.0, temperature)),
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


# Helper function to call Grok API (xAI)
async def call_grok_api(prompt: str, *, temperature: float = 0.7) -> str:
    """
    Makes a request to the Grok (xAI) API with the provided prompt
    """
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROK_API_KEY}",
        }
        
        payload = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system",
                    "content": "You are Grok, a helpful AI assistant for the Smart Content Studio application."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": max(0.0, min(2.0, temperature)),
            "max_tokens": 8192,
        }
        
        # Make API request to Grok
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROK_API_URL,
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"Grok API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"AI service error: {response.status_code}"
                )
            
            result = response.json()
            
            # Extract text from Grok response (OpenAI-compatible format)
            if "choices" in result and len(result["choices"]) > 0:
                if "message" in result["choices"][0]:
                    return result["choices"][0]["message"]["content"]
            
            raise HTTPException(status_code=500, detail="Unexpected AI service response format")
            
    except httpx.TimeoutException:
        logger.error("Grok API timeout")
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"Grok API call failed: {str(e)}")
        raise HTTPException(status_code=500, detail="AI service unavailable")


# Smart routing function with fallback support
async def call_ai_with_routing(prompt: str, *, temperature: float = 0.7) -> str:
    """
    Routes AI requests to the configured primary provider with automatic fallback
    """
    providers = []
    
    # Build provider list based on configuration
    if PRIMARY_AI_PROVIDER == "grok" and GROK_API_KEY:
        providers.append(("grok", call_grok_api))
        if ENABLE_AI_FALLBACK and GEMINI_API_KEY:
            providers.append(("gemini", call_gemini_api))
    else:  # Default to Gemini
        if GEMINI_API_KEY:
            providers.append(("gemini", call_gemini_api))
        if ENABLE_AI_FALLBACK and GROK_API_KEY:
            providers.append(("grok", call_grok_api))
    
    if not providers:
        raise HTTPException(
            status_code=503,
            detail="No AI providers configured. Please set GEMINI_API_KEY or GROK_API_KEY."
        )
    
    # Try each provider in sequence
    last_error = None
    for provider_name, provider_func in providers:
        try:
            logger.info(f"Attempting AI request with provider: {provider_name}")
            result = await provider_func(prompt, temperature=temperature)
            logger.info(f"Successfully generated response using {provider_name}")
            return result
        except Exception as e:
            logger.warning(f"{provider_name} provider failed: {str(e)}")
            last_error = e
            # Continue to next provider if fallback is enabled
            continue
    
    # All providers failed
    logger.error("All AI providers failed")
    if last_error:
        raise last_error
    raise HTTPException(status_code=500, detail="All AI providers unavailable")


async def generate_image_asset(prompt: str, style: Optional[str], aspect_ratio: Optional[str], provider: Optional[str] = None, quality: Optional[str] = "balanced") -> Tuple[str, str]:
    """
    Generate images with intelligent multi-model routing based on quality requirements.
    
    Quality Tiers:
    - fast: Pollinations (instant, creative, free)
    - balanced: Pollinations with enhanced prompting (fast + good quality)
    - high: Gemini 2.5 Flash (detailed, photorealistic)
    - ultra: Grok Image (premium quality, highest detail)
    """
    description = prompt.strip()
    if style and style.strip():
        description = f"{description}, {style.strip()}"

    ratio_key = (aspect_ratio or "square").lower()
    if ratio_key not in ASPECT_RATIO_DIMENSIONS:
        ratio_key = "square"
    width, height = ASPECT_RATIO_DIMENSIONS[ratio_key]

    # Smart routing: if no provider specified, choose based on quality tier
    if provider is None:
        quality_tier = (quality or "balanced").lower()
        if quality_tier == "fast":
            selected_provider = "pollinations"
        elif quality_tier == "balanced":
            selected_provider = "pollinations"
        elif quality_tier == "high":
            selected_provider = "gemini" if GEMINI_API_KEY else "pollinations"
        elif quality_tier == "ultra":
            selected_provider = "grok" if GROK_IMAGE_API_KEY else ("gemini" if GEMINI_API_KEY else "pollinations")
        else:
            selected_provider = "pollinations"
    else:
        selected_provider = provider.lower()

    # === GEMINI 2.5 FLASH IMAGE GENERATION ===
    if selected_provider == "gemini":
        if not GEMINI_API_KEY:
            logger.warning("Gemini provider selected but GEMINI_API_KEY is missing, falling back to Pollinations")
            selected_provider = "pollinations"
        else:
            try:
                # Use Vertex AI Imagen 3 via Gemini API
                # Enhance prompt for better quality
                enhanced_prompt = f"{description}, high quality, detailed, professional photography"
                
                payload = {
                    "prompt": enhanced_prompt,
                    "number_of_images": 1,
                    "aspect_ratio": f"{width}:{height}",
                    "person_generation": "allow_adult",
                    "safety_filter_level": "block_only_high",
                    "language": "en"
                }

                headers = {
                    "Content-Type": "application/json",
                }

                async with httpx.AsyncClient(timeout=90.0) as client:
                    # Using Imagen 3 Fast via Vertex AI endpoint
                    response = await client.post(
                        f"https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict?key={GEMINI_API_KEY}",
                        headers=headers,
                        json=payload,
                    )

                if response.status_code == 200:
                    data = response.json()
                    
                    # Extract image from response
                    if "predictions" in data and len(data["predictions"]) > 0:
                        prediction = data["predictions"][0]
                        if "bytesBase64Encoded" in prediction:
                            image_data = prediction["bytesBase64Encoded"]
                            image_url = f"data:image/png;base64,{image_data}"
                            return image_url, "gemini"
                
                # If Gemini fails, fall back to Pollinations
                logger.warning(f"Gemini image generation failed (status {response.status_code}), falling back to Pollinations")
                selected_provider = "pollinations"

            except Exception as e:
                logger.warning(f"Gemini image generation error: {str(e)}, falling back to Pollinations")
                selected_provider = "pollinations"

    # === GROK IMAGE GENERATION ===
    if selected_provider == "grok":
        if not GROK_IMAGE_API_KEY:
            logger.warning("Grok provider selected but GROK_IMAGE_API_KEY is missing, falling back to Gemini")
            selected_provider = "gemini" if GEMINI_API_KEY else "pollinations"
        else:
            try:
                # Grok image generation (using xAI's API)
                payload = {
                    "prompt": f"{description}, ultra high quality, photorealistic, 8k, professional",
                    "width": width,
                    "height": height,
                    "num_inference_steps": 50,  # Higher steps = better quality
                    "guidance_scale": 7.5
                }

                headers = {
                    "Authorization": f"Bearer {GROK_IMAGE_API_KEY}",
                    "Content-Type": "application/json",
                }

                async with httpx.AsyncClient(timeout=120.0) as client:
                    # Note: Actual Grok image endpoint to be confirmed when API is released
                    response = await client.post(
                        "https://api.x.ai/v1/images/generations",
                        headers=headers,
                        json=payload,
                    )

                if response.status_code == 200:
                    data = response.json()
                    
                    if "data" in data and len(data["data"]) > 0:
                        image_url = data["data"][0].get("url") or data["data"][0].get("b64_json")
                        if image_url:
                            if not image_url.startswith("http") and not image_url.startswith("data:"):
                                image_url = f"data:image/png;base64,{image_url}"
                            return image_url, "grok"
                
                logger.warning(f"Grok image generation failed, falling back")
                selected_provider = "gemini" if GEMINI_API_KEY else "pollinations"

            except Exception as e:
                logger.warning(f"Grok image generation error: {str(e)}, falling back")
                selected_provider = "gemini" if GEMINI_API_KEY else "pollinations"

    # === POLLINATIONS (FAST & RELIABLE) ===
    if selected_provider == "pollinations":
        # Enhance prompt based on quality tier
        quality_tier = (quality or "balanced").lower()
        if quality_tier in ["high", "ultra"]:
            description = f"{description}, highly detailed, professional quality, sharp focus"
        
        encoded_prompt = quote_plus(description)
        image_url = (
            f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true&enhance=true"
        )
        return image_url, "pollinations"

    # === FAL.AI (FALLBACK) ===
    if selected_provider == "fal":
        if not IMAGE_API_KEY:
            logger.error("FAL provider selected but IMAGE_API_KEY is missing")
            raise HTTPException(status_code=500, detail="Image API key not configured")

        payload = {
            "input": {
                "prompt": description,
                "image_size": f"{width}x{height}",
            }
        }

        headers = {
            "Authorization": f"Key {IMAGE_API_KEY}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.fal.ai/v1/pipelines/fal-ai/flux-pro/v1/run",
                headers=headers,
                json=payload,
            )

        if response.status_code != 200:
            logger.error("Image provider error %s - %s", response.status_code, response.text)
            raise HTTPException(status_code=500, detail="Image provider error")

        data = response.json()
        image_url = (
            (data.get("images") or [{}])[0].get("url")
            or data.get("image", {}).get("url")
            or data.get("output", {}).get("image_url")
        )

        if not image_url:
            logger.error("Unable to parse image URL from provider response: %s", data)
            raise HTTPException(status_code=500, detail="Invalid response from image provider")

        return image_url, "fal"

    logger.error("Unsupported image provider configured: %s", selected_provider)
    raise HTTPException(status_code=400, detail="Unsupported image provider configuration")

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
        # Rate limiting check (using a simple IP-based approach in headers)
        # In a real production app, extract from request context or auth token
        client_id = "default"  # Replace with actual client identification
        is_allowed, rate_info = check_rate_limit(client_id)
        if not is_allowed:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again after {rate_info['reset_time']}"
            )
        
        # Validate and sanitize input
        cleaned_text = validate_and_sanitize(request.text, "text", max_length=10000)
        
        prompt = f"""
        Please provide a concise and comprehensive summary of the following text. 
        Focus on the main points, key concepts, and important details. 
        Make the summary clear, well-structured, and easy to understand.
        
        Format your response with:
        - Use emojis where appropriate to make it more engaging 📝
        - Break down complex information into bullet points when helpful
        - Use proper formatting with line breaks for readability
        
        Text to summarize:
        {cleaned_text}
        """
        
        summary = await call_ai_with_routing(prompt)
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
        # Validate and sanitize input
        cleaned_topic = validate_and_sanitize(request.topic, "topic", max_length=500)
        
        prompt = f"""
        Generate 5-7 creative and diverse ideas related to the following topic: "{cleaned_topic}"
        
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
        
        ideas = await call_ai_with_routing(prompt)
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
        # Validate and sanitize inputs
        cleaned_text = validate_and_sanitize(request.text, "text", max_length=10000)
        cleaned_instruction = ""
        if request.instruction:
            cleaned_instruction = validate_and_sanitize(request.instruction, "instruction", max_length=500)
        
        # Build prompt based on instruction
        if cleaned_instruction:
            prompt = f"""
            Please refine and improve the following content based on this specific instruction: "{cleaned_instruction}"
            
            Content to refine:
            {cleaned_text}
            
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
            {cleaned_text}
            
            Please ensure the refined content:
            - Maintains the original meaning and intent
            - Improves grammar and sentence structure
            - Enhances clarity and coherence
            - Uses appropriate tone and style
            - Include relevant emojis where appropriate to enhance engagement ✨
            - Use proper formatting with line breaks and structure for better readability
            """
        
        refined_content = await call_ai_with_routing(prompt)
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
        # Validate and sanitize input
        cleaned_message = validate_and_sanitize(request.message, "message", max_length=2000)
        
        tone_instructions = {
            "friendly": "Warm, upbeat, and encouraging with conversational phrasing",
            "professional": "Clear, confident, and executive-ready with minimal emojis",
            "playful": "Energetic, witty, and emoji-rich without sacrificing clarity",
            "expert": "Insightful, reference-driven, and authoritative with structured explanations",
        }

        tone_key = (request.tone or "friendly").lower()
        tone_description = tone_instructions.get(tone_key, tone_instructions["friendly"])
        creativity = request.creativity if request.creativity is not None else 0.7
        temperature = max(0.0, min(1.0, creativity))

        prompt = f"""
        You are a helpful AI assistant for the Smart Content Studio application. 
        Adopt the following communication tone: {tone_description}.
        
        User message: {cleaned_message}
        
        Please provide a thoughtful response that:
        - Addresses the user's question or comment directly
        - Is helpful and informative
        - Uses proper formatting with line breaks, bullet points, or numbered lists when helpful
        - Encourages further discussion if appropriate
        - Keeps the response visually appealing and easy to scan
        """
        
        response = await call_ai_with_routing(prompt, temperature=temperature)
        return APIResponse(output=response)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")


@app.post("/api/generate-image", response_model=ImageResponse)
async def generate_image(request: ImageGenerationRequest):
    try:
        # Validate and sanitize inputs
        cleaned_prompt = validate_and_sanitize(request.prompt, "prompt", max_length=1000)
        cleaned_style = ""
        if request.style:
            cleaned_style = validate_and_sanitize(request.style, "style", max_length=500)

        image_url, provider = await generate_image_asset(
            cleaned_prompt,
            cleaned_style if cleaned_style else None,
            request.aspect_ratio,
            request.provider,
            request.quality,
        )

        return ImageResponse(image_url=image_url, provider=provider)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate image")

# Error handler for validation errors
@app.exception_handler(422)
async def validation_exception_handler(request, exc):
    return HTTPException(status_code=400, detail="Invalid request data")

@app.post("/api/gamedev/story", response_model=APIResponse)
async def gamedev_story(request: GameDevRequest):
    try:
        cleaned_prompt = validate_and_sanitize(request.prompt, "prompt", max_length=2000)
        prompt = f"""
        You are a creative narrative designer for video games.

        Generate a compelling backstory, quest idea, or world-building concept based on the following prompt:

        {cleaned_prompt}

        Response should include:
        - Title
        - Setting
        - Main conflict or hook
        - Suggested gameplay elements
        """
        output = await call_ai_with_routing(prompt)
        return APIResponse(output=output)
    except Exception as e:
        logger.error(f"GameDev Story error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate story content")

@app.post("/api/gamedev/dialogue", response_model=APIResponse)
async def gamedev_dialogue(request: GameDevRequest):
    try:
        cleaned_prompt = validate_and_sanitize(request.prompt, "prompt", max_length=2000)
        prompt = f"""
        You are a professional NPC dialogue writer for a fantasy RPG.

        Based on the input below, generate a short, flavorful dialogue (4–6 lines) between an NPC and the player.

        Context: {cleaned_prompt}

        Ensure the dialogue:
        - Has character personality
        - Uses natural tone and speech
        - Can be directly used in a quest or interaction
        """
        output = await call_ai_with_routing(prompt)
        return APIResponse(output=output)
    except Exception as e:
        logger.error(f"GameDev Dialogue error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate dialogue")

@app.post("/api/gamedev/mechanics", response_model=APIResponse)
async def gamedev_mechanics(request: GameDevRequest):
    try:
        cleaned_prompt = validate_and_sanitize(request.prompt, "prompt", max_length=2000)
        prompt = f"""
        You are a gameplay systems designer.

        Based on the game concept provided below, suggest 2–3 unique gameplay mechanics or balancing ideas:

        {cleaned_prompt}

        Include:
        - Name of each mechanic
        - Brief description
        - Optional: balancing tips
        """
        output = await call_ai_with_routing(prompt)
        return APIResponse(output=output)
    except Exception as e:
        logger.error(f"GameDev Mechanics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to suggest game mechanics")

@app.post("/api/gamedev/code", response_model=APIResponse)
async def gamedev_code(request: GameDevRequest):
    try:
        cleaned_prompt = validate_and_sanitize(request.prompt, "prompt", max_length=2000)
        prompt = f"""
        You are a game developer assistant specialized in Unity (C#) and Godot (GDScript).

        Based on this request: "{cleaned_prompt}"

        Provide a clear, short code snippet with comments. Mention the engine used and context of use.
        """
        output = await call_ai_with_routing(prompt)
        return APIResponse(output=output)
    except Exception as e:
        logger.error(f"GameDev Code error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate code snippet")

@app.post("/api/gamedev/explain", response_model=APIResponse)
async def gamedev_explain(request: GameDevRequest):
    try:
        cleaned_prompt = validate_and_sanitize(request.prompt, "prompt", max_length=2000)
        prompt = f"""
        You are an expert game engine educator.

        Explain the following concept in simple, beginner-friendly terms with real-life analogies:

        "{cleaned_prompt}"

        Use line breaks and bullet points to improve readability.
        """
        output = await call_ai_with_routing(prompt)
        return APIResponse(output=output)
    except Exception as e:
        logger.error(f"GameDev Explain error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to explain concept")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
