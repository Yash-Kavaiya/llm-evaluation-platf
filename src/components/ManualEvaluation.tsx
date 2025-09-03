import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import SampleDataLibrary from "

  { id: "gpt-4", name: "GPT-4" },
  { id: "claude-3", name: "Claude 3" },
  { id: "llama-2", name: "Llama 2" },

const METRICS = 
  { id: "rouge1", label: "ROUGE-1
  { id: "rougel", label: "ROUGE-L", description: 
  { id: "coherence", label: "Coherence"
  { id: "relevance", label: "Relevance", de
  { id: "toxicity", label: "Toxicity 

  

    customModel: 
  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
  ]);
  const [qualityRatings, setQualityRatings] = useState({
    completeness: 3,
    conciseness: 3,
    helpfulness: 3,
    factuality: 3

  const [results, setResults] = useState<any>(null);
  

    }));

    setFormData(p
      question:
      model: s
  };
  const copyToCli
     

    }

    s

    );

    if (!formData.qu
      return;

    
      // Simulate m
        const 
          score: 
     

      // Calculate composite quality score
        sum + rating, 0

        automatic: automaticMetrics,
        qualityBreakdown: 
          mode
          questionLe
        


      toast.error("Failed to calculate metrics"
      setIsCalculating(fal
  };
  const exportResults = () => {
    
      input: formData,
      ex
    

    a.href = url;
    a.cli
  };
  return (
      {/* Sample Da

     
    

            <div>
              <Textarea
                placeholder="E
                onChange={(e) => handleInput
              />
      
    

                Copy
            </div>
            <div>
             
     

              />
    
         
              >
                Copy
            </div>
            <div>
              <Textarea
                placeholder="Enter reference answer for comparison..."
          
              />


                <Select value={formData.mo
                    <SelectValue placeholder="Select a model" />
                  <Sele
                      <SelectItem key={model.id} value={model.id}>

                  </Select
              </div>
              {formData.model 
                  <Label htmlFor="customM
                   
                    value={formData.customModel}
                  />
              )}
          </div>
      </C
      {/

        </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols
              <div ke
                  id={metric.id}
               
                <div className
     
    

                    {metric.des
                </div>
    
        </CardContent>

      <QualityRatingPan
        onRatingChange={setQualityRatings}

    
          onClick={calculateMetrics}
        >
          {isCalculating ? "Calculating...

          <Button 
            on
            <Download classNa
    

      {/* 
        <MetricResults results=
    </div>
}




























































































































































