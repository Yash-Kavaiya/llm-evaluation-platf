from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

Base = declarative_base()

# Database Models
class EvaluationSession(Base):
    __tablename__ = "evaluation_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    evaluations = relationship("Evaluation", back_populates="session")

class Evaluation(Base):
    __tablename__ = "evaluations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("evaluation_sessions.id"), nullable=False)
    
    # Input data
    prompt = Column(Text, nullable=False)
    context = Column(Text)  # For RAG evaluations
    expected_answer = Column(Text)  # Ground truth for comparison
    
    # Model information
    model_name = Column(String, nullable=False)
    model_response = Column(Text, nullable=False)
    
    # Response metadata
    response_time = Column(Float)
    tokens_used = Column(Integer)
    cost = Column(Float)
    
    # Manual evaluation scores
    accuracy_score = Column(Float)
    relevance_score = Column(Float)
    helpfulness_score = Column(Float)
    clarity_score = Column(Float)
    overall_score = Column(Float)
    
    # Automated evaluation scores
    ragas_scores = Column(JSON)  # Store RAGAS evaluation results
    deepeval_scores = Column(JSON)  # Store DeepEval evaluation results
    
    # Evaluation metadata
    evaluator_name = Column(String)
    evaluation_notes = Column(Text)
    category = Column(String)
    tags = Column(JSON)  # List of tags
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session = relationship("EvaluationSession", back_populates="evaluations")

# Pydantic Models for API
class EvaluationSessionCreate(BaseModel):
    name: str
    description: Optional[str] = None

class EvaluationSessionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    is_active: bool
    evaluation_count: int = 0

class ManualScores(BaseModel):
    accuracy_score: Optional[float] = None
    relevance_score: Optional[float] = None
    helpfulness_score: Optional[float] = None
    clarity_score: Optional[float] = None
    overall_score: Optional[float] = None

class EvaluationCreate(BaseModel):
    session_id: str
    prompt: str
    context: Optional[str] = None
    expected_answer: Optional[str] = None
    model_name: str
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class EvaluationUpdate(BaseModel):
    manual_scores: Optional[ManualScores] = None
    evaluator_name: Optional[str] = None
    evaluation_notes: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class EvaluationResponse(BaseModel):
    id: str
    session_id: str
    prompt: str
    context: Optional[str]
    expected_answer: Optional[str]
    model_name: str
    model_response: str
    response_time: Optional[float]
    tokens_used: Optional[int]
    cost: Optional[float]
    
    # Manual scores
    accuracy_score: Optional[float]
    relevance_score: Optional[float]
    helpfulness_score: Optional[float]
    clarity_score: Optional[float]
    overall_score: Optional[float]
    
    # Automated scores
    ragas_scores: Optional[Dict[str, Any]]
    deepeval_scores: Optional[Dict[str, Any]]
    
    # Metadata
    evaluator_name: Optional[str]
    evaluation_notes: Optional[str]
    category: Optional[str]
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: Optional[datetime]

class EvaluationSummary(BaseModel):
    total_evaluations: int
    average_scores: ManualScores
    model_breakdown: Dict[str, int]
    category_breakdown: Dict[str, int]
    score_distribution: Dict[str, int]

class BatchEvaluationRequest(BaseModel):
    session_id: str
    prompts: List[str]
    contexts: Optional[List[str]] = None
    expected_answers: Optional[List[str]] = None
    models: List[str]
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class ComparisonRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    models: List[str]
    expected_answer: Optional[str] = None