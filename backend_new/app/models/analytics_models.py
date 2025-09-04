"""
SQLAlchemy database models for analytics and reporting
"""

from sqlalchemy import Column, String, Text, Float, Integer, DateTime, JSON, Boolean, Index
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from app.database.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class EvaluationAnalytics(Base):
    __tablename__ = "evaluation_analytics"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Time-based partitioning
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    hour = Column(Integer, nullable=False, index=True)  # 0-23
    
    # Aggregated metrics
    total_evaluations = Column(Integer, default=0)
    successful_evaluations = Column(Integer, default=0)
    failed_evaluations = Column(Integer, default=0)
    
    # Score aggregations
    avg_automatic_score = Column(Float, nullable=True)
    avg_manual_score = Column(Float, nullable=True)
    avg_response_time = Column(Float, nullable=True)
    
    # Model usage
    model_usage = Column(JSON, nullable=True)  # {"model_name": count, ...}
    framework_usage = Column(JSON, nullable=True)  # {"framework": count, ...}
    
    # Category distribution
    category_distribution = Column(JSON, nullable=True)
    evaluation_type_distribution = Column(JSON, nullable=True)
    
    # Performance metrics
    total_tokens_used = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<EvaluationAnalytics(date={self.date}, evaluations={self.total_evaluations})>"

# Create composite index for efficient time-series queries
Index('idx_analytics_date_hour', EvaluationAnalytics.date, EvaluationAnalytics.hour)

class ModelPerformance(Base):
    __tablename__ = "model_performance"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Model identification
    model_name = Column(String(200), nullable=False, index=True)
    provider = Column(String(100), nullable=True, index=True)
    
    # Time period
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Performance metrics
    total_evaluations = Column(Integer, default=0)
    avg_score = Column(Float, nullable=True)
    avg_response_time = Column(Float, nullable=True)
    success_rate = Column(Float, nullable=True)
    
    # Detailed metrics
    metric_scores = Column(JSON, nullable=True)  # All metric averages
    score_distribution = Column(JSON, nullable=True)  # Score histogram
    
    # Usage metrics
    total_tokens = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    
    # Ranking and comparison
    rank_overall = Column(Integer, nullable=True)
    rank_in_category = Column(JSON, nullable=True)  # {"category": rank, ...}
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<ModelPerformance(model={self.model_name}, score={self.avg_score})>"

# Create composite index for model performance queries
Index('idx_model_perf_name_date', ModelPerformance.model_name, ModelPerformance.date)

class SessionAnalytics(Base):
    __tablename__ = "session_analytics"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Session reference
    session_id = Column(String, nullable=False, index=True)
    session_name = Column(String(200), nullable=False)
    
    # Time period
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Session metrics
    evaluations_added = Column(Integer, default=0)
    unique_models_tested = Column(Integer, default=0)
    avg_session_score = Column(Float, nullable=True)
    
    # Detailed analysis
    model_distribution = Column(JSON, nullable=True)
    category_distribution = Column(JSON, nullable=True)
    score_trends = Column(JSON, nullable=True)
    
    # Performance
    total_response_time = Column(Float, default=0.0)
    total_tokens_used = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<SessionAnalytics(session={self.session_id}, date={self.date})>"

class PlatformMetrics(Base):
    __tablename__ = "platform_metrics"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Time period
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    metric_type = Column(String(50), nullable=False, index=True)  # daily, weekly, monthly
    
    # Overall platform metrics
    total_sessions = Column(Integer, default=0)
    total_evaluations = Column(Integer, default=0)
    total_models_tested = Column(Integer, default=0)
    total_users = Column(Integer, default=0)
    
    # Performance metrics
    platform_avg_score = Column(Float, nullable=True)
    platform_success_rate = Column(Float, nullable=True)
    avg_response_time = Column(Float, nullable=True)
    
    # Popular items
    top_models = Column(JSON, nullable=True)
    top_categories = Column(JSON, nullable=True)
    top_frameworks = Column(JSON, nullable=True)
    
    # Trends and insights
    score_trends = Column(JSON, nullable=True)
    usage_patterns = Column(JSON, nullable=True)
    geographic_distribution = Column(JSON, nullable=True)
    
    # System metrics
    total_api_calls = Column(Integer, default=0)
    total_tokens_processed = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<PlatformMetrics(date={self.date}, type={self.metric_type})>"

# Create composite index for platform metrics queries
Index('idx_platform_metrics_date_type', PlatformMetrics.date, PlatformMetrics.metric_type)

class CustomMetric(Base):
    __tablename__ = "custom_metrics"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Metric definition
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    formula = Column(Text, nullable=False)
    category = Column(String(100), nullable=True, index=True)
    
    # Metric metadata
    input_variables = Column(JSON, nullable=True)  # Variables required for calculation
    output_range = Column(JSON, nullable=True)  # Expected output range
    higher_is_better = Column(Boolean, default=True)
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    avg_score = Column(Float, nullable=True)
    
    # Validation and testing
    is_validated = Column(Boolean, default=False)
    test_cases = Column(JSON, nullable=True)
    validation_results = Column(JSON, nullable=True)
    
    # Sharing and visibility
    is_public = Column(Boolean, default=False)
    creator_id = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<CustomMetric(name={self.name}, category={self.category})>"
