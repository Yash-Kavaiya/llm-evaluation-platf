import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Download, Copy } from "@phosphor-icons/react";
import { toast } from "sonner";
import MetricResults from "./MetricResults";
import QualityRatings from "./QualityRatings";
import SampleDataLibrary from "./SampleDataLibrary";

const LLM_MODELS = [
  "GPT-4", "GPT-3.5", "Claude-3", "Claude-2", "Gemini Pro", "Llama-2", "Llama-3", "Mistral", "Custom"
];

const AUTOMATED_METRICS = [
  { id: "bleu", label: "BLEU Score", description: "Measures n-gram overlap with reference text" },
  { id: "rouge1", label: "ROUGE-1", description: "Unigram overlap between generated and reference text" },
  { id: "rouge2", label: "ROUGE-2", description: "Bigram overlap between generated and reference text" },
  { id: "rougeL", label: "ROUGE-L", description: "Longest common subsequence based metric" },
  { id: "perplexity", label: "Perplexity", description: "Measures how well the model predicts the text" },
  { id: "coherence", label: "Coherence Score", description: "Evaluates logical flow and consistency" },
  { id: "fluency", label: "Fluency Score", description: "Assesses grammatical correctness and readability" },
  { id: "relevance", label: "Relevance Score", description: "Measures how well response addresses the prompt" },
  { id: "semantic", label: "Semantic Similarity", description: "Computes meaning similarity using embeddings" },
  { id: "length", label: "Response Length", description: "Token count and character length analysis" }
];

export default function ManualEvaluation() {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    model: "",
    customModel: "",
    referenceAnswer: ""
  });

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["coherence", "fluency", "relevance"]);
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

  const handleSampleSelect = (sample: any) => {
    setFormData(prev => ({
      ...prev,
      question: sample.question,
      answer: sample.answer,
      referenceAnswer: sample.reference || ""
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = {
        automated: selectedMetrics.reduce((acc, metricId) => {
          const metric = AUTOMATED_METRICS.find(m => m.id === metricId);
          if (metric) {
            acc[metricId] = {
              label: metric.label,
              score: Math.random() * 0.4 + 0.6, // Random score between 0.6-1.0
              description: metric.description
            };
          }
          return acc;
        }, {} as Record<string, any>),
        quality: qualityRatings,
        metadata: {
          model: formData.model === "Custom" ? formData.customModel : formData.model,
          timestamp: new Date().toISOString(),
          inputLength: formData.question.length,
          outputLength: formData.answer.length
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
    if (!results) {
      toast.error("No results to export");
      return;
    }

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
      {/* Sample Data Library */}
      <SampleDataLibrary onSampleSelect={handleSampleSelect} />

      <Separator />

      {/* Input Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Input Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="question">Question/Prompt</Label>
                {formData.question && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formData.question, "Question")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Textarea
                id="question"
                placeholder="Enter the prompt or question given to the model..."
                className="min-h-[120px] resize-y"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="answer">Model Response</Label>
                {formData.answer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formData.answer, "Answer")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
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