"""
Data models for API requests and responses
"""
from pydantic import BaseModel
from typing import Optional


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


class GameDevRequest(BaseModel):
    prompt: str


class APIResponse(BaseModel):
    output: str


class ImageResponse(BaseModel):
    image_url: str
    provider: str
