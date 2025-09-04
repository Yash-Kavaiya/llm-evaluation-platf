"""
Individual evaluation endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.database.database import get_db
from app.models.schemas import (
    EvaluationCreate, EvaluationUpdate, EvaluationResponse,
    ManualScores
)
from app.models.evaluation_models import Evaluation
from app.models.session_models import Session as SessionModel
from app.services.evaluation_service import evaluation_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/evaluate", response_model=EvaluationResponse)
async def create_evaluation(
    evaluation_data: EvaluationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> EvaluationResponse:
    """
    Create and run a new evaluation
    """
    try:
        # Verify session exists
        session = db.query(SessionModel).filter(SessionModel.id == evaluation_data.session_id).first()
        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session {evaluation_data.session_id} not found"
            )
        
        # Run evaluation
        eval_result = await evaluation_service.evaluate_single(evaluation_data)
        
        # Save to database
        db_evaluation = Evaluation(
            id=eval_result["id"],
            session_id=evaluation_data.session_id,
            prompt=evaluation_data.prompt,
            context=evaluation_data.context,
            expected_answer=evaluation_data.expected_answer,
            model_name=evaluation_data.model_name,
            model_response=eval_result.get("model_response"),
            category=evaluation_data.category,
            status=eval_result["status"],
            evaluation_type=eval_result["evaluation_type"],
            temperature=evaluation_data.temperature,
            max_tokens=evaluation_data.max_tokens,
            top_p=evaluation_data.top_p,
            automatic_metrics=eval_result.get("automatic_metrics"),
            framework_scores=eval_result.get("framework_scores"),
            response_time=eval_result.get("response_time"),
            tokens_used=eval_result.get("tokens_used"),
            cost=eval_result.get("cost"),
            metadata=eval_result.get("metadata"),
            completed_at=eval_result["completed_at"]
        )
        
        db.add(db_evaluation)
        
        # Update session activity
        session.last_activity = datetime.now()
        session.evaluation_count = session.evaluation_count + 1
        
        db.commit()
        db.refresh(db_evaluation)
        
        # Convert to response format
        response = EvaluationResponse(
            id=db_evaluation.id,
            session_id=db_evaluation.session_id,
            prompt=db_evaluation.prompt,
            context=db_evaluation.context,
            expected_answer=db_evaluation.expected_answer,
            model_name=db_evaluation.model_name,
            model_response=db_evaluation.model_response,
            category=db_evaluation.category,
            status=db_evaluation.status,
            evaluation_type=db_evaluation.evaluation_type,
            automatic_metrics=db_evaluation.automatic_metrics,
            framework_scores=db_evaluation.framework_scores,
            response_time=db_evaluation.response_time,
            tokens_used=db_evaluation.tokens_used,
            cost=db_evaluation.cost,
            metadata=db_evaluation.metadata,
            created_at=db_evaluation.created_at,
            updated_at=db_evaluation.updated_at
        )
        
        logger.info(f"Created evaluation: {db_evaluation.id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create evaluation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create evaluation: {str(e)}"
        )

@router.get("/evaluations/{evaluation_id}", response_model=EvaluationResponse)
def get_evaluation(
    evaluation_id: str,
    db: Session = Depends(get_db)
) -> EvaluationResponse:
    """
    Get specific evaluation by ID
    """
    try:
        evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        
        if not evaluation:
            raise HTTPException(
                status_code=404,
                detail=f"Evaluation with ID {evaluation_id} not found"
            )
        
        # Prepare manual scores
        manual_scores = None
        if any([evaluation.accuracy_score, evaluation.relevance_score, 
                evaluation.helpfulness_score, evaluation.clarity_score, 
                evaluation.overall_score]):
            manual_scores = ManualScores(
                accuracy_score=evaluation.accuracy_score or 5,
                relevance_score=evaluation.relevance_score or 5,
                helpfulness_score=evaluation.helpfulness_score or 5,
                clarity_score=evaluation.clarity_score or 5,
                overall_score=evaluation.overall_score or 5
            )
        
        return EvaluationResponse(
            id=evaluation.id,
            session_id=evaluation.session_id,
            prompt=evaluation.prompt,
            context=evaluation.context,
            expected_answer=evaluation.expected_answer,
            model_name=evaluation.model_name,
            model_response=evaluation.model_response,
            category=evaluation.category,
            status=evaluation.status,
            evaluation_type=evaluation.evaluation_type,
            automatic_metrics=evaluation.automatic_metrics,
            manual_scores=manual_scores,
            framework_scores=evaluation.framework_scores,
            response_time=evaluation.response_time,
            tokens_used=evaluation.tokens_used,
            cost=evaluation.cost,
            evaluator_name=evaluation.evaluator_name,
            evaluation_notes=evaluation.evaluation_notes,
            metadata=evaluation.metadata,
            created_at=evaluation.created_at,
            updated_at=evaluation.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get evaluation {evaluation_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve evaluation: {str(e)}"
        )

@router.put("/evaluations/{evaluation_id}", response_model=EvaluationResponse)
def update_evaluation(
    evaluation_id: str,
    evaluation_update: EvaluationUpdate,
    db: Session = Depends(get_db)
) -> EvaluationResponse:
    """
    Update evaluation with manual scores and notes
    """
    try:
        evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        
        if not evaluation:
            raise HTTPException(
                status_code=404,
                detail=f"Evaluation with ID {evaluation_id} not found"
            )
        
        # Update manual scores
        if evaluation_update.manual_scores:
            evaluation.accuracy_score = evaluation_update.manual_scores.get("accuracy_score")
            evaluation.relevance_score = evaluation_update.manual_scores.get("relevance_score")
            evaluation.helpfulness_score = evaluation_update.manual_scores.get("helpfulness_score")
            evaluation.clarity_score = evaluation_update.manual_scores.get("clarity_score")
            evaluation.overall_score = evaluation_update.manual_scores.get("overall_score")
        
        # Update other fields
        if evaluation_update.evaluator_name is not None:
            evaluation.evaluator_name = evaluation_update.evaluator_name
        if evaluation_update.evaluation_notes is not None:
            evaluation.evaluation_notes = evaluation_update.evaluation_notes
        if evaluation_update.metadata is not None:
            evaluation.metadata = {**(evaluation.metadata or {}), **evaluation_update.metadata}
        
        evaluation.updated_at = datetime.now()
        
        db.commit()
        db.refresh(evaluation)
        
        # Prepare manual scores for response
        manual_scores = None
        if any([evaluation.accuracy_score, evaluation.relevance_score, 
                evaluation.helpfulness_score, evaluation.clarity_score, 
                evaluation.overall_score]):
            manual_scores = ManualScores(
                accuracy_score=evaluation.accuracy_score or 5,
                relevance_score=evaluation.relevance_score or 5,
                helpfulness_score=evaluation.helpfulness_score or 5,
                clarity_score=evaluation.clarity_score or 5,
                overall_score=evaluation.overall_score or 5
            )
        
        logger.info(f"Updated evaluation: {evaluation_id}")
        
        return EvaluationResponse(
            id=evaluation.id,
            session_id=evaluation.session_id,
            prompt=evaluation.prompt,
            context=evaluation.context,
            expected_answer=evaluation.expected_answer,
            model_name=evaluation.model_name,
            model_response=evaluation.model_response,
            category=evaluation.category,
            status=evaluation.status,
            evaluation_type=evaluation.evaluation_type,
            automatic_metrics=evaluation.automatic_metrics,
            manual_scores=manual_scores,
            framework_scores=evaluation.framework_scores,
            response_time=evaluation.response_time,
            tokens_used=evaluation.tokens_used,
            cost=evaluation.cost,
            evaluator_name=evaluation.evaluator_name,
            evaluation_notes=evaluation.evaluation_notes,
            metadata=evaluation.metadata,
            created_at=evaluation.created_at,
            updated_at=evaluation.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update evaluation {evaluation_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update evaluation: {str(e)}"
        )

@router.get("/sessions/{session_id}/evaluations", response_model=List[EvaluationResponse])
def get_session_evaluations(
    session_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[EvaluationResponse]:
    """
    Get all evaluations for a specific session
    """
    try:
        # Verify session exists
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session {session_id} not found"
            )
        
        # Get evaluations
        evaluations = db.query(Evaluation)\
            .filter(Evaluation.session_id == session_id)\
            .order_by(desc(Evaluation.created_at))\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        # Convert to response format
        response_evaluations = []
        for evaluation in evaluations:
            # Prepare manual scores
            manual_scores = None
            if any([evaluation.accuracy_score, evaluation.relevance_score, 
                    evaluation.helpfulness_score, evaluation.clarity_score, 
                    evaluation.overall_score]):
                manual_scores = ManualScores(
                    accuracy_score=evaluation.accuracy_score or 5,
                    relevance_score=evaluation.relevance_score or 5,
                    helpfulness_score=evaluation.helpfulness_score or 5,
                    clarity_score=evaluation.clarity_score or 5,
                    overall_score=evaluation.overall_score or 5
                )
            
            response_evaluations.append(EvaluationResponse(
                id=evaluation.id,
                session_id=evaluation.session_id,
                prompt=evaluation.prompt,
                context=evaluation.context,
                expected_answer=evaluation.expected_answer,
                model_name=evaluation.model_name,
                model_response=evaluation.model_response,
                category=evaluation.category,
                status=evaluation.status,
                evaluation_type=evaluation.evaluation_type,
                automatic_metrics=evaluation.automatic_metrics,
                manual_scores=manual_scores,
                framework_scores=evaluation.framework_scores,
                response_time=evaluation.response_time,
                tokens_used=evaluation.tokens_used,
                cost=evaluation.cost,
                evaluator_name=evaluation.evaluator_name,
                evaluation_notes=evaluation.evaluation_notes,
                metadata=evaluation.metadata,
                created_at=evaluation.created_at,
                updated_at=evaluation.updated_at
            ))
        
        return response_evaluations
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get evaluations for session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve evaluations: {str(e)}"
        )

@router.delete("/evaluations/{evaluation_id}")
def delete_evaluation(
    evaluation_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Delete an evaluation
    """
    try:
        evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        
        if not evaluation:
            raise HTTPException(
                status_code=404,
                detail=f"Evaluation with ID {evaluation_id} not found"
            )
        
        session_id = evaluation.session_id
        
        # Delete evaluation
        db.delete(evaluation)
        
        # Update session evaluation count
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if session:
            session.evaluation_count = max(0, session.evaluation_count - 1)
            session.updated_at = datetime.now()
        
        db.commit()
        
        logger.info(f"Deleted evaluation: {evaluation_id}")
        
        return {"message": f"Evaluation {evaluation_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete evaluation {evaluation_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete evaluation: {str(e)}"
        )
