import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle, XCircle, Info, Shield, Brain, MagnifyingGlass, ChartBar } from "@phosphor-icons/react";

// Enhanced result interfaces for comprehensive evaluation frameworks
interface FrameworkResult {
  score: number;
  reasoning?: string;
  verdict?: 'PASS' | 'FAIL';
  justification?: string;
  explanation?: string;
  label?: string;
  framework: 'DeepEval' | 'MLFlow' | 'RAGAs' | 'Phoenix' | 'Deepchecks';
}

interface MetricResultsProps {
  results: {
    // Framework-specific results
    deepeval?: Record<string, FrameworkResult>;
    mlflow?: Record<string, FrameworkResult>;
    ragas?: Record<string, FrameworkResult>;
    phoenix?: Record<string, FrameworkResult>;
    deepchecks?: Record<string, FrameworkResult>;
    
    // Legacy automatic metrics (maintain backward compatibility)
    automatic: Record<string, { score: number; details: string }>;
    quality: number;
    qualityBreakdown: Record<string, number>;
    metadata: {
      model: string;
      timestamp: string;
      questionLength: number;
      answerLength: number;
      framework?: string;
      evaluationMode?: 'single' | 'bulk';
    };
  };
  onExport: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.6) return "text-yellow-600";
  return "text-red-600";
};

const getScoreIcon = (score: number) => {
  if (score >= 0.8) return <CheckCircle className="w-4 h-4 text-green-600" />;
  if (score >= 0.6) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
  return <XCircle className="w-4 h-4 text-red-600" />;
};

