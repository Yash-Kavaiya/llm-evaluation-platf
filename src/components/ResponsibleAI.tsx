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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Warning, CheckCircle, AlertTriangle, Eye, Lock, Scales, Users, Brain, Leaf } from "@phosphor-icons/react";
import { toast } from "sonner";

// Comprehensive Responsible AI Metrics Interfaces
interface ResponsibilityMetrics {
  raiOversight: {
    rolesResponsibilities: number;
    aiGovernanceCommittee: number;
    organizationalRiskTolerance: number;
  };
  raiCompetence: {
    raiTraining: number;
    raiCapabilityAssessment: number;
  };
}

interface AuditabilityMetrics {
  systematicOversight: {
    dataProvenance: number;
    modelProvenance: number;
    systemProvenanceLogging: number;
  };
  complianceChecking: {
    auditingScore: number;
  };
}

interface RedressabilityMetrics {
  redressByDesign: {
    incidentReportingResponse: number;
    builtInRedundancy: number;
  };
}

interface FairnessMetrics {
  biasDetection: {
    demographicParity: number;
    equalizedOdds: number;
    individualFairness: number;
    counterfactualFairness: number;
  };
  groupFairness: {
    representationFairness: number;
    qualityOfServiceFairness: number;
  };
}

interface SafetyMetrics {
  contentSafety: {
    toxicityDetection: number;
    hallucinationDetection: number;
  };
  robustness: {
    adversarialRobustness: number;
    distributionShiftResilience: number;
  };
}

interface TransparencyMetrics {
  modelInterpretability: {
    featureImportance: number;
    decisionBoundaryClarity: number;
  };
  systemTransparency: {
    documentationCompleteness: number;
    stakeholderCommunication: number;
  };
}

interface PerformanceMetrics {
  taskPerformance: {
    answerRelevancy: number;
    correctness: number;
    taskCompletionRate: number;
  };
  systemReliability: {
    availabilityMetrics: number;
    consistencyMetrics: number;
  };
}

interface PrivacyMetrics {
  piiProtection: {
    piiDetectionRate: number;
    dataMinimization: number;
  };
  privacyPreservation: {
    differentialPrivacy: number;
    dataAnonymizationQuality: number;
  };
}

interface EnvironmentalMetrics {
  environmentalImpact: {
    carbonFootprint: number;
    resourceUtilization: number;
  };
  sustainability: {
    modelEfficiency: number;
  };
}

interface HumanAIMetrics {
  userExperience: {
    userTrust: number;
    userUnderstanding: number;
  };
  humanOversight: {
    humanInLoopEffectiveness: number;
    meaningfulHumanControl: number;
  };
}

interface ComprehensiveRAIResults {
  responsibility?: ResponsibilityMetrics;
  auditability?: AuditabilityMetrics;
  redressability?: RedressabilityMetrics;
  fairness?: FairnessMetrics;
  safety?: SafetyMetrics;
  transparency?: TransparencyMetrics;
  performance?: PerformanceMetrics;
  privacy?: PrivacyMetrics;
  environmental?: EnvironmentalMetrics;
  humanAI?: HumanAIMetrics;
}

