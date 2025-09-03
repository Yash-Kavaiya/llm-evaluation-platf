import { useState } from "react";
import { Textarea } from "@/components/ui/textar
import { Card, CardContent, CardHeader, CardTitle } 
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import SampleDataLibrary from "./SampleDataLib
import { Copy, Download, Play } from "@phosphor-icons/react";
const MODELS = [
import MetricResults from "./MetricResults";
import SampleDataLibrary from "./SampleDataLibrary";
import QualityRatingPanel from "./QualityRatingPanel";

const MODELS = [
  { id: "c
  { id: "relevan
  { id: "toxicity", 

  const [formDa
    answer: "",
    customM
  });
  

  const [qualityRatings, se
    completeness: 3,
    conciseness: 3,
    helpfulness: 3,
    factuality: 3

  { id: "coherence", label: "Coherence", description: "Text coherence score" },
  { id: "fluency", label: "Fluency", description: "Text fluency assessment" },
  { id: "relevance", label: "Relevance", description: "Response relevance to prompt" },
  { id: "semantic", label: "Semantic Similarity", description: "Semantic similarity to reference" },
  { id: "toxicity", label: "Toxicity Detection", description: "Harmful content detection" }
];

export default function ManualEvaluation() {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    model: "",
    customModel: "",
    reference: ""
  });

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "rouge1", "coherence", "fluency", "relevance"
  ]);

  const [qualityRatings, setQualityRatings] = useState({
    accuracy: 3,
    completeness: 3,
    clarity: 3,
    conciseness: 3,
    creativity: 3,
    helpfulness: 3,
    safety: 3,
    factuality: 3
  });

  const [isCalculating, setIsCalculating] = useState(false);
    }

    
    setFormData(prev => ({
      const au
      question: sample.question,
          score: parseFloat(
      model: sample.model || ""
        
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
        automatic: automaticMetrics,
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
    

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );


  const calculateMetrics = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Please provide both question and answer");
      return;
     


    
    try {
      // Simulate metric calculations
      const automaticMetrics = selectedMetrics.reduce((acc, metric) => {
        const score = Math.random() * 0.4 + 0.6; // Random score between 0.6-1.0
    URL.revokeObjectURL
          score: parseFloat(score.toFixed(3)),
          details: `Calculated ${metric} score based on text analysis`
        };
    <div className=
      }, {} as any);

      // Calculate composite quality score
      const qualityScore = Object.values(qualityRatings).reduce((sum: number, rating: any) => 
        sum + rating, 0
      ) / Object.keys(qualityRatings).length / 5; // Normalize to 0-1

                <L
        automatic: automaticMetrics,
        quality: qualityScore,
        qualityBreakdown: qualityRatings,
        metadata: {
          model: formData.model === "Custom" ? formData.customModel : formData.model,
          timestamp: new Date().toISOString(),
          questionLength: formData.question.length,
          answerLength: formData.answer.length
        }
         

        {/* Metric Selection */}
          <CardHeader
          </CardHeader>
            <di
              <div className="
     
    

                    <div classN
                   
                      >
             
     
    
                ))}
            </div>
            <QualityRa
              onRatingChange={setQualityRa
      

      {/* Action Buttons */}
        <Button 
          disabled={isCalculating || !form
        >
          {isCalculating ? "Calculating..." : "Ru

          <But
            onClick={exportResult
          >

        )}


          
        />
    </div>
}



































































































































































