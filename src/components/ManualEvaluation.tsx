import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator
import { Calculator, Download, Copy } from "@phosphor-icons/react";
import MetricResults from "./MetricResults";
import SampleDataLibrary from "./SampleDataLibrary";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Download, Lightbulb, Copy } from "@phosphor-icons/react";
import { toast } from "sonner";
import MetricResults from "./MetricResults";
import QualityRatings from "./QualityRatings";

const LLM_MODELS = [
  { id: "b
  { id: "rouge2", l
  { id: "perplexit
  { id: "fluency", l
  { id: "semantic",
];

export default f
    question: "
    model: "",
    referenceAnswer

  

    accuracy: 3,
    clarity: 3,
    creativity: 3,
    safety: 3,
  });
  const [results, setResults] = useState<any>(null);


    setFormData(prev => ({
      question: sample.question,
      referenceAnswer: sample.reference || "",
  

    navigator.clipboard.writeText(text);
  };
  const handleMet
    answer: "",
        : [...
  };
  const calculateMetric
  });

    setIsCalculating(true);
      // Simulate metric calculations
  ]);

            score: Math.random() * 0.4 + 0.6, // Random 
          };
        }, {} as Rec
        metadat
    conciseness: 3,
          timestam
    helpfulness: 3,
      setResul
    factualGrounding: 3
    }


  const [isCalculating, setIsCalculating] = useState(false);

  const handleMetricToggle = (metricId: string) => {
      exportDate: new Date().to
      prev.includes(metricId) 
    const url = URL.createObjectURL(blob);
        : [...prev, metricId]
    a.
  };

  const calculateMetrics = async () => {
      {/* Extended Sample Data Library */}
      toast.error("Please provide both question and answer");
      <div cl
     

            <div className=
         
      // Simulate metric calculations
                    size="sm"
      
                    <Copy c
                )}
              <Textarea
                placeholder="Enter the prompt or question given to the model.
                value={formData.question}
          };

              <div className="flex ite
                {formData.answer
        metadata: {
                    onClick={() => copyToClipboard(formData.answer, "Answer")}
                  >
                  </Button>
              </div>
         
      };

      setResults(mockResults);
            <div className="grid sm:grid-cols-2 gap-4">
                <Labe
                  <SelectTrigger>
               
                    {LLM_MODEL
    }
    

                <div className=
                  <Input
    
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


          {/* Quality Ratings */}
          <QualityRatings 
            ratings={qualityRatings}
            onRatingsChange={setQualityRatings}

        </div>
      </div>

      <Separator />


      <div className="flex flex-wrap gap-4 justify-center">

          onClick={calculateMetrics}
          disabled={isCalculating || !formData.question.trim() || !formData.answer.trim()}
          className="flex items-center gap-2"
          size="lg"
        >

          {isCalculating ? "Calculating..." : "Evaluate Response"}
        </Button>


          <Button 
            variant="outline" 
            onClick={exportResults}

            size="lg"
          >
            <Download className="w-4 h-4" />
            Export Results
          </Button>

      </div>

      {/* Results */}

        <MetricResults results={results} />

    </div>

}