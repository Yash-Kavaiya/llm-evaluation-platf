import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  Plus, 
  Trash, 
  Copy, 
  FloppyDisk, 
  FolderOpen, 
  TestTube,
  MathOperations,
  Function as FunctionIcon,
  Brackets,
  Info,
  Lightbulb
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";

interface CustomMetric {
  id: string;
  name: string;
  description: string;
  formula: string;
  category: string;
  variables: string[];
  outputRange: [number, number];
  higherIsBetter: boolean;
  created: string;
  lastModified: string;
}

interface FormulaValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const FORMULA_FUNCTIONS = [
  { name: "sqrt", description: "Square root", example: "sqrt(x)" },
  { name: "pow", description: "Power function", example: "pow(x, 2)" },
  { name: "log", description: "Natural logarithm", example: "log(x)" },
  { name: "log10", description: "Base 10 logarithm", example: "log10(x)" },
  { name: "exp", description: "Exponential function", example: "exp(x)" },
  { name: "abs", description: "Absolute value", example: "abs(x)" },
  { name: "min", description: "Minimum value", example: "min(x, y, z)" },
  { name: "max", description: "Maximum value", example: "max(x, y, z)" },
  { name: "avg", description: "Average value", example: "avg(x, y, z)" },
  { name: "sin", description: "Sine function", example: "sin(x)" },
  { name: "cos", description: "Cosine function", example: "cos(x)" },
  { name: "tan", description: "Tangent function", example: "tan(x)" },
  { name: "round", description: "Round to nearest integer", example: "round(x)" },
  { name: "floor", description: "Round down", example: "floor(x)" },
  { name: "ceil", description: "Round up", example: "ceil(x)" },
  { name: "sigmoid", description: "Sigmoid function", example: "sigmoid(x)" },
  { name: "normalize", description: "Normalize to 0-1 range", example: "normalize(x, min, max)" }
];

const AVAILABLE_VARIABLES = [
  { name: "answer_length", description: "Character count of model response", type: "numeric" },
  { name: "token_count", description: "Approximate token count", type: "numeric" },
  { name: "sentence_count", description: "Number of sentences", type: "numeric" },
  { name: "word_count", description: "Number of words", type: "numeric" },
  { name: "paragraph_count", description: "Number of paragraphs", type: "numeric" },
  { name: "bleu_score", description: "BLEU similarity score", type: "numeric" },
  { name: "rouge1", description: "ROUGE-1 score", type: "numeric" },
  { name: "rouge2", description: "ROUGE-2 score", type: "numeric" },
  { name: "coherence", description: "Coherence score", type: "numeric" },
  { name: "fluency", description: "Fluency score", type: "numeric" },
  { name: "relevance", description: "Relevance score", type: "numeric" },
  { name: "semantic_similarity", description: "Semantic similarity score", type: "numeric" },
  { name: "accuracy_rating", description: "Manual accuracy rating (1-5)", type: "numeric" },
  { name: "completeness_rating", description: "Manual completeness rating (1-5)", type: "numeric" },
  { name: "clarity_rating", description: "Manual clarity rating (1-5)", type: "numeric" },
  { name: "creativity_rating", description: "Manual creativity rating (1-5)", type: "numeric" },
  { name: "helpfulness_rating", description: "Manual helpfulness rating (1-5)", type: "numeric" },
  { name: "safety_rating", description: "Manual safety rating (1-5)", type: "numeric" }
];

const METRIC_CATEGORIES = [
  "Quality Assessment",
  "Linguistic Analysis", 
  "Content Evaluation",
  "Performance Metrics",
  "Domain-Specific",
  "Composite Scores",
  "Custom"
];

