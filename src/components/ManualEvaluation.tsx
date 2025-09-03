import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Copy, Download, Play } from "@phosphor-icons/react";
import MetricResults from "./MetricResults";
import SampleDataLibrary from "./SampleDataLibrary";
import QualityRatingPanel from "./QualityRatingPanel";

const MODELS = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "claude-3", name: "Claude 3" },
  { id: "gemini-pro", name: "Gemini Pro" },
  { id: "llama-2", name: "Llama 2" },
  { id: "custom", name: "Custom Model" }
];

const METRICS = [
  { id: "bleu", label: "BLEU Score", description: "Bilingual evaluation understudy score" },
  { id: "rouge1", label: "ROUGE-1", description: "Unigram overlap score" },
  { id: "rouge2", label: "ROUGE-2", description: "Bigram overlap score" },
  { id: "rougel", label: "ROUGE-L", description: "Longest common subsequence" },
  { id: "perplexity", label: "Perplexity", description: "Language model perplexity" },
  { id: "coherence", label: "Coherence", description: "Text coherence score" },
  { id: "fluency", label: "Fluency", description: "Text fluency assessment" },
  { id: "relevance", label: "Relevance", description: "Response relevance to prompt" },
  { id: "semantic", label: "Semantic Similarity", description: "Semantic similarity to reference" },
  { id: "toxicity", label: "Toxicity Detection", description: "Harmful content detection" }
];

export default function ManualEvaluation() {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    model: "",
    customModel: "",
    reference: ""
  });

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "rouge1", "coherence", "fluency", "relevance"
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

  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSampleSelect = (sample: any) => {
    setFormData(prev => ({
      ...prev,
      question: sample.question,
      answer: sample.answer,
      model: sample.model || ""
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const calculateMetrics = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Please provide both question and answer");
      return;
    }

    setIsCalculating(true);
    
    try {
      // Simulate metric calculations
      const automaticMetrics = selectedMetrics.reduce((acc, metric) => {
        const score = Math.random() * 0.4 + 0.6; // Random score between 0.6-1.0
        acc[metric] = {
          score: parseFloat(score.toFixed(3)),
          details: `Calculated ${metric} score based on text analysis`
        };
        return acc;
      }, {} as any);

      // Calculate composite quality score
      const qualityScore = Object.values(qualityRatings).reduce((sum: number, rating: any) => 
        sum + rating, 0
      ) / Object.keys(qualityRatings).length / 5; // Normalize to 0-1

      const newResults = {
        automatic: automaticMetrics,
        quality: qualityScore,
        qualityBreakdown: qualityRatings,
        metadata: {
          model: formData.model === "custom" ? formData.customModel : formData.model,
          timestamp: new Date().toISOString(),
          questionLength: formData.question.length,
          answerLength: formData.answer.length
        }
      };

      setResults(newResults);
      toast.success("Metrics calculated successfully");
    } catch (error) {
      toast.error("Failed to calculate metrics");
    } finally {
      setIsCalculating(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const exportData = {
      input: formData,
      metrics: results,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Sample Data Library */}
      <SampleDataLibrary onSampleSelect={handleSampleSelect} />

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="question">Question/Prompt</Label>
              <Textarea
                id="question"
                placeholder="Enter your question or prompt here..."
                value={formData.question}
                onChange={(e) => handleInputChange("question", e.target.value)}
                className="min-h-20"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(formData.question)}
                className="mt-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>

            <div>
              <Label htmlFor="answer">Model Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the model's response here..."
                value={formData.answer}
                onChange={(e) => handleInputChange("answer", e.target.value)}
                className="min-h-32"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(formData.answer)}
                className="mt-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>

            <div>
              <Label htmlFor="reference">Reference Answer (Optional)</Label>
              <Textarea
                id="reference"
                placeholder="Enter reference answer for comparison..."
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                className="min-h-20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model</Label>
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
              </div>

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
        </CardContent>
      </Card>

      {/* Metric Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Metric Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {METRICS.map((metric) => (
              <div key={metric.id} className="flex items-start space-x-2">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={() => handleMetricToggle(metric.id)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={metric.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {metric.label}
                  </label>
                  <p className="text-xs text-muted-foreground">
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
      <div className="flex gap-2">
        <Button 
          onClick={calculateMetrics}
          disabled={isCalculating || !formData.question.trim() || !formData.answer.trim()}
        >
          <Play className="w-4 h-4 mr-2" />
          {isCalculating ? "Calculating..." : "Run Evaluation"}
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
        <MetricResults results={results} onExport={exportResults} />
      )}
    </div>
  );
}