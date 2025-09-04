"""
Health check and status endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any
import logging

from app.database.database import get_db
from app.models.schemas import HealthCheck, ConnectionTest
from app.services.openrouter_service import test_connection
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health", response_model=HealthCheck)
async def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check endpoint
    Returns system status and service availability
    """
    try:
        # Test database connection
        db.execute("SELECT 1")
        database_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        database_status = "unhealthy"
    
    # Test OpenRouter connection
    openrouter_status = None
    try:
        if settings.OPENROUTER_API_KEY:
            is_connected = await test_connection()
            openrouter_status = "healthy" if is_connected else "unhealthy"
        else:
            openrouter_status = "not_configured"
    except Exception as e:
        logger.error(f"OpenRouter health check failed: {str(e)}")
        openrouter_status = "unhealthy"
    
    # Determine overall status
    overall_status = "healthy"
    if database_status != "healthy":
        overall_status = "unhealthy"
    elif openrouter_status == "unhealthy":
        overall_status = "degraded"
    
    return HealthCheck(
        status=overall_status,
        timestamp=datetime.now(),
        version=settings.VERSION,
        database_status=database_status,
        openrouter_status=openrouter_status
    )

@router.get("/health/database")
async def database_health(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Detailed database health check
    """
    try:
        # Test basic query
        start_time = datetime.now()
        result = db.execute("SELECT 1 as test").fetchone()
        end_time = datetime.now()
        
        response_time = (end_time - start_time).total_seconds() * 1000  # milliseconds
        
        # Test table access
        from app.models.session_models import Session as SessionModel
        session_count = db.query(SessionModel).count()
        
        return {
            "status": "healthy",
            "response_time_ms": response_time,
            "database_url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "local",
            "session_count": session_count,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/health/openrouter")
async def openrouter_health() -> Dict[str, Any]:
    """
    Detailed OpenRouter API health check
    """
    if not settings.OPENROUTER_API_KEY:
        return {
            "status": "not_configured",
            "message": "OpenRouter API key not configured",
            "timestamp": datetime.now().isoformat()
        }
    
    try:
        start_time = datetime.now()
        is_connected = await test_connection()
        end_time = datetime.now()
        
        response_time = (end_time - start_time).total_seconds() * 1000  # milliseconds
        
        return {
            "status": "healthy" if is_connected else "unhealthy",
            "response_time_ms": response_time,
            "api_endpoint": settings.OPENROUTER_BASE_URL,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"OpenRouter health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/ping")
async def ping() -> Dict[str, str]:
    """
    Simple ping endpoint for basic connectivity testing
    """
    return {
        "message": "pong",
        "timestamp": datetime.now().isoformat(),
        "version": settings.VERSION
    }

@router.get("/status")
async def system_status(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Comprehensive system status including usage statistics
    """
    try:
        # Database statistics
        from app.models.session_models import Session as SessionModel
        from app.models.evaluation_models import Evaluation
        
        total_sessions = db.query(SessionModel).count()
        total_evaluations = db.query(Evaluation).count()
        
        # Recent activity (last 24 hours)
        from sqlalchemy import func
        from datetime import timedelta
        
        recent_cutoff = datetime.now() - timedelta(hours=24)
        recent_evaluations = db.query(Evaluation).filter(
            Evaluation.created_at >= recent_cutoff
        ).count()
        
        # System info
        import psutil
        
        return {
            "status": "operational",
            "version": settings.VERSION,
            "uptime": "system_uptime_placeholder",  # Would need to track startup time
            "statistics": {
                "total_sessions": total_sessions,
                "total_evaluations": total_evaluations,
                "recent_evaluations_24h": recent_evaluations
            },
            "system": {
                "cpu_usage": psutil.cpu_percent(),
                "memory_usage": psutil.virtual_memory().percent,
                "disk_usage": psutil.disk_usage('/').percent
            },
            "configuration": {
                "debug_mode": settings.DEBUG,
                "database_type": "sqlite" if "sqlite" in settings.DATABASE_URL else "postgresql",
                "openrouter_configured": bool(settings.OPENROUTER_API_KEY),
                "cache_enabled": settings.ENABLE_CACHING
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"System status check failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
