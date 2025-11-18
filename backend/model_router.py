"""
Intelligent Multi-Model Router
Routes tasks to the best free specialized AI model based on task type
"""

import os
from enum import Enum
from typing import Dict, Any, Optional
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class TaskType(Enum):
    """Task types for routing decisions"""
    TEXT_GENERATION = "text_generation"
    CODE_GENERATION = "code_generation"
    IMAGE_GENERATION = "image_generation"
    SUMMARIZATION = "summarization"
    CREATIVE_WRITING = "creative_writing"
    TECHNICAL_WRITING = "technical_writing"
    CHAT = "chat"
    ANALYSIS = "analysis"

class ModelProvider(Enum):
    """Available free model providers"""
    GEMINI = "gemini"
    GROQ = "groq"
    MISTRAL = "mistral"
    POLLINATIONS = "pollinations"
    PICSUM = "picsum"

# Model configurations with their strengths
MODEL_CONFIGS = {
    # Text Models
    "gemini-2.0-flash-thinking": {
        "provider": ModelProvider.GEMINI,
        "endpoint": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent",
        "strengths": [TaskType.TEXT_GENERATION, TaskType.ANALYSIS, TaskType.CREATIVE_WRITING],
        "cost": "free",
        "speed": "fast",
        "quality": 90,
        "context_window": 32000
    },
    "gemini-2.5-flash": {
        "provider": ModelProvider.GEMINI,
        "endpoint": "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
        "strengths": [TaskType.CHAT, TaskType.SUMMARIZATION],
        "cost": "free",
        "speed": "very_fast",
        "quality": 85,
        "context_window": 8000
    },
    "llama-3.3-70b": {
        "provider": ModelProvider.GROQ,
        "endpoint": "https://api.groq.com/openai/v1/chat/completions",
        "strengths": [TaskType.CODE_GENERATION, TaskType.TECHNICAL_WRITING],
        "cost": "free",
        "speed": "very_fast",
        "quality": 92,
        "context_window": 8000,
        "model_name": "llama-3.3-70b-versatile"
    },
    "mixtral-8x7b": {
        "provider": ModelProvider.GROQ,
        "endpoint": "https://api.groq.com/openai/v1/chat/completions",
        "strengths": [TaskType.TEXT_GENERATION, TaskType.ANALYSIS],
        "cost": "free",
        "speed": "fast",
        "quality": 88,
        "context_window": 32000,
        "model_name": "mixtral-8x7b-32768"
    },
    "mistral-large": {
        "provider": ModelProvider.MISTRAL,
        "endpoint": "https://api.mistral.ai/v1/chat/completions",
        "strengths": [TaskType.CODE_GENERATION, TaskType.TECHNICAL_WRITING],
        "cost": "free_tier",
        "speed": "medium",
        "quality": 90,
        "context_window": 32000,
        "model_name": "mistral-large-latest"
    },
    # Image Models
    "pollinations-flux": {
        "provider": ModelProvider.POLLINATIONS,
        "endpoint": "https://image.pollinations.ai/prompt/",
        "strengths": [TaskType.IMAGE_GENERATION],
        "cost": "free",
        "speed": "fast",
        "quality": 85
    },
    "picsum-photos": {
        "provider": ModelProvider.PICSUM,
        "endpoint": "https://picsum.photos/",
        "strengths": [TaskType.IMAGE_GENERATION],
        "cost": "free",
        "speed": "very_fast",
        "quality": 75
    }
}