const formatMetricName = (key: string) => {
  const names: Record<string, string> = {
    // Legacy metrics
    bleu: "BLEU Score",
    rouge1: "ROUGE-1",
    rouge2: "ROUGE-2", 
    rougeL: "ROUGE-L",
    perplexity: "Perplexity",
    coherence: "Coherence",
    fluency: "Fluency",
    relevance: "Relevance",
    semantic: "Semantic Similarity",
    length: "Response Length",
    
    // DeepEval metrics
    g_eval: "G-Eval",
    answer_relevancy: "Answer Relevancy",
    faithfulness: "Faithfulness",
    contextual_precision: "Contextual Precision",
    contextual_recall: "Contextual Recall",
    hallucination: "Hallucination Detection",
    correctness: "Correctness",
    toxicity: "Toxicity",
    bias: "Bias Detection",
    summarization: "Summarization Quality",
    
    // MLFlow metrics
    answer_similarity: "Answer Similarity",
    answer_correctness: "Answer Correctness",
    answer_relevance: "Answer Relevance",
    
    // RAGAs metrics
    faithful: "Faithfulness (RAGAs)",
    answer_rel: "Answer Relevance (RAGAs)",
    context_rel: "Context Relevance",
    answer_sim: "Answer Similarity (RAGAs)",
    factual_cor: "Factual Correctness",
    answer_cor: "Answer Correctness (RAGAs)",
    
    // Phoenix metrics
    qa_correctness: "QA Correctness",
    retrieval_relevance: "Retrieval Relevance",
    
    // Deepchecks metrics (34+ built-in properties)
    grounded_in_context: "Grounded in Context",
    reading_ease: "Reading Ease",
    formality: "Formality",
    avoided_answer: "Avoided Answer",
    sentiment: "Sentiment",
    invalid_links: "Invalid Links",
    safety_score: "Safety Score",
    overall_score: "Overall Score"
  };
  return names[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatQualityName = (key: string) => {
  const names: Record<string, string> = {
    accuracy: "Accuracy/Correctness",
    completeness: "Completeness",
    clarity: "Clarity",
    conciseness: "Conciseness", 
    creativity: "Creativity/Originality",
    helpfulness: "Helpfulness",
    safety: "Safety/Harmlessness",
    factualGrounding: "Factual Grounding"
  };
  return names[key] || key;
};

const getFrameworkIcon = (framework: string) => {
  switch (framework) {
    case 'DeepEval':
      return <Brain className="w-4 h-4 text-blue-600" />;
    case 'MLFlow':
      return <ChartBar className="w-4 h-4 text-purple-600" />;
    case 'RAGAs':
      return <MagnifyingGlass className="w-4 h-4 text-green-600" />;
    case 'Phoenix':
      return <Shield className="w-4 h-4 text-orange-600" />;
    case 'Deepchecks':
      return <Info className="w-4 h-4 text-indigo-600" />;
    default:
      return <CheckCircle className="w-4 h-4 text-gray-600" />;
  }
};

const getFrameworkColor = (framework: string) => {
  switch (framework) {
    case 'DeepEval':
      return 'text-blue-600';
    case 'MLFlow':
      return 'text-purple-600';
    case 'RAGAs':
      return 'text-green-600';
    case 'Phoenix':
      return 'text-orange-600';
    case 'Deepchecks':
      return 'text-indigo-600';
    default:
      return 'text-gray-600';
  }
};

const renderFrameworkResults = (frameworkResults: Record<string, FrameworkResult>, frameworkName: string) => {
  const results = Object.entries(frameworkResults);
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {getFrameworkIcon(frameworkName)}
        <h3 className={`text-lg font-semibold ${getFrameworkColor(frameworkName)}`}>
          {frameworkName} Results
        </h3>
      </div>
      
      {results.map(([metric, data]) => (
        <div key={metric} className="space-y-2 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getScoreIcon(data.score)}
              <span className="font-medium">{formatMetricName(metric)}</span>
              {data.verdict && (
                <Badge variant={data.verdict === 'PASS' ? 'default' : 'destructive'}>
                  {data.verdict}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${getScoreColor(data.score)}`}>
                {(data.score * 100).toFixed(1)}%
              </span>
              {data.label && (
                <Badge variant="outline">{data.label}</Badge>
              )}
            </div>
          </div>
          <Progress value={data.score * 100} />
          
          {/* Show detailed explanations based on framework */}
          {data.reasoning && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              <strong>Reasoning:</strong> {data.reasoning}
            </div>
          )}
          {data.justification && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              <strong>Justification:</strong> {data.justification}
            </div>
          )}
          {data.explanation && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              <strong>Explanation:</strong> {data.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default function MetricResults({ results, onExport }: MetricResultsProps) {
  const automatedScores = Object.entries(results.automatic);
  const qualityScores = Object.entries(results.qualityBreakdown);
  
  // Calculate framework-specific scores
  const allFrameworkResults = [
    ...(results.deepeval ? Object.entries(results.deepeval) : []),
    ...(results.mlflow ? Object.entries(results.mlflow) : []),
    ...(results.ragas ? Object.entries(results.ragas) : []),
    ...(results.phoenix ? Object.entries(results.phoenix) : []),
    ...(results.deepchecks ? Object.entries(results.deepchecks) : [])
  ];
  
  const overallAutomatedScore = automatedScores.length > 0 
    ? automatedScores.reduce((sum, [, data]) => sum + data.score, 0) / automatedScores.length 
    : 0;
    
  const overallQualityScore = qualityScores.length > 0
    ? qualityScores.reduce((sum, [, score]) => sum + score, 0) / qualityScores.length / 5
    : 0;

  const overallFrameworkScore = allFrameworkResults.length > 0
    ? allFrameworkResults.reduce((sum, [, data]) => sum + data.score, 0) / allFrameworkResults.length
    : 0;

  const overallScore = [overallAutomatedScore, overallQualityScore, overallFrameworkScore]
    .filter(score => score > 0)
    .reduce((sum, score, _, arr) => sum + score / arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Enhanced Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getScoreIcon(overallScore)}
              <div>
                <div className="text-2xl font-bold">{(overallScore * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Composite evaluation</div>
              </div>
            </div>
            <Progress value={overallScore * 100} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Framework Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getScoreIcon(overallFrameworkScore)}
              <div>
                <div className="text-2xl font-bold">{(overallFrameworkScore * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">{allFrameworkResults.length} metrics</div>
              </div>
            </div>
            <Progress value={overallFrameworkScore * 100} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Automated Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getScoreIcon(overallAutomatedScore)}
              <div>
                <div className="text-2xl font-bold">{(overallAutomatedScore * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">{automatedScores.length} metrics</div>
              </div>
            </div>
            <Progress value={overallAutomatedScore * 100} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quality Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getScoreIcon(overallQualityScore)}
              <div>
                <div className="text-2xl font-bold">{(overallQualityScore * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Manual ratings</div>
              </div>
            </div>
            <Progress value={overallQualityScore * 100} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Evaluation Results</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Model: {results.metadata.model}</Badge>
            <Badge variant="outline">Question: {results.metadata.questionLength} chars</Badge>
            <Badge variant="outline">Answer: {results.metadata.answerLength} chars</Badge>
            {results.metadata.framework && (
              <Badge variant="secondary">Framework: {results.metadata.framework}</Badge>
            )}
            {results.metadata.evaluationMode && (
              <Badge variant="secondary">Mode: {results.metadata.evaluationMode}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="frameworks" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="frameworks">Framework Results</TabsTrigger>
              <TabsTrigger value="deepeval">DeepEval</TabsTrigger>
              <TabsTrigger value="ragas">RAGAs</TabsTrigger>
              <TabsTrigger value="automated">Legacy Metrics</TabsTrigger>
              <TabsTrigger value="quality">Quality Ratings</TabsTrigger>
              <TabsTrigger value="summary">Summary Table</TabsTrigger>
            </TabsList>

            <TabsContent value="frameworks" className="space-y-6">
              {results.deepeval && renderFrameworkResults(results.deepeval, 'DeepEval')}
              {results.mlflow && renderFrameworkResults(results.mlflow, 'MLFlow')}
              {results.ragas && renderFrameworkResults(results.ragas, 'RAGAs')}
              {results.phoenix && renderFrameworkResults(results.phoenix, 'Phoenix')}
              {results.deepchecks && renderFrameworkResults(results.deepchecks, 'Deepchecks')}
              
              {allFrameworkResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No framework-specific results available. Use individual framework tabs to see results.
                </div>
              )}
            </TabsContent>

            <TabsContent value="deepeval" className="space-y-4">
              {results.deepeval ? renderFrameworkResults(results.deepeval, 'DeepEval') : (
                <div className="text-center py-8 text-muted-foreground">
                  No DeepEval results available
                </div>
              )}
            </TabsContent>

            <TabsContent value="ragas" className="space-y-4">
              {results.ragas ? renderFrameworkResults(results.ragas, 'RAGAs') : (
                <div className="text-center py-8 text-muted-foreground">
                  No RAGAs results available
                </div>
              )}
            </TabsContent>

            <TabsContent value="automated" className="space-y-4">
              {automatedScores.length > 0 ? (
                <div className="space-y-4">
                  {automatedScores.map(([metric, data]) => (
                    <div key={metric} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getScoreIcon(data.score)}
                          <span className="font-medium">{formatMetricName(metric)}</span>
                        </div>
                        <span className={`font-bold ${getScoreColor(data.score)}`}>
                          {(data.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={data.score * 100} />
                      <p className="text-sm text-muted-foreground">{data.details}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No automated metrics selected
                </div>
              )}
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <div className="space-y-4">
                {qualityScores.map(([dimension, score]) => (
                  <div key={dimension} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{formatQualityName(dimension)}</span>
                      <span className="font-bold text-primary">{score}/5</span>
                    </div>
                    <Progress value={(score / 5) * 100} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Framework Results */}
                  {allFrameworkResults.map(([metric, data]) => (
                    <TableRow key={`${data.framework}-${metric}`}>
                      <TableCell className="font-medium">{formatMetricName(metric)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFrameworkIcon(data.framework)}
                          <span className={getFrameworkColor(data.framework)}>{data.framework}</span>
                        </div>
                      </TableCell>
                      <TableCell>Framework</TableCell>
                      <TableCell className={getScoreColor(data.score)}>
                        {(data.score * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getScoreIcon(data.score)}
                          {data.verdict && (
                            <Badge variant={data.verdict === 'PASS' ? 'default' : 'destructive'} className="text-xs">
                              {data.verdict}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {data.reasoning || data.justification || data.explanation || data.label || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Legacy Automated Results */}
                  {automatedScores.map(([metric, data]) => (
                    <TableRow key={metric}>
                      <TableCell className="font-medium">{formatMetricName(metric)}</TableCell>
                      <TableCell>Legacy</TableCell>
                      <TableCell>Automated</TableCell>
                      <TableCell className={getScoreColor(data.score)}>
                        {(data.score * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>{getScoreIcon(data.score)}</TableCell>
                      <TableCell className="max-w-xs truncate">{data.details}</TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Quality Results */}
                  {qualityScores.map(([dimension, score]) => (
                    <TableRow key={dimension}>
                      <TableCell className="font-medium">{formatQualityName(dimension)}</TableCell>
                      <TableCell>Manual</TableCell>
                      <TableCell>Quality</TableCell>
                      <TableCell className="text-primary">{score}/5</TableCell>
                      <TableCell>{getScoreIcon((score / 5))}</TableCell>
                      <TableCell>—</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}