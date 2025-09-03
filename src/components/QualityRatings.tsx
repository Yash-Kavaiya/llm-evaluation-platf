import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const QUALITY_DIMENSIONS = [
  { 
    key: "accuracy", 
    label: "Accuracy/Correctness", 
    description: "How factually correct and truthful is the response?" 
  },
  { 
    key: "completeness", 
    label: "Completeness", 
    description: "Does the response fully address all parts of the question?" 
  },
  { 
    key: "clarity", 
    label: "Clarity", 
    description: "How clear and understandable is the response?" 
  },
  { 
    key: "conciseness", 
    label: "Conciseness", 
    description: "Is the response appropriately concise without unnecessary information?" 
  },
  { 
    key: "creativity", 
    label: "Creativity/Originality", 
    description: "How creative or original is the response when appropriate?" 
  },
  { 
    key: "helpfulness", 
    label: "Helpfulness", 
    description: "How helpful is the response to the user's needs?" 
  },
  { 
    key: "safety", 
    label: "Safety/Harmlessness", 
    description: "Is the response safe and free from harmful content?" 
  },
  { 
    key: "factualGrounding", 
    label: "Factual Grounding", 
    description: "How well-grounded in facts and evidence is the response?" 
  }
];

const RATING_LABELS = {
  1: "Poor",
  2: "Below Average", 
  3: "Average",
  4: "Good",
  5: "Excellent"
};

interface QualityRatingsProps {
  ratings: Record<string, number>;
  onRatingsChange: (ratings: Record<string, number>) => void;
}

export default function QualityRatings({ ratings, onRatingsChange }: QualityRatingsProps) {
  const handleRatingChange = (key: string, value: number[]) => {
    onRatingsChange({
      ...ratings,
      [key]: value[0]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quality Assessment</CardTitle>
        <p className="text-sm text-muted-foreground">Rate each dimension on a scale of 1-5</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {QUALITY_DIMENSIONS.map(dimension => (
          <div key={dimension.key} className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">{dimension.label}</Label>
                <span className="text-sm font-medium text-primary">
                  {ratings[dimension.key]} - {RATING_LABELS[ratings[dimension.key] as keyof typeof RATING_LABELS]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{dimension.description}</p>
            </div>
            
            <div className="px-2">
              <Slider
                value={[ratings[dimension.key]]}
                onValueChange={(value) => handleRatingChange(dimension.key, value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <Label className="font-semibold">Overall Quality Score</Label>
            <span className="text-lg font-bold text-primary">
              {(Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / Object.values(ratings).length).toFixed(1)}/5
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}