# LLM Evaluation Platform Backend

A comprehensive, scalable FastAPI backend for evaluating Large Language Models with support for multiple evaluation frameworks, session management, and advanced analytics.

## 🚀 Quick Start

### Option 1: Using the Startup Script (Recommended)

```bash
cd backend_new
python start.py
```

The startup script will:
- Create a default `.env` configuration file
- Install required dependencies automatically
- Initialize the database
- Start the server on http://localhost:8000

### Option 2: Manual Setup

1. **Install Dependencies**
```bash
cd backend_new
pip install -r requirements.txt
```

2. **Create Environment File**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the Server**
```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/health

## 🎯 Core Features

### ✅ Implemented Features

1. **Health & Status Monitoring**
   - Comprehensive health checks
   - System status monitoring
   - Database connectivity testing
   - OpenRouter API testing

2. **Model Management**
   - Integration with OpenRouter (100+ models)
   - Model discovery and listing
   - Provider information
   - Model search and filtering

3. **Session Management**
   - Create and manage evaluation sessions
   - Session analytics and statistics
   - Archive and restore functionality
   - Bulk session operations

4. **Individual Evaluations**
   - Single prompt-response evaluations
   - Manual scoring and annotations
   - Automatic metric calculations
   - Multi-framework evaluation support

5. **Basic Evaluation Metrics**
   - ROUGE (1, 2, L) scores
   - BLEU scores
   - Coherence and relevance metrics
   - Fluency and informativeness scores
   - Custom linguistic metrics

### 🚧 In Development

1. **Bulk Processing**
   - CSV file upload and processing
   - Batch evaluation with progress tracking
   - Resume and pause functionality

2. **Advanced Analytics**
   - Session performance analytics
   - Model comparison reports
   - Trend analysis and insights

3. **Responsible AI Assessment**
   - Bias detection
   - Toxicity analysis
   - Fairness evaluation
   - Safety scoring

4. **RAG Playground**
   - Document-based Q&A evaluation
   - Retrieval quality assessment
   - Citation verification

## 🏗️ Architecture

```
backend_new/
├── app/
│   ├── core/           # Core configuration and utilities
│   ├── models/         # Pydantic schemas and SQLAlchemy models
│   ├── routers/        # API route handlers
│   ├── services/       # Business logic services
│   ├── evaluators/     # Evaluation framework implementations
│   ├── database/       # Database configuration
│   └── utils/          # Utility functions
├── main.py            # FastAPI application entry point
├── start.py           # Development startup script
└── requirements.txt   # Python dependencies
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Application
DEBUG=true
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=sqlite:///./llm_evaluation.db

# API Keys (Optional)
OPENROUTER_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

# Features
ENABLE_RAGAS=false
ENABLE_DEEPEVAL=false
ENABLE_CUSTOM_METRICS=true

# Performance
MAX_BATCH_SIZE=100
RATE_LIMIT_PER_MINUTE=1000
```

### Database Support

- **SQLite** (default): No setup required, file-based database
- **PostgreSQL**: Set `DATABASE_URL=postgresql://user:pass@host:port/db`
- **MySQL**: Set `DATABASE_URL=mysql://user:pass@host:port/db`

## 📊 API Endpoints

### Core Endpoints

- `GET /` - API overview and status
- `GET /api/v1/info` - Detailed API capabilities
- `GET /api/v1/health` - Health check

### Sessions
- `POST /api/v1/sessions` - Create session
- `GET /api/v1/sessions` - List sessions
- `GET /api/v1/sessions/{id}` - Get session details
- `PUT /api/v1/sessions/{id}` - Update session
- `DELETE /api/v1/sessions/{id}` - Delete session

### Evaluations
- `POST /api/v1/evaluate` - Create evaluation
- `GET /api/v1/evaluations/{id}` - Get evaluation
- `PUT /api/v1/evaluations/{id}` - Update with manual scores
- `GET /api/v1/sessions/{id}/evaluations` - List session evaluations

### Models
- `GET /api/v1/models` - List available models
- `GET /api/v1/models/{id}` - Get model details
- `GET /api/v1/providers` - List providers
- `GET /api/v1/models/search` - Search models

## 🧪 Evaluation Frameworks

### Basic Metrics (Always Available)
- **ROUGE**: 1, 2, L variants
- **BLEU**: N-gram overlap scoring
- **Coherence**: Text consistency analysis
- **Relevance**: Answer-question alignment
- **Fluency**: Language quality assessment

### Advanced Frameworks (Optional)
- **RAGAS**: Retrieval-augmented generation assessment
- **DeepEval**: Comprehensive LLM evaluation suite
- **Custom Metrics**: User-defined evaluation criteria

## 🔐 Security

- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- Rate limiting and request size limits
- Configurable CORS policies
- API key management

## 📈 Performance

- Async/await for non-blocking operations
- Database connection pooling
- Concurrent evaluation processing
- Efficient batch processing
- Response caching (optional)

## 🐛 Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
isort app/
flake8 app/
```

### Database Migrations
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Available at `/docs` when server is running
- **Issues**: Report bugs and feature requests via GitHub issues
- **Health Check**: Monitor system status at `/api/v1/health`

## 🎯 Next Steps

1. Complete bulk evaluation implementation
2. Add advanced analytics dashboard
3. Implement responsible AI assessments
4. Build RAG playground functionality
5. Add user authentication and authorization
6. Implement real-time evaluation streaming
7. Add model fine-tuning evaluation support
