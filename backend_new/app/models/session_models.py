"""
SQLAlchemy database models for sessions and user management
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from app.database.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Session(Base):
    __tablename__ = "sessions"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Basic fields
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Session metadata
    metadata = Column(JSON, nullable=True)
    
    # Session statistics (cached for performance)
    evaluation_count = Column(Integer, default=0)
    avg_automatic_score = Column(Float, nullable=True)
    avg_manual_score = Column(Float, nullable=True)
    
    # Session status
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    evaluations = relationship("Evaluation", back_populates="session", cascade="all, delete-orphan")
    bulk_evaluations = relationship("BulkEvaluation", back_populates="session", cascade="all, delete-orphan")
    model_comparisons = relationship("ModelComparison", back_populates="session", cascade="all, delete-orphan")
    responsible_ai_evaluations = relationship("ResponsibleAIEvaluation", back_populates="session", cascade="all, delete-orphan")
    rag_evaluations = relationship("RAGEvaluation", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Session(id={self.id}, name={self.name}, evaluations={self.evaluation_count})>"

class User(Base):
    __tablename__ = "users"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # User identification
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=True, index=True)
    full_name = Column(String(200), nullable=True)
    
    # User preferences
    preferences = Column(JSON, nullable=True)
    
    # User status
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    # Usage statistics
    total_evaluations = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"

class APIKey(Base):
    __tablename__ = "api_keys"
    
    # Primary key
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Key data
    key_name = Column(String(100), nullable=False)
    key_hash = Column(String(200), nullable=False, unique=True, index=True)
    key_prefix = Column(String(20), nullable=False)  # First few characters for identification
    
    # Permissions and limits
    permissions = Column(JSON, nullable=True)
    rate_limit = Column(Integer, default=1000)  # Requests per hour
    is_active = Column(Boolean, default=True)
    
    # Usage tracking
    total_requests = Column(Integer, default=0)
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<APIKey(id={self.id}, name={self.key_name}, active={self.is_active})>"
