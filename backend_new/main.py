#!/usr/bin/env python3
"""
LLM Evaluation Platform - Main Application Entry Point
A comprehensive, scalable backend for LLM evaluation with support for:
- Manual and bulk evaluations
- Multiple evaluation frameworks (RAGAS, DeepEval, Custom)
- Session management and analytics
- OpenRouter API integration for multiple LLM providers
"""

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import uvicorn
from typing import Dict, Any

# Import core components
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.database.database import init_db, get_db
from app.core.exceptions import setup_exception_handlers

# Import all routers
from app.routers import (
    health,
    models,
    sessions,
    evaluations,
    bulk_evaluation,
    analytics,
    responsible_ai,
    rag_playground
)

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - handles startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting LLM Evaluation Platform...")
    try:
        # Initialize database
        init_db()
        logger.info("✅ Database initialized successfully")
        
        # Test external services
        from app.services.openrouter_service import test_connection
        if await test_connection():
            logger.info("✅ OpenRouter API connection tested successfully")
        else:
            logger.warning("⚠️ OpenRouter API connection failed - some features may be limited")
            
        logger.info("🎉 LLM Evaluation Platform started successfully!")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down LLM Evaluation Platform...")
    logger.info("✅ Shutdown completed")


# Create FastAPI application
app = FastAPI(
    title="LLM Evaluation Platform API",
    description="""
    ## Comprehensive LLM Evaluation Platform
    
    A scalable, production-ready API for evaluating Large Language Models with:
    
    ### 🎯 **Core Features**
    - **Manual Evaluation**: Single prompt-response evaluation with comprehensive metrics
    - **Bulk Processing**: Batch evaluation of CSV datasets with progress tracking
    - **Multiple Frameworks**: Integration with RAGAS, DeepEval, and custom evaluators
    - **Session Management**: Organize evaluations into manageable sessions
    - **Analytics Dashboard**: Comprehensive performance analytics and insights
    
    ### 🔧 **Advanced Capabilities**
    - **Responsible AI**: Bias, toxicity, and fairness evaluation
    - **RAG Playground**: Document-based question answering evaluation
    - **Model Comparison**: Side-by-side model performance analysis
    - **Custom Metrics**: Build and deploy custom evaluation criteria
    - **Real-time Processing**: Live evaluation with progress tracking
    
    ### 🌐 **Integrations**
    - **OpenRouter API**: Access to 100+ LLM providers
    - **Multiple Databases**: SQLite, PostgreSQL support
    - **Export Formats**: JSON, CSV, detailed reports
    
    ### 📊 **Evaluation Frameworks**
    - **RAGAS**: Answer relevancy, faithfulness, context precision/recall
    - **DeepEval**: G-Eval, hallucination detection, bias analysis
    - **Custom**: Build domain-specific evaluation criteria
    
    Built with FastAPI for high performance and automatic API documentation.
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "LLM Evaluation Platform",
        "url": "https://github.com/Yash-Kavaiya/llm-evaluation-platf",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan
)

# Configure middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Setup exception handlers
setup_exception_handlers(app)

# Include all routers with proper prefixes and tags
app.include_router(
    health.router,
    prefix="/api/v1",
    tags=["Health & Status"]
)

app.include_router(
    models.router,
    prefix="/api/v1",
    tags=["Models & Providers"]
)

app.include_router(
    sessions.router,
    prefix="/api/v1",
    tags=["Session Management"]
)

app.include_router(
    evaluations.router,
    prefix="/api/v1",
    tags=["Evaluations"]
)

app.include_router(
    bulk_evaluation.router,
    prefix="/api/v1",
    tags=["Bulk Processing"]
)

app.include_router(
    analytics.router,
    prefix="/api/v1",
    tags=["Analytics & Insights"]
)

app.include_router(
    responsible_ai.router,
    prefix="/api/v1",
    tags=["Responsible AI"]
)

app.include_router(
    rag_playground.router,
    prefix="/api/v1",
    tags=["RAG Playground"]
)

# Root endpoint
@app.get("/", response_model=Dict[str, Any])
async def root():
    """
    Root endpoint providing API overview and health status
    """
    return {
        "message": "🎉 LLM Evaluation Platform API",
        "version": "2.0.0",
        "status": "healthy",
        "features": [
            "Manual Evaluation",
            "Bulk Processing", 
            "Session Management",
            "Analytics Dashboard",
            "Responsible AI Assessment",
            "RAG Playground",
            "Multi-Framework Support"
        ],
        "documentation": {
            "interactive": "/docs",
            "redoc": "/redoc"
        },
        "frameworks": [
            "RAGAS",
            "DeepEval", 
            "Custom Metrics",
            "MLFlow",
            "Phoenix",
            "Deepchecks"
        ],
        "supported_providers": "100+ via OpenRouter API"
    }


# API Info endpoint
@app.get("/api/v1/info", response_model=Dict[str, Any])
async def api_info():
    """
    Detailed API information and capabilities
    """
    return {
        "api_version": "2.0.0",
        "platform": "LLM Evaluation Platform",
        "capabilities": {
            "evaluation_types": ["manual", "automated", "bulk", "comparative"],
            "supported_frameworks": [
                {
                    "name": "RAGAS",
                    "metrics": ["answer_relevancy", "faithfulness", "context_precision", "context_recall", "answer_correctness", "answer_similarity"]
                },
                {
                    "name": "DeepEval", 
                    "metrics": ["g_eval", "answer_relevancy", "faithfulness", "contextual_precision", "hallucination", "correctness", "toxicity", "bias"]
                },
                {
                    "name": "Custom",
                    "metrics": ["user_defined", "domain_specific", "formula_based"]
                }
            ],
            "data_formats": ["JSON", "CSV", "TSV"],
            "export_formats": ["JSON", "CSV", "Excel", "PDF"],
            "real_time_processing": True,
            "batch_processing": True,
            "session_management": True,
            "analytics_dashboard": True
        },
        "limits": {
            "max_batch_size": settings.MAX_BATCH_SIZE,
            "max_file_size": f"{settings.MAX_FILE_SIZE_MB}MB",
            "rate_limit": f"{settings.RATE_LIMIT_PER_MINUTE}/minute"
        },
        "integrations": {
            "openrouter": True,
            "custom_llm_apis": True,
            "database_support": ["SQLite", "PostgreSQL", "MySQL"]
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning",
        access_log=settings.DEBUG
    )
