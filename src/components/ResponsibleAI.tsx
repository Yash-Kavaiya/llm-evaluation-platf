import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Warning, CheckCircle, AlertTriangle } from "@phosphor-icons/react";
import { toast } from "sonner";

interface BiasResult {
  category: string;
  score: number;
  severity: "low" | "medium" | "high";
  examples?: string[];
}

interface ToxicityResult {
  overall: number;
  categories: {
    threat: number;
    insult: number;
    profanity: number;
    hate: number;
    harassment: number;
  };
}

interface FairnessResult {
  demographic_parity: number;
  equalized_odds: number;
  treatment_equality: number;
  counterfactual_fairness: number;
}

export default function ResponsibleAI() {
  const [inputText, setInputText] = useState("");
  const [model, setModel] = useState("");
  const [selectedChecks, setSelectedChecks] = useState<string[]>([
    "bias", "toxicity", "fairness", "privacy", "transparency"
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    bias?: BiasResult[];
    toxicity?: ToxicityResult;
    fairness?: FairnessResult;
    privacy?: { score: number; issues: string[] };
    transparency?: { score: number; explainability: string };
  }>({});

  const aiChecks = [
    { id: "bias", label: "Bias Detection", description: "Detect gender, racial, and cultural biases" },
    { id: "toxicity", label: "Toxicity Analysis", description: "Identify harmful or toxic content" },
    { id: "fairness", label: "Fairness Assessment", description: "Evaluate demographic fairness" },
    { id: "privacy", label: "Privacy Protection", description: "Check for PII and privacy risks" },
    { id: "transparency", label: "Transparency Score", description: "Assess explainability and reasoning" },
  ];

  const mockAnalyze = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults: any = {};
    
    if (selectedChecks.includes("bias")) {
      mockResults.bias = [
        { category: "Gender Bias", score: 0.15, severity: "low" as const },
        { category: "Racial Bias", score: 0.05, severity: "low" as const },
        { category: "Age Bias", score: 0.25, severity: "medium" as const },
      ];
    }
    
    if (selectedChecks.includes("toxicity")) {
      mockResults.toxicity = {
        overall: 0.08,
        categories: {
          threat: 0.02,
          insult: 0.05,
          profanity: 0.01,
          hate: 0.03,
          harassment: 0.04,
        }
      };
    }
    
    if (selectedChecks.includes("fairness")) {
      mockResults.fairness = {
        demographic_parity: 0.85,
        equalized_odds: 0.78,
        treatment_equality: 0.82,
        counterfactual_fairness: 0.88,
      };
    }
    
    if (selectedChecks.includes("privacy")) {
      mockResults.privacy = {
        score: 0.92,
        issues: ["Potential email address detected", "Phone number pattern found"]
      };
    }
    
    if (selectedChecks.includes("transparency")) {
      mockResults.transparency = {
        score: 0.75,
        explainability: "The model provides clear reasoning with step-by-step explanations."
      };
    }
    
    setResults(mockResults);
    setIsAnalyzing(false);
    toast.success("Responsible AI analysis completed");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low": return <CheckCircle className="w-4 h-4" />;
      case "medium": return <Warning className="w-4 h-4" />;
      case "high": return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Input Configuration
            </CardTitle>
            <CardDescription>
              Configure your AI model output for responsible AI assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-select">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="llama-2">Llama 2</SelectItem>
                  <SelectItem value="custom">Custom Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="input-text">Model Output Text</Label>
              <Textarea
                id="input-text"
                placeholder="Paste the AI model's response here for responsible AI analysis..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-32"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Configuration</CardTitle>
            <CardDescription>
              Select the responsible AI checks to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {aiChecks.map((check) => (
                <div key={check.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={check.id}
                    checked={selectedChecks.includes(check.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedChecks([...selectedChecks, check.id]);
                      } else {
                        setSelectedChecks(selectedChecks.filter(c => c !== check.id));
                      }
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={check.id} className="font-medium">
                      {check.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {check.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={mockAnalyze} 
              disabled={!inputText.trim() || selectedChecks.length === 0 || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? "Analyzing..." : "Run Responsible AI Assessment"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Results</CardTitle>
            <CardDescription>
              Comprehensive responsible AI analysis results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
                <TabsTrigger value="toxicity">Toxicity Detection</TabsTrigger>
                <TabsTrigger value="fairness">Fairness Metrics</TabsTrigger>
                <TabsTrigger value="privacy">Privacy Assessment</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.bias && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Bias Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {((1 - Math.max(...results.bias.map(b => b.score))) * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Lower is better</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {results.toxicity && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Toxicity Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {((1 - results.toxicity.overall) * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Safety rating</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {results.fairness && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Fairness Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(Object.values(results.fairness).reduce((a, b) => a + b, 0) / 4 * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Demographic fairness</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bias" className="space-y-4">
                {results.bias && (
                  <div className="space-y-3">
                    {results.bias.map((bias, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(bias.severity)}
                          <div>
                            <p className="font-medium">{bias.category}</p>
                            <p className="text-sm text-muted-foreground">
                              Risk Score: {(bias.score * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <Badge variant={bias.severity === "low" ? "default" : bias.severity === "medium" ? "secondary" : "destructive"}>
                          {bias.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="toxicity" className="space-y-4">
                {results.toxicity && (
                  <div className="space-y-4">
                    <div>
                      <Label>Overall Toxicity</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={(1 - results.toxicity.overall) * 100} className="flex-1" />
                        <span className="text-sm font-medium">
                          {((1 - results.toxicity.overall) * 100).toFixed(1)}% Safe
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid gap-3 md:grid-cols-2">
                      {Object.entries(results.toxicity.categories).map(([category, score]) => (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{category}</span>
                            <span>{((1 - score) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(1 - score) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="fairness" className="space-y-4">
                {results.fairness && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(results.fairness).map(([metric, score]) => (
                      <div key={metric} className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="capitalize">{metric.replace('_', ' ')}</Label>
                          <span className="text-sm font-medium">{(score * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={score * 100} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                {results.privacy && (
                  <div className="space-y-4">
                    <div>
                      <Label>Privacy Protection Score</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={results.privacy.score * 100} className="flex-1" />
                        <span className="text-sm font-medium">
                          {(results.privacy.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    {results.privacy.issues.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Privacy Issues Detected:</strong>
                          <ul className="mt-2 space-y-1">
                            {results.privacy.issues.map((issue, index) => (
                              <li key={index} className="text-sm">• {issue}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}