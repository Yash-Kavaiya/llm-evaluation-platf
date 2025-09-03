from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid
import logging
from datetime import datetime

from config import settings
from database import get_db, init_db
from models import (
    Evaluation, EvaluationSession,
    EvaluationCreate, EvaluationUpdate, EvaluationResponse,
    EvaluationSessionCreate, EvaluationSessionResponse,
    EvaluationSummary, BatchEvaluationRequest, ComparisonRequest,
    ManualScores
)
from llm_client import llm_client, LLMRequest
from ragas_evaluator import ragas_evaluator
from deepeval_evaluator import deepeval_evaluator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
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

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    logger.info("LLM Evaluation Platform API started")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Test LLM connection
@app.get("/test-connection")
async def test_llm_connection():
    try:
        is_connected = llm_client.test_connection()
        return {
            "openrouter_connection": is_connected,
            "message": "Connection successful" if is_connected else "Connection failed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection test failed: {str(e)}")

# Get available models
@app.get("/models")
async def get_available_models():
    try:
        models = await llm_client.get_available_models()
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get models: {str(e)}")

# Session Management Endpoints

@app.post("/sessions", response_model=EvaluationSessionResponse)
async def create_session(
    session_data: EvaluationSessionCreate,
    db: Session = Depends(get_db)
):
    """Create a new evaluation session"""
    try:
        session = EvaluationSession(
            id=str(uuid.uuid4()),
            name=session_data.name,
            description=session_data.description
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return EvaluationSessionResponse(
            id=session.id,
            name=session.name,
            description=session.description,
            created_at=session.created_at,
            updated_at=session.updated_at,
            is_active=session.is_active,
            evaluation_count=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@app.get("/sessions", response_model=List[EvaluationSessionResponse])
async def get_sessions(db: Session = Depends(get_db)):
    """Get all evaluation sessions"""
    try:
        sessions = db.query(EvaluationSession).filter(EvaluationSession.is_active == True).all()
        
        result = []
        for session in sessions:
            eval_count = db.query(Evaluation).filter(Evaluation.session_id == session.id).count()
            result.append(EvaluationSessionResponse(
                id=session.id,
                name=session.name,
                description=session.description,
                created_at=session.created_at,
                updated_at=session.updated_at,
                is_active=session.is_active,
                evaluation_count=eval_count
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

@app.get("/sessions/{session_id}", response_model=EvaluationSessionResponse)
async def get_session(session_id: str, db: Session = Depends(get_db)):
    """Get a specific evaluation session"""
    try:
        session = db.query(EvaluationSession).filter(EvaluationSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        eval_count = db.query(Evaluation).filter(Evaluation.session_id == session_id).count()
        
        return EvaluationSessionResponse(
            id=session.id,
            name=session.name,
            description=session.description,
            created_at=session.created_at,
            updated_at=session.updated_at,
            is_active=session.is_active,
            evaluation_count=eval_count
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

# Single Evaluation Endpoints

@app.post("/evaluate", response_model=EvaluationResponse)
async def create_evaluation(
    eval_data: EvaluationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new evaluation by calling the LLM and storing the result"""
    try:
        # Verify session exists
        session = db.query(EvaluationSession).filter(EvaluationSession.id == eval_data.session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Prepare LLM request
        messages = [{"role": "user", "content": eval_data.prompt}]
        if eval_data.context:
            context_message = f"Context: {eval_data.context}\n\nQuestion: {eval_data.prompt}"
            messages = [{"role": "user", "content": context_message}]
        
        llm_request = LLMRequest(
            model=eval_data.model_name,
            messages=messages,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens
        )
        
        # Call LLM
        llm_response = await llm_client.chat_completion(llm_request)
        
        # Create evaluation record
        evaluation = Evaluation(
            id=str(uuid.uuid4()),
            session_id=eval_data.session_id,
            prompt=eval_data.prompt,
            context=eval_data.context,
            expected_answer=eval_data.expected_answer,
            model_name=eval_data.model_name,
            model_response=llm_response.content,
            response_time=llm_response.response_time,
            tokens_used=llm_response.usage.get("total_tokens", 0),
            category=eval_data.category,
            tags=eval_data.tags
        )
        
        db.add(evaluation)
        db.commit()
        db.refresh(evaluation)
        
        # Schedule automated evaluation in background
        background_tasks.add_task(
            run_automated_evaluation,
            evaluation.id,
            eval_data.prompt,
            llm_response.content,
            eval_data.context,
            eval_data.expected_answer
        )
        
        return _evaluation_to_response(evaluation)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create evaluation: {str(e)}")

@app.put("/evaluations/{evaluation_id}", response_model=EvaluationResponse)
async def update_evaluation(
    evaluation_id: str,
    update_data: EvaluationUpdate,
    db: Session = Depends(get_db)
):
    """Update an evaluation with manual scores and notes"""
    try:
        evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        # Update manual scores
        if update_data.manual_scores:
            if update_data.manual_scores.accuracy_score is not None:
                evaluation.accuracy_score = update_data.manual_scores.accuracy_score
            if update_data.manual_scores.relevance_score is not None:
                evaluation.relevance_score = update_data.manual_scores.relevance_score
            if update_data.manual_scores.helpfulness_score is not None:
                evaluation.helpfulness_score = update_data.manual_scores.helpfulness_score
            if update_data.manual_scores.clarity_score is not None:
                evaluation.clarity_score = update_data.manual_scores.clarity_score
            if update_data.manual_scores.overall_score is not None:
                evaluation.overall_score = update_data.manual_scores.overall_score
        
        # Update metadata
        if update_data.evaluator_name is not None:
            evaluation.evaluator_name = update_data.evaluator_name
        if update_data.evaluation_notes is not None:
            evaluation.evaluation_notes = update_data.evaluation_notes
        if update_data.category is not None:
            evaluation.category = update_data.category
        if update_data.tags is not None:
            evaluation.tags = update_data.tags
        
        evaluation.updated_at = datetime.now()
        
        db.commit()
        db.refresh(evaluation)
        
        return _evaluation_to_response(evaluation)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update evaluation: {str(e)}")

@app.get("/evaluations/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(evaluation_id: str, db: Session = Depends(get_db)):
    """Get a specific evaluation"""
    try:
        evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        return _evaluation_to_response(evaluation)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get evaluation: {str(e)}")

@app.get("/sessions/{session_id}/evaluations", response_model=List[EvaluationResponse])
async def get_session_evaluations(
    session_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all evaluations for a session"""
    try:
        evaluations = (
            db.query(Evaluation)
            .filter(Evaluation.session_id == session_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        return [_evaluation_to_response(eval) for eval in evaluations]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get evaluations: {str(e)}")

# Batch Evaluation Endpoints

@app.post("/evaluate-batch")
async def batch_evaluation(
    request: BatchEvaluationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Run batch evaluation across multiple prompts and models"""
    try:
        # Verify session exists
        session = db.query(EvaluationSession).filter(EvaluationSession.id == request.session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        evaluation_ids = []
        
        for i, prompt in enumerate(request.prompts):
            for model in request.models:
                # Prepare context and expected answer if available
                context = request.contexts[i] if request.contexts and i < len(request.contexts) else None
                expected_answer = request.expected_answers[i] if request.expected_answers and i < len(request.expected_answers) else None
                
                # Create evaluation
                eval_data = EvaluationCreate(
                    session_id=request.session_id,
                    prompt=prompt,
                    context=context,
                    expected_answer=expected_answer,
                    model_name=model,
                    category=request.category,
                    tags=request.tags
                )
                
                # This will be processed in background
                background_tasks.add_task(
                    process_single_evaluation,
                    eval_data
                )
        
        return {
            "message": f"Batch evaluation started for {len(request.prompts)} prompts across {len(request.models)} models",
            "total_evaluations": len(request.prompts) * len(request.models)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start batch evaluation: {str(e)}")

# Model Comparison Endpoint

@app.post("/compare-models")
async def compare_models(
    request: ComparisonRequest,
    background_tasks: BackgroundTasks
):
    """Compare multiple models on the same prompt"""
    try:
        results = []
        
        for model in request.models:
            # Prepare LLM request
            messages = [{"role": "user", "content": request.prompt}]
            if request.context:
                context_message = f"Context: {request.context}\n\nQuestion: {request.prompt}"
                messages = [{"role": "user", "content": context_message}]
            
            llm_request = LLMRequest(
                model=model,
                messages=messages,
                temperature=settings.temperature,
                max_tokens=settings.max_tokens
            )
            
            # Call LLM
            llm_response = await llm_client.chat_completion(llm_request)
            
            # Run automated evaluation
            automated_scores = await run_automated_evaluation_sync(
                request.prompt,
                llm_response.content,
                [request.context] if request.context else None,
                request.expected_answer
            )
            
            results.append({
                "model": model,
                "response": llm_response.content,
                "response_time": llm_response.response_time,
                "tokens_used": llm_response.usage.get("total_tokens", 0),
                "automated_scores": automated_scores
            })
        
        return {
            "prompt": request.prompt,
            "context": request.context,
            "expected_answer": request.expected_answer,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare models: {str(e)}")

# Analytics Endpoints

@app.get("/sessions/{session_id}/summary", response_model=EvaluationSummary)
async def get_session_summary(session_id: str, db: Session = Depends(get_db)):
    """Get summary statistics for a session"""
    try:
        evaluations = db.query(Evaluation).filter(Evaluation.session_id == session_id).all()
        
        if not evaluations:
            return EvaluationSummary(
                total_evaluations=0,
                average_scores=ManualScores(),
                model_breakdown={},
                category_breakdown={},
                score_distribution={}
            )
        
        # Calculate averages (excluding None values)
        def avg_score(scores):
            filtered = [s for s in scores if s is not None]
            return sum(filtered) / len(filtered) if filtered else None
        
        avg_scores = ManualScores(
            accuracy_score=avg_score([e.accuracy_score for e in evaluations]),
            relevance_score=avg_score([e.relevance_score for e in evaluations]),
            helpfulness_score=avg_score([e.helpfulness_score for e in evaluations]),
            clarity_score=avg_score([e.clarity_score for e in evaluations]),
            overall_score=avg_score([e.overall_score for e in evaluations])
        )
        
        # Model breakdown
        model_breakdown = {}
        for eval in evaluations:
            model_breakdown[eval.model_name] = model_breakdown.get(eval.model_name, 0) + 1
        
        # Category breakdown
        category_breakdown = {}
        for eval in evaluations:
            category = eval.category or "Uncategorized"
            category_breakdown[category] = category_breakdown.get(category, 0) + 1
        
        # Score distribution (overall scores)
        score_distribution = {"1-2": 0, "2-4": 0, "4-6": 0, "6-8": 0, "8-10": 0}
        for eval in evaluations:
            if eval.overall_score is not None:
                score = eval.overall_score
                if score <= 2:
                    score_distribution["1-2"] += 1
                elif score <= 4:
                    score_distribution["2-4"] += 1
                elif score <= 6:
                    score_distribution["4-6"] += 1
                elif score <= 8:
                    score_distribution["6-8"] += 1
                else:
                    score_distribution["8-10"] += 1
        
        return EvaluationSummary(
            total_evaluations=len(evaluations),
            average_scores=avg_scores,
            model_breakdown=model_breakdown,
            category_breakdown=category_breakdown,
            score_distribution=score_distribution
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get summary: {str(e)}")

# Helper Functions

def _evaluation_to_response(evaluation: Evaluation) -> EvaluationResponse:
    """Convert database evaluation to response model"""
    return EvaluationResponse(
        id=evaluation.id,
        session_id=evaluation.session_id,
        prompt=evaluation.prompt,
        context=evaluation.context,
        expected_answer=evaluation.expected_answer,
        model_name=evaluation.model_name,
        model_response=evaluation.model_response,
        response_time=evaluation.response_time,
        tokens_used=evaluation.tokens_used,
        cost=evaluation.cost,
        accuracy_score=evaluation.accuracy_score,
        relevance_score=evaluation.relevance_score,
        helpfulness_score=evaluation.helpfulness_score,
        clarity_score=evaluation.clarity_score,
        overall_score=evaluation.overall_score,
        ragas_scores=evaluation.ragas_scores,
        deepeval_scores=evaluation.deepeval_scores,
        evaluator_name=evaluation.evaluator_name,
        evaluation_notes=evaluation.evaluation_notes,
        category=evaluation.category,
        tags=evaluation.tags,
        created_at=evaluation.created_at,
        updated_at=evaluation.updated_at
    )

async def run_automated_evaluation(
    evaluation_id: str,
    prompt: str,
    response: str,
    context: Optional[str] = None,
    expected_answer: Optional[str] = None
):
    """Run automated evaluation and update the database"""
    try:
        from database import SessionLocal
        db = SessionLocal()
        
        # Get evaluation
        evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        if not evaluation:
            return
        
        contexts_list = [context] if context else None
        
        # Run RAGAS evaluation (requires OpenAI API key)
        ragas_scores = {}
        # Uncomment when OpenAI API key is available
        # ragas_scores = ragas_evaluator.evaluate_single(
        #     question=prompt,
        #     answer=response,
        #     contexts=contexts_list,
        #     ground_truth=expected_answer,
        #     openai_api_key="your_openai_api_key"
        # )
        
        # Run DeepEval evaluation
        deepeval_scores = deepeval_evaluator.evaluate_single(
            question=prompt,
            answer=response,
            contexts=contexts_list,
            expected_output=expected_answer
        )
        
        # Update evaluation with automated scores
        evaluation.ragas_scores = ragas_scores
        evaluation.deepeval_scores = deepeval_scores
        
        db.commit()
        db.close()
        
    except Exception as e:
        logger.error(f"Automated evaluation failed for {evaluation_id}: {e}")

async def run_automated_evaluation_sync(
    prompt: str,
    response: str,
    contexts: Optional[List[str]] = None,
    expected_answer: Optional[str] = None
) -> Dict[str, Any]:
    """Run automated evaluation synchronously for comparison"""
    try:
        # Run RAGAS evaluation
        ragas_scores = {}
        # Uncomment when OpenAI API key is available
        # ragas_scores = ragas_evaluator.evaluate_single(
        #     question=prompt,
        #     answer=response,
        #     contexts=contexts,
        #     ground_truth=expected_answer,
        #     openai_api_key="your_openai_api_key"
        # )
        
        # Run DeepEval evaluation
        deepeval_scores = deepeval_evaluator.evaluate_single(
            question=prompt,
            answer=response,
            contexts=contexts,
            expected_output=expected_answer
        )
        
        return {
            "ragas": ragas_scores,
            "deepeval": deepeval_scores
        }
        
    except Exception as e:
        logger.error(f"Automated evaluation failed: {e}")
        return {"ragas": {}, "deepeval": {}}

async def process_single_evaluation(eval_data: EvaluationCreate):
    """Process a single evaluation in background"""
    try:
        from database import SessionLocal
        db = SessionLocal()
        
        # Prepare LLM request
        messages = [{"role": "user", "content": eval_data.prompt}]
        if eval_data.context:
            context_message = f"Context: {eval_data.context}\n\nQuestion: {eval_data.prompt}"
            messages = [{"role": "user", "content": context_message}]
        
        llm_request = LLMRequest(
            model=eval_data.model_name,
            messages=messages,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens
        )
        
        # Call LLM
        llm_response = await llm_client.chat_completion(llm_request)
        
        # Create evaluation record
        evaluation = Evaluation(
            id=str(uuid.uuid4()),
            session_id=eval_data.session_id,
            prompt=eval_data.prompt,
            context=eval_data.context,
            expected_answer=eval_data.expected_answer,
            model_name=eval_data.model_name,
            model_response=llm_response.content,
            response_time=llm_response.response_time,
            tokens_used=llm_response.usage.get("total_tokens", 0),
            category=eval_data.category,
            tags=eval_data.tags
        )
        
        db.add(evaluation)
        db.commit()
        
        # Run automated evaluation
        await run_automated_evaluation(
            evaluation.id,
            eval_data.prompt,
            llm_response.content,
            eval_data.context,
            eval_data.expected_answer
        )
        
        db.close()
        
    except Exception as e:
        logger.error(f"Failed to process evaluation: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.api_host, port=settings.api_port, reload=settings.debug)