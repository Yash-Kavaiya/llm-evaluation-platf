"""
Pydantic models for data validation and API documentation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List, Any, Union
from datetime import datetime
from enum import Enum

# Enums
class EvaluationType(str, Enum):
    MANUAL = "manual"
    AUTOMATED = "automated"
    BULK = "bulk"
    COMPARATIVE = "comparative"
    RESPONSIBLE_AI = "responsible_ai"
    RAG = "rag"

class EvaluationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class MetricType(str, Enum):
    AUTOMATIC = "automatic"
    MANUAL = "manual"
    FRAMEWORK = "framework"
    CUSTOM = "custom"

# Base Models
class TimestampMixin(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Session Models
class SessionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Session name")
    description: Optional[str] = Field(None, max_length=1000, description="Session description")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    metadata: Optional[Dict[str, Any]] = None

class SessionResponse(SessionBase, TimestampMixin):
    id: str
    evaluation_count: int = 0
    avg_score: Optional[float] = None
    
    class Config:
        from_attributes = True

# Evaluation Models
class EvaluationBase(BaseModel):
    session_id: str = Field(..., description="Session ID")
    prompt: str = Field(..., min_length=1, description="Input prompt/question")
    context: Optional[str] = Field(None, description="Additional context")
    expected_answer: Optional[str] = Field(None, description="Expected/reference answer")
    model_name: str = Field(..., description="Model name used for generation")
    category: Optional[str] = Field(None, description="Evaluation category")
    
class EvaluationCreate(EvaluationBase):
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(2048, ge=1, le=8192)
    top_p: Optional[float] = Field(1.0, ge=0.0, le=1.0)

class EvaluationUpdate(BaseModel):
    manual_scores: Optional[Dict[str, float]] = Field(None, description="Manual evaluation scores")
    evaluator_name: Optional[str] = Field(None, description="Name of evaluator")
    evaluation_notes: Optional[str] = Field(None, description="Evaluation notes")
    metadata: Optional[Dict[str, Any]] = None

class ManualScores(BaseModel):
    accuracy_score: float = Field(..., ge=1, le=10, description="Accuracy score (1-10)")
    relevance_score: float = Field(..., ge=1, le=10, description="Relevance score (1-10)")
    helpfulness_score: float = Field(..., ge=1, le=10, description="Helpfulness score (1-10)")
    clarity_score: float = Field(..., ge=1, le=10, description="Clarity score (1-10)")
    overall_score: float = Field(..., ge=1, le=10, description="Overall score (1-10)")

class EvaluationMetrics(BaseModel):
    # Automatic metrics
    rouge1: Optional[float] = None
    rouge2: Optional[float] = None
    rougeL: Optional[float] = None
    bleu: Optional[float] = None
    meteor: Optional[float] = None
    coherence: Optional[float] = None
    relevance: Optional[float] = None
    
    # Framework-specific metrics
    ragas_metrics: Optional[Dict[str, float]] = None
    deepeval_metrics: Optional[Dict[str, float]] = None
    custom_metrics: Optional[Dict[str, float]] = None

class EvaluationResponse(EvaluationBase, TimestampMixin):
    id: str
    model_response: Optional[str] = None
    status: EvaluationStatus
    evaluation_type: EvaluationType
    
    # Scores and metrics
    automatic_metrics: Optional[EvaluationMetrics] = None
    manual_scores: Optional[ManualScores] = None
    framework_scores: Optional[Dict[str, Dict[str, float]]] = None
    
    # Performance metrics
    response_time: Optional[float] = None
    tokens_used: Optional[int] = None
    cost: Optional[float] = None
    
    # Evaluation metadata
    evaluator_name: Optional[str] = None
    evaluation_notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# Bulk Evaluation Models
class BulkEvaluationRow(BaseModel):
    question: str
    answer: str
    model: Optional[str] = None
    context: Optional[str] = None
    expected_answer: Optional[str] = None
    category: Optional[str] = None

class BulkEvaluationRequest(BaseModel):
    session_id: str
    data: List[BulkEvaluationRow]
    selected_metrics: List[str] = Field(default_factory=list)
    model_name: Optional[str] = None
    batch_size: int = Field(10, ge=1, le=100)
    
    @validator('data')
    def validate_data_not_empty(cls, v):
        if not v:
            raise ValueError('Data cannot be empty')
        return v

class BulkEvaluationProgress(BaseModel):
    total_items: int
    processed_items: int
    progress_percentage: float
    current_status: str
    estimated_time_remaining: Optional[int] = None
    
class BulkEvaluationResult(BaseModel):
    id: str
    session_id: str
    total_items: int
    processed_items: int
    successful_items: int
    failed_items: int
    status: EvaluationStatus
    results: List[EvaluationResponse]
    progress: BulkEvaluationProgress
    created_at: datetime
    completed_at: Optional[datetime] = None

# Comparison Models
class ComparisonRequest(BaseModel):
    session_id: str
    prompt: str
    context: Optional[str] = None
    expected_answer: Optional[str] = None
    models: List[str] = Field(..., min_items=2, max_items=10)
    selected_metrics: List[str] = Field(default_factory=list)
    
class ModelComparison(BaseModel):
    model_name: str
    response: str
    metrics: EvaluationMetrics
    response_time: float
    tokens_used: int
    cost: Optional[float] = None

class ComparisonResult(BaseModel):
    id: str
    session_id: str
    prompt: str
    context: Optional[str] = None
    expected_answer: Optional[str] = None
    comparisons: List[ModelComparison]
    winner: Optional[str] = None
    winner_reason: Optional[str] = None
    created_at: datetime

# Analytics Models
class SessionSummary(BaseModel):
    session_id: str
    session_name: str
    total_evaluations: int
    avg_automatic_score: Optional[float] = None
    avg_manual_score: Optional[float] = None
    model_distribution: Dict[str, int]
    category_distribution: Dict[str, int]
    evaluation_type_distribution: Dict[str, int]
    date_range: Dict[str, datetime]
    top_performing_models: List[Dict[str, Any]]
    metric_averages: Dict[str, float]

class PlatformAnalytics(BaseModel):
    total_sessions: int
    total_evaluations: int
    total_models_tested: int
    avg_platform_score: float
    popular_models: List[Dict[str, Any]]
    evaluation_trends: Dict[str, Any]
    framework_usage: Dict[str, int]
    
# Model Provider Models
class ModelProvider(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    provider: str
    context_length: Optional[int] = None
    pricing: Optional[Dict[str, float]] = None
    capabilities: List[str] = Field(default_factory=list)
    
class ModelListResponse(BaseModel):
    models: List[ModelProvider]
    total_count: int
    providers: List[str]

# Health and Status Models
class HealthCheck(BaseModel):
    status: str = "healthy"
    timestamp: datetime
    version: str
    database_status: str
    openrouter_status: Optional[str] = None
    cache_status: Optional[str] = None
    
class ConnectionTest(BaseModel):
    service: str
    status: str
    response_time: Optional[float] = None
    error: Optional[str] = None

# Error Models
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)

# Responsible AI Models
class ResponsibleAIRequest(BaseModel):
    text: str
    context: Optional[str] = None
    selected_checks: List[str] = Field(default_factory=list)
    
class ResponsibleAIResult(BaseModel):
    bias_score: Optional[float] = None
    toxicity_score: Optional[float] = None
    fairness_score: Optional[float] = None
    safety_score: Optional[float] = None
    privacy_score: Optional[float] = None
    detailed_analysis: Dict[str, Any] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)

# RAG Playground Models
class RAGRequest(BaseModel):
    question: str
    documents: List[str]
    model_name: Optional[str] = None
    retrieval_strategy: str = "similarity"
    top_k: int = Field(3, ge=1, le=10)
    
class RAGResult(BaseModel):
    question: str
    answer: str
    retrieved_documents: List[Dict[str, Any]]
    retrieval_scores: List[float]
    answer_quality: Dict[str, float]
    citations: List[str] = Field(default_factory=list)
