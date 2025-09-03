import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle, XCircle } from "@phosphor-icons/react";

interface MetricResultsProps {
  results: {
    automatic: Record<string, { score: number; details: string }>;
    quality: number;
    qualityBreakdown: Record<string, number>;
    metadata: {
      model: string;
      timestamp: string;
      questionLength: number;
      answerLength: number;
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
    bleu: "BLEU Score",
    rouge1: "ROUGE-1",
    rouge2: "ROUGE-2", 
    rougeL: "ROUGE-L",
    perplexity: "Perplexity",
    coherence: "Coherence",
    fluency: "Fluency",
    relevance: "Relevance",
    semantic: "Semantic Similarity",
    length: "Response Length"
  };
  return names[key] || key;
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

export default function MetricResults({ results, onExport }: MetricResultsProps) {
  const automatedScores = Object.entries(results.automatic);
  const qualityScores = Object.entries(results.qualityBreakdown);
  
  const overallAutomatedScore = automatedScores.length > 0 
    ? automatedScores.reduce((sum, [, data]) => sum + data.score, 0) / automatedScores.length 
    : 0;
    
  const overallQualityScore = qualityScores.length > 0
    ? qualityScores.reduce((sum, [, score]) => sum + score, 0) / qualityScores.length / 5
    : 0;

  const overallScore = (overallAutomatedScore + overallQualityScore) / 2;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
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

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Evaluation Results</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Model: {results.metadata.model}</Badge>
            <Badge variant="outline">Question: {results.metadata.questionLength} chars</Badge>
            <Badge variant="outline">Answer: {results.metadata.answerLength} chars</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="automated" className="space-y-4">
            <TabsList>
              <TabsTrigger value="automated">Automated Metrics</TabsTrigger>
              <TabsTrigger value="quality">Quality Ratings</TabsTrigger>
              <TabsTrigger value="summary">Summary Table</TabsTrigger>
            </TabsList>

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
                    <TableHead>Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automatedScores.map(([metric, data]) => (
                    <TableRow key={metric}>
                      <TableCell className="font-medium">{formatMetricName(metric)}</TableCell>
                      <TableCell>Automated</TableCell>
                      <TableCell className={getScoreColor(data.score)}>
                        {(data.score * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>{getScoreIcon(data.score)}</TableCell>
                    </TableRow>
                  ))}
                  {qualityScores.map(([dimension, score]) => (
                    <TableRow key={dimension}>
                      <TableCell className="font-medium">{formatQualityName(dimension)}</TableCell>
                      <TableCell>Manual</TableCell>
                      <TableCell className="text-primary">{score}/5</TableCell>
                      <TableCell>{getScoreIcon((score / 5))}</TableCell>
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