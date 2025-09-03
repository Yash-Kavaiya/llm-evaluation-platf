import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Folder, 
  Copy, 
  FileText, 
  Code, 
  Lightbulb, 
  ChartLine,
  BookOpen,
  Microscope
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface SampleData {
  question: string;
  answer: string;
  reference?: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  description: string;
}

const EXTENDED_SAMPLES: SampleData[] = [
  {
    question: "Write a Python function to find the longest common subsequence (LCS) between two strings using dynamic programming.",
    answer: "Here's a Python implementation of the LCS algorithm using dynamic programming:\n\n```python\ndef longest_common_subsequence(str1, str2):\n    m, n = len(str1), len(str2)\n    \n    # Create a 2D DP table\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    # Fill the DP table\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if str1[i-1] == str2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    \n    # Reconstruct the LCS\n    lcs = []\n    i, j = m, n\n    while i > 0 and j > 0:\n        if str1[i-1] == str2[j-1]:\n            lcs.append(str1[i-1])\n            i -= 1\n            j -= 1\n        elif dp[i-1][j] > dp[i][j-1]:\n            i -= 1\n        else:\n            j -= 1\n    \n    return ''.join(reversed(lcs))\n\n# Example usage\nresult = longest_common_subsequence('ABCDGH', 'AEDFHR')\nprint(result)  # Output: 'ADH'\n```\n\nTime complexity: O(m*n), Space complexity: O(m*n)",
    reference: "def lcs(str1, str2):\n    m, n = len(str1), len(str2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if str1[i-1] == str2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    \n    return dp[m][n]",
    category: "Programming",
    difficulty: "Hard",
    description: "Advanced dynamic programming algorithm implementation"
  },
  {
    question: "Write a science fiction short story about a world where memories can be traded as currency.",
    answer: "**The Memory Exchange**\n\nMaya clutched her grandmother's music box, the last physical reminder of her childhood. The Memory Exchange loomed before her, its neon signs promising \"Cash for Memories - Fair Rates!\"\n\nInside, traders appraised memories like precious gems. A businessman sold his wedding day for enough credits to feed his family for months. A teenager traded her first kiss to afford college tuition.\n\n\"What do you have?\" asked the trader, neural scanner already humming.\n\n\"My grandmother teaching me to bake cookies,\" Maya whispered. \"Worth 500 credits according to your database.\"\n\nThe trader's eyes lit up. \"Childhood memories with emotional attachment? We can go 800.\"\n\nMaya hesitated. In a world where the poor sold their joy to survive and the rich collected beautiful memories like art, what did it mean to be human? She thought of her hungry daughter waiting at home.\n\n\"Make it 1000,\" she said, \"and you have a deal.\"\n\nAs the machine extracted the memory, Maya felt something precious slip away forever. But her daughter would eat tonight. In the Memory Exchange, love always had a price.",
    category: "Creative Writing",
    difficulty: "Medium",
    description: "Science fiction story with social commentary themes"
  },
  {
    question: "Analyze the impact of social media on modern democracy and political discourse.",
    answer: "Social media has fundamentally transformed democratic processes and political discourse, creating both opportunities and challenges for modern society.\n\n**Positive Impacts:**\n\n1. **Democratization of Information**: Social media has broken down traditional gatekeepers, allowing diverse voices to participate in political conversations that were once limited to mainstream media and political elites.\n\n2. **Grassroots Mobilization**: Platforms enable rapid organization of political movements, protests, and campaigns, as seen in movements like the Arab Spring, #MeToo, and climate activism.\n\n3. **Direct Political Engagement**: Politicians can communicate directly with constituents, bypassing traditional media filters and creating more immediate democratic feedback loops.\n\n4. **Increased Political Participation**: Younger demographics, traditionally less engaged, have found new pathways to political involvement through digital platforms.\n\n**Negative Impacts:**\n\n1. **Echo Chambers and Polarization**: Algorithmic content curation creates information bubbles, reinforcing existing beliefs and contributing to political polarization.\n\n2. **Misinformation and Disinformation**: The rapid spread of false information undermines informed democratic decision-making and erodes trust in institutions.\n\n3. **Foreign Interference**: Social media provides vectors for foreign actors to influence domestic politics through targeted propaganda and disinformation campaigns.\n\n4. **Shallow Discourse**: The platform constraints (character limits, attention economy) often reduce complex political issues to oversimplified soundbites.\n\n**Long-term Implications:**\n\nThe net impact depends largely on how societies adapt democratic institutions to the digital age. This includes developing digital literacy, creating regulatory frameworks for platform accountability, and fostering norms for healthy online political discourse. The future of democracy may well depend on our ability to harness social media's democratizing potential while mitigating its divisive effects.",
    category: "Political Science",
    difficulty: "Hard",
    description: "Comprehensive analysis of social media's impact on democracy"
  }
];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "programming":
    case "data structures":
      return <Code className="w-4 h-4" />;
    case "creative writing":
      return <Lightbulb className="w-4 h-4" />;
    case "philosophy":
      return <BookOpen className="w-4 h-4" />;
    case "political science":
      return <ChartLine className="w-4 h-4" />;
    case "systems science":
      return <Microscope className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Hard": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "Expert": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

