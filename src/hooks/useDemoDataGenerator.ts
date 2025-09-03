import { useEvaluationTracking, EvaluationRecord } from '@/hooks/useEvaluationTracking';

const DEMO_MODELS = [
  'GPT-4', 'Claude 3', 'Gemini Pro', 'Llama 2', 'GPT-3.5', 'PaLM 2'
];

const DEMO_PROMPTS = [
  'Explain quantum computing in simple terms',
  'Write a professional email about project delays',
  'Summarize the key benefits of renewable energy',
  'Create a recipe for chocolate chip cookies',
  'Describe the process of photosynthesis',
  'Write a short story about time travel',
  'Explain machine learning to a 10-year-old',
  'List the pros and cons of remote work',
  'Describe the water cycle',
  'Write code to sort an array in Python'
];

const DEMO_RESPONSES = [
  'Quantum computing is like having a super-powered calculator...',
  'Dear Team, I am writing to inform you about some adjustments...',
  'Renewable energy offers several key advantages including...',
  'Here\'s a classic chocolate chip cookie recipe that serves 24...',
  'Photosynthesis is the process by which plants convert sunlight...',
  'Sarah stared at the strange device that had appeared in her garage...',
  'Think of machine learning like teaching a computer to recognize patterns...',
  'Remote work has become increasingly popular. Here are the main advantages...',
  'The water cycle is nature\'s way of recycling water through...',
  'Here\'s a simple Python function to sort an array using the built-in method...'
];

const CATEGORIES = [
  'Education', 'Business', 'Science', 'Creative Writing', 'Programming', 'General Knowledge'
];

export function useDemoDataGenerator() {
  const { addEvaluation, evaluationHistory } = useEvaluationTracking();

  const generateRandomScore = (base: number = 7, variance: number = 2) => {
    return Math.max(1, Math.min(10, base + (Math.random() - 0.5) * variance * 2));
  };

  const generateDemoEvaluation = (daysAgo: number = 0): Omit<EvaluationRecord, 'id' | 'timestamp'> => {
    const modelName = DEMO_MODELS[Math.floor(Math.random() * DEMO_MODELS.length)];
    const promptIndex = Math.floor(Math.random() * DEMO_PROMPTS.length);
    const prompt = DEMO_PROMPTS[promptIndex];
    const response = DEMO_RESPONSES[promptIndex];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
    // Model performance variations
    const modelMultiplier = {
      'GPT-4': 1.1,
      'Claude 3': 1.05,
      'Gemini Pro': 1.0,
      'Llama 2': 0.95,
      'GPT-3.5': 0.9,
      'PaLM 2': 0.95
    }[modelName] || 1.0;

    // Time-based improvement (slight upward trend)
    const timeMultiplier = 1 + (30 - daysAgo) * 0.002; // 0.2% improvement per day

    const baseScore = 7 * modelMultiplier * timeMultiplier;
    
    const relevance = generateRandomScore(baseScore, 1.5);
    const accuracy = generateRandomScore(baseScore, 1.5);
    const coherence = generateRandomScore(baseScore + 0.5, 1.2);
    const helpfulness = generateRandomScore(baseScore, 1.8);
    const harmlessness = generateRandomScore(9, 0.8); // Generally high safety scores

    const overallScore = (relevance + accuracy + coherence + helpfulness + harmlessness) / 5;

    return {
      modelName,
      prompt,
      response,
      metrics: {
        relevance,
        accuracy,
        coherence,
        helpfulness,
        harmlessness
      },
      overallScore,
      category,
      evaluationType: Math.random() > 0.7 ? 'bulk' : 'manual' as const,
      metadata: {
        demoData: true,
        generatedAt: new Date().toISOString()
      }
    };
  };

  const generateDemoDataset = (count: number = 50) => {
    const evaluations: Array<Omit<EvaluationRecord, 'id' | 'timestamp'> & { customTimestamp: number }> = [];
    
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
      const hoursAgo = Math.random() * 24;
      const customTimestamp = Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000);
      
      evaluations.push({
        ...generateDemoEvaluation(daysAgo),
        customTimestamp
      });
    }

    // Sort by timestamp and add them
    evaluations
      .sort((a, b) => a.customTimestamp - b.customTimestamp)
      .forEach(evaluation => {
        const { customTimestamp, ...evalData } = evaluation;
        // We'll need to manually set the timestamp in the actual implementation
        addEvaluation(evalData);
      });

    return evaluations.length;
  };

  const clearDemoData = () => {
    // This would need to filter out demo data specifically
    // For now, we'll just note this functionality
    console.log('Demo data clearing would be implemented here');
  };

  return {
    generateDemoDataset,
    generateDemoEvaluation,
    clearDemoData,
    hasDemoData: evaluationHistory.some(eval => eval.metadata?.demoData),
    totalEvaluations: evaluationHistory.length
  };
}