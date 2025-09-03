import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/sep
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calculator, Download, Copy } from "@phosphor-icons/react";
import { toast } from "sonner";
import MetricResults from "./MetricResults";
import SampleDataLibrary from "./SampleDataLibrary";
import QualityRatings from "./QualityRatings";

const LLM_MODELS = [
  "GPT-4",
  "GPT-3.5 Turbo",
  "Claude-3 Sonnet", 
  "Claude-3 Haiku",
  "Gemini Pro",
  "Llama 2",
  "Custom Model"
];

const AUTOMATED_METRICS = [
  { id: "coherence", label: "Coherence Score", description: "Logical flow and consistency" },
  { id: "fluency", label: "Fluency Score", description: "Language quality and readability" },
  { id: "relevance", label: "Relevance Score", description: "Response appropriateness" },
  { id: "rouge", label: "ROUGE Scores", description: "Text overlap metrics" },
  { id: "bleu", label: "BLEU Score", description: "N-gram overlap (requires reference)" },
  { id: "toxicity", label: "Toxicity Detection", description: "Harmful content analysis" },
  { id: "sentiment", label: "Sentiment Analysis", description: "Emotional tone assessment" }
];

export default function ManualEvaluation() {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    model: "",
    customModel: "",
    reference: ""
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
    factual: 3
  });

  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSampleSelect = (sample: any) => {
    setFormData(prev => ({
      ...prev,
      question: sample.question,
      answer: sample.answer,
      model: sample.model || ""
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = selectedMetrics.reduce((acc, metric) => {
        acc[metric] = {
          score: Math.random() * 0.4 + 0.6, // Score between 0.6-1.0
          details: `Calculated ${metric} score based on input analysis`
        };
        return acc;
      }, {} as any);

      const overallScore = (
        Object.values(mockResults).reduce((sum: number, metric: any) => sum + metric.score, 0) / Object.keys(mockResults).length +
        Object.values(qualityRatings).reduce((sum: number, rating: number) => sum + rating, 0) / (Object.keys(qualityRatings).length * 5)
      ) / 2;

      setResults({
        metrics: mockResults,
        quality: qualityRatings,
        overall: overallScore,
        metadata: {
          model: formData.model || formData.customModel,
          timestamp: new Date().toISOString(),
          inputLength: formData.question.length,
          outputLength: formData.answer.length
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
      input: formData,
      ...results,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluation-results.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Results exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Sample Data Library */}
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
                  disabled={!formData.question.trim()}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                id="question"
                placeholder="Enter the question or prompt..."
                className="min-h-[120px]"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="answer">Model Response</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formData.answer)}
                  disabled={!formData.answer.trim()}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                id="answer"
                placeholder="Enter the model's response..."
                className="min-h-[120px]"
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

              {formData.model === "Custom Model" && (
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Answer (Optional)</Label>
              <Textarea
                id="reference"
                placeholder="Enter reference answer for comparison metrics..."
                className="min-h-[80px]"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuration Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {AUTOMATED_METRICS.map(metric => (
                  <div key={metric.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => handleMetricToggle(metric.id)}
                    />
                    <div className="space-y-1 flex-1">
                      <Label htmlFor={metric.id} className="text-sm font-medium">
                        {metric.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {metric.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <QualityRatings 
            ratings={qualityRatings}
            onRatingsChange={setQualityRatings}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={calculateMetrics}
          disabled={isCalculating || !formData.question.trim() || !formData.answer.trim()}
          size="lg"
          className="flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          {isCalculating ? "Calculating..." : "Evaluate Response"}
        </Button>

        <Button 
          variant="outline"
          onClick={exportResults}
          disabled={!results}
          size="lg"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Results
        </Button>
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