interface SampleDataLibraryProps {
  onSampleSelect: (sample: { question: string; answer: string; reference?: string }) => void;
}

export default function SampleDataLibrary({ onSampleSelect }: SampleDataLibraryProps) {
  const [selectedSample, setSelectedSample] = useState<SampleData | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const loadSample = (sample: SampleData) => {
    onSampleSelect({
      question: sample.question,
      answer: sample.answer,
      reference: sample.reference
    });
    toast.success(`Loaded sample: ${sample.category}`);
  };

  const categories = Array.from(new Set(EXTENDED_SAMPLES.map(s => s.category)));

  return (
    <Card className="bg-accent/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Folder className="w-5 h-5 text-accent-foreground" />
          Sample Data Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Explore diverse sample questions and answers across different domains and difficulty levels
          </p>
          
          <Accordion type="multiple" className="w-full">
            {categories.map((category, categoryIndex) => {
              const categorySamples = EXTENDED_SAMPLES.filter(s => s.category === category);
              return (
                <AccordionItem key={category} value={`category-${categoryIndex}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline" className="text-xs ml-2">
                        {categorySamples.length} samples
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-3 pt-2">
                      {categorySamples.map((sample, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1">{sample.description}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`text-xs ${getDifficultyColor(sample.difficulty)}`}>
                                {sample.difficulty}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {sample.question}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 ml-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSample(sample)}
                                  className="h-8 w-8 p-0"
                                  title="Preview sample"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {getCategoryIcon(sample.category)}
                                    {sample.category} Sample
                                  </DialogTitle>
                                  <DialogDescription>
                                    {sample.description} • Difficulty: {sample.difficulty}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-sm font-medium">Question</Label>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(sample.question, "Question")}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <Textarea
                                      value={sample.question}
                                      readOnly
                                      className="min-h-[80px] resize-none"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-sm font-medium">Answer</Label>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(sample.answer, "Answer")}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <Textarea
                                      value={sample.answer}
                                      readOnly
                                      className="min-h-[200px] resize-none font-mono text-xs"
                                    />
                                  </div>
                                  
                                  {sample.reference && (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Reference Answer</Label>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(sample.reference!, "Reference")}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <Textarea
                                        value={sample.reference}
                                        readOnly
                                        className="min-h-[100px] resize-none font-mono text-xs"
                                      />
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2 pt-4">
                                    <Button onClick={() => loadSample(sample)} className="flex-1">
                                      Load into Evaluation Form
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => loadSample(sample)}
                              className="h-8 px-3"
                              title="Load sample data"
                            >
                              Load
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}