#!/usr/bin/env python3

import requests
import json
import time
from datetime import datetime

# Backend API configuration
API_BASE_URL = 'http://localhost:8000'

def test_api_health():
    """Test if the API is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API Health Check: PASSED")
            return True
        else:
            print(f"❌ API Health Check: FAILED - Status {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ API Health Check: FAILED - {e}")
        return False

def test_create_session():
    """Test creating an evaluation session"""
    try:
        session_data = {
            "name": f"Test Session {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "description": "Integration test session"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/sessions",
            headers={'Content-Type': 'application/json'},
            json=session_data,
            timeout=10
        )
        
        if response.status_code == 200:
            session = response.json()
            print("✅ Session Creation: PASSED")
            print(f"   Session ID: {session['id']}")
            return session['id']
        else:
            print(f"❌ Session Creation: FAILED - Status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except requests.RequestException as e:
        print(f"❌ Session Creation: FAILED - {e}")
        return None

def test_evaluation(session_id):
    """Test running an evaluation"""
    if not session_id:
        print("⏭️  Skipping evaluation test - no session")
        return None
        
    try:
        eval_data = {
            "session_id": session_id,
            "prompt": "What is 2 + 2?",
            "model_name": "deepseek/deepseek-chat-v3.1:free",
            "expected_answer": "4",
            "category": "Mathematics"
        }
        
        print("🔄 Running evaluation (this may take a few seconds)...")
        response = requests.post(
            f"{API_BASE_URL}/evaluate",
            headers={'Content-Type': 'application/json'},
            json=eval_data,
            timeout=30
        )
        
        if response.status_code == 200:
            evaluation = response.json()
            print("✅ Evaluation: PASSED")
            print(f"   Evaluation ID: {evaluation['id']}")
            print(f"   Model Response: {evaluation['model_response'][:100]}...")
            return evaluation
        else:
            print(f"❌ Evaluation: FAILED - Status {response.status_code}")
            error_detail = response.json().get('detail', 'Unknown error') if response.headers.get('content-type', '').startswith('application/json') else response.text
            print(f"   Error: {error_detail}")
            return None
            
    except requests.RequestException as e:
        print(f"❌ Evaluation: FAILED - {e}")
        return None

def test_manual_scoring(evaluation):
    """Test updating evaluation with manual scores"""
    if not evaluation:
        print("⏭️  Skipping manual scoring test - no evaluation")
        return False
        
    try:
        manual_scores = {
            "manual_scores": {
                "accuracy_score": 9.0,
                "relevance_score": 10.0,
                "helpfulness_score": 8.5,
                "clarity_score": 9.5,
                "overall_score": 9.0
            },
            "evaluator_name": "Integration Test",
            "evaluation_notes": "Automated integration test evaluation"
        }
        
        response = requests.put(
            f"{API_BASE_URL}/evaluations/{evaluation['id']}",
            headers={'Content-Type': 'application/json'},
            json=manual_scores,
            timeout=10
        )
        
        if response.status_code == 200:
            updated_evaluation = response.json()
            print("✅ Manual Scoring: PASSED")
            print(f"   Overall Score: {updated_evaluation.get('overall_score', 'N/A')}")
            return True
        else:
            print(f"❌ Manual Scoring: FAILED - Status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Manual Scoring: FAILED - {e}")
        return False

def test_get_sessions():
    """Test getting all sessions"""
    try:
        response = requests.get(f"{API_BASE_URL}/sessions", timeout=10)
        
        if response.status_code == 200:
            sessions = response.json()
            print("✅ Get Sessions: PASSED")
            print(f"   Found {len(sessions)} sessions")
            return True
        else:
            print(f"❌ Get Sessions: FAILED - Status {response.status_code}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Get Sessions: FAILED - {e}")
        return False

def main():
    """Run integration tests"""
    print("🧪 LLM Evaluation Platform - Integration Tests")
    print("=" * 50)
    
    # Test API health
    if not test_api_health():
        print("\n❌ API is not running. Please start the backend first:")
        print("   cd backend && python start.py")
        return False
    
    print()
    
    # Test creating session
    session_id = test_create_session()
    print()
    
    # Test evaluation (requires OpenRouter API key)
    evaluation = test_evaluation(session_id)
    print()
    
    # Test manual scoring
    if evaluation:
        test_manual_scoring(evaluation)
        print()
    
    # Test getting sessions
    test_get_sessions()
    print()
    
    print("=" * 50)
    print("🎉 Integration tests completed!")
    
    if not evaluation:
        print("\n💡 Note: Evaluation test failed. This is expected if:")
        print("   - OpenRouter API key is not configured")
        print("   - Network connection issues")
        print("   - OpenRouter service is unavailable")
        print("\n   To fix: Update OPENROUTER_API_KEY in backend/.env")
    
    return True

if __name__ == "__main__":
    main()