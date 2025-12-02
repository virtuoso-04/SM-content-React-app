"""
Image generation service with multi-provider routing
"""
import httpx
import logging
from typing import Optional, Tuple
from urllib.parse import quote_plus
from fastapi import HTTPException

from config import (
    GEMINI_API_KEY,
    GROK_IMAGE_API_KEY,
    IMAGE_API_KEY,
    ASPECT_RATIO_DIMENSIONS,
)

logger = logging.getLogger(__name__)


async def generate_image_asset(
    prompt: str,
    style: Optional[str],
    aspect_ratio: Optional[str],
    provider: Optional[str] = None,
    quality: Optional[str] = "balanced"
) -> Tuple[str, str]:
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
                    response = await client.post(
                        f"https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict?key={GEMINI_API_KEY}",
                        headers=headers,
                        json=payload,
                    )

                if response.status_code == 200:
                    data = response.json()
                    
                    if "predictions" in data and len(data["predictions"]) > 0:
                        prediction = data["predictions"][0]
                        if "bytesBase64Encoded" in prediction:
                            image_data = prediction["bytesBase64Encoded"]
                            image_url = f"data:image/png;base64,{image_data}"
                            return image_url, "gemini"
                
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
                payload = {
                    "prompt": f"{description}, ultra high quality, photorealistic, 8k, professional",
                    "width": width,
                    "height": height,
                    "num_inference_steps": 50,
                    "guidance_scale": 7.5
                }

                headers = {
                    "Authorization": f"Bearer {GROK_IMAGE_API_KEY}",
                    "Content-Type": "application/json",
                }

                async with httpx.AsyncClient(timeout=120.0) as client:
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
