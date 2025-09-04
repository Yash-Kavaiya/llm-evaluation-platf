"""
Session management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from app.database.database import get_db
from app.models.schemas import (
    SessionCreate, SessionUpdate, SessionResponse,
    SessionSummary
)
from app.models.session_models import Session as SessionModel
from app.models.evaluation_models import Evaluation

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/sessions", response_model=SessionResponse)
def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db)
) -> SessionResponse:
    """
    Create a new evaluation session
    """
    try:
        # Create new session
        db_session = SessionModel(
            name=session_data.name,
            description=session_data.description,
            metadata=session_data.metadata or {}
        )
        
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        
        logger.info(f"Created new session: {db_session.id}")
        
        return SessionResponse(
            id=db_session.id,
            name=db_session.name,
            description=db_session.description,
            metadata=db_session.metadata,
            evaluation_count=0,
            avg_score=None,
            created_at=db_session.created_at,
            updated_at=db_session.updated_at
        )
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create session: {str(e)}"
        )

@router.get("/sessions", response_model=List[SessionResponse])
def get_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    include_archived: bool = Query(False),
    db: Session = Depends(get_db)
) -> List[SessionResponse]:
    """
    Get list of evaluation sessions with pagination
    """
    try:
        query = db.query(SessionModel)
        
        if not include_archived:
            query = query.filter(SessionModel.is_archived == False)
        
        # Order by last activity, then by creation date
        query = query.order_by(desc(SessionModel.last_activity), desc(SessionModel.created_at))
        
        sessions = query.offset(skip).limit(limit).all()
        
        # Get evaluation counts for each session
        session_ids = [s.id for s in sessions]
        eval_counts = db.query(
            Evaluation.session_id,
            func.count(Evaluation.id).label('count'),
            func.avg(Evaluation.overall_score).label('avg_score')
        ).filter(
            Evaluation.session_id.in_(session_ids)
        ).group_by(Evaluation.session_id).all()
        
        # Create lookup dictionary
        counts_dict = {ec.session_id: (ec.count, ec.avg_score) for ec in eval_counts}
        
        response_sessions = []
        for session in sessions:
            count, avg_score = counts_dict.get(session.id, (0, None))
            
            response_sessions.append(SessionResponse(
                id=session.id,
                name=session.name,
                description=session.description,
                metadata=session.metadata,
                evaluation_count=count,
                avg_score=avg_score,
                created_at=session.created_at,
                updated_at=session.updated_at
            ))
        
        return response_sessions
        
    except Exception as e:
        logger.error(f"Failed to get sessions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve sessions: {str(e)}"
        )

@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: str,
    db: Session = Depends(get_db)
) -> SessionResponse:
    """
    Get specific session by ID
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session with ID {session_id} not found"
            )
        
        # Get evaluation statistics
        eval_stats = db.query(
            func.count(Evaluation.id).label('count'),
            func.avg(Evaluation.overall_score).label('avg_score')
        ).filter(Evaluation.session_id == session_id).first()
        
        count = eval_stats.count if eval_stats else 0
        avg_score = eval_stats.avg_score if eval_stats else None
        
        return SessionResponse(
            id=session.id,
            name=session.name,
            description=session.description,
            metadata=session.metadata,
            evaluation_count=count,
            avg_score=avg_score,
            created_at=session.created_at,
            updated_at=session.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve session: {str(e)}"
        )

@router.put("/sessions/{session_id}", response_model=SessionResponse)
def update_session(
    session_id: str,
    session_update: SessionUpdate,
    db: Session = Depends(get_db)
) -> SessionResponse:
    """
    Update session information
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session with ID {session_id} not found"
            )
        
        # Update fields
        if session_update.name is not None:
            session.name = session_update.name
        if session_update.description is not None:
            session.description = session_update.description
        if session_update.metadata is not None:
            session.metadata = session_update.metadata
        
        session.updated_at = datetime.now()
        
        db.commit()
        db.refresh(session)
        
        # Get evaluation statistics
        eval_stats = db.query(
            func.count(Evaluation.id).label('count'),
            func.avg(Evaluation.overall_score).label('avg_score')
        ).filter(Evaluation.session_id == session_id).first()
        
        count = eval_stats.count if eval_stats else 0
        avg_score = eval_stats.avg_score if eval_stats else None
        
        logger.info(f"Updated session: {session_id}")
        
        return SessionResponse(
            id=session.id,
            name=session.name,
            description=session.description,
            metadata=session.metadata,
            evaluation_count=count,
            avg_score=avg_score,
            created_at=session.created_at,
            updated_at=session.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update session: {str(e)}"
        )

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Delete a session and all associated evaluations
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session with ID {session_id} not found"
            )
        
        # Delete session (cascade will handle evaluations)
        db.delete(session)
        db.commit()
        
        logger.info(f"Deleted session: {session_id}")
        
        return {"message": f"Session {session_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete session: {str(e)}"
        )

@router.post("/sessions/{session_id}/archive")
def archive_session(
    session_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Archive a session (soft delete)
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session with ID {session_id} not found"
            )
        
        session.is_archived = True
        session.updated_at = datetime.now()
        
        db.commit()
        
        logger.info(f"Archived session: {session_id}")
        
        return {"message": f"Session {session_id} archived successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to archive session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to archive session: {str(e)}"
        )

@router.post("/sessions/{session_id}/restore")
def restore_session(
    session_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Restore an archived session
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session with ID {session_id} not found"
            )
        
        session.is_archived = False
        session.updated_at = datetime.now()
        
        db.commit()
        
        logger.info(f"Restored session: {session_id}")
        
        return {"message": f"Session {session_id} restored successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to restore session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restore session: {str(e)}"
        )
