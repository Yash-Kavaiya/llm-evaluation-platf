# LLM Evaluation Platform Backend

A comprehensive Python backend for evaluating Large Language Models using OpenRouter, RAGAS, and DeepEval frameworks.

## Features

- **OpenRouter Integration**: Support for multiple LLM providers through OpenRouter API
- **Manual Evaluation**: Human evaluation with customizable scoring criteria
- **Automated Evaluation**: Integration with RAGAS and DeepEval for automated metrics
- **Session Management**: Organize evaluations into sessions
- **Batch Processing**: Evaluate multiple prompts across multiple models
- **Model Comparison**: Side-by-side comparison of different models
- **Analytics**: Comprehensive analytics and reporting

## Quick Start

### 1. Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=LLM Evaluation Platform

# Database (SQLite by default, PostgreSQL for production)
DATABASE_URL=sqlite:///./llm_eval.db

# Optional: OpenAI API key for RAGAS evaluation
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Server

```bash
# Development server
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health & Connection
- `GET /health` - Health check
- `GET /test-connection` - Test OpenRouter connection
- `GET /models` - Get available models

### Session Management
- `POST /sessions` - Create evaluation session
- `GET /sessions` - List all sessions
- `GET /sessions/{session_id}` - Get specific session

### Evaluation
- `POST /evaluate` - Create single evaluation
- `PUT /evaluations/{evaluation_id}` - Update evaluation with manual scores
- `GET /evaluations/{evaluation_id}` - Get evaluation details
- `GET /sessions/{session_id}/evaluations` - Get session evaluations

### Batch & Comparison
- `POST /evaluate-batch` - Batch evaluation
- `POST /compare-models` - Compare multiple models

### Analytics
- `GET /sessions/{session_id}/summary` - Session analytics

## Usage Examples

### 1. Create Evaluation Session

```python
import requests

response = requests.post(
    "http://localhost:8000/sessions",
    json={
        "name": "Model Comparison Test",
        "description": "Comparing different models on Q&A tasks"
    }
)
session = response.json()
session_id = session["id"]
```

### 2. Run Single Evaluation

```python
response = requests.post(
    "http://localhost:8000/evaluate",
    json={
        "session_id": session_id,
        "prompt": "What is the capital of France?",
        "model_name": "deepseek/deepseek-chat-v3.1:free",
        "expected_answer": "Paris",
        "category": "geography"
    }
)
evaluation = response.json()
```

### 3. Add Manual Scores

```python
requests.put(
    f"http://localhost:8000/evaluations/{evaluation['id']}",
    json={
        "manual_scores": {
            "accuracy_score": 9.5,
            "relevance_score": 10.0,
            "helpfulness_score": 8.5,
            "clarity_score": 9.0,
            "overall_score": 9.0
        },
        "evaluator_name": "Human Evaluator",
        "evaluation_notes": "Correct and well-formatted response"
    }
)
```

### 4. Compare Models

```python
response = requests.post(
    "http://localhost:8000/compare-models",
    json={
        "prompt": "Explain quantum computing in simple terms",
        "models": [
            "deepseek/deepseek-chat-v3.1:free",
            "openai/gpt-4o-mini",
            "anthropic/claude-3-haiku"
        ],
        "expected_answer": "A clear explanation suitable for beginners"
    }
)
comparison = response.json()
```

### 5. Batch Evaluation

```python
requests.post(
    "http://localhost:8000/evaluate-batch",
    json={
        "session_id": session_id,
        "prompts": [
            "What is machine learning?",
            "Explain neural networks",
            "What is deep learning?"
        ],
        "models": [
            "deepseek/deepseek-chat-v3.1:free",
            "openai/gpt-4o-mini"
        ],
        "category": "AI/ML"
    }
)
```

## Evaluation Frameworks

### RAGAS (Requires OpenAI API Key)
- **Answer Relevancy**: How relevant the answer is to the question
- **Answer Correctness**: Comparison with ground truth
- **Context Precision**: Quality of retrieved context
- **Context Recall**: Coverage of ground truth in context
- **Faithfulness**: How well the answer aligns with context
- **Answer Similarity**: Semantic similarity with expected answer

### DeepEval
- **Answer Relevancy**: Relevance to the input
- **Faithfulness**: Consistency with provided context
- **Contextual Precision**: Quality of context retrieval
- **Contextual Recall**: Completeness of context
- **Hallucination**: Detection of factual inconsistencies
- **Bias**: Detection of biased responses
- **Toxicity**: Detection of harmful content

## Database Schema

### Evaluation Sessions
- Session management for organizing evaluations
- Track multiple evaluation runs

### Evaluations
- Store prompts, responses, and metadata
- Manual evaluation scores (1-10 scale)
- Automated evaluation results (RAGAS/DeepEval)
- Performance metrics (response time, tokens, cost)

## Development

### Project Structure
```
backend/
├── main.py                 # FastAPI application
├── config.py              # Configuration management
├── database.py            # Database setup
├── models.py              # Data models
├── llm_client.py          # OpenRouter client
├── ragas_evaluator.py     # RAGAS integration
├── deepeval_evaluator.py  # DeepEval integration
├── requirements.txt       # Dependencies
└── README.md             # This file
```

### Adding New Models
1. Update `EVALUATION_MODELS` in `.env`
2. Check available models: `GET /models`
3. Models follow OpenRouter naming convention

### Adding New Metrics
1. Extend `ragas_evaluator.py` or `deepeval_evaluator.py`
2. Update metric requirements in `get_metric_requirements()`
3. Modify evaluation endpoints to use new metrics

## Production Deployment

### Database
Replace SQLite with PostgreSQL:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/llm_eval_db
```

### Environment Variables
- Set `DEBUG=False`
- Use strong database credentials
- Configure CORS origins appropriately
- Set up Redis for caching (if needed)

### Docker (Optional)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Common Issues

1. **OpenRouter Connection Failed**
   - Check API key in `.env`
   - Verify internet connection
   - Check OpenRouter service status

2. **RAGAS Evaluation Not Working**
   - Requires OpenAI API key
   - Set `OPENAI_API_KEY` in environment
   - Uncomment RAGAS code in `main.py`

3. **Database Errors**
   - Check database URL format
   - Ensure database is accessible
   - Run with `DEBUG=True` for detailed logs

4. **Import Errors**
   - Verify virtual environment is activated
   - Install all requirements: `pip install -r requirements.txt`
   - Check Python version compatibility

### Logs
Enable detailed logging by setting `DEBUG=True` in `.env`

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the logs for error details
3. Verify configuration in `.env`
4. Test connection with `/test-connection` endpoint