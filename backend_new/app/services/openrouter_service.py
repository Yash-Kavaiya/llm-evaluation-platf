"""
OpenRouter API integration service
Handles LLM API calls through OpenRouter for multiple providers
"""

import aiohttp
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import time

from app.core.config import settings
from app.core.exceptions import OpenRouterException

logger = logging.getLogger(__name__)

class OpenRouterService:
    """Service for interacting with OpenRouter API"""
    
    def __init__(self):
        self.base_url = settings.OPENROUTER_BASE_URL
        self.api_key = settings.OPENROUTER_API_KEY
        self.site_url = settings.OPENROUTER_SITE_URL
        self.site_name = settings.OPENROUTER_SITE_NAME
        self.session = None
        
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=120)
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for OpenRouter API requests"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.site_url,
            "X-Title": self.site_name,
        }
        return headers
    
    async def test_connection(self) -> bool:
        """Test connection to OpenRouter API"""
        try:
            if not self.api_key:
                logger.warning("No OpenRouter API key configured")
                return False
                
            session = await self._get_session()
            async with session.get(
                f"{self.base_url}/models",
                headers=self._get_headers()
            ) as response:
                if response.status == 200:
                    logger.info("✅ OpenRouter API connection successful")
                    return True
                else:
                    logger.error(f"❌ OpenRouter API connection failed: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ OpenRouter API connection error: {str(e)}")
            return False
    
    async def get_models(self) -> List[Dict[str, Any]]:
        """Get available models from OpenRouter"""
        try:
            if not self.api_key:
                # Return default models if no API key
                return self._get_default_models()
            
            session = await self._get_session()
            async with session.get(
                f"{self.base_url}/models",
                headers=self._get_headers()
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    models = []
                    
                    for model in data.get("data", []):
                        models.append({
                            "id": model.get("id"),
                            "name": model.get("name", model.get("id")),
                            "description": model.get("description"),
                            "provider": model.get("provider"),
                            "context_length": model.get("context_length"),
                            "pricing": model.get("pricing"),
                            "capabilities": model.get("capabilities", [])
                        })
                    
                    logger.info(f"Retrieved {len(models)} models from OpenRouter")
                    return models
                else:
                    logger.error(f"Failed to get models: {response.status}")
                    return self._get_default_models()
                    
        except Exception as e:
            logger.error(f"Error getting models: {str(e)}")
            return self._get_default_models()
    
    def _get_default_models(self) -> List[Dict[str, Any]]:
        """Get default model list when API is unavailable"""
        return [
            {
                "id": "openai/gpt-4",
                "name": "GPT-4",
                "description": "Most capable GPT-4 model",
                "provider": "OpenAI",
                "context_length": 8192,
                "pricing": {"prompt": "0.03", "completion": "0.06"},
                "capabilities": ["chat", "completion"]
            },
            {
                "id": "openai/gpt-3.5-turbo",
                "name": "GPT-3.5 Turbo",
                "description": "Fast and efficient model",
                "provider": "OpenAI",
                "context_length": 4096,
                "pricing": {"prompt": "0.001", "completion": "0.002"},
                "capabilities": ["chat", "completion"]
            },
            {
                "id": "anthropic/claude-3-opus",
                "name": "Claude 3 Opus",
                "description": "Most powerful Claude model",
                "provider": "Anthropic",
                "context_length": 200000,
                "pricing": {"prompt": "0.015", "completion": "0.075"},
                "capabilities": ["chat", "completion"]
            },
            {
                "id": "anthropic/claude-3-sonnet",
                "name": "Claude 3 Sonnet",
                "description": "Balanced Claude model",
                "provider": "Anthropic",
                "context_length": 200000,
                "pricing": {"prompt": "0.003", "completion": "0.015"},
                "capabilities": ["chat", "completion"]
            },
            {
                "id": "google/gemini-pro",
                "name": "Gemini Pro",
                "description": "Google's advanced AI model",
                "provider": "Google",
                "context_length": 32768,
                "pricing": {"prompt": "0.0005", "completion": "0.0015"},
                "capabilities": ["chat", "completion"]
            }
        ]
    
    async def generate_response(
        self,
        model: str,
        prompt: str,
        context: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        top_p: float = 1.0
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Generate response from a model via OpenRouter
        
        Returns:
            Tuple of (response_text, metadata)
        """
        if not self.api_key:
            raise OpenRouterException("OpenRouter API key not configured")
        
        start_time = time.time()
        
        # Prepare messages
        messages = []
        if context:
            messages.append({"role": "system", "content": context})
        messages.append({"role": "user", "content": prompt})
        
        # Prepare request payload
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
            "stream": False
        }
        
        try:
            session = await self._get_session()
            async with session.post(
                f"{self.base_url}/chat/completions",
                headers=self._get_headers(),
                json=payload
            ) as response:
                response_data = await response.json()
                
                if response.status == 200:
                    # Extract response
                    content = response_data["choices"][0]["message"]["content"]
                    usage = response_data.get("usage", {})
                    
                    # Calculate metadata
                    response_time = time.time() - start_time
                    metadata = {
                        "model": model,
                        "response_time": response_time,
                        "tokens_used": usage.get("total_tokens", 0),
                        "prompt_tokens": usage.get("prompt_tokens", 0),
                        "completion_tokens": usage.get("completion_tokens", 0),
                        "cost": self._calculate_cost(model, usage),
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    logger.info(f"Generated response for {model} in {response_time:.2f}s")
                    return content, metadata
                    
                else:
                    error_msg = response_data.get("error", {}).get("message", "Unknown error")
                    raise OpenRouterException(
                        f"OpenRouter API error: {error_msg}",
                        details={
                            "status": response.status,
                            "model": model,
                            "error_data": response_data
                        }
                    )
                    
        except aiohttp.ClientError as e:
            raise OpenRouterException(
                f"Network error calling OpenRouter: {str(e)}",
                details={"model": model, "error_type": "network"}
            )
        except Exception as e:
            if isinstance(e, OpenRouterException):
                raise
            raise OpenRouterException(
                f"Unexpected error: {str(e)}",
                details={"model": model, "error_type": "unexpected"}
            )
    
    def _calculate_cost(self, model: str, usage: Dict[str, Any]) -> Optional[float]:
        """Calculate approximate cost based on usage"""
        # This is a simplified cost calculation
        # In production, you'd want to use the actual pricing from the models endpoint
        
        prompt_tokens = usage.get("prompt_tokens", 0)
        completion_tokens = usage.get("completion_tokens", 0)
        
        # Default pricing (per 1K tokens)
        pricing_map = {
            "openai/gpt-4": {"prompt": 0.03, "completion": 0.06},
            "openai/gpt-3.5-turbo": {"prompt": 0.001, "completion": 0.002},
            "anthropic/claude-3-opus": {"prompt": 0.015, "completion": 0.075},
            "anthropic/claude-3-sonnet": {"prompt": 0.003, "completion": 0.015},
            "google/gemini-pro": {"prompt": 0.0005, "completion": 0.0015},
        }
        
        if model in pricing_map:
            pricing = pricing_map[model]
            cost = (prompt_tokens / 1000 * pricing["prompt"] + 
                   completion_tokens / 1000 * pricing["completion"])
            return round(cost, 6)
        
        return None
    
    async def batch_generate(
        self,
        requests: List[Dict[str, Any]],
        batch_size: int = 5,
        delay: float = 1.0
    ) -> List[Tuple[str, Dict[str, Any]]]:
        """
        Generate responses for multiple requests in batches
        
        Args:
            requests: List of request dictionaries with keys: model, prompt, context, etc.
            batch_size: Number of concurrent requests
            delay: Delay between batches in seconds
        
        Returns:
            List of (response_text, metadata) tuples
        """
        results = []
        
        for i in range(0, len(requests), batch_size):
            batch = requests[i:i + batch_size]
            
            # Create tasks for concurrent execution
            tasks = []
            for req in batch:
                task = self.generate_response(
                    model=req["model"],
                    prompt=req["prompt"],
                    context=req.get("context"),
                    temperature=req.get("temperature", 0.7),
                    max_tokens=req.get("max_tokens", 2048),
                    top_p=req.get("top_p", 1.0)
                )
                tasks.append(task)
            
            # Execute batch
            try:
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                results.extend(batch_results)
                
                # Add delay between batches (except for last batch)
                if i + batch_size < len(requests):
                    await asyncio.sleep(delay)
                    
            except Exception as e:
                logger.error(f"Batch processing error: {str(e)}")
                # Add None results for failed batch
                results.extend([None] * len(batch))
        
        return results

# Global service instance
openrouter_service = OpenRouterService()

# Convenience functions
async def test_connection() -> bool:
    """Test OpenRouter connection"""
    return await openrouter_service.test_connection()

async def get_available_models() -> List[Dict[str, Any]]:
    """Get available models"""
    return await openrouter_service.get_models()

async def generate_llm_response(
    model: str,
    prompt: str,
    context: Optional[str] = None,
    **kwargs
) -> Tuple[str, Dict[str, Any]]:
    """Generate LLM response"""
    return await openrouter_service.generate_response(
        model=model,
        prompt=prompt,
        context=context,
        **kwargs
    )
