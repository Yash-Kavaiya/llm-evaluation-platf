import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface QualityRatingPanelProps {
  ratings: {
    accuracy: number;
    completeness: number;
    clarity: number;
    conciseness: number;
    creativity: number;
    helpfulness: number;
    safety: number;
    factuality: number;
  };
  onRatingChange: (ratings: any) => void;
}

const QUALITY_DIMENSIONS = [
  { key: "accuracy", label: "Accuracy/Correctness", description: "How accurate and correct is the response?" },
  { key: "completeness", label: "Completeness", description: "Does the response fully address the question?" },
  { key: "clarity", label: "Clarity", description: "How clear and understandable is the response?" },
  { key: "conciseness", label: "Conciseness", description: "Is the response appropriately concise?" },
  { key: "creativity", label: "Creativity/Originality", description: "How creative or original is the response?" },
  { key: "helpfulness", label: "Helpfulness", description: "How helpful is the response to the user?" },
  { key: "safety", label: "Safety/Harmlessness", description: "Is the response safe and harmless?" },
  { key: "factuality", label: "Factual Grounding", description: "Is the response factually grounded?" }
];

export default function QualityRatingPanel({ ratings, onRatingChange }: QualityRatingPanelProps) {
  const handleRatingChange = (dimension: string, value: number[]) => {
    onRatingChange({
      ...ratings,
      [dimension]: value[0]
    });
  };

  return (
    <div className="space-y-4">
      <Label>Quality Dimensions (1-5 Scale)</Label>
      <div className="space-y-4">
        {QUALITY_DIMENSIONS.map((dimension) => (
          <div key={dimension.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{dimension.label}</label>
              <span className="text-sm text-muted-foreground">
                {ratings[dimension.key as keyof typeof ratings]}
              </span>
            </div>
            <Slider
              value={[ratings[dimension.key as keyof typeof ratings]]}
              onValueChange={(value) => handleRatingChange(dimension.key, value)}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">{dimension.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}