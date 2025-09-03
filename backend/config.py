from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # OpenRouter Configuration
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    openrouter_site_url: str = os.getenv("OPENROUTER_SITE_URL", "http://localhost:3000")
    openrouter_site_name: str = os.getenv("OPENROUTER_SITE_NAME", "LLM Evaluation Platform")
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    
    # Database Configuration
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./llm_eval.db")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # API Configuration
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Model Configuration
    default_model: str = os.getenv("DEFAULT_MODEL", "deepseek/deepseek-chat-v3.1:free")
    evaluation_models: List[str] = os.getenv("EVALUATION_MODELS", "").split(",")
    
    # Evaluation Configuration
    max_tokens: int = 1000
    temperature: float = 0.7
    request_timeout: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()