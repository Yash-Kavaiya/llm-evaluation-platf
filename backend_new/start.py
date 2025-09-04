#!/usr/bin/env python3

"""
Startup script for the LLM Evaluation Platform Backend
"""

import os
import sys
import asyncio
import uvicorn
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def create_env_file():
    """Create a basic .env file if it doesn't exist"""
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("📝 Creating basic .env file...")
        with open(env_file, "w") as f:
            f.write("""# LLM Evaluation Platform Backend Configuration

# Application Settings
DEBUG=true
HOST=0.0.0.0
PORT=8000

# Database Configuration (SQLite for development)
DATABASE_URL=sqlite:///./llm_evaluation.db

# OpenRouter API Configuration (Optional - for LLM integrations)
# OPENROUTER_API_KEY=your_openrouter_api_key_here
# OPENROUTER_SITE_URL=http://localhost:3000
# OPENROUTER_SITE_NAME=LLM Evaluation Platform

# OpenAI Configuration (Optional - for RAGAS evaluations)
# OPENAI_API_KEY=your_openai_api_key_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080,*

# Evaluation Framework Settings
ENABLE_RAGAS=false
ENABLE_DEEPEVAL=false
ENABLE_CUSTOM_METRICS=true

# Performance Settings
MAX_BATCH_SIZE=100
MAX_FILE_SIZE_MB=50
RATE_LIMIT_PER_MINUTE=1000

# Logging
LOG_LEVEL=INFO
ENABLE_FILE_LOGGING=true

# Security (Change in production)
SECRET_KEY=dev-secret-key-change-in-production
""")
        print("✅ Created .env file with default configuration")
    else:
        print("✅ .env file already exists")

def install_dependencies():
    """Install required dependencies"""
    import subprocess
    import sys
    
    print("📦 Installing dependencies...")
    try:
        # Install basic dependencies
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", 
            "fastapi>=0.104.0",
            "uvicorn[standard]>=0.24.0", 
            "pydantic>=2.5.0",
            "sqlalchemy>=2.0.0",
            "aiosqlite>=0.19.0",
            "python-dotenv>=1.0.0",
            "aiohttp>=3.9.0",
            "psutil>=5.9.0"
        ])
        print("✅ Core dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_dependencies():
    """Check if required dependencies are available"""
    required_packages = [
        "fastapi", "uvicorn", "pydantic", "sqlalchemy", 
        "aiosqlite", "dotenv", "aiohttp", "psutil"
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing required packages: {', '.join(missing_packages)}")
        print("🔧 Attempting to install missing dependencies...")
        return install_dependencies()
    else:
        print("✅ All required dependencies are available")
        return True

async def test_application():
    """Test that the application can start properly"""
    try:
        from app.core.config import settings
        from app.database.database import init_db
        
        print("🧪 Testing application configuration...")
        
        # Test configuration
        print(f"   - Debug mode: {settings.DEBUG}")
        print(f"   - Database URL: {settings.DATABASE_URL}")
        print(f"   - Host: {settings.HOST}:{settings.PORT}")
        
        # Test database initialization
        print("🗄️  Testing database initialization...")
        init_db()
        print("✅ Database initialized successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Application test failed: {str(e)}")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting LLM Evaluation Platform Backend...")
    print("=" * 60)
    
    # Step 1: Create environment file
    create_env_file()
    
    # Step 2: Check and install dependencies
    if not check_dependencies():
        print("❌ Failed to install required dependencies")
        sys.exit(1)
    
    # Step 3: Test application
    if not asyncio.run(test_application()):
        print("❌ Application test failed")
        sys.exit(1)
    
    # Step 4: Start the server
    print("\n" + "=" * 60)
    print("🎉 LLM Evaluation Platform Backend Starting...")
    print("📝 API Documentation: http://localhost:8000/docs")
    print("🔄 ReDoc Documentation: http://localhost:8000/redoc")
    print("💚 Health Check: http://localhost:8000/api/v1/health")
    print("🔍 Models Endpoint: http://localhost:8000/api/v1/models")
    print("\n" + "=" * 60 + "\n")
    
    try:
        # Import here to ensure all setup is complete
        from app.core.config import settings
        
        uvicorn.run(
            "main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            log_level="info" if settings.DEBUG else "warning",
            access_log=settings.DEBUG
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server startup failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
