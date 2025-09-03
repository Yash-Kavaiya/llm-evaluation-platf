from ragas import evaluate
from ragas.metrics import (
    answer_relevancy,
    answer_correctness,
    context_precision,
    context_recall,
    faithfulness,
    answer_similarity
)
from datasets import Dataset
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from typing import List, Dict, Any, Optional
import pandas as pd
import logging
from config import settings

logger = logging.getLogger(__name__)

class RagasEvaluator:
    def __init__(self):
        # Initialize OpenAI models for RAGAS evaluation
        # Note: RAGAS uses OpenAI by default for its internal evaluations
        self.llm = None
        self.embeddings = None
        
        # Available RAGAS metrics
        self.available_metrics = {
            "answer_relevancy": answer_relevancy,
            "answer_correctness": answer_correctness,
            "context_precision": context_precision,
            "context_recall": context_recall,
            "faithfulness": faithfulness,
            "answer_similarity": answer_similarity
        }
    
    def _prepare_openai_models(self, openai_api_key: str):
        """Initialize OpenAI models for RAGAS evaluation"""
        try:
            self.llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                api_key=openai_api_key,
                temperature=0
            )
            self.embeddings = OpenAIEmbeddings(
                api_key=openai_api_key
            )
            return True
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI models for RAGAS: {e}")
            return False
    
    def evaluate_single(
        self,
        question: str,
        answer: str,
        contexts: Optional[List[str]] = None,
        ground_truth: Optional[str] = None,
        metrics: Optional[List[str]] = None,
        openai_api_key: Optional[str] = None
    ) -> Dict[str, float]:
        """
        Evaluate a single QA pair using RAGAS metrics
        
        Args:
            question: The input question/prompt
            answer: The generated answer
            contexts: List of context documents (for RAG evaluation)
            ground_truth: Expected answer for comparison
            metrics: List of metrics to evaluate (default: all available)
            openai_api_key: OpenAI API key for RAGAS evaluation
        """
        if not openai_api_key:
            logger.warning("No OpenAI API key provided, skipping RAGAS evaluation")
            return {}
        
        if not self._prepare_openai_models(openai_api_key):
            return {}
        
        try:
            # Prepare data
            data = {
                "question": [question],
                "answer": [answer]
            }
            
            if contexts:
                data["contexts"] = [contexts]
            if ground_truth:
                data["ground_truth"] = [ground_truth]
            
            dataset = Dataset.from_dict(data)
            
            # Select metrics based on available data
            selected_metrics = self._select_metrics(
                has_contexts=contexts is not None,
                has_ground_truth=ground_truth is not None,
                requested_metrics=metrics
            )
            
            if not selected_metrics:
                logger.warning("No suitable metrics found for evaluation")
                return {}
            
            # Run evaluation
            result = evaluate(
                dataset=dataset,
                metrics=selected_metrics,
                llm=self.llm,
                embeddings=self.embeddings
            )
            
            # Convert to dictionary with single values
            scores = {}
            for metric_name in result.columns:
                if metric_name not in ["question", "answer", "contexts", "ground_truth"]:
                    scores[metric_name] = float(result[metric_name].iloc[0])
            
            return scores
            
        except Exception as e:
            logger.error(f"RAGAS evaluation failed: {e}")
            return {}
    
    def evaluate_batch(
        self,
        questions: List[str],
        answers: List[str],
        contexts: Optional[List[List[str]]] = None,
        ground_truths: Optional[List[str]] = None,
        metrics: Optional[List[str]] = None,
        openai_api_key: Optional[str] = None
    ) -> List[Dict[str, float]]:
        """
        Evaluate multiple QA pairs using RAGAS metrics
        """
        if not openai_api_key:
            logger.warning("No OpenAI API key provided, skipping RAGAS evaluation")
            return [{}] * len(questions)
        
        if not self._prepare_openai_models(openai_api_key):
            return [{}] * len(questions)
        
        try:
            # Prepare data
            data = {
                "question": questions,
                "answer": answers
            }
            
            if contexts:
                data["contexts"] = contexts
            if ground_truths:
                data["ground_truth"] = ground_truths
            
            dataset = Dataset.from_dict(data)
            
            # Select metrics
            selected_metrics = self._select_metrics(
                has_contexts=contexts is not None,
                has_ground_truth=ground_truths is not None,
                requested_metrics=metrics
            )
            
            if not selected_metrics:
                logger.warning("No suitable metrics found for evaluation")
                return [{}] * len(questions)
            
            # Run evaluation
            result = evaluate(
                dataset=dataset,
                metrics=selected_metrics,
                llm=self.llm,
                embeddings=self.embeddings
            )
            
            # Convert to list of dictionaries
            scores_list = []
            for idx in range(len(questions)):
                scores = {}
                for metric_name in result.columns:
                    if metric_name not in ["question", "answer", "contexts", "ground_truth"]:
                        scores[metric_name] = float(result[metric_name].iloc[idx])
                scores_list.append(scores)
            
            return scores_list
            
        except Exception as e:
            logger.error(f"RAGAS batch evaluation failed: {e}")
            return [{}] * len(questions)
    
    def _select_metrics(
        self,
        has_contexts: bool,
        has_ground_truth: bool,
        requested_metrics: Optional[List[str]] = None
    ) -> List:
        """
        Select appropriate metrics based on available data
        """
        if requested_metrics:
            # Filter requested metrics by availability
            available_requested = [
                self.available_metrics[m] for m in requested_metrics 
                if m in self.available_metrics
            ]
            if available_requested:
                return available_requested
        
        # Auto-select metrics based on data availability
        selected = []
        
        if has_ground_truth:
            selected.extend([
                answer_correctness,
                answer_similarity
            ])
        
        if has_contexts:
            selected.extend([
                context_precision,
                context_recall,
                faithfulness
            ])
        
        # Answer relevancy doesn't require ground truth or context
        selected.append(answer_relevancy)
        
        return selected
    
    def get_available_metrics(self) -> List[str]:
        """Get list of available RAGAS metrics"""
        return list(self.available_metrics.keys())
    
    def get_metric_requirements(self) -> Dict[str, Dict[str, bool]]:
        """Get requirements for each metric"""
        return {
            "answer_relevancy": {"contexts": False, "ground_truth": False},
            "answer_correctness": {"contexts": False, "ground_truth": True},
            "context_precision": {"contexts": True, "ground_truth": True},
            "context_recall": {"contexts": True, "ground_truth": True},
            "faithfulness": {"contexts": True, "ground_truth": False},
            "answer_similarity": {"contexts": False, "ground_truth": True}
        }

# Global evaluator instance
ragas_evaluator = RagasEvaluator()