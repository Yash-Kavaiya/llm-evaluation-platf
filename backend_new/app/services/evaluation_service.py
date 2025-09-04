"""
Core evaluation service that orchestrates different evaluation frameworks
"""

import asyncio
import logging
import time
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import json

from app.core.config import settings
from app.core.exceptions import EvaluationException, ProcessingException
from app.services.openrouter_service import generate_llm_response
from app.models.schemas import EvaluationMetrics, EvaluationCreate, EvaluationResponse

logger = logging.getLogger(__name__)

class EvaluationService:
    """Core service for managing evaluations across different frameworks"""
    
    def __init__(self):
        self.evaluators = {}
        self._load_evaluators()
    
    def _load_evaluators(self):
        """Load available evaluation frameworks"""
        try:
            # Import evaluators conditionally based on settings
            if settings.ENABLE_RAGAS:
                from app.evaluators.ragas_evaluator import RAGASEvaluator
                self.evaluators['ragas'] = RAGASEvaluator()
            
            if settings.ENABLE_DEEPEVAL:
                from app.evaluators.deepeval_evaluator import DeepEvalEvaluator
                self.evaluators['deepeval'] = DeepEvalEvaluator()
            
            if settings.ENABLE_CUSTOM_METRICS:
                from app.evaluators.custom_evaluator import CustomEvaluator
                self.evaluators['custom'] = CustomEvaluator()
            
            # Always include basic metrics
            from app.evaluators.basic_evaluator import BasicEvaluator
            self.evaluators['basic'] = BasicEvaluator()
            
            logger.info(f"Loaded evaluators: {list(self.evaluators.keys())}")
            
        except Exception as e:
            logger.error(f"Error loading evaluators: {str(e)}")
    
    async def evaluate_single(
        self,
        evaluation_data: EvaluationCreate,
        selected_metrics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate a single prompt-response pair
        
        Args:
            evaluation_data: Evaluation request data
            selected_metrics: List of specific metrics to calculate
        
        Returns:
            Dictionary containing evaluation results
        """
        start_time = time.time()
        
        try:
            # Generate response if not provided
            model_response = None
            response_metadata = {}
            
            if evaluation_data.model_name and evaluation_data.prompt:
                try:
                    model_response, response_metadata = await generate_llm_response(
                        model=evaluation_data.model_name,
                        prompt=evaluation_data.prompt,
                        context=evaluation_data.context,
                        temperature=evaluation_data.temperature,
                        max_tokens=evaluation_data.max_tokens,
                        top_p=evaluation_data.top_p
                    )
                except Exception as e:
                    logger.warning(f"Failed to generate response: {str(e)}")
                    model_response = "Error generating response"
                    response_metadata = {"error": str(e)}
            
            # Prepare evaluation context
            eval_context = {
                "question": evaluation_data.prompt,
                "answer": model_response or "",
                "context": evaluation_data.context,
                "expected_answer": evaluation_data.expected_answer,
                "category": evaluation_data.category
            }
            
            # Run evaluations across all frameworks
            evaluation_results = await self._run_evaluations(eval_context, selected_metrics)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Compile final results
            result = {
                "id": f"eval_{int(time.time() * 1000)}",
                "session_id": evaluation_data.session_id,
                "prompt": evaluation_data.prompt,
                "context": evaluation_data.context,
                "expected_answer": evaluation_data.expected_answer,
                "model_name": evaluation_data.model_name,
                "model_response": model_response,
                "category": evaluation_data.category,
                "status": "completed",
                "evaluation_type": "automated",
                
                # Metrics
                "automatic_metrics": evaluation_results.get("automatic_metrics"),
                "framework_scores": evaluation_results.get("framework_scores"),
                
                # Performance
                "response_time": response_metadata.get("response_time", 0),
                "processing_time": processing_time,
                "tokens_used": response_metadata.get("tokens_used", 0),
                "cost": response_metadata.get("cost"),
                
                # Metadata
                "metadata": {
                    "model_metadata": response_metadata,
                    "evaluation_frameworks": list(self.evaluators.keys()),
                    "selected_metrics": selected_metrics,
                    "timestamp": datetime.now().isoformat()
                },
                
                # Timestamps
                "created_at": datetime.now(),
                "completed_at": datetime.now()
            }
            
            logger.info(f"Evaluation completed in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Evaluation failed: {str(e)}")
            raise EvaluationException(
                f"Evaluation failed: {str(e)}",
                details={
                    "model": evaluation_data.model_name,
                    "session_id": evaluation_data.session_id,
                    "error_type": type(e).__name__
                }
            )
    
    async def _run_evaluations(
        self,
        eval_context: Dict[str, Any],
        selected_metrics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Run evaluations across all loaded frameworks"""
        
        automatic_metrics = {}
        framework_scores = {}
        
        # Run evaluations for each framework
        evaluation_tasks = []
        
        for framework_name, evaluator in self.evaluators.items():
            task = self._run_framework_evaluation(
                framework_name, evaluator, eval_context, selected_metrics
            )
            evaluation_tasks.append(task)
        
        # Execute all evaluations concurrently
        framework_results = await asyncio.gather(*evaluation_tasks, return_exceptions=True)
        
        # Process results
        for i, (framework_name, evaluator) in enumerate(self.evaluators.items()):
            result = framework_results[i]
            
            if isinstance(result, Exception):
                logger.warning(f"Framework {framework_name} failed: {str(result)}")
                framework_scores[framework_name] = {"error": str(result)}
            else:
                framework_scores[framework_name] = result
                
                # Merge basic metrics into automatic_metrics
                if framework_name == 'basic':
                    automatic_metrics.update(result)
        
        return {
            "automatic_metrics": automatic_metrics,
            "framework_scores": framework_scores
        }
    
    async def _run_framework_evaluation(
        self,
        framework_name: str,
        evaluator: Any,
        eval_context: Dict[str, Any],
        selected_metrics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Run evaluation for a specific framework"""
        try:
            if hasattr(evaluator, 'evaluate_async'):
                return await evaluator.evaluate_async(eval_context, selected_metrics)
            else:
                # Run synchronous evaluator in thread pool
                loop = asyncio.get_event_loop()
                return await loop.run_in_executor(
                    None, evaluator.evaluate, eval_context, selected_metrics
                )
        except Exception as e:
            logger.error(f"Framework {framework_name} evaluation failed: {str(e)}")
            raise
    
    async def evaluate_bulk(
        self,
        evaluations: List[EvaluationCreate],
        selected_metrics: Optional[List[str]] = None,
        batch_size: int = 5,
        progress_callback: Optional[callable] = None
    ) -> List[Dict[str, Any]]:
        """
        Evaluate multiple prompt-response pairs in batches
        
        Args:
            evaluations: List of evaluation requests
            selected_metrics: List of specific metrics to calculate
            batch_size: Number of concurrent evaluations
            progress_callback: Callback function for progress updates
        
        Returns:
            List of evaluation results
        """
        results = []
        total_items = len(evaluations)
        
        logger.info(f"Starting bulk evaluation of {total_items} items")
        
        for i in range(0, total_items, batch_size):
            batch = evaluations[i:i + batch_size]
            
            # Create evaluation tasks
            tasks = []
            for eval_data in batch:
                task = self.evaluate_single(eval_data, selected_metrics)
                tasks.append(task)
            
            # Execute batch
            try:
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Process batch results
                for j, result in enumerate(batch_results):
                    if isinstance(result, Exception):
                        logger.error(f"Bulk evaluation item {i+j} failed: {str(result)}")
                        # Create error result
                        error_result = {
                            "id": f"error_{int(time.time() * 1000)}_{i+j}",
                            "status": "failed",
                            "error": str(result),
                            "evaluation_data": batch[j].dict() if hasattr(batch[j], 'dict') else str(batch[j])
                        }
                        results.append(error_result)
                    else:
                        results.append(result)
                
                # Update progress
                processed_items = min(i + batch_size, total_items)
                progress = (processed_items / total_items) * 100
                
                if progress_callback:
                    await progress_callback(processed_items, total_items, progress)
                
                logger.info(f"Bulk evaluation progress: {processed_items}/{total_items} ({progress:.1f}%)")
                
            except Exception as e:
                logger.error(f"Bulk evaluation batch failed: {str(e)}")
                # Add error results for entire batch
                for j in range(len(batch)):
                    error_result = {
                        "id": f"batch_error_{int(time.time() * 1000)}_{i+j}",
                        "status": "failed",
                        "error": f"Batch processing failed: {str(e)}",
                        "evaluation_data": batch[j].dict() if hasattr(batch[j], 'dict') else str(batch[j])
                    }
                    results.append(error_result)
        
        successful_results = [r for r in results if r.get("status") != "failed"]
        failed_results = [r for r in results if r.get("status") == "failed"]
        
        logger.info(f"Bulk evaluation completed: {len(successful_results)} successful, {len(failed_results)} failed")
        
        return results
    
    async def compare_models(
        self,
        prompt: str,
        models: List[str],
        context: Optional[str] = None,
        expected_answer: Optional[str] = None,
        selected_metrics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Compare multiple models on the same prompt
        
        Args:
            prompt: Input prompt
            models: List of model names to compare
            context: Optional context
            expected_answer: Optional expected answer
            selected_metrics: List of specific metrics to calculate
        
        Returns:
            Comparison results with model rankings
        """
        logger.info(f"Comparing {len(models)} models on prompt")
        
        comparisons = []
        tasks = []
        
        # Create evaluation tasks for each model
        for model in models:
            eval_data = EvaluationCreate(
                session_id="comparison",
                prompt=prompt,
                context=context,
                expected_answer=expected_answer,
                model_name=model
            )
            task = self.evaluate_single(eval_data, selected_metrics)
            tasks.append(task)
        
        # Execute all model evaluations concurrently
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Model {models[i]} comparison failed: {str(result)}")
                    comparisons.append({
                        "model_name": models[i],
                        "error": str(result),
                        "status": "failed"
                    })
                else:
                    comparisons.append({
                        "model_name": models[i],
                        "response": result.get("model_response", ""),
                        "metrics": result.get("automatic_metrics", {}),
                        "framework_scores": result.get("framework_scores", {}),
                        "response_time": result.get("response_time", 0),
                        "tokens_used": result.get("tokens_used", 0),
                        "cost": result.get("cost"),
                        "status": "completed"
                    })
            
            # Determine winner based on overall scores
            winner = self._determine_winner(comparisons)
            
            comparison_result = {
                "id": f"comparison_{int(time.time() * 1000)}",
                "prompt": prompt,
                "context": context,
                "expected_answer": expected_answer,
                "models_tested": models,
                "comparisons": comparisons,
                "winner": winner.get("model") if winner else None,
                "winner_reason": winner.get("reason") if winner else None,
                "selected_metrics": selected_metrics,
                "created_at": datetime.now(),
                "metadata": {
                    "comparison_type": "multi_model",
                    "frameworks_used": list(self.evaluators.keys())
                }
            }
            
            logger.info(f"Model comparison completed, winner: {winner.get('model') if winner else 'None'}")
            return comparison_result
            
        except Exception as e:
            logger.error(f"Model comparison failed: {str(e)}")
            raise EvaluationException(
                f"Model comparison failed: {str(e)}",
                details={
                    "models": models,
                    "prompt_length": len(prompt)
                }
            )
    
    def _determine_winner(self, comparisons: List[Dict[str, Any]]) -> Optional[Dict[str, str]]:
        """Determine the winning model from comparison results"""
        successful_comparisons = [c for c in comparisons if c.get("status") == "completed"]
        
        if not successful_comparisons:
            return None
        
        # Calculate overall scores for each model
        model_scores = []
        
        for comparison in successful_comparisons:
            metrics = comparison.get("metrics", {})
            framework_scores = comparison.get("framework_scores", {})
            
            # Calculate composite score
            all_scores = []
            
            # Add basic metrics
            for metric_name, score in metrics.items():
                if isinstance(score, (int, float)) and score is not None:
                    all_scores.append(score)
            
            # Add framework scores
            for framework, scores in framework_scores.items():
                if isinstance(scores, dict):
                    for metric_name, score in scores.items():
                        if isinstance(score, (int, float)) and score is not None:
                            all_scores.append(score)
            
            # Calculate average score
            overall_score = sum(all_scores) / len(all_scores) if all_scores else 0
            
            model_scores.append({
                "model": comparison["model_name"],
                "score": overall_score,
                "response_time": comparison.get("response_time", float('inf')),
                "cost": comparison.get("cost", 0) or 0
            })
        
        if not model_scores:
            return None
        
        # Sort by score (descending), then by response time (ascending), then by cost (ascending)
        model_scores.sort(key=lambda x: (-x["score"], x["response_time"], x["cost"]))
        
        winner = model_scores[0]
        
        # Generate reason
        reason_parts = [f"Highest overall score: {winner['score']:.3f}"]
        if len(model_scores) > 1:
            second_best = model_scores[1]
            score_diff = winner["score"] - second_best["score"]
            reason_parts.append(f"({score_diff:.3f} points ahead of {second_best['model']})")
        
        return {
            "model": winner["model"],
            "reason": " ".join(reason_parts)
        }
    
    def get_available_metrics(self) -> Dict[str, List[str]]:
        """Get list of available metrics from all frameworks"""
        metrics = {}
        
        for framework_name, evaluator in self.evaluators.items():
            if hasattr(evaluator, 'get_available_metrics'):
                metrics[framework_name] = evaluator.get_available_metrics()
            else:
                metrics[framework_name] = []
        
        return metrics

# Global service instance
evaluation_service = EvaluationService()
