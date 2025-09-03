import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Play } from "@phosphor-icons/react";
import { toast } from "sonner";
import MetricResults from "./MetricResults";
import SampleDataLibrary from "./SampleDataLibrary";
import QualityRatingPanel from "./QualityRatingPanel";

const MODELS = [
  "GPT-4",
  "GPT-4 Turbo",
  "Claude-3 Sonnet",
  "Claude-3 Haiku",
  "Gemini Pro",
  "Llama 2 70B",
  "PaLM 2",
  "Custom"
];

const AUTOMATED_METRICS = [
  { id: "bleu", label: "BLEU Score", description: "Bilingual Evaluation Understudy" },
  { id: "rouge1", label: "ROUGE-1", description: "Recall-Oriented Understudy for Gisting Evaluation" },
  { id: "rouge2", label: "ROUGE-2", description: "Bigram-based ROUGE" },
  { id: "rougeL", label: "ROUGE-L", description: "Longest Common Subsequence" },
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
      toast.success("Copied to clipboard!");
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

      setResults({
        automatic: automaticMetrics,
        quality: qualityScore,
        qualityBreakdown: qualityRatings,
        metadata: {
          model: formData.model === "Custom" ? formData.customModel : formData.model,
          timestamp: new Date().toISOString(),
          questionLength: formData.question.length,
          answerLength: formData.answer.length
        }
      });

      toast.success("Evaluation completed successfully!");
    } catch (error) {
      toast.error("Failed to calculate metrics");
    } finally {
      setIsCalculating(false);
    }
  };

  const exportResults = () => {
    if (!results) {
      toast.error("No results to export");
      return;
    }
    
    const exportData = {
      evaluation: results,
      input: formData,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Results exported successfully!");
  };

  return (
    <div className="space-y-6">
      <SampleDataLibrary onSampleSelect={handleSampleSelect} />
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="question">Question/Prompt</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formData.question)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                id="question"
                placeholder="Enter the question or prompt that was given to the model..."
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="answer">Model Response</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formData.answer)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                id="answer"
                placeholder="Paste the model's response here..."
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model Used</Label>
              <Select 
                value={formData.model} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the model used" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.model === "Custom" && (
              <div className="space-y-2">
                <Label htmlFor="customModel">Custom Model Name</Label>
                <Input
                  id="customModel"
                  placeholder="Enter custom model name"
                  value={formData.customModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, customModel: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Answer (Optional)</Label>
              <Textarea
                id="reference"
                placeholder="Provide a reference answer for comparison-based metrics..."
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Metric Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Automated Metrics</Label>
              <div className="grid grid-cols-1 gap-2">
                {AUTOMATED_METRICS.map((metric) => (
                  <div key={metric.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => handleMetricToggle(metric.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={metric.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
            </div>

            <QualityRatingPanel 
              ratings={qualityRatings}
              onRatingChange={setQualityRatings}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={calculateMetrics}
          disabled={isCalculating || !formData.question.trim() || !formData.answer.trim()}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {isCalculating ? "Calculating..." : "Run Evaluation"}
        </Button>

        {results && (
          <Button 
            variant="outline" 
            onClick={exportResults}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Results
          </Button>
        )}
      </div>

      {/* Results */}
      {results && (
        <MetricResults 
          results={results}
          onExport={exportResults}
        />
      )}
    </div>
  );
}