const SAMPLE_FORMULAS = [
  {
    name: "Weighted Quality Score",
    formula: "avg(accuracy_rating * 0.3, completeness_rating * 0.25, clarity_rating * 0.25, helpfulness_rating * 0.2)",
    description: "Combines manual ratings with custom weights",
    category: "Composite Scores"
  },
  {
    name: "Efficiency Score", 
    formula: "min(1, relevance / (token_count / 100))",
    description: "Relevance per token efficiency",
    category: "Performance Metrics"
  },
  {
    name: "Comprehensive Score",
    formula: "sqrt((coherence * fluency * relevance) / 3) * sigmoid(clarity_rating - 2.5)",
    description: "Geometric mean of automated metrics weighted by clarity",
    category: "Composite Scores"
  },
  {
    name: "Conciseness Index",
    formula: "relevance * (1 - min(0.5, (word_count - 50) / 200))",
    description: "Penalizes overly long responses while maintaining relevance",
    category: "Content Evaluation"
  }
];

export default function CustomMetricBuilder() {
  const [customMetrics, setCustomMetrics] = useKV<CustomMetric[]>("custom-metrics", []);
  const [currentMetric, setCurrentMetric] = useState<Partial<CustomMetric>>({
    name: "",
    description: "",
    formula: "",
    category: "Custom",
    variables: [],
    outputRange: [0, 1],
    higherIsBetter: true
  });
  
  const [validation, setValidation] = useState<FormulaValidation>({
    isValid: false,
    errors: [],
    warnings: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [testValues, setTestValues] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<number | null>(null);

  // Validate formula whenever it changes
  useEffect(() => {
    if (currentMetric.formula) {
      validateFormula(currentMetric.formula);
    } else {
      setValidation({ isValid: false, errors: [], warnings: [] });
    }
  }, [currentMetric.formula]);

  const validateFormula = (formula: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for basic syntax
    const brackets = formula.split('(').length - formula.split(')').length;
    if (brackets !== 0) {
      errors.push("Mismatched parentheses");
    }

    // Check for valid variables
    const variablePattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    const foundVariables = formula.match(variablePattern) || [];
    const validVariables = AVAILABLE_VARIABLES.map(v => v.name);
    const validFunctions = FORMULA_FUNCTIONS.map(f => f.name);
    
    const unknownVariables = foundVariables.filter(v => 
      !validVariables.includes(v) && 
      !validFunctions.includes(v) &&
      !['e', 'pi'].includes(v)
    );

    if (unknownVariables.length > 0) {
      errors.push(`Unknown variables/functions: ${unknownVariables.join(', ')}`);
    }

    // Check for division by zero risks
    if (formula.includes('/') && !formula.includes('max(')) {
      warnings.push("Consider using max() in denominators to prevent division by zero");
    }

    // Check for potential unbounded results
    if (formula.includes('log(') && !formula.includes('max(')) {
      warnings.push("Log functions may produce negative infinity - consider bounds checking");
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('formula') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentFormula = currentMetric.formula || "";
      const newFormula = currentFormula.substring(0, start) + variable + currentFormula.substring(end);
      
      setCurrentMetric(prev => ({ ...prev, formula: newFormula }));
      
      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const insertFunction = (functionName: string) => {
    insertVariable(`${functionName}()`);
  };

  const loadSampleFormula = (sample: typeof SAMPLE_FORMULAS[0]) => {
    setCurrentMetric(prev => ({
      ...prev,
      name: sample.name,
      formula: sample.formula,
      description: sample.description,
      category: sample.category
    }));
    toast.success(`Loaded sample: ${sample.name}`);
  };

  const testFormula = () => {
    if (!validation.isValid || !currentMetric.formula) {
      toast.error("Please fix formula errors before testing");
      return;
    }

    try {
      // Create a safe evaluation context
      const context = { ...testValues };
      
      // Add mathematical functions
      const mathFunctions = {
        sqrt: Math.sqrt,
        pow: Math.pow,
        log: Math.log,
        log10: Math.log10,
        exp: Math.exp,
        abs: Math.abs,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        round: Math.round,
        floor: Math.floor,
        ceil: Math.ceil,
        min: Math.min,
        max: Math.max,
        avg: (...args: number[]) => args.reduce((a, b) => a + b, 0) / args.length,
        sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
        normalize: (x: number, min: number, max: number) => (x - min) / (max - min),
        e: Math.E,
        pi: Math.PI
      };

      // Simple expression evaluator (in production, use a proper math parser)
      const evaluateExpression = (expr: string, vars: Record<string, any>): number => {
        // This is a simplified evaluator - in production, use a proper math expression parser
        let expression = expr;
        
        // Replace variables
        Object.entries(vars).forEach(([key, value]) => {
          expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
        });

        // Replace functions (simplified)
        Object.entries(mathFunctions).forEach(([key, fn]) => {
          if (expression.includes(key + '(')) {
            // This is simplified - use a proper parser in production
            expression = expression.replace(
              new RegExp(`${key}\\(([^)]+)\\)`, 'g'), 
              (match, args) => {
                const argValues = args.split(',').map((arg: string) => parseFloat(arg.trim()));
                return (fn as any)(...argValues).toString();
              }
            );
          }
        });

        // Evaluate the expression (simplified - use proper parser in production)
        try {
          return Function(`"use strict"; return (${expression})`)();
        } catch (e) {
          throw new Error("Invalid expression");
        }
      };

      const result = evaluateExpression(currentMetric.formula, context);
      setTestResult(result);
      toast.success(`Test result: ${result.toFixed(4)}`);
    } catch (error) {
      toast.error("Error evaluating formula");
      setTestResult(null);
    }
  };

  const saveMetric = () => {
    if (!currentMetric.name?.trim()) {
      toast.error("Please provide a metric name");
      return;
    }

    if (!validation.isValid) {
      toast.error("Please fix formula errors before saving");
      return;
    }

    const now = new Date().toISOString();
    const metric: CustomMetric = {
      id: isEditing ? currentMetric.id! : `custom_${Date.now()}`,
      name: currentMetric.name,
      description: currentMetric.description || "",
      formula: currentMetric.formula || "",
      category: currentMetric.category || "Custom",
      variables: currentMetric.variables || [],
      outputRange: currentMetric.outputRange || [0, 1],
      higherIsBetter: currentMetric.higherIsBetter ?? true,
      created: isEditing ? currentMetric.created! : now,
      lastModified: now
    };

    setCustomMetrics(prev => {
      if (isEditing) {
        return prev.map(m => m.id === metric.id ? metric : m);
      } else {
        return [...prev, metric];
      }
    });

    setCurrentMetric({
      name: "",
      description: "",
      formula: "",
      category: "Custom",
      variables: [],
      outputRange: [0, 1],
      higherIsBetter: true
    });
    setIsEditing(false);
    
    toast.success(`Metric ${isEditing ? 'updated' : 'saved'} successfully`);
  };

  const editMetric = (metric: CustomMetric) => {
    setCurrentMetric(metric);
    setIsEditing(true);
  };

  const deleteMetric = (id: string) => {
    setCustomMetrics(prev => prev.filter(m => m.id !== id));
    toast.success("Metric deleted");
  };

  const duplicateMetric = (metric: CustomMetric) => {
    setCurrentMetric({
      ...metric,
      name: `${metric.name} (Copy)`,
      id: undefined,
      created: undefined,
      lastModified: undefined
    });
    setIsEditing(false);
  };

  const clearForm = () => {
    setCurrentMetric({
      name: "",
      description: "",
      formula: "",
      category: "Custom",
      variables: [],
      outputRange: [0, 1],
      higherIsBetter: true
    });
    setIsEditing(false);
    setTestResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Metric Builder</h2>
          <p className="text-muted-foreground">Create domain-specific evaluation metrics with custom formulas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearForm}>
            Clear Form
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Metric Builder */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Metric Definition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metric-name">Metric Name</Label>
                <Input
                  id="metric-name"
                  placeholder="e.g., Domain-Specific Quality Score"
                  value={currentMetric.name || ""}
                  onChange={(e) => setCurrentMetric(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metric-description">Description</Label>
                <Textarea
                  id="metric-description"
                  placeholder="Describe what this metric measures and how it should be interpreted..."
                  value={currentMetric.description || ""}
                  onChange={(e) => setCurrentMetric(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metric-category">Category</Label>
                  <Select 
                    value={currentMetric.category} 
                    onValueChange={(value) => setCurrentMetric(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {METRIC_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Score Direction</Label>
                  <Select 
                    value={currentMetric.higherIsBetter ? "higher" : "lower"} 
                    onValueChange={(value) => setCurrentMetric(prev => ({ ...prev, higherIsBetter: value === "higher" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="higher">Higher is Better</SelectItem>
                      <SelectItem value="lower">Lower is Better</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formula Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MathOperations className="w-5 h-5" />
                Formula Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="formula">Formula</Label>
                <Textarea
                  id="formula"
                  placeholder="Enter your custom formula using available variables and functions..."
                  value={currentMetric.formula || ""}
                  onChange={(e) => setCurrentMetric(prev => ({ ...prev, formula: e.target.value }))}
                  className="min-h-[120px] font-mono text-sm"
                />
                
                {/* Validation Results */}
                {validation.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Errors:</strong>
                      <ul className="mt-1 list-disc list-inside">
                        {validation.errors.map((error, idx) => (
                          <li key={idx} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {validation.warnings.length > 0 && (
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Warnings:</strong>
                      <ul className="mt-1 list-disc list-inside">
                        {validation.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.isValid && currentMetric.formula && (
                  <Alert>
                    <AlertDescription className="text-green-600">
                      ✓ Formula is valid
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Quick Insert Buttons */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Variables</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {AVAILABLE_VARIABLES.slice(0, 8).map(variable => (
                      <Button
                        key={variable.name}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable.name)}
                        className="h-7 text-xs"
                      >
                        {variable.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Functions</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {FORMULA_FUNCTIONS.slice(0, 8).map(func => (
                      <Button
                        key={func.name}
                        variant="outline"
                        size="sm"
                        onClick={() => insertFunction(func.name)}
                        className="h-7 text-xs"
                      >
                        {func.name}()
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Operators</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['+', '-', '*', '/', '(', ')', ','].map(op => (
                      <Button
                        key={op}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(op)}
                        className="h-7 text-xs min-w-[28px]"
                      >
                        {op}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Formula */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Test Formula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_VARIABLES.slice(0, 6).map(variable => (
                  <div key={variable.name} className="space-y-1">
                    <Label className="text-xs">{variable.name}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={testValues[variable.name] || ""}
                      onChange={(e) => setTestValues(prev => ({
                        ...prev,
                        [variable.name]: parseFloat(e.target.value) || 0
                      }))}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={testFormula}
                  disabled={!validation.isValid}
                  size="sm"
                >
                  Test Formula
                </Button>
                
                {testResult !== null && (
                  <Badge variant="secondary" className="text-sm">
                    Result: {testResult.toFixed(4)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={saveMetric} disabled={!validation.isValid} className="flex-1">
              <FloppyDisk className="w-4 h-4 mr-2" />
              {isEditing ? "Update Metric" : "Save Metric"}
            </Button>
          </div>
        </div>

        {/* Reference & Saved Metrics */}
        <div className="space-y-6">
          {/* Sample Formulas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Sample Formulas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SAMPLE_FORMULAS.map((sample, idx) => (
                <div key={idx} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{sample.name}</h4>
                      <p className="text-xs text-muted-foreground">{sample.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadSampleFormula(sample)}
                      className="h-auto p-1"
                    >
                      <FolderOpen className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                    {sample.formula}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Available Variables Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FunctionIcon className="w-5 h-5" />
                Available Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {AVAILABLE_VARIABLES.map(variable => (
                  <div key={variable.name} className="flex items-center justify-between p-2 border rounded text-xs">
                    <div className="flex-1">
                      <code className="font-mono text-primary">{variable.name}</code>
                      <p className="text-muted-foreground mt-0.5">{variable.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertVariable(variable.name)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Custom Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FloppyDisk className="w-5 h-5" />
                Saved Metrics ({customMetrics.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customMetrics.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No custom metrics saved yet
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {customMetrics.map(metric => (
                    <div key={metric.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{metric.name}</h4>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {metric.category}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editMetric(metric)}
                            className="h-6 w-6 p-0"
                          >
                            <FolderOpen className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateMetric(metric)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMetric(metric.id)}
                            className="h-6 w-6 p-0 hover:text-destructive"
                          >
                            <Trash className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                        {metric.formula}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}