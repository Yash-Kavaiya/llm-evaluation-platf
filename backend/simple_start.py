#!/usr/bin/env python3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime

# Create FastAPI app
app = FastAPI(
    title="LLM Evaluation Platform API",
    description="Comprehensive LLM evaluation platform with manual and automated evaluation capabilities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {"message": "LLM Evaluation Platform API is running!"}

@app.get("/test")
async def test_endpoint():
    return {"message": "Test endpoint working!", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    print("🚀 Starting Simple LLM Evaluation Platform API...")
    print("📝 API Documentation: http://localhost:8000/docs")
    print("🔄 ReDoc Documentation: http://localhost:8000/redoc")
    print("\n" + "="*60 + "\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