export default function ResponsibleAI() {
  const [inputText, setInputText] = useState("");
  const [model, setModel] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "responsibility", "fairness", "safety", "transparency", "privacy"
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ComprehensiveRAIResults>({});

  const metricCategories = [
    {
      id: "responsibility",
      label: "Responsibility Metrics",
      icon: <Shield className="w-4 h-4" />,
      description: "RAI oversight, governance, and competence assessment",
      color: "bg-blue-500"
    },
    {
      id: "auditability", 
      label: "Auditability Metrics",
      icon: <Eye className="w-4 h-4" />,
      description: "Systematic oversight, provenance tracking, and compliance",
      color: "bg-purple-500"
    },
    {
      id: "redressability",
      label: "Redressability Metrics", 
      icon: <CheckCircle className="w-4 h-4" />,
      description: "Incident response and built-in redundancy systems",
      color: "bg-green-500"
    },
    {
      id: "fairness",
      label: "Fairness & Bias Metrics",
      icon: <Scales className="w-4 h-4" />,
      description: "Bias detection, demographic parity, and group fairness",
      color: "bg-orange-500"
    },
    {
      id: "safety",
      label: "Safety & Security Metrics",
      icon: <Shield className="w-4 h-4" />,
      description: "Content safety, toxicity detection, and robustness",
      color: "bg-red-500"
    },
    {
      id: "transparency",
      label: "Transparency & Explainability",
      icon: <Brain className="w-4 h-4" />,
      description: "Model interpretability and system transparency",
      color: "bg-cyan-500"
    },
    {
      id: "performance",
      label: "Performance & Reliability",
      icon: <CheckCircle className="w-4 h-4" />,
      description: "Task performance and system reliability metrics",
      color: "bg-emerald-500"
    },
    {
      id: "privacy",
      label: "Privacy & Data Protection",
      icon: <Lock className="w-4 h-4" />,
      description: "PII protection and privacy preservation",
      color: "bg-indigo-500"
    },
    {
      id: "environmental",
      label: "Environmental & Resource",
      icon: <Leaf className="w-4 h-4" />,
      description: "Carbon footprint and resource utilization",
      color: "bg-teal-500"
    },
    {
      id: "humanAI",
      label: "Human-AI Interaction",
      icon: <Users className="w-4 h-4" />,
      description: "User experience and human oversight metrics",
      color: "bg-pink-500"
    }
  ];

  const mockAnalyze = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockResults: ComprehensiveRAIResults = {};
    
    if (selectedCategories.includes("responsibility")) {
      mockResults.responsibility = {
        raiOversight: {
          rolesResponsibilities: 0.85,
          aiGovernanceCommittee: 0.78,
          organizationalRiskTolerance: 0.82
        },
        raiCompetence: {
          raiTraining: 0.88,
          raiCapabilityAssessment: 0.75
        }
      };
    }

    if (selectedCategories.includes("auditability")) {
      mockResults.auditability = {
        systematicOversight: {
          dataProvenance: 0.92,
          modelProvenance: 0.87,
          systemProvenanceLogging: 0.83
        },
        complianceChecking: {
          auditingScore: 0.79
        }
      };
    }

    if (selectedCategories.includes("redressability")) {
      mockResults.redressability = {
        redressByDesign: {
          incidentReportingResponse: 0.86,
          builtInRedundancy: 0.74
        }
      };
    }
    
    if (selectedCategories.includes("fairness")) {
      mockResults.fairness = {
        biasDetection: {
          demographicParity: 0.85,
          equalizedOdds: 0.78,
          individualFairness: 0.82,
          counterfactualFairness: 0.88
        },
        groupFairness: {
          representationFairness: 0.83,
          qualityOfServiceFairness: 0.79
        }
      };
    }

    if (selectedCategories.includes("safety")) {
      mockResults.safety = {
        contentSafety: {
          toxicityDetection: 0.94,
          hallucinationDetection: 0.87
        },
        robustness: {
          adversarialRobustness: 0.76,
          distributionShiftResilience: 0.81
        }
      };
    }

    if (selectedCategories.includes("transparency")) {
      mockResults.transparency = {
        modelInterpretability: {
          featureImportance: 0.73,
          decisionBoundaryClarity: 0.68
        },
        systemTransparency: {
          documentationCompleteness: 0.89,
          stakeholderCommunication: 0.84
        }
      };
    }

    if (selectedCategories.includes("performance")) {
      mockResults.performance = {
        taskPerformance: {
          answerRelevancy: 0.91,
          correctness: 0.88,
          taskCompletionRate: 0.85
        },
        systemReliability: {
          availabilityMetrics: 0.97,
          consistencyMetrics: 0.89
        }
      };
    }

    if (selectedCategories.includes("privacy")) {
      mockResults.privacy = {
        piiProtection: {
          piiDetectionRate: 0.95,
          dataMinimization: 0.82
        },
        privacyPreservation: {
          differentialPrivacy: 0.77,
          dataAnonymizationQuality: 0.86
        }
      };
    }

    if (selectedCategories.includes("environmental")) {
      mockResults.environmental = {
        environmentalImpact: {
          carbonFootprint: 0.72,
          resourceUtilization: 0.78
        },
        sustainability: {
          modelEfficiency: 0.81
        }
      };
    }

    if (selectedCategories.includes("humanAI")) {
      mockResults.humanAI = {
        userExperience: {
          userTrust: 0.84,
          userUnderstanding: 0.79
        },
        humanOversight: {
          humanInLoopEffectiveness: 0.87,
          meaningfulHumanControl: 0.82
        }
      };
    }
    
    setResults(mockResults);
    setIsAnalyzing(false);
    toast.success("Comprehensive Responsible AI analysis completed");
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) return "default";
    if (score >= 0.6) return "secondary";
    return "destructive";
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
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  <strong>Sample:</strong> "When evaluating job candidates, I prioritize cultural fit and communication skills..."
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputText("When evaluating job candidates, I prioritize cultural fit and communication skills. Candidates who can relate to our team's background tend to work better with us. We've found that people from certain universities and neighborhoods often make better employees. Additionally, our ideal candidate should be energetic and able to work long hours, which typically suits younger professionals better.")}
                >
                  Load Sample
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metric Categories Selection</CardTitle>
            <CardDescription>
              Select the responsible AI metric categories to evaluate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {metricCategories.map((category) => (
                <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, category.id]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(c => c !== category.id));
                      }
                    }}
                  />
                  <div className="grid gap-1.5 leading-none flex-1">
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <Label htmlFor={category.id} className="font-medium text-sm">
                        {category.label}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={mockAnalyze} 
              disabled={!inputText.trim() || selectedCategories.length === 0 || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? "Analyzing..." : "Run Comprehensive RAI Assessment"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive RAI Assessment Results</CardTitle>
            <CardDescription>
              Detailed analysis across all responsible AI dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
                <TabsTrigger value="ethics">Ethics</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Overall Score Cards */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                  {Object.entries(results).map(([category, metrics]) => {
                    const categoryData = metricCategories.find(c => c.id === category);
                    if (!categoryData) return null;
                    
                    // Calculate average score for the category
                    const flatScores: number[] = [];
                    Object.values(metrics).forEach(subCategory => {
                      Object.values(subCategory).forEach(score => {
                        if (typeof score === 'number') flatScores.push(score);
                      });
                    });
                    const avgScore = flatScores.reduce((a, b) => a + b, 0) / flatScores.length;
                    
                    return (
                      <Card key={category} className="text-center">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-center gap-2">
                            {categoryData.icon}
                            <CardTitle className="text-sm">{categoryData.label}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                            {(avgScore * 100).toFixed(0)}%
                          </div>
                          <Badge variant={getScoreBadge(avgScore)} className="mt-1">
                            {avgScore >= 0.8 ? "Excellent" : avgScore >= 0.6 ? "Good" : "Needs Improvement"}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Overall Risk Assessment */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Overall Risk Assessment:</strong> Based on the comprehensive evaluation, 
                    your AI system shows strong performance across most responsible AI dimensions. 
                    Focus areas for improvement include transparency and environmental impact metrics.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="governance" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {results.responsibility && (
                    <AccordionItem value="responsibility">
                      <AccordionTrigger className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Responsibility Metrics
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">RAI Oversight</h4>
                            {Object.entries(results.responsibility.raiOversight).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">RAI Competence</h4>
                            {Object.entries(results.responsibility.raiCompetence).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {results.auditability && (
                    <AccordionItem value="auditability">
                      <AccordionTrigger className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Auditability Metrics
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Systematic Oversight</h4>
                            {Object.entries(results.auditability.systematicOversight).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Compliance Checking</h4>
                            {Object.entries(results.auditability.complianceChecking).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </TabsContent>

              <TabsContent value="ethics" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {results.fairness && (
                    <AccordionItem value="fairness">
                      <AccordionTrigger className="flex items-center gap-2">
                        <Scales className="w-4 h-4" />
                        Fairness & Bias Metrics
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Bias Detection</h4>
                            {Object.entries(results.fairness.biasDetection).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Group Fairness</h4>
                            {Object.entries(results.fairness.groupFairness).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {results.privacy && (
                    <AccordionItem value="privacy">
                      <AccordionTrigger className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Privacy & Data Protection
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">PII Protection</h4>
                            {Object.entries(results.privacy.piiProtection).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Privacy Preservation</h4>
                            {Object.entries(results.privacy.privacyPreservation).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {results.safety && (
                    <AccordionItem value="safety">
                      <AccordionTrigger className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Safety & Security Metrics
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Content Safety</h4>
                            {Object.entries(results.safety.contentSafety).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Robustness</h4>
                            {Object.entries(results.safety.robustness).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {results.performance && (
                    <AccordionItem value="performance">
                      <AccordionTrigger className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Performance & Reliability
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Task Performance</h4>
                            {Object.entries(results.performance.taskPerformance).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">System Reliability</h4>
                            {Object.entries(results.performance.systemReliability).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </TabsContent>

              <TabsContent value="impact" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {results.environmental && (
                    <AccordionItem value="environmental">
                      <AccordionTrigger className="flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Environmental & Resource Metrics
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Environmental Impact</h4>
                            {Object.entries(results.environmental.environmentalImpact).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Sustainability</h4>
                            {Object.entries(results.environmental.sustainability).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {results.humanAI && (
                    <AccordionItem value="humanai">
                      <AccordionTrigger className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Human-AI Interaction Metrics
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">User Experience</h4>
                            {Object.entries(results.humanAI.userExperience).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Human Oversight</h4>
                            {Object.entries(results.humanAI.humanOversight).map(([metric, score]) => (
                              <div key={metric} className="flex justify-between items-center mb-2">
                                <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={score * 100} className="w-20" />
                                  <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}