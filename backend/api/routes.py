"""
API routes for all endpoints
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import logging
import json

from models import (
    SummarizerRequest,
    IdeaGeneratorRequest,
    ContentRefinerRequest,
    ChatbotRequest,
    ImageGenerationRequest,
    GameDevRequest,
    APIResponse,
    ImageResponse,
)
from services import call_ai_with_routing, stream_ai_with_routing, generate_image_asset
from utils import validate_and_sanitize, check_rate_limit
from config import RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MINUTES

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Smart Content Studio AI API is running!"}


@router.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Smart Content Studio AI API",
        "version": "1.0.0"
    }


@router.post("/api/summarize", response_model=APIResponse)
async def summarize_text(request: SummarizerRequest):
    """Summarize the provided text using AI"""
    try:
        client_id = "default"
        is_allowed, rate_info = check_rate_limit(
            client_id,
            RATE_LIMIT_REQUESTS,
            RATE_LIMIT_WINDOW_MINUTES
        )
        if not is_allowed:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again after {rate_info['reset_time']}"
            )
        
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


@router.post("/api/generate-ideas", response_model=APIResponse)
async def generate_ideas(request: IdeaGeneratorRequest):
    """Generate creative ideas based on the provided topic"""
    try:
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


@router.post("/api/refine-content", response_model=APIResponse)
async def refine_content(request: ContentRefinerRequest):
    """Refine and improve the provided content"""
    try:
        cleaned_text = validate_and_sanitize(request.text, "text", max_length=10000)
        cleaned_instruction = ""
        if request.instruction:
            cleaned_instruction = validate_and_sanitize(request.instruction, "instruction", max_length=500)
        
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


@router.post("/api/chat", response_model=APIResponse)
async def chat_with_ai(request: ChatbotRequest):
    """Chat with AI assistant"""
    try:
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


@router.post("/api/generate-image", response_model=ImageResponse)
async def generate_image(request: ImageGenerationRequest):
    """Generate an image based on the prompt"""
    try:
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


@router.post("/api/gamedev/story", response_model=APIResponse)
async def gamedev_story(request: GameDevRequest):
    """Generate game story content"""
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


@router.post("/api/gamedev/dialogue", response_model=APIResponse)
async def gamedev_dialogue(request: GameDevRequest):
    """Generate game dialogue"""
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


@router.post("/api/gamedev/mechanics", response_model=APIResponse)
async def gamedev_mechanics(request: GameDevRequest):
    """Suggest game mechanics"""
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


@router.post("/api/gamedev/code", response_model=APIResponse)
async def gamedev_code(request: GameDevRequest):
    """Generate game development code"""
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


@router.post("/api/gamedev/explain", response_model=APIResponse)
async def gamedev_explain(request: GameDevRequest):
    """Explain game development concepts"""
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


# ==================== STREAMING ENDPOINTS ====================

async def sse_generator(prompt: str, temperature: float = 0.7):
    """Helper function to format SSE events"""
    try:
        async for chunk in stream_ai_with_routing(prompt, temperature=temperature):
            # Format as Server-Sent Event
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        
        # Send completion event
        yield f"data: {json.dumps({'done': True})}\n\n"
    except Exception as e:
        logger.error(f"Streaming error: {str(e)}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@router.post("/api/summarize/stream")
async def summarize_text_stream(request: SummarizerRequest):
    """Stream summarization response using Server-Sent Events"""
    try:
        client_id = "default"
        is_allowed, rate_info = check_rate_limit(
            client_id,
            RATE_LIMIT_REQUESTS,
            RATE_LIMIT_WINDOW_MINUTES
        )
        if not is_allowed:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again after {rate_info['reset_time']}"
            )
        
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
        
        return StreamingResponse(
            sse_generator(prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarizer streaming error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stream summary")


@router.post("/api/generate-ideas/stream")
async def generate_ideas_stream(request: IdeaGeneratorRequest):
    """Stream idea generation response using Server-Sent Events"""
    try:
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
        
        return StreamingResponse(
            sse_generator(prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Idea generator streaming error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stream ideas")


@router.post("/api/refine-content/stream")
async def refine_content_stream(request: ContentRefinerRequest):
    """Stream content refinement response using Server-Sent Events"""
    try:
        cleaned_text = validate_and_sanitize(request.text, "text", max_length=10000)
        cleaned_instruction = ""
        if request.instruction:
            cleaned_instruction = validate_and_sanitize(request.instruction, "instruction", max_length=500)
        
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
        
        return StreamingResponse(
            sse_generator(prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Content refiner streaming error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stream refined content")


@router.post("/api/chat/stream")
async def chat_with_ai_stream(request: ChatbotRequest):
    """Stream chat response using Server-Sent Events"""
    try:
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
        
        return StreamingResponse(
            sse_generator(prompt, temperature=temperature),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chatbot streaming error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stream chat response")


@router.post("/api/gamedev/story/stream")
async def gamedev_story_stream(request: GameDevRequest):
    """Stream game story generation using Server-Sent Events"""
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
        
        return StreamingResponse(
            sse_generator(prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        logger.error(f"GameDev Story streaming error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stream story content")


@router.post("/api/gamedev/dialogue/stream")
async def gamedev_dialogue_stream(request: GameDevRequest):
    """Stream game dialogue generation using Server-Sent Events"""
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
        
        return StreamingResponse(
            sse_generator(prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        logger.error(f"GameDev Dialogue streaming error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stream dialogue")


@router.post("/api/gamedev/mechanics/stream")
async def gamedev_mechanics_stream(request: GameDevRequest):
    """Stream game mechanics suggestions using Server-Sent Events"""
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
        
        return StreamingResponse(
            sse_generator(prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        logger.error(f"GameDev Mechanics streaming error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stream mechanics")


@router.post("/api/gamedev/code/stream")
async def gamedev_code_stream(request: GameDevRequest):
    """Stream game development code generation using Server-Sent Events"""
    try:
        cleaned_prompt = validate_and_sanitize(request.prompt, "prompt", max_length=2000)
        prompt = f"""
        You are a game developer assistant specialized in Unity (C#) and Godot (GDScript).

        Based on this request: "{cleaned_prompt}"

        Provide a clear, short code snippet with comments. Mention the engine used and context of use.
        """
        
        return StreamingResponse(
            sse_generator(prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        logger.error(f"GameDev Code streaming error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stream code")


@router.post("/api/gamedev/explain/stream")
async def gamedev_explain_stream(request: GameDevRequest):
    """Stream game development concept explanations using Server-Sent Events"""
    try:
        cleaned_prompt = validate_and_sanitize(request.prompt, "prompt", max_length=2000)
        prompt = f"""
        You are an expert game engine educator.

        Explain the following concept in simple, beginner-friendly terms with real-life analogies:

        "{cleaned_prompt}"

        Use line breaks and bullet points to improve readability.
        """
        
        return StreamingResponse(
            sse_generator(prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        logger.error(f"GameDev Explain streaming error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stream explanation")
        raise HTTPException(status_code=500, detail="Failed to explain concept")
