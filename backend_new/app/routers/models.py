"""
Models and providers management endpoints
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import logging

from app.models.schemas import ModelListResponse, ModelProvider
from app.services.openrouter_service import get_available_models
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/models", response_model=ModelListResponse)
async def get_models() -> ModelListResponse:
    """
    Get list of available models from OpenRouter and other providers
    """
    try:
        models_data = await get_available_models()
        
        # Convert to ModelProvider format
        models = []
        providers = set()
        
        for model_data in models_data:
            provider = model_data.get("provider", "Unknown")
            providers.add(provider)
            
            model = ModelProvider(
                id=model_data.get("id", ""),
                name=model_data.get("name", model_data.get("id", "")),
                description=model_data.get("description"),
                provider=provider,
                context_length=model_data.get("context_length"),
                pricing=model_data.get("pricing"),
                capabilities=model_data.get("capabilities", [])
            )
            models.append(model)
        
        return ModelListResponse(
            models=models,
            total_count=len(models),
            providers=sorted(list(providers))
        )
        
    except Exception as e:
        logger.error(f"Failed to get models: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve models: {str(e)}"
        )

@router.get("/models/{model_id}")
async def get_model_details(model_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific model
    """
    try:
        models_data = await get_available_models()
        
        # Find the specific model
        model_info = None
        for model_data in models_data:
            if model_data.get("id") == model_id:
                model_info = model_data
                break
        
        if not model_info:
            raise HTTPException(
                status_code=404,
                detail=f"Model '{model_id}' not found"
            )
        
        return {
            "id": model_info.get("id"),
            "name": model_info.get("name"),
            "description": model_info.get("description"),
            "provider": model_info.get("provider"),
            "context_length": model_info.get("context_length"),
            "pricing": model_info.get("pricing"),
            "capabilities": model_info.get("capabilities", []),
            "parameters": model_info.get("parameters", {}),
            "created": model_info.get("created"),
            "updated": model_info.get("updated")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get model details for {model_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve model details: {str(e)}"
        )

@router.get("/providers")
async def get_providers() -> Dict[str, Any]:
    """
    Get list of available model providers
    """
    try:
        models_data = await get_available_models()
        
        # Group models by provider
        providers = {}
        
        for model_data in models_data:
            provider = model_data.get("provider", "Unknown")
            
            if provider not in providers:
                providers[provider] = {
                    "name": provider,
                    "models": [],
                    "total_models": 0,
                    "capabilities": set()
                }
            
            providers[provider]["models"].append({
                "id": model_data.get("id"),
                "name": model_data.get("name"),
                "context_length": model_data.get("context_length")
            })
            providers[provider]["total_models"] += 1
            
            # Collect capabilities
            capabilities = model_data.get("capabilities", [])
            providers[provider]["capabilities"].update(capabilities)
        
        # Convert capabilities sets to lists
        for provider_info in providers.values():
            provider_info["capabilities"] = list(provider_info["capabilities"])
        
        return {
            "providers": list(providers.values()),
            "total_providers": len(providers),
            "total_models": len(models_data)
        }
        
    except Exception as e:
        logger.error(f"Failed to get providers: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve providers: {str(e)}"
        )

@router.get("/models/search")
async def search_models(
    query: str = "",
    provider: str = "",
    capability: str = "",
    max_context: int = None,
    min_context: int = None
) -> Dict[str, Any]:
    """
    Search and filter available models
    """
    try:
        models_data = await get_available_models()
        
        filtered_models = []
        
        for model_data in models_data:
            # Apply filters
            if query and query.lower() not in model_data.get("name", "").lower():
                continue
            
            if provider and model_data.get("provider", "").lower() != provider.lower():
                continue
            
            if capability:
                model_capabilities = model_data.get("capabilities", [])
                if capability.lower() not in [cap.lower() for cap in model_capabilities]:
                    continue
            
            if max_context or min_context:
                context_length = model_data.get("context_length")
                if context_length:
                    if max_context and context_length > max_context:
                        continue
                    if min_context and context_length < min_context:
                        continue
            
            filtered_models.append(model_data)
        
        return {
            "models": filtered_models,
            "total_results": len(filtered_models),
            "filters_applied": {
                "query": query,
                "provider": provider,
                "capability": capability,
                "max_context": max_context,
                "min_context": min_context
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to search models: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search models: {str(e)}"
        )

@router.get("/models/popular")
async def get_popular_models() -> Dict[str, Any]:
    """
    Get list of popular/recommended models
    """
    try:
        all_models = await get_available_models()
        
        # Define popular models (in a real system, this would be based on usage statistics)
        popular_model_ids = [
            "openai/gpt-4",
            "openai/gpt-3.5-turbo",
            "anthropic/claude-3-opus",
            "anthropic/claude-3-sonnet",
            "google/gemini-pro",
            "meta-llama/llama-2-70b-chat",
            "microsoft/wizardlm-70b",
            "mistralai/mixtral-8x7b-instruct"
        ]
        
        popular_models = []
        for model_data in all_models:
            if model_data.get("id") in popular_model_ids:
                popular_models.append(model_data)
        
        # Sort by the order in popular_model_ids
        popular_models.sort(key=lambda x: popular_model_ids.index(x.get("id")))
        
        return {
            "popular_models": popular_models,
            "count": len(popular_models),
            "categories": {
                "large_models": [m for m in popular_models if "70b" in m.get("id", "").lower() or "opus" in m.get("id", "").lower()],
                "fast_models": [m for m in popular_models if "turbo" in m.get("id", "").lower() or "sonnet" in m.get("id", "").lower()],
                "multimodal": [m for m in popular_models if "gpt-4" in m.get("id", "").lower() or "gemini" in m.get("id", "").lower()]
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get popular models: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve popular models: {str(e)}"
        )

@router.get("/test-connection")
async def test_model_connection() -> Dict[str, Any]:
    """
    Test connection to model providers
    """
    try:
        from app.services.openrouter_service import test_connection
        
        openrouter_status = await test_connection()
        
        return {
            "openrouter": {
                "status": "connected" if openrouter_status else "disconnected",
                "configured": bool(settings.OPENROUTER_API_KEY)
            },
            "overall_status": "connected" if openrouter_status else "limited",
            "message": "All providers connected" if openrouter_status else "Some providers unavailable"
        }
        
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        return {
            "openrouter": {
                "status": "error",
                "error": str(e)
            },
            "overall_status": "error",
            "message": f"Connection test failed: {str(e)}"
        }
