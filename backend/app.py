"""
Smart Content Studio AI - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import ALLOWED_ORIGINS
from api import routes

# Initialize FastAPI app
app = FastAPI(
    title="Smart Content Studio AI API",
    description="Backend API for AI-powered content tools using Gemini 2.0 Flash",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)

# Include API routes
app.include_router(routes.router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
