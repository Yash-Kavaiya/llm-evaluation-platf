import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator
import { Calculator, Download, Copy } from "@phosphor-icons/react";
import MetricResults from "./MetricResults";
import SampleDataLibrary from "./SampleDataLibrary";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Download, Copy } from "@phosphor-icons/react";
import { toast } from "sonner";
import MetricResults from "./MetricResults";
import QualityRatings from "./QualityRatings";
import SampleDataLibrary from "./SampleDataLibrary";


  const [formData, setFormData] = useState({
  

  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["coherence", "fluency", "relev
    accuracy: 3,
    clarity: 3,
    creativity: 3,
    safety: 3,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const handleSampleSelect = (sample: any) => {
      ...prev,
      answer: sample.answer,
  

    navigator.clipboard.writeText(text);
  };
  const handleMet
      prev.incl
        : [...
  };
  const calculateMetric
     

    setIsCalculating(true);
    try {
      await new 
      const mockResu
          const
            acc[met
              scor
            };
          retu
        quality: qualit
     
          inputLength: formData.question.length,
        }

      toast.success("Evaluation completed succe
      toast.error("Failed 
      setIsCal
  };
  const exportResults = () =
      toast.error("No results to export");
    }
    

      exportDate: new Date().toISOString()
    
    const url = URL.createObjectURL(blob);
    

    
  };
  return (
      {/* Sample Data Library */}


    

          </CardHeader>
            <div className="space-y-2">
                <Label htmlFor="question">Question/Prompt</La
             
     

                  </Button>
    
         
                className="min-h-[120
                onChange={(e) => setFormData(prev => ({ ...pre
      
            <div className=
                <Label htmlFor="answer">Model Response</Label>
                  <Button
                    siz
                  >
                  </Button>
              </div>
                id="answer"
              
           
            </div>
            <div className="grid sm:gr
                <Label htmlFor="
                  <
                  </SelectTrigger>
                    {LLM_MODELS.map(model => (
                    ))}
                </Select>

        

                    placeholde
                    onChange={(e) => setFormData(prev => 
                </div
            </div>
            <di
              <Textarea
     
    

            </div>
        </Card>
        <div className="space-y-6">
          <Ca
     

                {A
                    <C
                      checked={
                      d
                    <div className="space-
      
    
                      </Label>
                    </div>
                ))}
            </Car

          <Qua
            onRatingsChange={
    



          
          className="flex items
        >
          {isCalculating ? "Calculating..." : "Evaluate Respons

          <Button 

            size="lg"
            <Download className="w-4 h-4" />
          </Bu
      </div>
      {/* Results */}
        <MetricResults 
    </div>
}





























































































































































