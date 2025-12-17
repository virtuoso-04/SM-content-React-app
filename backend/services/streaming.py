"""
Streaming AI provider services for Server-Sent Events (SSE)
"""
import httpx
import json
import logging
from typing import AsyncGenerator
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


async def stream_gemini_api(prompt: str, *, temperature: float = 0.7) -> AsyncGenerator[str, None]:
    """
    Stream responses from Gemini API using Server-Sent Events
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
        
        # Gemini supports streaming with streamGenerateContent
        stream_url = GEMINI_API_URL.replace("generateContent", "streamGenerateContent")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{stream_url}?key={GEMINI_API_KEY}&alt=sse",
                headers=headers,
                json=payload
            ) as response:
                if response.status_code != 200:
                    logger.error(f"Gemini streaming error: {response.status_code}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"AI streaming service error: {response.status_code}"
                    )
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        try:
                            json_str = line[6:]  # Remove "data: " prefix
                            if json_str.strip() == "[DONE]":
                                break
                            
                            data = json.loads(json_str)
                            
                            if "candidates" in data and len(data["candidates"]) > 0:
                                candidate = data["candidates"][0]
                                if "content" in candidate and "parts" in candidate["content"]:
                                    text_chunk = candidate["content"]["parts"][0].get("text", "")
                                    if text_chunk:
                                        yield text_chunk
                        except json.JSONDecodeError:
                            continue
                        except Exception as e:
                            logger.warning(f"Error parsing Gemini stream chunk: {e}")
                            continue
                            
    except httpx.TimeoutException:
        logger.error("Gemini streaming timeout")
        raise HTTPException(status_code=504, detail="AI streaming service timeout")
    except Exception as e:
        logger.error(f"Gemini streaming failed: {str(e)}")
        raise HTTPException(status_code=500, detail="AI streaming service unavailable")


async def stream_grok_api(prompt: str, *, temperature: float = 0.7) -> AsyncGenerator[str, None]:
    """
    Stream responses from Grok API using Server-Sent Events
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
            "stream": True,
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                GROK_API_URL,
                headers=headers,
                json=payload
            ) as response:
                if response.status_code != 200:
                    logger.error(f"Grok streaming error: {response.status_code}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"AI streaming service error: {response.status_code}"
                    )
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        try:
                            json_str = line[6:]  # Remove "data: " prefix
                            if json_str.strip() == "[DONE]":
                                break
                            
                            data = json.loads(json_str)
                            
                            if "choices" in data and len(data["choices"]) > 0:
                                choice = data["choices"][0]
                                if "delta" in choice and "content" in choice["delta"]:
                                    text_chunk = choice["delta"]["content"]
                                    if text_chunk:
                                        yield text_chunk
                        except json.JSONDecodeError:
                            continue
                        except Exception as e:
                            logger.warning(f"Error parsing Grok stream chunk: {e}")
                            continue
                            
    except httpx.TimeoutException:
        logger.error("Grok streaming timeout")
        raise HTTPException(status_code=504, detail="AI streaming service timeout")
    except Exception as e:
        logger.error(f"Grok streaming failed: {str(e)}")
        raise HTTPException(status_code=500, detail="AI streaming service unavailable")


async def stream_ai_with_routing(prompt: str, *, temperature: float = 0.7) -> AsyncGenerator[str, None]:
    """
    Routes streaming AI requests to the configured primary provider with automatic fallback
    """
    providers = []
    
    # Build provider list based on configuration
    if PRIMARY_AI_PROVIDER == "grok" and GROK_API_KEY:
        providers.append(("grok", stream_grok_api))
        if ENABLE_AI_FALLBACK and GEMINI_API_KEY:
            providers.append(("gemini", stream_gemini_api))
    else:  # Default to Gemini
        if GEMINI_API_KEY:
            providers.append(("gemini", stream_gemini_api))
        if ENABLE_AI_FALLBACK and GROK_API_KEY:
            providers.append(("grok", stream_grok_api))
    
    if not providers:
        raise HTTPException(
            status_code=503,
            detail="No AI providers configured. Please set GEMINI_API_KEY or GROK_API_KEY."
        )
    
    # Try each provider in sequence
    last_error = None
    for provider_name, provider_func in providers:
        try:
            logger.info(f"Attempting streaming AI request with provider: {provider_name}")
            async for chunk in provider_func(prompt, temperature=temperature):
                yield chunk
            logger.info(f"Successfully completed streaming with {provider_name}")
            return  # Successfully streamed
        except Exception as e:
            logger.warning(f"{provider_name} streaming provider failed: {str(e)}")
            last_error = e
            continue
    
    # All providers failed
    logger.error("All streaming AI providers failed")
    if last_error:
        raise last_error
    raise HTTPException(status_code=500, detail="All AI streaming providers unavailable")
