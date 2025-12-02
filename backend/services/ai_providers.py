"""
AI provider services for Gemini and Grok
"""
import httpx
import logging
from typing import Optional
from fastapi import HTTPException

from config import (
    GEMINI_API_KEY,
    GROK_API_KEY,
    GEMINI_API_URL,
    GROK_API_URL,
    PRIMARY_AI_PROVIDER,
    ENABLE_AI_FALLBACK,
)

logger = logging.getLogger(__name__)


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
            continue
    
    # All providers failed
    logger.error("All AI providers failed")
    if last_error:
        raise last_error
    raise HTTPException(status_code=500, detail="All AI providers unavailable")
