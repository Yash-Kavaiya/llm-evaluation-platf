"""
Core application configuration using Pydantic settings
Supports environment variables, .env files, and default values
"""

from pydantic import BaseSettings, Field, validator
from typing import List, Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application Settings
    APP_NAME: str = "LLM Evaluation Platform"
    VERSION: str = "2.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production", env="SECRET_KEY")
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "*"],
        env="ALLOWED_ORIGINS"
    )
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./llm_evaluation.db",
        env="DATABASE_URL"
    )
    DATABASE_ECHO: bool = Field(default=False, env="DATABASE_ECHO")
    
    # OpenRouter API Configuration
    OPENROUTER_API_KEY: Optional[str] = Field(default=None, env="OPENROUTER_API_KEY")
    OPENROUTER_BASE_URL: str = Field(
        default="https://openrouter.ai/api/v1",
        env="OPENROUTER_BASE_URL"
    )
    OPENROUTER_SITE_URL: str = Field(
        default="http://localhost:3000",
        env="OPENROUTER_SITE_URL"
    )
    OPENROUTER_SITE_NAME: str = Field(
        default="LLM Evaluation Platform",
        env="OPENROUTER_SITE_NAME"
    )
    
    # OpenAI Configuration (for RAGAS)
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    OPENAI_BASE_URL: str = Field(
        default="https://api.openai.com/v1",
        env="OPENAI_BASE_URL"
    )
    
    # Evaluation Settings
    DEFAULT_TEMPERATURE: float = Field(default=0.7, env="DEFAULT_TEMPERATURE")
    DEFAULT_MAX_TOKENS: int = Field(default=2048, env="DEFAULT_MAX_TOKENS")
    DEFAULT_TOP_P: float = Field(default=1.0, env="DEFAULT_TOP_P")
    
    # Processing Limits
    MAX_BATCH_SIZE: int = Field(default=1000, env="MAX_BATCH_SIZE")
    MAX_FILE_SIZE_MB: int = Field(default=50, env="MAX_FILE_SIZE_MB")
    RATE_LIMIT_PER_MINUTE: int = Field(default=100, env="RATE_LIMIT_PER_MINUTE")
    MAX_CONCURRENT_EVALUATIONS: int = Field(default=10, env="MAX_CONCURRENT_EVALUATIONS")
    
    # Cache Settings
    REDIS_URL: Optional[str] = Field(default=None, env="REDIS_URL")
    CACHE_TTL_SECONDS: int = Field(default=3600, env="CACHE_TTL_SECONDS")
    ENABLE_CACHING: bool = Field(default=True, env="ENABLE_CACHING")
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    ENABLE_FILE_LOGGING: bool = Field(default=True, env="ENABLE_FILE_LOGGING")
    LOG_FILE_PATH: str = Field(default="logs/app.log", env="LOG_FILE_PATH")
    
    # Evaluation Framework Settings
    ENABLE_RAGAS: bool = Field(default=True, env="ENABLE_RAGAS")
    ENABLE_DEEPEVAL: bool = Field(default=True, env="ENABLE_DEEPEVAL")
    ENABLE_CUSTOM_METRICS: bool = Field(default=True, env="ENABLE_CUSTOM_METRICS")
    
    # Default Model Settings
    DEFAULT_MODEL: str = Field(
        default="openai/gpt-3.5-turbo",
        env="DEFAULT_MODEL"
    )
    EVALUATION_MODEL: str = Field(
        default="openai/gpt-4",
        env="EVALUATION_MODEL"
    )
    
    # Storage Settings
    UPLOAD_DIR: str = Field(default="uploads", env="UPLOAD_DIR")
    EXPORT_DIR: str = Field(default="exports", env="EXPORT_DIR")
    TEMP_DIR: str = Field(default="temp", env="TEMP_DIR")
    
    # Analytics Settings
    ENABLE_ANALYTICS: bool = Field(default=True, env="ENABLE_ANALYTICS")
    ANALYTICS_RETENTION_DAYS: int = Field(default=365, env="ANALYTICS_RETENTION_DAYS")
    
    # Performance Settings
    WORKER_CONNECTIONS: int = Field(default=1000, env="WORKER_CONNECTIONS")
    KEEP_ALIVE_TIMEOUT: int = Field(default=5, env="KEEP_ALIVE_TIMEOUT")
    
    @validator('ALLOWED_ORIGINS', pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @validator('LOG_LEVEL')
    def validate_log_level(cls, v):
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'LOG_LEVEL must be one of: {valid_levels}')
        return v.upper()
    
    @property
    def database_url_sync(self) -> str:
        """Synchronous database URL for SQLAlchemy"""
        if self.DATABASE_URL.startswith("postgresql"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")
        return self.DATABASE_URL
    
    @property
    def database_url_async(self) -> str:
        """Asynchronous database URL for async SQLAlchemy"""
        if self.DATABASE_URL.startswith("postgresql"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
        elif self.DATABASE_URL.startswith("sqlite"):
            return self.DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")
        return self.DATABASE_URL
    
    def create_directories(self):
        """Create necessary directories"""
        dirs = [self.UPLOAD_DIR, self.EXPORT_DIR, self.TEMP_DIR]
        if self.ENABLE_FILE_LOGGING:
            dirs.append(os.path.dirname(self.LOG_FILE_PATH))
        
        for dir_path in dirs:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create global settings instance
settings = Settings()

# Create necessary directories on import
settings.create_directories()
