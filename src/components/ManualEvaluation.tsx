import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calculator, Download } from "@phosphor-icons/react";
import { toast } from "sonner";
import MetricResults from "./MetricResults";
import QualityRatings from "./QualityRatings";

const LLM_MODELS = [
  "GPT-4",
  "GPT-3.5-turbo", 
  "Claude-3-opus",
  "Claude-3-sonnet",
  "Claude-3-haiku",
  "Gemini-1.5-pro",
  "Gemini-1.0-pro",
  "Llama-3-70b",
  "Llama-3-8b",
  "Mistral-large",
  "Mistral-medium",
  "Custom"
];

const AUTOMATED_METRICS = [
  { id: "bleu", label: "BLEU Score", description: "Measures overlap with reference text" },
  { id: "rouge1", label: "ROUGE-1", description: "Unigram overlap score" },
  { id: "rouge2", label: "ROUGE-2", description: "Bigram overlap score" },
  { id: "rougeL", label: "ROUGE-L", description: "Longest common subsequence" },
  { id: "perplexity", label: "Perplexity", description: "Language model uncertainty" },
  { id: "coherence", label: "Coherence Score", description: "Logical flow and consistency" },
  { id: "fluency", label: "Fluency Score", description: "Natural language quality" },
  { id: "relevance", label: "Relevance Score", description: "Answer relevance to question" },
  { id: "semantic", label: "Semantic Similarity", description: "Meaning similarity score" },
  { id: "length", label: "Response Length", description: "Token count and character length" }
];

export default function ManualEvaluation() {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    model: "",
    customModel: "",
    referenceAnswer: ""
  });

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "coherence", "fluency", "relevance", "semantic", "length"
  ]);

  const [qualityRatings, setQualityRatings] = useState({
    accuracy: 3,
    completeness: 3,
    clarity: 3,
    conciseness: 3,
    creativity: 3,
    helpfulness: 3,
    safety: 3,
    factualGrounding: 3
  });

  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults = {
        automated: selectedMetrics.reduce((acc, metric) => {
          acc[metric] = {
            score: Math.random() * 0.4 + 0.6, // Random score between 0.6-1.0
            details: `Calculated ${metric} score based on input analysis`
          };
          return acc;
        }, {} as Record<string, any>),
        quality: qualityRatings,
        metadata: {
          model: formData.model === "Custom" ? formData.customModel : formData.model,
          questionLength: formData.question.length,
          answerLength: formData.answer.length,
          timestamp: new Date().toISOString()
        }
      };

      setResults(mockResults);
      toast.success("Evaluation completed successfully");
    } catch (error) {
      toast.error("Failed to calculate metrics");
    } finally {
      setIsCalculating(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const data = {
      input: formData,
      metrics: selectedMetrics,
      results: results,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `llm-evaluation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Results exported successfully");
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Input Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Question/Prompt</Label>
              <Textarea
                id="question"
                placeholder="Enter the prompt or question given to the model..."
                className="min-h-[120px] resize-y"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Model Response</Label>
              <Textarea
                id="answer"
                placeholder="Enter the model's generated answer..."
                className="min-h-[120px] resize-y"
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={formData.model} onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {LLM_MODELS.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.model === "Custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customModel">Custom Model Name</Label>
                  <Input
                    id="customModel"
                    placeholder="Enter model name"
                    value={formData.customModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, customModel: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Answer (Optional)</Label>
              <Textarea
                id="reference"
                placeholder="Enter reference answer for BLEU score calculation..."
                className="min-h-[80px] resize-y"
                value={formData.referenceAnswer}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceAnswer: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Required for BLEU score calculation</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Metric Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Automated Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {AUTOMATED_METRICS.map(metric => (
                  <div key={metric.id} className="flex items-start gap-3">
                    <Checkbox
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => handleMetricToggle(metric.id)}
                      disabled={metric.id === "bleu" && !formData.referenceAnswer.trim()}
                    />
                    <div className="space-y-1 flex-1">
                      <Label 
                        htmlFor={metric.id} 
                        className={`text-sm font-medium ${metric.id === "bleu" && !formData.referenceAnswer.trim() ? "text-muted-foreground" : ""}`}
                      >
                        {metric.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quality Ratings */}
          <QualityRatings 
            ratings={qualityRatings}
            onRatingsChange={setQualityRatings}
          />
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={calculateMetrics}
          disabled={isCalculating || !formData.question.trim() || !formData.answer.trim()}
          className="flex items-center gap-2"
          size="lg"
        >
          <Calculator className="w-4 h-4" />
          {isCalculating ? "Calculating..." : "Evaluate Response"}
        </Button>

        {results && (
          <Button 
            variant="outline" 
            onClick={exportResults}
            className="flex items-center gap-2"
            size="lg"
          >
            <Download className="w-4 h-4" />
            Export Results
          </Button>
        )}
      </div>

      {/* Results */}
      {results && (
        <MetricResults results={results} />
      )}
    </div>
  );
}