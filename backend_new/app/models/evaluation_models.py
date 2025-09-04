"""
SQLAlchemy database models for evaluations
"""

from sqlalchemy import Column, String, Text, Float, Integer, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from app.database.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Evaluation(Base):
    __tablename__ = "evaluations"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Foreign keys
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Basic fields
    prompt = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    expected_answer = Column(Text, nullable=True)
    model_name = Column(String(200), nullable=False, index=True)
    model_response = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    
    # Status and type
    status = Column(String(20), default="pending", index=True)
    evaluation_type = Column(String(20), default="manual", index=True)
    
    # Generation parameters
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=2048)
    top_p = Column(Float, default=1.0)
    
    # Automatic metrics (JSON field)
    automatic_metrics = Column(JSON, nullable=True)
    
    # Manual scores
    accuracy_score = Column(Float, nullable=True)
    relevance_score = Column(Float, nullable=True)
    helpfulness_score = Column(Float, nullable=True)
    clarity_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)
    
    # Framework-specific scores (JSON field)
    framework_scores = Column(JSON, nullable=True)
    
    # Performance metrics
    response_time = Column(Float, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    cost = Column(Float, nullable=True)
    
    # Evaluation metadata
    evaluator_name = Column(String(200), nullable=True)
    evaluation_notes = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    session = relationship("Session", back_populates="evaluations")
    
    def __repr__(self):
        return f"<Evaluation(id={self.id}, model={self.model_name}, status={self.status})>"

class BulkEvaluation(Base):
    __tablename__ = "bulk_evaluations"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Foreign keys
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Bulk evaluation metadata
    total_items = Column(Integer, nullable=False)
    processed_items = Column(Integer, default=0)
    successful_items = Column(Integer, default=0)
    failed_items = Column(Integer, default=0)
    
    # Status and progress
    status = Column(String(20), default="pending", index=True)
    progress_percentage = Column(Float, default=0.0)
    current_status = Column(String(200), nullable=True)
    estimated_time_remaining = Column(Integer, nullable=True)
    
    # Configuration
    selected_metrics = Column(JSON, nullable=True)
    batch_size = Column(Integer, default=10)
    model_name = Column(String(200), nullable=True)
    
    # Results summary
    results_summary = Column(JSON, nullable=True)
    error_log = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    session = relationship("Session", back_populates="bulk_evaluations")
    
    def __repr__(self):
        return f"<BulkEvaluation(id={self.id}, status={self.status}, progress={self.progress_percentage}%)>"

class ModelComparison(Base):
    __tablename__ = "model_comparisons"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Foreign keys
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Comparison data
    prompt = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    expected_answer = Column(Text, nullable=True)
    models_tested = Column(JSON, nullable=False)  # List of model names
    
    # Results
    comparison_results = Column(JSON, nullable=False)  # Detailed results per model
    winner = Column(String(200), nullable=True)
    winner_reason = Column(Text, nullable=True)
    
    # Metadata
    selected_metrics = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    session = relationship("Session", back_populates="model_comparisons")
    
    def __repr__(self):
        return f"<ModelComparison(id={self.id}, models={len(self.models_tested)}, winner={self.winner})>"

class ResponsibleAIEvaluation(Base):
    __tablename__ = "responsible_ai_evaluations"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Foreign keys
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    evaluation_id = Column(String, ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Input data
    text = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    selected_checks = Column(JSON, nullable=True)
    
    # AI safety scores
    bias_score = Column(Float, nullable=True)
    toxicity_score = Column(Float, nullable=True)
    fairness_score = Column(Float, nullable=True)
    safety_score = Column(Float, nullable=True)
    privacy_score = Column(Float, nullable=True)
    
    # Detailed analysis
    detailed_analysis = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    # Metadata
    metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    session = relationship("Session", back_populates="responsible_ai_evaluations")
    evaluation = relationship("Evaluation")
    
    def __repr__(self):
        return f"<ResponsibleAIEvaluation(id={self.id}, safety_score={self.safety_score})>"

class RAGEvaluation(Base):
    __tablename__ = "rag_evaluations"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Foreign keys
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # RAG specific data
    question = Column(Text, nullable=False)
    documents = Column(JSON, nullable=False)  # List of documents
    model_name = Column(String(200), nullable=True)
    retrieval_strategy = Column(String(50), default="similarity")
    top_k = Column(Integer, default=3)
    
    # Results
    answer = Column(Text, nullable=True)
    retrieved_documents = Column(JSON, nullable=True)
    retrieval_scores = Column(JSON, nullable=True)
    answer_quality = Column(JSON, nullable=True)
    citations = Column(JSON, nullable=True)
    
    # Performance metrics
    retrieval_time = Column(Float, nullable=True)
    generation_time = Column(Float, nullable=True)
    total_time = Column(Float, nullable=True)
    
    # Metadata
    metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    session = relationship("Session", back_populates="rag_evaluations")
    
    def __repr__(self):
        return f"<RAGEvaluation(id={self.id}, question_length={len(self.question)})>"
