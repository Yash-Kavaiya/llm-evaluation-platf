"""
Custom exception handlers for the LLM Evaluation Platform
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)

class EvaluationException(Exception):
    """Base exception for evaluation-related errors"""
    def __init__(self, message: str, details: Dict[str, Any] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class OpenRouterException(EvaluationException):
    """Exception for OpenRouter API errors"""
    pass

class DatabaseException(EvaluationException):
    """Exception for database-related errors"""
    pass

class ValidationException(EvaluationException):
    """Exception for validation errors"""
    pass

class ProcessingException(EvaluationException):
    """Exception for processing errors"""
    pass

def setup_exception_handlers(app: FastAPI):
    """Setup custom exception handlers"""
    
    @app.exception_handler(EvaluationException)
    async def evaluation_exception_handler(request: Request, exc: EvaluationException):
        logger.error(f"Evaluation exception: {exc.message}", extra={"details": exc.details})
        return JSONResponse(
            status_code=400,
            content={
                "error": "EvaluationError",
                "message": exc.message,
                "details": exc.details
            }
        )
    
    @app.exception_handler(OpenRouterException)
    async def openrouter_exception_handler(request: Request, exc: OpenRouterException):
        logger.error(f"OpenRouter exception: {exc.message}", extra={"details": exc.details})
        return JSONResponse(
            status_code=502,
            content={
                "error": "OpenRouterError",
                "message": exc.message,
                "details": exc.details
            }
        )
    
    @app.exception_handler(DatabaseException)
    async def database_exception_handler(request: Request, exc: DatabaseException):
        logger.error(f"Database exception: {exc.message}", extra={"details": exc.details})
        return JSONResponse(
            status_code=500,
            content={
                "error": "DatabaseError",
                "message": "A database error occurred",
                "details": exc.details if logger.level <= logging.DEBUG else {}
            }
        )
    
    @app.exception_handler(ValidationException)
    async def validation_exception_handler(request: Request, exc: ValidationException):
        logger.warning(f"Validation exception: {exc.message}", extra={"details": exc.details})
        return JSONResponse(
            status_code=422,
            content={
                "error": "ValidationError",
                "message": exc.message,
                "details": exc.details
            }
        )
    
    @app.exception_handler(ProcessingException)
    async def processing_exception_handler(request: Request, exc: ProcessingException):
        logger.error(f"Processing exception: {exc.message}", extra={"details": exc.details})
        return JSONResponse(
            status_code=500,
            content={
                "error": "ProcessingError",
                "message": exc.message,
                "details": exc.details
            }
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Request validation error: {exc.errors()}")
        return JSONResponse(
            status_code=422,
            content={
                "error": "ValidationError",
                "message": "Request validation failed",
                "details": {
                    "errors": exc.errors(),
                    "body": str(exc.body) if hasattr(exc, 'body') else None
                }
            }
        )
    
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": "HTTPError",
                "message": exc.detail,
                "status_code": exc.status_code
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "InternalServerError",
                "message": "An unexpected error occurred",
                "details": {
                    "type": type(exc).__name__,
                    "message": str(exc) if logger.level <= logging.DEBUG else "Internal server error"
                }
            }
        )
