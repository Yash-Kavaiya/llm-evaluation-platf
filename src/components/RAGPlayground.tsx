import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MagnifyingGlass, 
  Database, 
  Lightning, 
  CheckCircle, 
  Warning,
  Article,
  Ranking
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  content: string;
  relevance_score: number;
  source: string;
}

interface RAGResult {
  answer: string;
  confidence: number;
  retrieved_docs: Document[];
  context_relevance: number;
  answer_faithfulness: number;
  answer_relevance: number;
  retrieval_precision: number;
  retrieval_recall: number;
}

export default function RAGPlayground() {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [retrievalMethod, setRetrievalMethod] = useState("semantic");
  const [topK, setTopK] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ragResult, setRAGResult] = useState<RAGResult | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Sample knowledge base documents
  const sampleDocs = [
    {
      id: "1",
      title: "Machine Learning Fundamentals",
      content: "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.",
      source: "ML Textbook"
    },
    {
      id: "2", 
      title: "Neural Networks Overview",
      content: "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes that process information.",
      source: "AI Research Paper"
    },
    {
      id: "3",
      title: "Deep Learning Applications",
      content: "Deep learning has revolutionized fields like computer vision, natural language processing, and speech recognition through multi-layered neural networks.",
      source: "Tech Journal"
    },
    {
      id: "4",
      title: "Transformer Architecture",
      content: "Transformers use self-attention mechanisms to process sequential data efficiently, forming the backbone of modern language models like GPT and BERT.",
      source: "Research Publication"
    },
    {
      id: "5",
      title: "Large Language Models",
      content: "Large language models are neural networks trained on vast amounts of text data to understand and generate human-like text responses.",
      source: "AI Documentation"
    }
  ];

  const mockRAGProcess = async () => {
    setIsProcessing(true);
    
    // Simulate retrieval and generation delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock document retrieval based on query similarity
    const retrievedDocs = sampleDocs
      .map(doc => ({
        ...doc,
        relevance_score: Math.random() * 0.6 + 0.4 // 0.4-1.0 range
      }))
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, topK);
    
    const mockResult: RAGResult = {
      answer: `Based on the retrieved context, ${query.toLowerCase().includes('machine learning') ? 'machine learning is a powerful subset of AI that enables systems to learn from data without explicit programming. It uses algorithms to identify patterns and make predictions.' : query.toLowerCase().includes('neural') ? 'neural networks are computational models inspired by the human brain, consisting of interconnected nodes that process information through weighted connections.' : 'the concept you\'re asking about relates to modern AI systems that process and understand information through sophisticated mathematical models and algorithms.'}`,
      confidence: 0.87,
      retrieved_docs: retrievedDocs,
      context_relevance: 0.82,
      answer_faithfulness: 0.89,
      answer_relevance: 0.85,
      retrieval_precision: 0.78,
      retrieval_recall: 0.73
    };
    
    setRAGResult(mockResult);
    setDocuments(retrievedDocs);
    setIsProcessing(false);
    toast.success("RAG analysis completed");
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) return "default";
    if (score >= 0.6) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Input Configuration */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MagnifyingGlass className="w-5 h-5" />
              Query Configuration
            </CardTitle>
            <CardDescription>
              Configure your RAG query and retrieval parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query-input">User Query</Label>
              <Textarea
                id="query-input"
                placeholder="Enter your question or query here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retrieval-method">Retrieval Method</Label>
                <Select value={retrievalMethod} onValueChange={setRetrievalMethod}>
                  <SelectTrigger id="retrieval-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semantic">Semantic Search</SelectItem>
                    <SelectItem value="keyword">Keyword Matching</SelectItem>
                    <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                    <SelectItem value="dense">Dense Retrieval</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="top-k">Top-K Documents</Label>
                <Input
                  id="top-k"
                  type="number"
                  min="1"
                  max="10"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value) || 5)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Knowledge Base Context
            </CardTitle>
            <CardDescription>
              Additional context or knowledge base information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="context-input">Additional Context (Optional)</Label>
              <Textarea
                id="context-input"
                placeholder="Provide additional context or domain-specific information..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-32"
              />
            </div>

            <div className="pt-2">
              <Button 
                onClick={mockRAGProcess} 
                disabled={!query.trim() || isProcessing}
                className="w-full"
              >
                <Lightning className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing RAG Pipeline..." : "Run RAG Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {ragResult && (
        <Card>
          <CardHeader>
            <CardTitle>RAG Analysis Results</CardTitle>
            <CardDescription>
              Comprehensive evaluation of retrieval and generation performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="answer" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="answer">Generated Answer</TabsTrigger>
                <TabsTrigger value="retrieval">Retrieved Documents</TabsTrigger>
                <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
                <TabsTrigger value="analysis">Quality Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="answer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Article className="w-5 h-5" />
                        Generated Response
                      </span>
                      <Badge variant={getScoreBadge(ragResult.confidence)}>
                        {(ragResult.confidence * 100).toFixed(1)}% Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm leading-relaxed">{ragResult.answer}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {(ragResult.answer_relevance * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Answer Relevance</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {(ragResult.answer_faithfulness * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Faithfulness</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {ragResult.answer.split(' ').length}
                          </div>
                          <div className="text-xs text-muted-foreground">Words</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="retrieval" className="space-y-4">
                <div className="space-y-3">
                  {ragResult.retrieved_docs.map((doc, index) => (
                    <Card key={doc.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{doc.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <Badge variant={getScoreBadge(doc.relevance_score)}>
                              {(doc.relevance_score * 100).toFixed(1)}% Relevant
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{doc.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Source: {doc.source}</span>
                          <div className="flex items-center gap-1">
                            <Ranking className="w-3 h-3" />
                            <span className="text-xs">Score: {doc.relevance_score.toFixed(3)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Retrieval Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Retrieval Precision</span>
                          <span className={getScoreColor(ragResult.retrieval_precision)}>
                            {(ragResult.retrieval_precision * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={ragResult.retrieval_precision * 100} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Retrieval Recall</span>
                          <span className={getScoreColor(ragResult.retrieval_recall)}>
                            {(ragResult.retrieval_recall * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={ragResult.retrieval_recall * 100} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Context Relevance</span>
                          <span className={getScoreColor(ragResult.context_relevance)}>
                            {(ragResult.context_relevance * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={ragResult.context_relevance * 100} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Generation Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Answer Faithfulness</span>
                          <span className={getScoreColor(ragResult.answer_faithfulness)}>
                            {(ragResult.answer_faithfulness * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={ragResult.answer_faithfulness * 100} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Answer Relevance</span>
                          <span className={getScoreColor(ragResult.answer_relevance)}>
                            {(ragResult.answer_relevance * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={ragResult.answer_relevance * 100} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Confidence</span>
                          <span className={getScoreColor(ragResult.confidence)}>
                            {(ragResult.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={ragResult.confidence * 100} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {ragResult.answer_faithfulness > 0.8 && (
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            High answer faithfulness to retrieved context
                          </li>
                        )}
                        {ragResult.retrieval_precision > 0.7 && (
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Good retrieval precision
                          </li>
                        )}
                        {ragResult.confidence > 0.8 && (
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            High confidence in generated answer
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Retrieved {ragResult.retrieved_docs.length} relevant documents
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Warning className="w-5 h-5 text-yellow-600" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {ragResult.retrieval_recall < 0.8 && (
                          <li className="flex items-center gap-2">
                            <Warning className="w-4 h-4 text-yellow-600" />
                            Retrieval recall could be improved
                          </li>
                        )}
                        {ragResult.context_relevance < 0.8 && (
                          <li className="flex items-center gap-2">
                            <Warning className="w-4 h-4 text-yellow-600" />
                            Context relevance needs attention
                          </li>
                        )}
                        {ragResult.answer_relevance < 0.8 && (
                          <li className="flex items-center gap-2">
                            <Warning className="w-4 h-4 text-yellow-600" />
                            Answer relevance to query can be enhanced
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <Warning className="w-4 h-4 text-yellow-600" />
                          Consider expanding knowledge base coverage
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommendation:</strong> The RAG system shows {ragResult.confidence > 0.8 ? 'strong' : ragResult.confidence > 0.6 ? 'moderate' : 'weak'} performance. 
                    Consider {ragResult.retrieval_recall < 0.8 ? 'improving document coverage, ' : ''}
                    {ragResult.context_relevance < 0.8 ? 'enhancing retrieval relevance, ' : ''}
                    and {ragResult.answer_faithfulness < 0.8 ? 'improving answer grounding in retrieved context.' : 'maintaining current quality standards.'}
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}