import requests
import json
import time
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from config import settings
import logging

logger = logging.getLogger(__name__)

class LLMRequest(BaseModel):
    model: str
    messages: List[Dict[str, str]]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000
    top_p: Optional[float] = 1.0
    frequency_penalty: Optional[float] = 0.0
    presence_penalty: Optional[float] = 0.0
    stream: Optional[bool] = False

class LLMResponse(BaseModel):
    id: str
    model: str
    content: str
    usage: Dict[str, int]
    finish_reason: str
    response_time: float
    timestamp: float

class OpenRouterClient:
    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.base_url = settings.openrouter_base_url
        self.site_url = settings.openrouter_site_url
        self.site_name = settings.openrouter_site_name
        self.timeout = settings.request_timeout
        
        if not self.api_key:
            raise ValueError("OpenRouter API key is required")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for OpenRouter API requests"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        if self.site_url:
            headers["HTTP-Referer"] = self.site_url
        if self.site_name:
            headers["X-Title"] = self.site_name
            
        return headers
    
    async def chat_completion(self, request: LLMRequest) -> LLMResponse:
        """Send a chat completion request to OpenRouter"""
        start_time = time.time()
        
        try:
            payload = {
                "model": request.model,
                "messages": request.messages,
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
                "top_p": request.top_p,
                "frequency_penalty": request.frequency_penalty,
                "presence_penalty": request.presence_penalty,
                "stream": request.stream
            }
            
            response = requests.post(
                url=f"{self.base_url}/chat/completions",
                headers=self._get_headers(),
                data=json.dumps(payload),
                timeout=self.timeout
            )
            
            response.raise_for_status()
            data = response.json()
            
            response_time = time.time() - start_time
            
            # Extract response content
            content = data["choices"][0]["message"]["content"]
            finish_reason = data["choices"][0]["finish_reason"]
            
            return LLMResponse(
                id=data["id"],
                model=data["model"],
                content=content,
                usage=data["usage"],
                finish_reason=finish_reason,
                response_time=response_time,
                timestamp=time.time()
            )
            
        except requests.RequestException as e:
            logger.error(f"OpenRouter API request failed: {e}")
            raise Exception(f"OpenRouter API request failed: {e}")
        except KeyError as e:
            logger.error(f"Unexpected response format: {e}")
            raise Exception(f"Unexpected response format: {e}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise Exception(f"Unexpected error: {e}")
    
    def chat_completion_sync(self, request: LLMRequest) -> LLMResponse:
        """Synchronous version of chat completion"""
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.chat_completion(request))
        finally:
            loop.close()
    
    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available models from OpenRouter"""
        try:
            response = requests.get(
                url=f"{self.base_url}/models",
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            response.raise_for_status()
            data = response.json()
            
            return data.get("data", [])
            
        except requests.RequestException as e:
            logger.error(f"Failed to get models: {e}")
            raise Exception(f"Failed to get models: {e}")
    
    def test_connection(self) -> bool:
        """Test connection to OpenRouter API"""
        try:
            request = LLMRequest(
                model=settings.default_model,
                messages=[{"role": "user", "content": "Hello, this is a test."}],
                max_tokens=10
            )
            
            response = self.chat_completion_sync(request)
            return response.content is not None
            
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False

# Global client instance
llm_client = OpenRouterClient()