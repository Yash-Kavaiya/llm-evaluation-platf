import { useKV } from '@github/spark/hooks';

export interface EvaluationRecord {
  id: string;
  timestamp: number;
  modelName: string;
  prompt: string;
  response: string;
  metrics: {
    relevance: number;
    accuracy: number;
    clarity: number;
    helpfulness: number;
  };
  overallScore: number;
  category?: string;
  evaluationType: 'manual' | 'bulk' | 'rag' | 'responsible';
  metadata?: {
    [key: string]: any;
  };
}

export function useEvaluationTracking() {
  const [evaluationHistory, setEvaluationHistory] = useKV<EvaluationRecord[]>("evaluation-history", []);

  const addEvaluation = (evaluation: Omit<EvaluationRecord, 'id' | 'timestamp'>) => {
    const newRecord: EvaluationRecord = {
      ...evaluation,
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setEvaluationHistory(currentHistory => [...currentHistory, newRecord]);
    return newRecord.id;
  };

  const getEvaluationById = (id: string) => {
    return evaluationHistory.find(record => record.id === id);
  };

  const getEvaluationsByModel = (modelName: string) => {
    return evaluationHistory.filter(record => record.modelName === modelName);
  };

  const getEvaluationsByType = (type: EvaluationRecord['evaluationType']) => {
    return evaluationHistory.filter(record => record.evaluationType === type);
  };

  const clearHistory = () => {
    setEvaluationHistory([]);
  };

  return {
    evaluationHistory,
    addEvaluation,
    getEvaluationById,
    getEvaluationsByModel,
    getEvaluationsByType,
    clearHistory
  };
}