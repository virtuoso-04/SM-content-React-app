"""
Configuration settings for the backend application
"""
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
GROK_IMAGE_API_KEY = os.getenv("GROK_IMAGE_API_KEY", "")

# AI Configuration
PRIMARY_AI_PROVIDER = os.getenv("PRIMARY_AI_PROVIDER", "gemini").lower()
ENABLE_AI_FALLBACK = os.getenv("ENABLE_AI_FALLBACK", "true").lower() == "true"

# Image Generation
IMAGE_API_PROVIDER = os.getenv("IMAGE_API_PROVIDER", "pollinations").lower()
IMAGE_API_KEY = os.getenv("IMAGE_API_KEY", "")

# Model Endpoints
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

# CORS Settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
]

# Rate Limiting
RATE_LIMIT_REQUESTS = 60  # requests per window
RATE_LIMIT_WINDOW_MINUTES = 1  # 1 minute window

# Image Settings
ASPECT_RATIO_DIMENSIONS = {
    "square": (1024, 1024),
    "portrait": (832, 1216),
    "landscape": (1216, 832),
}

# Print configuration status
logger.info(f"Gemini API Key: {'✓ Configured' if GEMINI_API_KEY else '✗ Missing'}")
logger.info(f"Grok API Key: {'✓ Configured' if GROK_API_KEY else '✗ Missing'}")
logger.info(f"Grok Image API Key: {'✓ Configured' if GROK_IMAGE_API_KEY else '✗ Missing'}")
logger.info(f"Primary AI Provider: {PRIMARY_AI_PROVIDER}")
logger.info(f"AI Fallback: {'Enabled' if ENABLE_AI_FALLBACK else 'Disabled'}")
