#!/usr/bin/env python3

import os
import sys
import uvicorn
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def start_server():
    """Start the LLM Evaluation Platform API server"""
    
    # Check if .env exists, if not create a basic one
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("Creating basic .env file...")
        with open(env_file, "w") as f:
            f.write("""# LLM Evaluation Platform Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=LLM Evaluation Platform

# Database Configuration (SQLite for development)
DATABASE_URL=sqlite:///./llm_eval.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true

# Default Models
DEFAULT_MODEL=deepseek/deepseek-chat-v3.1:free
EVALUATION_MODELS=deepseek/deepseek-chat-v3.1:free,openai/gpt-4o-mini,anthropic/claude-3-haiku
""")
        print("✅ Created .env file. Please update OPENROUTER_API_KEY with your actual API key.")
    
    # Start the server
    print("🚀 Starting LLM Evaluation Platform API...")
    print("📝 API Documentation: http://localhost:8000/docs")
    print("🔄 ReDoc Documentation: http://localhost:8000/redoc")
    print("💡 Update .env file with your OpenRouter API key for full functionality")
    print("\n" + "="*60 + "\n")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("\n💡 Make sure you have installed the requirements:")
        print("   pip install -r requirements.txt")
        sys.exit(1)

if __name__ == "__main__":
    start_server()