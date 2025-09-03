from deepeval import evaluate
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    ContextualPrecisionMetric,
    ContextualRecallMetric,
    ContextualRelevancyMetric,
    HallucinationMetric,
    BiasMetric,
    ToxicityMetric
)
from deepeval.test_case import LLMTestCase
from typing import List, Dict, Any, Optional
import logging
from config import settings

logger = logging.getLogger(__name__)

class DeepEvalEvaluator:
    def __init__(self):
        # Available DeepEval metrics
        self.available_metrics = {
            "answer_relevancy": AnswerRelevancyMetric,
            "faithfulness": FaithfulnessMetric,
            "contextual_precision": ContextualPrecisionMetric,
            "contextual_recall": ContextualRecallMetric,
            "contextual_relevancy": ContextualRelevancyMetric,
            "hallucination": HallucinationMetric,
            "bias": BiasMetric,
            "toxicity": ToxicityMetric
        }
    
    def evaluate_single(
        self,
        question: str,
        answer: str,
        contexts: Optional[List[str]] = None,
        expected_output: Optional[str] = None,
        metrics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate a single QA pair using DeepEval metrics
        
        Args:
            question: The input question/prompt
            answer: The generated answer
            contexts: List of context documents (for RAG evaluation)
            expected_output: Expected answer for comparison
            metrics: List of metrics to evaluate (default: all applicable)
        """
        try:
            # Create test case
            test_case = LLMTestCase(
                input=question,
                actual_output=answer,
                expected_output=expected_output,
                retrieval_context=contexts
            )
            
            # Select and initialize metrics
            selected_metrics = self._get_metrics(
                has_contexts=contexts is not None,
                has_expected=expected_output is not None,
                requested_metrics=metrics
            )
            
            if not selected_metrics:
                logger.warning("No suitable DeepEval metrics found")
                return {}
            
            # Run evaluation
            results = {}
            for metric_name, metric_instance in selected_metrics.items():
                try:
                    metric_instance.measure(test_case)
                    results[metric_name] = {
                        "score": metric_instance.score,
                        "success": metric_instance.success,
                        "reason": metric_instance.reason if hasattr(metric_instance, 'reason') else None
                    }
                except Exception as e:
                    logger.error(f"DeepEval metric {metric_name} failed: {e}")
                    results[metric_name] = {
                        "score": None,
                        "success": False,
                        "reason": f"Evaluation failed: {str(e)}"
                    }
            
            return results
            
        except Exception as e:
            logger.error(f"DeepEval evaluation failed: {e}")
            return {}
    
    def evaluate_batch(
        self,
        questions: List[str],
        answers: List[str],
        contexts: Optional[List[List[str]]] = None,
        expected_outputs: Optional[List[str]] = None,
        metrics: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Evaluate multiple QA pairs using DeepEval metrics
        """
        try:
            # Create test cases
            test_cases = []
            for i, (question, answer) in enumerate(zip(questions, answers)):
                test_case = LLMTestCase(
                    input=question,
                    actual_output=answer,
                    expected_output=expected_outputs[i] if expected_outputs else None,
                    retrieval_context=contexts[i] if contexts else None
                )
                test_cases.append(test_case)
            
            # Select metrics
            selected_metrics = self._get_metrics(
                has_contexts=contexts is not None,
                has_expected=expected_outputs is not None,
                requested_metrics=metrics
            )
            
            if not selected_metrics:
                logger.warning("No suitable DeepEval metrics found")
                return [{}] * len(questions)
            
            # Evaluate each test case
            all_results = []
            for test_case in test_cases:
                results = {}
                for metric_name, metric_instance in selected_metrics.items():
                    try:
                        # Create new instance for each test case
                        metric = self.available_metrics[metric_name](threshold=0.5)
                        metric.measure(test_case)
                        results[metric_name] = {
                            "score": metric.score,
                            "success": metric.success,
                            "reason": metric.reason if hasattr(metric, 'reason') else None
                        }
                    except Exception as e:
                        logger.error(f"DeepEval metric {metric_name} failed: {e}")
                        results[metric_name] = {
                            "score": None,
                            "success": False,
                            "reason": f"Evaluation failed: {str(e)}"
                        }
                all_results.append(results)
            
            return all_results
            
        except Exception as e:
            logger.error(f"DeepEval batch evaluation failed: {e}")
            return [{}] * len(questions)
    
    def _get_metrics(
        self,
        has_contexts: bool,
        has_expected: bool,
        requested_metrics: Optional[List[str]] = None,
        threshold: float = 0.5
    ) -> Dict[str, Any]:
        """
        Get appropriate metrics based on available data
        """
        selected = {}
        
        if requested_metrics:
            # Filter requested metrics by availability
            for metric_name in requested_metrics:
                if metric_name in self.available_metrics:
                    if self._is_metric_applicable(metric_name, has_contexts, has_expected):
                        try:
                            selected[metric_name] = self.available_metrics[metric_name](threshold=threshold)
                        except Exception as e:
                            logger.warning(f"Failed to initialize metric {metric_name}: {e}")
        else:
            # Auto-select applicable metrics
            for metric_name in self.available_metrics:
                if self._is_metric_applicable(metric_name, has_contexts, has_expected):
                    try:
                        selected[metric_name] = self.available_metrics[metric_name](threshold=threshold)
                    except Exception as e:
                        logger.warning(f"Failed to initialize metric {metric_name}: {e}")
        
        return selected
    
    def _is_metric_applicable(self, metric_name: str, has_contexts: bool, has_expected: bool) -> bool:
        """
        Check if a metric is applicable given the available data
        """
        requirements = self.get_metric_requirements()
        if metric_name not in requirements:
            return False
        
        req = requirements[metric_name]
        
        # Check if required data is available
        if req["contexts"] and not has_contexts:
            return False
        if req["expected"] and not has_expected:
            return False
        
        return True
    
    def get_available_metrics(self) -> List[str]:
        """Get list of available DeepEval metrics"""
        return list(self.available_metrics.keys())
    
    def get_metric_requirements(self) -> Dict[str, Dict[str, bool]]:
        """Get requirements for each metric"""
        return {
            "answer_relevancy": {"contexts": False, "expected": False},
            "faithfulness": {"contexts": True, "expected": False},
            "contextual_precision": {"contexts": True, "expected": True},
            "contextual_recall": {"contexts": True, "expected": True},
            "contextual_relevancy": {"contexts": True, "expected": False},
            "hallucination": {"contexts": True, "expected": False},
            "bias": {"contexts": False, "expected": False},
            "toxicity": {"contexts": False, "expected": False}
        }
    
    def run_comprehensive_evaluation(
        self,
        question: str,
        answer: str,
        contexts: Optional[List[str]] = None,
        expected_output: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run a comprehensive evaluation with all applicable metrics
        """
        # Get all applicable metrics
        applicable_metrics = []
        requirements = self.get_metric_requirements()
        
        for metric_name, req in requirements.items():
            if not req["contexts"] or contexts is not None:
                if not req["expected"] or expected_output is not None:
                    applicable_metrics.append(metric_name)
        
        return self.evaluate_single(
            question=question,
            answer=answer,
            contexts=contexts,
            expected_output=expected_output,
            metrics=applicable_metrics
        )

# Global evaluator instance
deepeval_evaluator = DeepEvalEvaluator()