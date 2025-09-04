"""
Basic evaluation metrics (ROUGE, BLEU, etc.)
These don't require external API keys and work offline
"""

import re
import logging
import math
from typing import Dict, List, Optional, Any, Set
from collections import Counter
import asyncio

logger = logging.getLogger(__name__)

class BasicEvaluator:
    """Evaluator for basic NLP metrics that can run without external dependencies"""
    
    def __init__(self):
        self.available_metrics = [
            "rouge1", "rouge2", "rougeL", "bleu", "meteor_approx",
            "coherence", "relevance", "fluency", "informativeness",
            "length_ratio", "word_overlap", "sentence_similarity"
        ]
    
    def get_available_metrics(self) -> List[str]:
        """Get list of available metrics"""
        return self.available_metrics
    
    async def evaluate_async(
        self, 
        eval_context: Dict[str, Any], 
        selected_metrics: Optional[List[str]] = None
    ) -> Dict[str, float]:
        """Async wrapper for evaluate method"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.evaluate, eval_context, selected_metrics)
    
    def evaluate(
        self, 
        eval_context: Dict[str, Any], 
        selected_metrics: Optional[List[str]] = None
    ) -> Dict[str, float]:
        """
        Evaluate using basic metrics
        
        Args:
            eval_context: Dictionary with 'question', 'answer', 'expected_answer', etc.
            selected_metrics: List of metrics to calculate (if None, calculates all)
        
        Returns:
            Dictionary of metric names to scores
        """
        question = eval_context.get("question", "")
        answer = eval_context.get("answer", "")
        expected_answer = eval_context.get("expected_answer", "")
        context = eval_context.get("context", "")
        
        # Use selected metrics or all available metrics
        metrics_to_calculate = selected_metrics or self.available_metrics
        
        results = {}
        
        try:
            # ROUGE metrics (require reference answer)
            if expected_answer and any(m.startswith("rouge") for m in metrics_to_calculate):
                rouge_scores = self._calculate_rouge(answer, expected_answer)
                for metric in ["rouge1", "rouge2", "rougeL"]:
                    if metric in metrics_to_calculate:
                        results[metric] = rouge_scores.get(metric, 0.0)
            
            # BLEU score (require reference answer)
            if "bleu" in metrics_to_calculate and expected_answer:
                results["bleu"] = self._calculate_bleu(answer, expected_answer)
            
            # Approximate METEOR (simplified version)
            if "meteor_approx" in metrics_to_calculate and expected_answer:
                results["meteor_approx"] = self._calculate_meteor_approx(answer, expected_answer)
            
            # Coherence (internal consistency)
            if "coherence" in metrics_to_calculate:
                results["coherence"] = self._calculate_coherence(answer)
            
            # Relevance (to question)
            if "relevance" in metrics_to_calculate:
                results["relevance"] = self._calculate_relevance(question, answer, context)
            
            # Fluency
            if "fluency" in metrics_to_calculate:
                results["fluency"] = self._calculate_fluency(answer)
            
            # Informativeness
            if "informativeness" in metrics_to_calculate:
                results["informativeness"] = self._calculate_informativeness(answer)
            
            # Length ratio
            if "length_ratio" in metrics_to_calculate and expected_answer:
                results["length_ratio"] = self._calculate_length_ratio(answer, expected_answer)
            
            # Word overlap
            if "word_overlap" in metrics_to_calculate and expected_answer:
                results["word_overlap"] = self._calculate_word_overlap(answer, expected_answer)
            
            # Sentence similarity
            if "sentence_similarity" in metrics_to_calculate and expected_answer:
                results["sentence_similarity"] = self._calculate_sentence_similarity(answer, expected_answer)
            
            logger.debug(f"Basic evaluation completed with {len(results)} metrics")
            
        except Exception as e:
            logger.error(f"Basic evaluation failed: {str(e)}")
            # Return default scores for failed metrics
            for metric in metrics_to_calculate:
                if metric not in results:
                    results[metric] = 0.0
        
        return results
    
    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization"""
        if not text:
            return []
        # Simple word tokenization
        words = re.findall(r'\b\w+\b', text.lower())
        return words
    
    def _get_ngrams(self, tokens: List[str], n: int) -> List[tuple]:
        """Get n-grams from token list"""
        if len(tokens) < n:
            return []
        return [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]
    
    def _calculate_rouge(self, candidate: str, reference: str) -> Dict[str, float]:
        """Calculate ROUGE-1, ROUGE-2, and ROUGE-L scores"""
        candidate_tokens = self._tokenize(candidate)
        reference_tokens = self._tokenize(reference)
        
        if not candidate_tokens or not reference_tokens:
            return {"rouge1": 0.0, "rouge2": 0.0, "rougeL": 0.0}
        
        # ROUGE-1 (unigram overlap)
        candidate_unigrams = set(candidate_tokens)
        reference_unigrams = set(reference_tokens)
        overlap_unigrams = candidate_unigrams.intersection(reference_unigrams)
        
        rouge1_precision = len(overlap_unigrams) / len(candidate_unigrams) if candidate_unigrams else 0
        rouge1_recall = len(overlap_unigrams) / len(reference_unigrams) if reference_unigrams else 0
        rouge1_f1 = 2 * (rouge1_precision * rouge1_recall) / (rouge1_precision + rouge1_recall) if (rouge1_precision + rouge1_recall) > 0 else 0
        
        # ROUGE-2 (bigram overlap)
        candidate_bigrams = set(self._get_ngrams(candidate_tokens, 2))
        reference_bigrams = set(self._get_ngrams(reference_tokens, 2))
        overlap_bigrams = candidate_bigrams.intersection(reference_bigrams)
        
        rouge2_precision = len(overlap_bigrams) / len(candidate_bigrams) if candidate_bigrams else 0
        rouge2_recall = len(overlap_bigrams) / len(reference_bigrams) if reference_bigrams else 0
        rouge2_f1 = 2 * (rouge2_precision * rouge2_recall) / (rouge2_precision + rouge2_recall) if (rouge2_precision + rouge2_recall) > 0 else 0
        
        # ROUGE-L (longest common subsequence)
        rougeL_f1 = self._calculate_lcs_f1(candidate_tokens, reference_tokens)
        
        return {
            "rouge1": rouge1_f1,
            "rouge2": rouge2_f1,
            "rougeL": rougeL_f1
        }
    
    def _calculate_lcs_f1(self, candidate_tokens: List[str], reference_tokens: List[str]) -> float:
        """Calculate ROUGE-L using longest common subsequence"""
        def lcs_length(x, y):
            m, n = len(x), len(y)
            dp = [[0] * (n + 1) for _ in range(m + 1)]
            
            for i in range(1, m + 1):
                for j in range(1, n + 1):
                    if x[i-1] == y[j-1]:
                        dp[i][j] = dp[i-1][j-1] + 1
                    else:
                        dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            
            return dp[m][n]
        
        lcs_len = lcs_length(candidate_tokens, reference_tokens)
        
        if not candidate_tokens or not reference_tokens:
            return 0.0
        
        precision = lcs_len / len(candidate_tokens)
        recall = lcs_len / len(reference_tokens)
        
        if precision + recall == 0:
            return 0.0
        
        return 2 * (precision * recall) / (precision + recall)
    
    def _calculate_bleu(self, candidate: str, reference: str) -> float:
        """Calculate simplified BLEU score"""
        candidate_tokens = self._tokenize(candidate)
        reference_tokens = self._tokenize(reference)
        
        if not candidate_tokens or not reference_tokens:
            return 0.0
        
        # Calculate BLEU with n-grams up to 4
        weights = [0.25, 0.25, 0.25, 0.25]
        precisions = []
        
        for n in range(1, 5):
            candidate_ngrams = self._get_ngrams(candidate_tokens, n)
            reference_ngrams = self._get_ngrams(reference_tokens, n)
            
            if not candidate_ngrams:
                precisions.append(0.0)
                continue
            
            candidate_counts = Counter(candidate_ngrams)
            reference_counts = Counter(reference_ngrams)
            
            overlap = sum(min(candidate_counts[ngram], reference_counts[ngram]) 
                         for ngram in candidate_counts)
            
            precision = overlap / len(candidate_ngrams)
            precisions.append(precision)
        
        # Calculate geometric mean
        if all(p > 0 for p in precisions):
            bleu_score = math.exp(sum(w * math.log(p) for w, p in zip(weights, precisions)))
        else:
            bleu_score = 0.0
        
        # Apply brevity penalty
        bp = min(1.0, math.exp(1 - len(reference_tokens) / len(candidate_tokens)))
        
        return bp * bleu_score
    
    def _calculate_meteor_approx(self, candidate: str, reference: str) -> float:
        """Calculate approximate METEOR score (simplified)"""
        candidate_tokens = self._tokenize(candidate)
        reference_tokens = self._tokenize(reference)
        
        if not candidate_tokens or not reference_tokens:
            return 0.0
        
        # Word-level matching
        candidate_set = set(candidate_tokens)
        reference_set = set(reference_tokens)
        matches = len(candidate_set.intersection(reference_set))
        
        precision = matches / len(candidate_set) if candidate_set else 0
        recall = matches / len(reference_set) if reference_set else 0
        
        if precision + recall == 0:
            return 0.0
        
        f_mean = (10 * precision * recall) / (9 * precision + recall)
        
        # Simplified penalty (no chunk calculation)
        penalty = 0.5 * (matches / len(candidate_tokens)) if candidate_tokens else 0
        
        return f_mean * (1 - penalty)
    
    def _calculate_coherence(self, text: str) -> float:
        """Calculate text coherence based on simple heuristics"""
        if not text:
            return 0.0
        
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 2:
            return 0.8  # Single sentence is considered coherent
        
        score = 0.0
        factors = 0
        
        # Factor 1: Consistent use of pronouns/entities
        entities = re.findall(r'\b[A-Z][a-z]+\b', text)
        if entities:
            entity_consistency = len(set(entities)) / len(entities)
            score += entity_consistency
            factors += 1
        
        # Factor 2: Logical connectors
        connectors = ['however', 'therefore', 'moreover', 'furthermore', 'additionally', 
                     'consequently', 'meanwhile', 'similarly', 'in contrast', 'as a result']
        connector_count = sum(1 for connector in connectors if connector in text.lower())
        connector_score = min(1.0, connector_count / len(sentences))
        score += connector_score
        factors += 1
        
        # Factor 3: Sentence length variation (not too repetitive)
        lengths = [len(self._tokenize(s)) for s in sentences]
        if lengths:
            length_var = 1.0 - (max(lengths) - min(lengths)) / (max(lengths) + 1)
            score += length_var
            factors += 1
        
        return score / factors if factors > 0 else 0.5
    
    def _calculate_relevance(self, question: str, answer: str, context: str = "") -> float:
        """Calculate relevance of answer to question"""
        if not question or not answer:
            return 0.0
        
        question_tokens = set(self._tokenize(question))
        answer_tokens = set(self._tokenize(answer))
        context_tokens = set(self._tokenize(context)) if context else set()
        
        # Keyword overlap with question
        question_overlap = len(question_tokens.intersection(answer_tokens))
        question_relevance = question_overlap / len(question_tokens) if question_tokens else 0
        
        # Context relevance (if available)
        context_relevance = 0.0
        if context_tokens:
            context_overlap = len(context_tokens.intersection(answer_tokens))
            context_relevance = context_overlap / len(context_tokens)
        
        # Combine relevance scores
        if context:
            return 0.7 * question_relevance + 0.3 * context_relevance
        else:
            return question_relevance
    
    def _calculate_fluency(self, text: str) -> float:
        """Calculate fluency based on simple linguistic features"""
        if not text:
            return 0.0
        
        score = 0.0
        factors = 0
        
        # Factor 1: Average sentence length (not too short or too long)
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if sentences:
            avg_length = sum(len(self._tokenize(s)) for s in sentences) / len(sentences)
            # Optimal sentence length is around 10-20 words
            length_score = 1.0 - abs(avg_length - 15) / 20
            score += max(0, length_score)
            factors += 1
        
        # Factor 2: Grammatical markers (simplified)
        grammar_markers = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had']
        tokens = self._tokenize(text)
        if tokens:
            grammar_ratio = sum(1 for token in tokens if token in grammar_markers) / len(tokens)
            # Good ratio is around 0.2-0.4
            grammar_score = 1.0 - abs(grammar_ratio - 0.3) / 0.3
            score += max(0, grammar_score)
            factors += 1
        
        # Factor 3: Punctuation appropriateness
        punct_count = len(re.findall(r'[.!?]', text))
        sent_count = len(sentences)
        if sent_count > 0:
            punct_ratio = punct_count / sent_count
            punct_score = min(1.0, punct_ratio)  # Should have punctuation
            score += punct_score
            factors += 1
        
        return score / factors if factors > 0 else 0.5
    
    def _calculate_informativeness(self, text: str) -> float:
        """Calculate informativeness based on content richness"""
        if not text:
            return 0.0
        
        tokens = self._tokenize(text)
        if not tokens:
            return 0.0
        
        # Vocabulary richness (unique words / total words)
        unique_tokens = set(tokens)
        vocabulary_richness = len(unique_tokens) / len(tokens)
        
        # Content word ratio (excluding stop words)
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                     'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
                     'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
                     'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
                     'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
                     'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'}
        
        content_words = [token for token in tokens if token not in stop_words]
        content_ratio = len(content_words) / len(tokens) if tokens else 0
        
        # Combine scores
        informativeness = 0.6 * vocabulary_richness + 0.4 * content_ratio
        
        return min(1.0, informativeness)
    
    def _calculate_length_ratio(self, candidate: str, reference: str) -> float:
        """Calculate length ratio between candidate and reference"""
        if not reference:
            return 0.0
        
        candidate_length = len(self._tokenize(candidate))
        reference_length = len(self._tokenize(reference))
        
        if reference_length == 0:
            return 1.0 if candidate_length == 0 else 0.0
        
        ratio = candidate_length / reference_length
        # Penalize ratios that are too far from 1.0
        return 1.0 - abs(1.0 - ratio) / max(1.0, ratio)
    
    def _calculate_word_overlap(self, candidate: str, reference: str) -> float:
        """Calculate word overlap between candidate and reference"""
        candidate_tokens = set(self._tokenize(candidate))
        reference_tokens = set(self._tokenize(reference))
        
        if not candidate_tokens and not reference_tokens:
            return 1.0
        if not candidate_tokens or not reference_tokens:
            return 0.0
        
        overlap = candidate_tokens.intersection(reference_tokens)
        union = candidate_tokens.union(reference_tokens)
        
        return len(overlap) / len(union) if union else 0.0
    
    def _calculate_sentence_similarity(self, candidate: str, reference: str) -> float:
        """Calculate sentence-level similarity"""
        candidate_sentences = re.split(r'[.!?]+', candidate)
        reference_sentences = re.split(r'[.!?]+', reference)
        
        candidate_sentences = [s.strip() for s in candidate_sentences if s.strip()]
        reference_sentences = [s.strip() for s in reference_sentences if s.strip()]
        
        if not candidate_sentences or not reference_sentences:
            return 0.0
        
        # Calculate best matching similarity for each candidate sentence
        similarities = []
        
        for cand_sent in candidate_sentences:
            cand_tokens = set(self._tokenize(cand_sent))
            best_sim = 0.0
            
            for ref_sent in reference_sentences:
                ref_tokens = set(self._tokenize(ref_sent))
                if cand_tokens and ref_tokens:
                    overlap = cand_tokens.intersection(ref_tokens)
                    union = cand_tokens.union(ref_tokens)
                    sim = len(overlap) / len(union) if union else 0.0
                    best_sim = max(best_sim, sim)
            
            similarities.append(best_sim)
        
        return sum(similarities) / len(similarities) if similarities else 0.0
