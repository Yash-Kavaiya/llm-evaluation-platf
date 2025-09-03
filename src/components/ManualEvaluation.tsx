import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/text
import { Select, SelectContent, SelectItem, SelectTr
import { Card, CardContent, CardHeader, CardTi
import { toast } from "sonner";
import MetricResults from "./MetricResults";

  "GPT-4",
  "Claude-3 Sonnet",
  "Gemini Pro",
  "PaLM 2",
];

  { id: "rouge1", la
  { id: "r
  { id: "fluency",
  { id: "semantic", 
];
export default 
    question: ""
    model: 
    reference: "


    accuracy: 3,
    clarity: 3,
    creativity: 3,
    safety: 3,
  const [results, setResults] = useState<any>(null);
  const handleSampleSelect = (sample: any) => {
      ...prev,
      answer: sample.answer,
    }));

  

  const handleMetricToggle = (metricId: stri
      prev.includes(metricId) 
        : [...pre
  };
  const calcul
      toast.error("P
    }
    s

      
        acc[metric] = {
          details: `Calculated ${metric} score based on 
        return a

        Object.
      ) / 2;
      setResults({
        quality: qu
        metada
     
          outputLength: formData.answer.length

      toast.success("Evaluation completed succe
      toast.error("Failed 
      setIsCal
  };
  const exportResults = () =
      toast.error("No results t
    }
    

    };
    const blob = new Blob([JSON.stringif
    const a = document.createElement('a');
    

    toast.success("Results exported successfully!");

    <div className="space-y-6"
      <SampleDataLibrary onSampleSelect={han
      <div className="grid lg
      
    

              <div className="flex items
                <Button
                  size="sm"
             
     

                id="questio
         
                onChange={
            </div>
      
                <Label htmlFor="answer">Model Response</Label>
                  varia
                  onClick={() => copyToClipboard(formData.answer)}
                >
          
              <Text
                plac

              />

              <div className="space-y-2">
            

                  
                      <Select
                  </SelectConten
              </div>
              {form
                  <Label htmlFor="customModel">Custom Mo
                    id="customModel"
                    value={formData.customModel}
                  />
         


                id="reference"
                class
                onChange={(e) => setFormData(prev
            </d
        </Card>
     
    

            <CardContent>
                {AU
                    <Checkbox
             
     
    
                      </
                      
                 
                ))}
      

            ratings={qualityRatings}
          />
      </div>
      {/* Action 
        <Button 
          disa
          className="flex ite
    
        </Button>
    

          
        >
          Export Results
      </div>
      
        <MetricResults 
          onExport={exportRes
      )}
  );



























































































































































