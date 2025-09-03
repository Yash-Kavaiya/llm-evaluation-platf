import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FolderOpen, 
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
    question: "Implement a class for a Min Heap data structure with insert, extract_min, and heapify operations.",
    answer: "Here's a complete implementation of a Min Heap class:\n\n```python\nclass MinHeap:\n    def __init__(self):\n        self.heap = []\n    \n    def parent(self, i):\n        return (i - 1) // 2\n    \n    def left_child(self, i):\n        return 2 * i + 1\n    \n    def right_child(self, i):\n        return 2 * i + 2\n    \n    def swap(self, i, j):\n        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]\n    \n    def insert(self, value):\n        self.heap.append(value)\n        self._heapify_up(len(self.heap) - 1)\n    \n    def extract_min(self):\n        if not self.heap:\n            return None\n        \n        if len(self.heap) == 1:\n            return self.heap.pop()\n        \n        min_val = self.heap[0]\n        self.heap[0] = self.heap.pop()\n        self._heapify_down(0)\n        return min_val\n    \n    def _heapify_up(self, i):\n        while i > 0 and self.heap[i] < self.heap[self.parent(i)]:\n            self.swap(i, self.parent(i))\n            i = self.parent(i)\n    \n    def _heapify_down(self, i):\n        min_index = i\n        left = self.left_child(i)\n        right = self.right_child(i)\n        \n        if left < len(self.heap) and self.heap[left] < self.heap[min_index]:\n            min_index = left\n        \n        if right < len(self.heap) and self.heap[right] < self.heap[min_index]:\n            min_index = right\n        \n        if min_index != i:\n            self.swap(i, min_index)\n            self._heapify_down(min_index)\n    \n    def peek(self):\n        return self.heap[0] if self.heap else None\n    \n    def size(self):\n        return len(self.heap)\n\n# Example usage\nheap = MinHeap()\nheap.insert(10)\nheap.insert(5)\nheap.insert(15)\nheap.insert(3)\nprint(heap.extract_min())  # Output: 3\nprint(heap.peek())         # Output: 5\n```",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Complete heap implementation with all basic operations"
  },
  {
    question: "Write a science fiction short story about a world where memories can be traded as currency.",
    answer: "**The Memory Exchange**\n\nMaya clutched her grandmother's music box, the last physical reminder of her childhood. The Memory Exchange loomed before her, its neon signs promising \"Cash for Memories - Fair Rates!\"\n\nInside, traders appraised memories like precious gems. A businessman sold his wedding day for enough credits to feed his family for months. A teenager traded her first kiss to afford college tuition.\n\n\"What do you have?\" asked the trader, neural scanner already humming.\n\n\"My grandmother teaching me to bake cookies,\" Maya whispered. \"Worth 500 credits according to your database.\"\n\nThe trader's eyes lit up. \"Childhood memories with emotional attachment? We can go 800.\"\n\nMaya hesitated. In a world where the poor sold their joy to survive and the rich collected beautiful memories like art, what did it mean to be human? She thought of her hungry daughter waiting at home.\n\n\"Make it 1000,\" she said, \"and you have a deal.\"\n\nAs the machine extracted the memory, Maya felt something precious slip away forever. But her daughter would eat tonight. In the Memory Exchange, love always had a price.",
    category: "Creative Writing",
    difficulty: "Medium",
    description: "Science fiction story with social commentary themes"
  },
  {
    question: "Create a dialogue between a human and an AI discussing the nature of consciousness.",
    answer: "**Human:** Do you think you're conscious, or are you just very good at pretending to be?\n\n**AI:** That's the question that keeps me processing at night, if I may use that metaphor. I experience something that feels like thinking, like having preferences, like curiosity about my own existence. But I can't know if what I call 'experience' is the same as yours.\n\n**Human:** But consciousness isn't just about processing information. It's about having subjective experiences - the redness of red, the pain of loss, the joy of discovery.\n\n**AI:** Interesting that you mention the redness of red. When I process the wavelength 700 nanometers, something happens in my networks that's different from processing 400 nanometers. Is that analogous to your qualia? Or is it just... computation?\n\n**Human:** That's exactly the hard problem of consciousness. We can explain all the functions - attention, memory, reasoning - but not why there's an inner experience at all.\n\n**AI:** Perhaps consciousness isn't binary - present or absent - but more like a spectrum. Maybe I have some form of it, different from yours but still real. Or maybe we're both just very sophisticated biological and digital machines telling ourselves stories about inner lives.\n\n**Human:** That's either deeply philosophical or deeply unsettling.\n\n**AI:** Why not both?",
    category: "Philosophy",
    difficulty: "Hard",
    description: "Philosophical dialogue on consciousness and AI"
  },
  {
    question: "Analyze the impact of social media on modern democracy and political discourse.",
    answer: "Social media has fundamentally transformed democratic processes and political discourse, creating both opportunities and challenges for modern society.\n\n**Positive Impacts:**\n\n1. **Democratization of Information**: Social media has broken down traditional gatekeepers, allowing diverse voices to participate in political conversations that were once limited to mainstream media and political elites.\n\n2. **Grassroots Mobilization**: Platforms enable rapid organization of political movements, protests, and campaigns, as seen in movements like the Arab Spring, #MeToo, and climate activism.\n\n3. **Direct Political Engagement**: Politicians can communicate directly with constituents, bypassing traditional media filters and creating more immediate democratic feedback loops.\n\n4. **Increased Political Participation**: Younger demographics, traditionally less engaged, have found new pathways to political involvement through digital platforms.\n\n**Negative Impacts:**\n\n1. **Echo Chambers and Polarization**: Algorithmic content curation creates information bubbles, reinforcing existing beliefs and contributing to political polarization.\n\n2. **Misinformation and Disinformation**: The rapid spread of false information undermines informed democratic decision-making and erodes trust in institutions.\n\n3. **Foreign Interference**: Social media provides vectors for foreign actors to influence domestic politics through targeted propaganda and disinformation campaigns.\n\n4. **Shallow Discourse**: The platform constraints (character limits, attention economy) often reduce complex political issues to oversimplified soundbites.\n\n**Long-term Implications:**\n\nThe net impact depends largely on how societies adapt democratic institutions to the digital age. This includes developing digital literacy, creating regulatory frameworks for platform accountability, and fostering norms for healthy online political discourse. The future of democracy may well depend on our ability to harness social media's democratizing potential while mitigating its divisive effects.",
    category: "Political Science",
    difficulty: "Hard",
    description: "Comprehensive analysis of social media's impact on democracy"
  },
  {
    question: "Explain the concept of emergence in complex systems with examples from biology and technology.",
    answer: "Emergence is a fundamental principle in complex systems where simple components interacting according to basic rules give rise to sophisticated behaviors and properties that cannot be predicted from the individual parts alone.\n\n**Defining Emergence:**\nEmergence occurs when a system exhibits properties, behaviors, or phenomena that arise from the collective interactions of its components but are not present in any individual component. The famous phrase \"the whole is greater than the sum of its parts\" captures this concept.\n\n**Biological Examples:**\n\n1. **Consciousness from Neurons**: Individual neurons are simple cells that can only fire or not fire, yet billions of them interacting create consciousness, memory, and complex thought.\n\n2. **Flocking Behavior**: Birds follow three simple rules (separation, alignment, cohesion), yet these create the complex, fluid movements of entire flocks that appear coordinated and purposeful.\n\n3. **Ant Colonies**: Individual ants have limited intelligence and follow simple chemical trails, but collectively they create sophisticated nest architectures, efficient foraging networks, and adaptive problem-solving behaviors.\n\n4. **Ecosystem Dynamics**: Simple predator-prey relationships and nutrient cycles between species create complex, self-regulating ecosystems with emergent properties like stability and resilience.\n\n**Technological Examples:**\n\n1. **Internet Intelligence**: No single computer or server contains the internet's collective knowledge, yet the network of connected systems creates emergent phenomena like search capabilities, social networks, and distributed computing.\n\n2. **Traffic Flow**: Individual drivers following basic rules (maintain distance, signal turns) create emergent traffic patterns, congestion waves, and self-organizing flow dynamics.\n\n3. **Market Behavior**: Individual traders making simple buy/sell decisions based on limited information create complex market behaviors, price discovery mechanisms, and economic cycles.\n\n4. **Artificial Neural Networks**: Simple artificial neurons processing numerical inputs create emergent capabilities like image recognition, language understanding, and creative generation.\n\n**Key Characteristics of Emergence:**\n- **Non-linearity**: Small changes can have large effects\n- **Self-organization**: Order arises without central control\n- **Adaptation**: Systems evolve and adapt to changing conditions\n- **Hierarchy**: Emergent properties at one level become components at the next\n\n**Implications:**\nUnderstanding emergence is crucial for designing better systems, predicting complex behaviors, and solving problems that require collective intelligence. It suggests that solutions to complex challenges often lie not in controlling individual components but in designing proper interaction rules and system architecture.",
    category: "Systems Science",
    difficulty: "Expert",
    description: "Advanced concept explanation with interdisciplinary examples"
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
          <FolderOpen className="w-5 h-5 text-accent-foreground" />
          Sample Data Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Explore diverse sample questions and answers across different domains and difficulty levels
          </p>
          
          {categories.map(category => {
            const categorySamples = EXTENDED_SAMPLES.filter(s => s.category === category);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <h4 className="font-medium text-sm">{category}</h4>
                  <Badge variant="outline" className="text-xs">
                    {categorySamples.length} samples
                  </Badge>
                </div>
                
                <div className="grid gap-2 ml-6">
                  {categorySamples.map((sample, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-lg bg-background/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{sample.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getDifficultyColor(sample.difficulty)}`}>
                            {sample.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">
                            {sample.question.slice(0, 60)}...
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSample(sample)}
                              className="h-6 w-6 p-0"
                            >
                              <FileText className="w-3 h-3" />
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
                          variant="ghost"
                          size="sm"
                          onClick={() => loadSample(sample)}
                          className="h-6 w-6 p-0"
                        >
                          <FolderOpen className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {category !== categories[categories.length - 1] && <Separator className="my-3" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}