class ModelRouter:
    """Intelligent router that selects the best model for each task"""
    
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.groq_key = os.getenv("GROQ_API_KEY", "")
        self.mistral_key = os.getenv("MISTRAL_API_KEY", "")
        self.usage_stats = {}
        
    def analyze_task_type(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> TaskType:
        """Analyze prompt to determine task type"""
        prompt_lower = prompt.lower()
        
        # Code-related keywords
        if any(word in prompt_lower for word in ['code', 'function', 'class', 'debug', 'python', 'javascript', 'programming']):
            return TaskType.CODE_GENERATION
            
        # Image-related keywords
        if any(word in prompt_lower for word in ['image', 'picture', 'photo', 'generate image', 'create image']):
            return TaskType.IMAGE_GENERATION
            
        # Summarization keywords
        if any(word in prompt_lower for word in ['summarize', 'summary', 'tldr', 'brief', 'key points']):
            return TaskType.SUMMARIZATION
            
        # Creative writing keywords
        if any(word in prompt_lower for word in ['story', 'poem', 'creative', 'write a', 'compose']):
            return TaskType.CREATIVE_WRITING
            
        # Technical writing keywords
        if any(word in prompt_lower for word in ['documentation', 'technical', 'explain', 'how to', 'tutorial']):
            return TaskType.TECHNICAL_WRITING
            
        # Analysis keywords
        if any(word in prompt_lower for word in ['analyze', 'compare', 'evaluate', 'assess', 'review']):
            return TaskType.ANALYSIS
            
        # Default to chat for conversational queries
        return TaskType.CHAT
    
    def select_best_model(self, task_type: TaskType, preferences: Optional[Dict[str, Any]] = None) -> str:
        """Select the best model for the given task type"""
        
        # Filter models by task strengths
        suitable_models = []
        for model_name, config in MODEL_CONFIGS.items():
            if task_type in config["strengths"]:
                suitable_models.append((model_name, config))
        
        if not suitable_models:
            # Fallback to best general model
            return "gemini-2.0-flash-thinking"
        
        # Sort by quality score
        suitable_models.sort(key=lambda x: x[1]["quality"], reverse=True)
        
        # Apply preferences if provided
        if preferences:
            if preferences.get("speed_priority"):
                suitable_models.sort(key=lambda x: x[1]["speed"] == "very_fast", reverse=True)
            elif preferences.get("quality_priority"):
                suitable_models.sort(key=lambda x: x[1]["quality"], reverse=True)
        
        # Check API key availability
        for model_name, config in suitable_models:
            provider = config["provider"]
            if provider == ModelProvider.GEMINI and self.gemini_key:
                return model_name
            elif provider == ModelProvider.GROQ and self.groq_key:
                return model_name
            elif provider == ModelProvider.MISTRAL and self.mistral_key:
                return model_name
            elif provider in [ModelProvider.POLLINATIONS, ModelProvider.PICSUM]:
                return model_name
        
        # Fallback to Gemini (most likely to have key)
        return "gemini-2.0-flash-thinking"
    
    async def route_and_execute(
        self, 
        prompt: str, 
        task_type: Optional[TaskType] = None,
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Route the task to the best model and execute it"""
        
        # Analyze task type if not provided
        if task_type is None:
            task_type = self.analyze_task_type(prompt)
        
        # Select best model
        model_name = self.select_best_model(task_type, preferences)
        model_config = MODEL_CONFIGS[model_name]
        
        logger.info(f"🎯 Routing {task_type.value} to {model_name} ({model_config['provider'].value})")
        
        # Execute based on provider
        try:
            if model_config["provider"] == ModelProvider.GEMINI:
                result = await self._execute_gemini(prompt, model_config)
            elif model_config["provider"] == ModelProvider.GROQ:
                result = await self._execute_groq(prompt, model_config)
            elif model_config["provider"] == ModelProvider.MISTRAL:
                result = await self._execute_mistral(prompt, model_config)
            elif model_config["provider"] == ModelProvider.POLLINATIONS:
                result = await self._execute_pollinations(prompt, model_config)
            elif model_config["provider"] == ModelProvider.PICSUM:
                result = await self._execute_picsum(prompt, model_config)
            else:
                raise ValueError(f"Unknown provider: {model_config['provider']}")
            
            # Track usage
            self._track_usage(model_name, task_type)
            
            return {
                "success": True,
                "output": result,
                "model_used": model_name,
                "provider": model_config["provider"].value,
                "task_type": task_type.value,
                "fallback": False
            }
            
        except Exception as e:
            logger.error(f"Error executing {model_name}: {str(e)}")
            # Fallback to Gemini
            if model_name != "gemini-2.0-flash-thinking":
                return await self._fallback_to_gemini(prompt, task_type)
            raise
    
    async def _execute_gemini(self, prompt: str, config: Dict[str, Any]) -> str:
        """Execute Gemini API call"""
        if not self.gemini_key:
            raise Exception("Gemini API key not configured")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{config['endpoint']}?key={self.gemini_key}",
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['candidates'][0]['content']['parts'][0]['text']
            else:
                raise Exception(f"Gemini API error: {response.status_code}")
    
    async def _execute_groq(self, prompt: str, config: Dict[str, Any]) -> str:
        """Execute Groq API call"""
        if not self.groq_key:
            raise Exception("Groq API key not configured")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                config['endpoint'],
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": config["model_name"],
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 2048
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
            else:
                raise Exception(f"Groq API error: {response.status_code}")
    
    async def _execute_mistral(self, prompt: str, config: Dict[str, Any]) -> str:
        """Execute Mistral API call"""
        if not self.mistral_key:
            raise Exception("Mistral API key not configured")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                config['endpoint'],
                headers={
                    "Authorization": f"Bearer {self.mistral_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": config["model_name"],
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 2048
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
            else:
                raise Exception(f"Mistral API error: {response.status_code}")
    
    async def _execute_pollinations(self, prompt: str, config: Dict[str, Any]) -> str:
        """Execute Pollinations image generation"""
        import urllib.parse
        encoded_prompt = urllib.parse.quote(prompt)
        image_url = f"{config['endpoint']}{encoded_prompt}?width=1024&height=1024&seed={hash(prompt) % 10000}"
        return image_url
    
    async def _execute_picsum(self, prompt: str, config: Dict[str, Any]) -> str:
        """Execute Picsum photo generation"""
        seed = hash(prompt) % 1000
        image_url = f"{config['endpoint']}seed/{seed}/1024/1024"
        return image_url
    
    async def _fallback_to_gemini(self, prompt: str, task_type: TaskType) -> Dict[str, Any]:
        """Fallback to Gemini if primary model fails"""
        logger.info("⚠️ Falling back to Gemini...")
        config = MODEL_CONFIGS["gemini-2.0-flash-thinking"]
        result = await self._execute_gemini(prompt, config)
        return {
            "success": True,
            "output": result,
            "model_used": "gemini-2.0-flash-thinking",
            "provider": "gemini",
            "fallback": True,
            "task_type": task_type.value if isinstance(task_type, TaskType) else TaskType.CHAT.value
        }
    
    def _track_usage(self, model_name: str, task_type: TaskType):
        """Track model usage statistics"""
        key = f"{model_name}:{task_type.value}"
        self.usage_stats[key] = self.usage_stats.get(key, 0) + 1
    
    def get_usage_stats(self) -> Dict[str, int]:
        """Get usage statistics"""
        return self.usage_stats
    
    def get_available_models(self) -> Dict[str, Any]:
        """Get list of available models and their capabilities"""
        available = {}
        for model_name, config in MODEL_CONFIGS.items():
            provider = config["provider"]
            is_available = False
            
            if provider == ModelProvider.GEMINI and self.gemini_key:
                is_available = True
            elif provider == ModelProvider.GROQ and self.groq_key:
                is_available = True
            elif provider == ModelProvider.MISTRAL and self.mistral_key:
                is_available = True
            elif provider in [ModelProvider.POLLINATIONS, ModelProvider.PICSUM]:
                is_available = True
            
            available[model_name] = {
                "available": is_available,
                "provider": provider.value,
                "quality": config["quality"],
                "speed": config["speed"],
                "strengths": [t.value for t in config["strengths"]]
            }
        
        return available

# Global router instance
router = ModelRouter()
