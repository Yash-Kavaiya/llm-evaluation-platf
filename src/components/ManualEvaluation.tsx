import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Copy } from "@phosphor-icons/react";
import { toast } from "sonner";
import SampleDataLibrary from "./SampleDataLibrary";

const MODELS = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "claude-3", name: "Claude 3" },
  { id: "gemini-pro", name: "Gemini Pro" },
  { id: "llama-2", name: "Llama 2" },
  { id: "custom", name: "Custom Model" }
];

const METRICS = [
  { id: "rouge1", label: "ROUGE-1", description: "Unigram overlap between generated and reference text" },
  { id: "rouge2", label: "ROUGE-2", description: "Bigram overlap between generated and reference text" },
  { id: "rougel", label: "ROUGE-L", description: "Longest common subsequence based metric" },
  { id: "bleu", label: "BLEU Score", description: "N-gram precision based metric for translation quality" },
  { id: "coherence", label: "Coherence", description: "Logical flow and consistency of the response" },
  { id: "fluency", label: "Fluency", description: "Language quality and grammatical correctness" },
  { id: "relevance", label: "Relevance", description: "How well the response addresses the question" },
  { id: "toxicity", label: "Toxicity Detection", description: "Detection of harmful or offensive content" }
];

export default function ManualEvaluation() {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    reference: "",
    model: "",
    customModel: ""
  });
  
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "rouge1", "coherence", "relevance"
  ]);
  
  const [qualityRatings, setQualityRatings] = useState({
    accuracy: 3,
    completeness: 3,
    clarity: 3,
    conciseness: 3,
    creativity: 3,
    helpfulness: 3,
    safety: 3,
    factuality: 3
  });
  
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadSampleData = (data: { question: string; answer: string; model: string }) => {
    setFormData(prev => ({
      ...prev,
      question: data.question,
      answer: data.answer,
      model: data.model
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleMetricToggle = (metricId: string, checked: boolean) => {
    setSelectedMetrics(prev => 
      checked 
        ? [...prev, metricId]
        : prev.filter(id => id !== metricId)
    );
  };

  const calculateMetrics = async () => {
    if (!formData.question || !formData.answer) {
      toast.error("Please provide both question and answer");
      return;
    }

    setIsCalculating(true);
    try {
      // Simulate metric calculations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const automaticMetrics = selectedMetrics.reduce((acc, metricId) => {
        const metric = METRICS.find(m => m.id === metricId);
        if (metric) {
          acc[metricId] = {
            label: metric.label,
            score: Math.random() * 100,
            description: metric.description
          };
        }
        return acc;
      }, {} as any);

      // Calculate composite quality score
      const qualityScore = Object.values(qualityRatings).reduce((sum: number, rating: number) => 
        sum + rating, 0
      ) / Object.keys(qualityRatings).length;

      setResults({
        automatic: automaticMetrics,
        quality: qualityScore,
        qualityBreakdown: qualityRatings,
        metadata: {
          model: formData.model === "custom" ? formData.customModel : formData.model,
          questionLength: formData.question.length,
          answerLength: formData.answer.length,
          timestamp: new Date().toISOString()
        }
      });

      toast.success("Metrics calculated successfully");
    } catch (error) {
      toast.error("Failed to calculate metrics");
    } finally {
      setIsCalculating(false);
    }
  };

  const exportResults = () => {
    const exportData = {
      input: formData,
      results: results,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluation-results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Sample Data Library */}
      <SampleDataLibrary onLoadSample={loadSampleData} />

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input Data</CardTitle>
          <CardDescription>Enter the question/prompt and model response to evaluate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="question">Question/Prompt</Label>
              <div className="relative">
                <Textarea
                  id="question"
                  placeholder="Enter your question or prompt here..."
                  value={formData.question}
                  onChange={(e) => handleInputChange("question", e.target.value)}
                  className="min-h-[120px] pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(formData.question)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="answer">Model Response</Label>
              <div className="relative">
                <Textarea
                  id="answer"
                  placeholder="Enter the model's response here..."
                  value={formData.answer}
                  onChange={(e) => handleInputChange("answer", e.target.value)}
                  className="min-h-[120px] pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(formData.answer)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="reference">Reference Answer (Optional)</Label>
              <Textarea
                id="reference"
                placeholder="Enter reference answer for comparison..."
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <div className="space-y-2">
                <Select value={formData.model} onValueChange={(value) => handleInputChange("model", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.model === "custom" && (
                  <div>
                    <Label htmlFor="customModel">Custom Model Name</Label>
                    <Input
                      id="customModel"
                      placeholder="Enter custom model name"
                      value={formData.customModel}
                      onChange={(e) => handleInputChange("customModel", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Metrics</CardTitle>
          <CardDescription>Select which automated metrics to calculate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {METRICS.map((metric) => (
              <div key={metric.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={(checked) => handleMetricToggle(metric.id, checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor={metric.id} className="font-medium cursor-pointer">
                    {metric.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Rating Panel */}
      <QualityRatingPanel 
        ratings={qualityRatings}
        onRatingChange={setQualityRatings}
      />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={calculateMetrics}
          disabled={isCalculating || !formData.question || !formData.answer}
          className="flex-1"
        >
          {isCalculating ? "Calculating..." : "Calculate Metrics"}
        </Button>
        
        {results && (
          <Button 
            variant="outline"
            onClick={exportResults}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        )}
      </div>

      {/* Results Display */}
      {results && (
        <MetricResults results={results} />
      )}
    </div>
  );
}

// Quality Rating Panel Component
function QualityRatingPanel({ 
  ratings, 
  onRatingChange 
}: { 
  ratings: any; 
  onRatingChange: (ratings: any) => void; 
}) {
  const qualities = [
    { key: "accuracy", label: "Accuracy/Correctness" },
    { key: "completeness", label: "Completeness" },
    { key: "clarity", label: "Clarity" },
    { key: "conciseness", label: "Conciseness" },
    { key: "creativity", label: "Creativity/Originality" },
    { key: "helpfulness", label: "Helpfulness" },
    { key: "safety", label: "Safety/Harmlessness" },
    { key: "factuality", label: "Factual Grounding" }
  ];

  const handleRatingChange = (key: string, value: number) => {
    onRatingChange({ ...ratings, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Assessment</CardTitle>
        <CardDescription>Rate the response on various quality dimensions (1-5 scale)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qualities.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={ratings[key] === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRatingChange(key, value)}
                    className="w-10 h-10"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Metric Results Component
function MetricResults({ results }: { results: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation Results</CardTitle>
        <CardDescription>Comprehensive analysis of the model response</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-muted rounded-lg">
          <div className="text-3xl font-bold text-primary">
            {results.quality.toFixed(1)}/5.0
          </div>
          <p className="text-muted-foreground">Overall Quality Score</p>
        </div>

        {/* Automated Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Automated Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results.automatic).map(([key, metric]: [string, any]) => (
              <div key={key} className="p-4 border rounded-lg">
                <div className="font-medium">{metric.label}</div>
                <div className="text-2xl font-bold text-primary">
                  {metric.score.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quality Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(results.qualityBreakdown).map(([key, value]: [string, any]) => (
              <div key={key} className="text-center">
                <div className="text-lg font-semibold">{value}/5</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="text-sm text-muted-foreground border-t pt-4">
          <div>Model: {results.metadata.model}</div>
          <div>Question Length: {results.metadata.questionLength} characters</div>
          <div>Answer Length: {results.metadata.answerLength} characters</div>
          <div>Evaluated: {new Date(results.metadata.timestamp).toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}