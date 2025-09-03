import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Cube, 
  Lightning, 
  CheckCircle, 
  Info,
  Text,
  FileText,
  ChartBar,
  CaretRight,
  Copy,
  Download,
  Scissors
} from "@phosphor-icons/react";
import { toast } from "sonner";

export interface DocumentChunk {
  id: string;
  content: string;
  startPosition: number;
  endPosition: number;
  chunkIndex: number;
  wordCount: number;
  characterCount: number;
  embedding?: number[];
  metadata: {
    sourceDocument: string;
    chunkingMethod: string;
    overlap: number;
    createdAt: string;
  };
}

export interface ProcessingResult {
  chunks: DocumentChunk[];
  totalChunks: number;
  totalWords: number;
  totalCharacters: number;
  averageChunkSize: number;
  processingTime: number;
  embeddingModel: string;
  chunkingStrategy: string;
}

interface DocumentProcessorProps {
  onProcessingComplete?: (result: ProcessingResult) => void;
}

export default function DocumentProcessor({ onProcessingComplete }: DocumentProcessorProps) {
  const [inputText, setInputText] = useState("");
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [chunkingMethod, setChunkingMethod] = useState("token-based");
  const [embeddingModel, setEmbeddingModel] = useState("text-embedding-ada-002");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);

  // Sample text for demonstration
  const sampleTexts = {
    "research-paper": `Artificial intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. From machine learning algorithms that power recommendation systems to deep neural networks that enable autonomous vehicles, AI is reshaping virtually every industry and aspect of human life. 

The field of AI encompasses various subdomains, including machine learning, natural language processing, computer vision, and robotics. Each of these areas has seen remarkable advances in recent years, driven by improvements in computational power, the availability of large datasets, and breakthrough algorithmic innovations.

Machine learning, in particular, has become the backbone of modern AI systems. It enables computers to learn patterns from data without being explicitly programmed for every task. Deep learning, a subset of machine learning, uses artificial neural networks with multiple layers to model and understand complex patterns in data.

Natural language processing (NLP) has made significant strides, with models like transformers revolutionizing how machines understand and generate human language. These models have enabled applications ranging from chatbots and virtual assistants to automated translation and content generation.

Computer vision has also advanced dramatically, with deep learning models now capable of tasks that were once thought to be uniquely human, such as image recognition, object detection, and facial recognition. These capabilities have found applications in healthcare, autonomous vehicles, security systems, and many other domains.

The integration of AI into various industries has led to increased efficiency, new business models, and innovative solutions to complex problems. However, it has also raised important questions about privacy, ethics, job displacement, and the need for responsible AI development.`,
    
    "technical-docs": `# REST API Documentation

## Overview
This API provides programmatic access to our data processing platform. All endpoints use JSON for request and response data, and require authentication via API key.

## Authentication
Include your API key in the request header:
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Rate Limiting
API requests are limited to 1000 requests per hour per API key. Rate limit information is included in response headers.

## Base URL
All API requests should be made to: \`https://api.example.com/v1\`

## Data Processing Endpoints

### POST /process/document
Process a document for text extraction and analysis.

**Parameters:**
- \`document\` (file, required): The document file to process
- \`format\` (string, optional): Output format (json, xml, csv)
- \`extract_metadata\` (boolean, optional): Whether to extract metadata

**Response:**
\`\`\`json
{
  "id": "proc_123456",
  "status": "completed",
  "extracted_text": "...",
  "metadata": { ... },
  "processing_time": 2.34
}
\`\`\`

### GET /process/{id}/status
Check the status of a processing job.

**Response:**
\`\`\`json
{
  "id": "proc_123456",
  "status": "processing|completed|failed",
  "progress": 75,
  "estimated_completion": "2024-01-15T10:30:00Z"
}
\`\`\`

## Error Handling
The API uses standard HTTP status codes and returns error details in JSON format.`,
    
    "story": `In the year 2045, Dr. Elena Vasquez stood before the massive quantum computer that would change everything. The laboratory hummed with an almost musical frequency, the sound of hundreds of qubits maintaining their delicate quantum states.

"Are you certain about this?" asked her colleague, Dr. James Chen, his voice barely audible over the mechanical symphony.

Elena nodded, her fingers dancing across the holographic interface. "The simulations have been running for months. If we're right, this could solve the climate crisis within a decade."

The quantum computer, nicknamed 'Prometheus' by the team, was designed to model complex environmental systems with unprecedented accuracy. Unlike classical computers that processed information in binary, Prometheus could explore multiple solution paths simultaneously, leveraging the strange properties of quantum mechanics.

As Elena initiated the final sequence, she reflected on the journey that had brought them here. Years of research, countless failed experiments, and the constant pressure from a world growing increasingly desperate for solutions. The latest climate reports painted a grim picture: rising sea levels, extreme weather events, and ecosystem collapse accelerating beyond all previous predictions.

"Initialization complete," announced the AI assistant. "Beginning quantum simulation of global atmospheric carbon processing."

The room fell silent except for the quantum computer's ethereal hum. Elena watched as data streams flowed across multiple displays, each representing a different aspect of the Earth's atmospheric system. The quantum algorithms were exploring billions of potential interventions simultaneously, searching for the optimal combination of technologies and policies that could reverse decades of environmental damage.

Hours passed. The team took shifts monitoring the process, but Elena remained at her post, unwilling to step away from what might be humanity's last, best hope.`
  };

  const mockEmbeddingGeneration = async (text: string): Promise<number[]> => {
    // Simulate embedding generation with a delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate a mock embedding vector (normally would be 1536 dimensions for text-embedding-ada-002)
    const embeddingSize = embeddingModel === "text-embedding-ada-002" ? 1536 : 
                         embeddingModel === "sentence-transformers" ? 768 : 384;
    
    return Array.from({ length: embeddingSize }, () => Math.random() * 2 - 1);
  };

  const chunkText = (text: string, method: string, size: number, overlap: number): DocumentChunk[] => {
    const chunks: DocumentChunk[] = [];
    
    switch (method) {
      case "token-based":
        return chunkByTokens(text, size, overlap);
      case "sentence-based":
        return chunkBySentences(text, size, overlap);
      case "paragraph-based":
        return chunkByParagraphs(text, size, overlap);
      case "semantic-based":
        return chunkBySemantic(text, size, overlap);
      default:
        return chunkByTokens(text, size, overlap);
    }
  };

  const chunkByTokens = (text: string, maxTokens: number, overlap: number): DocumentChunk[] => {
    const words = text.split(/\s+/);
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;
    
    for (let i = 0; i < words.length; i += (maxTokens - overlap)) {
      const chunkWords = words.slice(i, i + maxTokens);
      const chunkText = chunkWords.join(' ');
      
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: chunkText,
        startPosition: i,
        endPosition: Math.min(i + maxTokens, words.length),
        chunkIndex,
        wordCount: chunkWords.length,
        characterCount: chunkText.length,
        metadata: {
          sourceDocument: "input-text",
          chunkingMethod: "token-based",
          overlap,
          createdAt: new Date().toISOString()
        }
      });
      
      chunkIndex++;
      
      if (i + maxTokens >= words.length) break;
    }
    
    return chunks;
  };

  const chunkBySentences = (text: string, maxTokens: number, overlap: number): DocumentChunk[] => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;
    let currentChunk = "";
    let currentWordCount = 0;
    let startSentence = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim() + '.';
      const sentenceWords = sentence.split(/\s+/).length;
      
      if (currentWordCount + sentenceWords > maxTokens && currentChunk) {
        chunks.push({
          id: `chunk-${chunkIndex}`,
          content: currentChunk.trim(),
          startPosition: startSentence,
          endPosition: i,
          chunkIndex,
          wordCount: currentWordCount,
          characterCount: currentChunk.length,
          metadata: {
            sourceDocument: "input-text",
            chunkingMethod: "sentence-based",
            overlap,
            createdAt: new Date().toISOString()
          }
        });
        
        chunkIndex++;
        
        // Calculate overlap
        const overlapSentences = Math.floor(overlap / 20); // Rough estimate
        const newStart = Math.max(startSentence, i - overlapSentences);
        currentChunk = sentences.slice(newStart, i + 1).join('. ') + '.';
        currentWordCount = currentChunk.split(/\s+/).length;
        startSentence = newStart;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
        currentWordCount += sentenceWords;
      }
    }
    
    if (currentChunk) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        startPosition: startSentence,
        endPosition: sentences.length,
        chunkIndex,
        wordCount: currentWordCount,
        characterCount: currentChunk.length,
        metadata: {
          sourceDocument: "input-text",
          chunkingMethod: "sentence-based",
          overlap,
          createdAt: new Date().toISOString()
        }
      });
    }
    
    return chunks;
  };

  const chunkByParagraphs = (text: string, maxTokens: number, overlap: number): DocumentChunk[] => {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;
    let currentChunk = "";
    let currentWordCount = 0;
    let startParagraph = 0;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();
      const paragraphWords = paragraph.split(/\s+/).length;
      
      if (currentWordCount + paragraphWords > maxTokens && currentChunk) {
        chunks.push({
          id: `chunk-${chunkIndex}`,
          content: currentChunk.trim(),
          startPosition: startParagraph,
          endPosition: i,
          chunkIndex,
          wordCount: currentWordCount,
          characterCount: currentChunk.length,
          metadata: {
            sourceDocument: "input-text",
            chunkingMethod: "paragraph-based",
            overlap,
            createdAt: new Date().toISOString()
          }
        });
        
        chunkIndex++;
        
        // Calculate overlap
        const overlapParagraphs = Math.max(1, Math.floor(overlap / 100));
        const newStart = Math.max(startParagraph, i - overlapParagraphs);
        currentChunk = paragraphs.slice(newStart, i + 1).join('\n\n');
        currentWordCount = currentChunk.split(/\s+/).length;
        startParagraph = newStart;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentWordCount += paragraphWords;
      }
    }
    
    if (currentChunk) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        startPosition: startParagraph,
        endPosition: paragraphs.length,
        chunkIndex,
        wordCount: currentWordCount,
        characterCount: currentChunk.length,
        metadata: {
          sourceDocument: "input-text",
          chunkingMethod: "paragraph-based",
          overlap,
          createdAt: new Date().toISOString()
        }
      });
    }
    
    return chunks;
  };

  const chunkBySemantic = (text: string, maxTokens: number, overlap: number): DocumentChunk[] => {
    // Semantic chunking is more complex and would typically use NLP models
    // For demo purposes, we'll use a hybrid approach of sentences + topic boundaries
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;
    let currentChunk = "";
    let currentWordCount = 0;
    let startSentence = 0;
    
    // Simple topic boundary detection based on common topic indicators
    const topicIndicators = /^(however|therefore|furthermore|moreover|in addition|meanwhile|consequently|on the other hand|in contrast)/i;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim() + '.';
      const sentenceWords = sentence.split(/\s+/).length;
      const isTopicBoundary = topicIndicators.test(sentence);
      
      if ((currentWordCount + sentenceWords > maxTokens || isTopicBoundary) && currentChunk && currentWordCount > maxTokens * 0.3) {
        chunks.push({
          id: `chunk-${chunkIndex}`,
          content: currentChunk.trim(),
          startPosition: startSentence,
          endPosition: i,
          chunkIndex,
          wordCount: currentWordCount,
          characterCount: currentChunk.length,
          metadata: {
            sourceDocument: "input-text",
            chunkingMethod: "semantic-based",
            overlap,
            createdAt: new Date().toISOString()
          }
        });
        
        chunkIndex++;
        
        // Calculate overlap based on semantic similarity (simplified)
        const overlapSentences = Math.floor(overlap / 25);
        const newStart = Math.max(startSentence, i - overlapSentences);
        currentChunk = sentences.slice(newStart, i + 1).join('. ') + '.';
        currentWordCount = currentChunk.split(/\s+/).length;
        startSentence = newStart;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
        currentWordCount += sentenceWords;
      }
    }
    
    if (currentChunk) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        startPosition: startSentence,
        endPosition: sentences.length,
        chunkIndex,
        wordCount: currentWordCount,
        characterCount: currentChunk.length,
        metadata: {
          sourceDocument: "input-text",
          chunkingMethod: "semantic-based",
          overlap,
          createdAt: new Date().toISOString()
        }
      });
    }
    
    return chunks;
  };

  const processDocument = async () => {
    if (!inputText.trim()) {
      toast.error("Please provide text to process");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    const startTime = Date.now();

    try {
      // Step 1: Text chunking
      setProcessingProgress(20);
      const chunks = chunkText(inputText, chunkingMethod, chunkSize, chunkOverlap);
      
      // Step 2: Generate embeddings
      const chunksWithEmbeddings: DocumentChunk[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        setProcessingProgress(20 + (60 * (i + 1)) / chunks.length);
        const embedding = await mockEmbeddingGeneration(chunks[i].content);
        chunksWithEmbeddings.push({
          ...chunks[i],
          embedding
        });
      }

      // Step 3: Calculate statistics
      setProcessingProgress(90);
      const totalWords = chunksWithEmbeddings.reduce((sum, chunk) => sum + chunk.wordCount, 0);
      const totalCharacters = chunksWithEmbeddings.reduce((sum, chunk) => sum + chunk.characterCount, 0);
      const averageChunkSize = totalWords / chunksWithEmbeddings.length;
      const processingTime = (Date.now() - startTime) / 1000;

      const result: ProcessingResult = {
        chunks: chunksWithEmbeddings,
        totalChunks: chunksWithEmbeddings.length,
        totalWords,
        totalCharacters,
        averageChunkSize,
        processingTime,
        embeddingModel,
        chunkingStrategy: chunkingMethod
      };

      setProcessingProgress(100);
      setProcessingResult(result);
      onProcessingComplete?.(result);
      toast.success(`Successfully processed ${result.totalChunks} chunks`);

    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to process document");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleText = (sampleKey: string) => {
    setInputText(sampleTexts[sampleKey as keyof typeof sampleTexts]);
    toast.success("Sample text loaded");
  };

  const copyChunk = (chunk: DocumentChunk) => {
    navigator.clipboard.writeText(chunk.content);
    toast.success("Chunk copied to clipboard");
  };

  const exportResults = () => {
    if (!processingResult) return;
    
    const data = {
      metadata: {
        totalChunks: processingResult.totalChunks,
        totalWords: processingResult.totalWords,
        totalCharacters: processingResult.totalCharacters,
        averageChunkSize: processingResult.averageChunkSize,
        processingTime: processingResult.processingTime,
        embeddingModel: processingResult.embeddingModel,
        chunkingStrategy: processingResult.chunkingStrategy,
        chunkSize,
        chunkOverlap,
        exportedAt: new Date().toISOString()
      },
      chunks: processingResult.chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        wordCount: chunk.wordCount,
        characterCount: chunk.characterCount,
        startPosition: chunk.startPosition,
        endPosition: chunk.endPosition,
        embeddingDimensions: chunk.embedding?.length || 0,
        metadata: chunk.metadata
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-chunks-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Processing results exported");
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Text className="w-5 h-5" />
              Input Text
            </CardTitle>
            <CardDescription>
              Provide the text content to be processed and chunked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Sample Texts</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadSampleText("research-paper")}
                >
                  Research Paper
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadSampleText("technical-docs")}
                >
                  Technical Docs
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadSampleText("story")}
                >
                  Story/Narrative
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="input-text">Text Content</Label>
              <Textarea
                id="input-text"
                placeholder="Paste your text content here or use a sample above..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-48 font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground">
                {inputText ? `${inputText.split(/\s+/).length} words, ${inputText.length} characters` : "No text provided"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cube className="w-5 h-5" />
              Processing Configuration
            </CardTitle>
            <CardDescription>
              Configure chunking and embedding parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chunk-size">Chunk Size (tokens)</Label>
                <Input
                  id="chunk-size"
                  type="number"
                  min="50"
                  max="2048"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value) || 512)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chunk-overlap">Overlap (tokens)</Label>
                <Input
                  id="chunk-overlap"
                  type="number"
                  min="0"
                  max="200"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 50)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chunking-method">Chunking Strategy</Label>
              <Select value={chunkingMethod} onValueChange={setChunkingMethod}>
                <SelectTrigger id="chunking-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token-based">Token-based</SelectItem>
                  <SelectItem value="sentence-based">Sentence-based</SelectItem>
                  <SelectItem value="paragraph-based">Paragraph-based</SelectItem>
                  <SelectItem value="semantic-based">Semantic-based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="embedding-model">Embedding Model</Label>
              <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                <SelectTrigger id="embedding-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-embedding-ada-002">OpenAI Ada-002 (1536d)</SelectItem>
                  <SelectItem value="sentence-transformers">Sentence Transformers (768d)</SelectItem>
                  <SelectItem value="cohere-embed">Cohere Embed (384d)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{processingProgress.toFixed(0)}%</span>
                </div>
                <Progress value={processingProgress} />
              </div>
            )}

            <Button 
              onClick={processDocument} 
              disabled={!inputText.trim() || isProcessing}
              className="w-full"
            >
              <Lightning className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Process Document"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {processingResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Processing Results
              </span>
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </CardTitle>
            <CardDescription>
              Document successfully processed into {processingResult.totalChunks} chunks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chunks">Chunks ({processingResult.totalChunks})</TabsTrigger>
                <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary">{processingResult.totalChunks}</div>
                      <div className="text-xs text-muted-foreground">Total Chunks</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary">{processingResult.totalWords}</div>
                      <div className="text-xs text-muted-foreground">Total Words</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary">{Math.round(processingResult.averageChunkSize)}</div>
                      <div className="text-xs text-muted-foreground">Avg Chunk Size</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary">{processingResult.processingTime.toFixed(2)}s</div>
                      <div className="text-xs text-muted-foreground">Processing Time</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Processing Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Chunking Strategy:</span>
                        <Badge variant="outline">{processingResult.chunkingStrategy}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Embedding Model:</span>
                        <Badge variant="outline">{processingResult.embeddingModel}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Chunk Size:</span>
                        <span className="text-sm text-muted-foreground">{chunkSize} tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Overlap:</span>
                        <span className="text-sm text-muted-foreground">{chunkOverlap} tokens</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Chunk Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Min Chunk Size:</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.min(...processingResult.chunks.map(c => c.wordCount))} words
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Max Chunk Size:</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.max(...processingResult.chunks.map(c => c.wordCount))} words
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Characters:</span>
                        <span className="text-sm text-muted-foreground">{processingResult.totalCharacters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Embedding Dimensions:</span>
                        <span className="text-sm text-muted-foreground">
                          {processingResult.chunks[0]?.embedding?.length || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Success:</strong> Document has been successfully processed into {processingResult.totalChunks} chunks 
                    with {processingResult.chunks[0]?.embedding?.length || 0}-dimensional embeddings. 
                    The chunks are ready for semantic search and retrieval operations.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="chunks" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Chunk List</CardTitle>
                      <CardDescription>
                        Click on a chunk to view its details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {processingResult.chunks.map((chunk, index) => (
                            <Card 
                              key={chunk.id}
                              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                selectedChunk?.id === chunk.id ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => setSelectedChunk(chunk)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">Chunk {index + 1}</Badge>
                                  <div className="text-xs text-muted-foreground">
                                    {chunk.wordCount} words
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {chunk.content.substring(0, 100)}...
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Chunk Details
                        {selectedChunk && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyChunk(selectedChunk)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedChunk ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Chunk Index</div>
                              <div className="text-muted-foreground">{selectedChunk.chunkIndex}</div>
                            </div>
                            <div>
                              <div className="font-medium">Word Count</div>
                              <div className="text-muted-foreground">{selectedChunk.wordCount}</div>
                            </div>
                            <div>
                              <div className="font-medium">Character Count</div>
                              <div className="text-muted-foreground">{selectedChunk.characterCount}</div>
                            </div>
                            <div>
                              <div className="font-medium">Position</div>
                              <div className="text-muted-foreground">
                                {selectedChunk.startPosition}-{selectedChunk.endPosition}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="font-medium">Content</div>
                            <ScrollArea className="h-64">
                              <div className="p-3 bg-muted rounded-lg text-sm leading-relaxed">
                                {selectedChunk.content}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                          <div className="text-center">
                            <FileText className="w-8 h-8 mx-auto mb-2" />
                            <p>Select a chunk to view its details</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="embeddings" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Embedding Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Model:</span>
                          <Badge variant="outline">{processingResult.embeddingModel}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Dimensions:</span>
                          <span className="text-sm text-muted-foreground">
                            {processingResult.chunks[0]?.embedding?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Embeddings:</span>
                          <span className="text-sm text-muted-foreground">
                            {processingResult.totalChunks}
                          </span>
                        </div>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Embeddings are high-dimensional vector representations that capture semantic meaning. 
                          They enable similarity search and clustering of text chunks.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sample Embedding</CardTitle>
                      <CardDescription>
                        First 20 dimensions of chunk 1 embedding
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {processingResult.chunks[0]?.embedding && (
                        <div className="space-y-2">
                          <div className="text-xs font-mono bg-muted p-2 rounded">
                            {processingResult.chunks[0].embedding.slice(0, 20).map((val, i) => (
                              <div key={i} className="flex justify-between">
                                <span>[{i}]</span>
                                <span>{val.toFixed(6)}</span>
                              </div>
                            ))}
                            {processingResult.chunks[0].embedding.length > 20 && (
                              <div className="text-center text-muted-foreground">
                                ... {processingResult.chunks[0].embedding.length - 20} more dimensions
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}