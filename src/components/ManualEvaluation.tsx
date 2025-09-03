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
import { Calculator, Download, Lightbulb, Copy } from "@phosphor-icons/react";
import { toast } from "sonner";
import MetricResults from "./MetricResults";
import QualityRatings from "./QualityRatings";
import SampleDataLibrary from "./SampleDataLibrary";

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

const SAMPLE_DATA = {
  coding: {
    question: "Write a Python function to find the longest common subsequence (LCS) between two strings using dynamic programming.",
    answer: "Here's a Python implementation of the LCS algorithm using dynamic programming:\n\n```python\ndef longest_common_subsequence(str1, str2):\n    m, n = len(str1), len(str2)\n    \n    # Create a 2D DP table\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    # Fill the DP table\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if str1[i-1] == str2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    \n    # Reconstruct the LCS\n    lcs = []\n    i, j = m, n\n    while i > 0 and j > 0:\n        if str1[i-1] == str2[j-1]:\n            lcs.append(str1[i-1])\n            i -= 1\n            j -= 1\n        elif dp[i-1][j] > dp[i][j-1]:\n            i -= 1\n        else:\n            j -= 1\n    \n    return ''.join(reversed(lcs))\n\n# Example usage\nresult = longest_common_subsequence('ABCDGH', 'AEDFHR')\nprint(result)  # Output: 'ADH'\n```\n\nTime complexity: O(m*n), Space complexity: O(m*n)",
    reference: "def lcs(str1, str2):\n    m, n = len(str1), len(str2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if str1[i-1] == str2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    \n    return dp[m][n]"
  },
  creative: {
    question: "Write a science fiction short story about a world where memories can be traded as currency.",
    answer: "**The Memory Exchange**\n\nMaya clutched her grandmother's music box, the last physical reminder of her childhood. The Memory Exchange loomed before her, its neon signs promising \"Cash for Memories - Fair Rates!\"\n\nInside, traders appraised memories like precious gems. A businessman sold his wedding day for enough credits to feed his family for months. A teenager traded her first kiss to afford college tuition.\n\n\"What do you have?\" asked the trader, neural scanner already humming.\n\n\"My grandmother teaching me to bake cookies,\" Maya whispered. \"Worth 500 credits according to your database.\"\n\nThe trader's eyes lit up. \"Childhood memories with emotional attachment? We can go 800.\"\n\nMaya hesitated. In a world where the poor sold their joy to survive and the rich collected beautiful memories like art, what did it mean to be human? She thought of her hungry daughter waiting at home.\n\n\"Make it 1000,\" she said, \"and you have a deal.\"\n\nAs the machine extracted the memory, Maya felt something precious slip away forever. But her daughter would eat tonight. In the Memory Exchange, love always had a price.",
    reference: ""
  },
  analysis: {
    question: "Analyze the impact of social media on modern democracy and political discourse.",
    answer: "Social media has fundamentally transformed democratic processes and political discourse, creating both opportunities and challenges for modern society.\n\n**Positive Impacts:**\n\n1. **Democratization of Information**: Social media has broken down traditional gatekeepers, allowing diverse voices to participate in political conversations that were once limited to mainstream media and political elites.\n\n2. **Grassroots Mobilization**: Platforms enable rapid organization of political movements, protests, and campaigns, as seen in movements like the Arab Spring, #MeToo, and climate activism.\n\n3. **Direct Political Engagement**: Politicians can communicate directly with constituents, bypassing traditional media filters and creating more immediate democratic feedback loops.\n\n4. **Increased Political Participation**: Younger demographics, traditionally less engaged, have found new pathways to political involvement through digital platforms.\n\n**Negative Impacts:**\n\n1. **Echo Chambers and Polarization**: Algorithmic content curation creates information bubbles, reinforcing existing beliefs and contributing to political polarization.\n\n2. **Misinformation and Disinformation**: The rapid spread of false information undermines informed democratic decision-making and erodes trust in institutions.\n\n3. **Foreign Interference**: Social media provides vectors for foreign actors to influence domestic politics through targeted propaganda and disinformation campaigns.\n\n4. **Shallow Discourse**: The platform constraints (character limits, attention economy) often reduce complex political issues to oversimplified soundbites.\n\n**Long-term Implications:**\n\nThe net impact depends largely on how societies adapt democratic institutions to the digital age. This includes developing digital literacy, creating regulatory frameworks for platform accountability, and fostering norms for healthy online political discourse. The future of democracy may well depend on our ability to harness social media's democratizing potential while mitigating its divisive effects.",
    reference: ""
  }
};

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

  const loadSampleData = (type: keyof typeof SAMPLE_DATA) => {
    const sample = SAMPLE_DATA[type];
    setFormData(prev => ({
      ...prev,
      question: sample.question,
      answer: sample.answer,
      referenceAnswer: sample.reference,
      model: "GPT-4"
    }));
    toast.success(`Loaded ${type} sample data`);
  };

  const loadSampleFromLibrary = (sample: { question: string; answer: string; reference?: string }) => {
    setFormData(prev => ({
      ...prev,
      question: sample.question,
      answer: sample.answer,
      referenceAnswer: sample.reference || "",
      model: "GPT-4"
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
      {/* Extended Sample Data Library */}
      <SampleDataLibrary onLoadSample={loadSampleFromLibrary} />

      {/* Quick Sample Data Section */}
      <Card className="bg-accent/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent-foreground" />
            Quick Sample Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Quick load basic sample question-answer pairs for immediate testing
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadSampleData('coding')}
                className="flex items-center gap-2 justify-start"
              >
                <Badge variant="secondary">Code</Badge>
                LCS Algorithm (Advanced)
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadSampleData('creative')}
                className="flex items-center gap-2 justify-start"
              >
                <Badge variant="secondary">Creative</Badge>
                Memory Trading Story
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadSampleData('analysis')}
                className="flex items-center gap-2 justify-start"
              >
                <Badge variant="secondary">Analysis</Badge>
                Social Media Democracy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    className="h-auto p-1"
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
                    className="h-auto p-1"
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