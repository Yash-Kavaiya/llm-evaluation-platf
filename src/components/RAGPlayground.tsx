import { useState, useRef } from "react";
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
  Ranking,
  Upload,
  File,
  FilePdf,
  FileText,
  Trash,
  Plus,
  CubeTransparent,
  Scissors
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from '@github/spark/hooks';
import DocumentProcessor, { type DocumentChunk, type ProcessingResult } from "./DocumentProcessor";

interface Document {
  id: string;
  title: string;
  content: string;
  relevance_score: number;
  source: string;
  embedding?: number[];
  chunk_index?: number;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadDate: string;
  chunks?: DocumentChunk[];
  processingResult?: ProcessingResult;
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
  const [uploadedFiles, setUploadedFiles] = useKV<UploadedFile[]>("rag-uploaded-files", []);
  const [processedChunks, setProcessedChunks] = useKV<DocumentChunk[]>("rag-processed-chunks", []);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("query");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle document processing completion
  const handleProcessingComplete = (result: ProcessingResult) => {
    setProcessedChunks(currentChunks => [...currentChunks, ...result.chunks]);
    toast.success(`Added ${result.chunks.length} processed chunks to knowledge base`);
  };

  // Calculate semantic similarity between query and chunk embeddings
  const calculateSimilarity = (queryEmbedding: number[], chunkEmbedding: number[]): number => {
    if (!queryEmbedding || !chunkEmbedding || queryEmbedding.length !== chunkEmbedding.length) {
      return Math.random() * 0.6 + 0.4; // Fallback random score
    }
    
    // Cosine similarity calculation
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < queryEmbedding.length; i++) {
      dotProduct += queryEmbedding[i] * chunkEmbedding[i];
      normA += queryEmbedding[i] * queryEmbedding[i];
      normB += chunkEmbedding[i] * chunkEmbedding[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  // Mock query embedding generation
  const generateQueryEmbedding = async (query: string): Promise<number[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Generate mock embedding (in real implementation, this would call an embedding API)
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  };
  // File upload handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      const newFiles: UploadedFile[] = [];
      
      for (const file of files) {
        // Check file type
        const allowedTypes = [
          'text/plain',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/markdown',
          'text/csv'
        ];
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|md|pdf|doc|docx|csv)$/i)) {
          toast.error(`Unsupported file type: ${file.name}`);
          continue;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File too large: ${file.name} (max 10MB)`);
          continue;
        }

        let content = '';
        
        // Process file based on type
        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
          content = await file.text();
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          // For PDF files, we'll extract a mock content for demo purposes
          // In a real implementation, you'd use a PDF parsing library
          content = `[PDF Content] This is extracted text from the PDF file: ${file.name}. The document contains ${Math.floor(file.size / 1000)} KB of content that would be processed by a PDF parser in a production environment. This could include technical documentation, research papers, or business documents with structured information.`;
        } else if (file.type.includes('word') || file.name.match(/\.(doc|docx)$/i)) {
          // For Word documents, we'll extract a mock content for demo purposes
          // In a real implementation, you'd use a document parsing library
          content = `[Word Document] This is extracted text from the Word document: ${file.name}. The document contains ${Math.floor(file.size / 1000)} KB of content that would be processed by a document parser in a production environment. This might include formatted text, tables, images, and other document elements.`;
        }

        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          content: content,
          uploadDate: new Date().toISOString()
        };

        newFiles.push(uploadedFile);
      }

      if (newFiles.length > 0) {
        setUploadedFiles(currentFiles => [...currentFiles, ...newFiles]);
        toast.success(`Successfully uploaded ${newFiles.length} file(s). Use the Document Processor tab to chunk and embed them.`);
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(currentFiles => currentFiles.filter(file => file.id !== fileId));
    toast.success('File removed from knowledge base');
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return <FilePdf className="w-4 h-4 text-red-600" />;
    } else if (fileType.includes('word') || fileName.match(/\.(doc|docx)$/i)) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    } else {
      return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
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

  // Combine sample docs with uploaded files and processed chunks for retrieval
  const getAllDocuments = () => {
    const uploadedDocs = uploadedFiles.map(file => ({
      id: file.id,
      title: file.name,
      content: file.content,
      source: "Uploaded File"
    }));
    
    const processedDocs = processedChunks.map(chunk => ({
      id: chunk.id,
      title: `${chunk.metadata.sourceDocument} - Chunk ${chunk.chunkIndex + 1}`,
      content: chunk.content,
      source: "Processed Chunk",
      embedding: chunk.embedding,
      chunk_index: chunk.chunkIndex
    }));
    
    return [...sampleDocs, ...uploadedDocs, ...processedDocs];
  };

  const mockRAGProcess = async () => {
    setIsProcessing(true);
    
    // Simulate retrieval and generation delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Get all available documents (sample + uploaded + processed chunks)
    const allDocs = getAllDocuments();
    
    // Generate query embedding for semantic similarity
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Enhanced document retrieval with embedding similarity
    const retrievedDocs = allDocs
      .map(doc => {
        let relevance_score;
        
        if (doc.embedding && retrievalMethod === "semantic") {
          // Use actual embedding similarity for processed chunks
          relevance_score = calculateSimilarity(queryEmbedding, doc.embedding);
        } else if (retrievalMethod === "keyword") {
          // Simple keyword matching
          const queryWords = query.toLowerCase().split(/\s+/);
          const docWords = doc.content.toLowerCase();
          const matches = queryWords.filter(word => docWords.includes(word)).length;
          relevance_score = Math.min(matches / queryWords.length, 1.0);
        } else if (retrievalMethod === "hybrid") {
          // Combine semantic and keyword scores
          const semanticScore = doc.embedding ? 
            calculateSimilarity(queryEmbedding, doc.embedding) : 
            Math.random() * 0.6 + 0.3;
          
          const queryWords = query.toLowerCase().split(/\s+/);
          const docWords = doc.content.toLowerCase();
          const matches = queryWords.filter(word => docWords.includes(word)).length;
          const keywordScore = Math.min(matches / queryWords.length, 1.0);
          
          relevance_score = (semanticScore * 0.7) + (keywordScore * 0.3);
        } else {
          // Default scoring for dense retrieval or fallback
          relevance_score = Math.random() * 0.6 + 0.4;
        }
        
        return {
          ...doc,
          relevance_score: Math.max(0, Math.min(1, relevance_score))
        };
      })
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, topK);
    
    // Enhanced answer generation based on retrieval method and chunk information
    let answerContent = "";
    const hasProcessedChunks = retrievedDocs.some(doc => doc.source === "Processed Chunk");
    
    if (hasProcessedChunks) {
      answerContent = `Based on analysis of ${allDocs.length} documents (including ${processedChunks.length} processed chunks with embeddings), `;
    } else {
      answerContent = `Based on the retrieved context from ${allDocs.length} documents (including ${uploadedFiles.length} uploaded files), `;
    }
    
    if (query.toLowerCase().includes('machine learning')) {
      answerContent += 'machine learning is a powerful subset of AI that enables systems to learn from data without explicit programming. It uses algorithms to identify patterns and make predictions, with applications spanning from recommendation systems to autonomous vehicles.';
    } else if (query.toLowerCase().includes('neural')) {
      answerContent += 'neural networks are computational models inspired by the human brain, consisting of interconnected nodes that process information through weighted connections. They form the foundation of deep learning systems.';
    } else if (query.toLowerCase().includes('transformer')) {
      answerContent += 'transformers represent a breakthrough architecture in natural language processing, using self-attention mechanisms to process sequential data efficiently. They enable parallel processing and have revolutionized language models.';
    } else {
      answerContent += 'the concept you\'re asking about relates to modern AI systems that process and understand information through sophisticated mathematical models and algorithms, leveraging the retrieved knowledge base for contextual understanding.';
    }
    
    const mockResult: RAGResult = {
      answer: answerContent,
      confidence: 0.87 + (hasProcessedChunks ? 0.08 : 0), // Higher confidence with processed chunks
      retrieved_docs: retrievedDocs,
      context_relevance: 0.82 + (retrievalMethod === "semantic" ? 0.1 : 0),
      answer_faithfulness: 0.89 + (hasProcessedChunks ? 0.06 : 0),
      answer_relevance: 0.85 + (retrievalMethod === "hybrid" ? 0.08 : 0),
      retrieval_precision: 0.78 + (hasProcessedChunks ? 0.12 : 0),
      retrieval_recall: 0.73 + (hasProcessedChunks ? 0.15 : 0)
    };
    
    setRAGResult(mockResult);
    setDocuments(retrievedDocs);
    setIsProcessing(false);
    toast.success("RAG analysis completed with enhanced retrieval");
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
      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="query" className="flex items-center gap-2">
            <MagnifyingGlass className="w-4 h-4" />
            RAG Query
          </TabsTrigger>
          <TabsTrigger value="processor" className="flex items-center gap-2">
            <CubeTransparent className="w-4 h-4" />
            Document Processor
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-6">
          {/* Query Configuration */}
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

                <div className="space-y-2">
                  <Label htmlFor="context-input">Additional Context (Optional)</Label>
                  <Textarea
                    id="context-input"
                    placeholder="Provide additional context or domain-specific information..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="min-h-20"
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
                  {getAllDocuments().length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Knowledge base: {getAllDocuments().length} documents ({uploadedFiles.length} uploaded, {processedChunks.length} processed chunks)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Quick File Upload
                </CardTitle>
                <CardDescription>
                  Upload documents directly (then process them in the Document Processor tab)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Section */}
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".txt,.pdf,.doc,.docx,.md,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload documents to expand your knowledge base
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Supports: TXT, PDF, DOC, DOCX, MD, CSV (max 10MB each)
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isUploading ? "Uploading..." : "Choose Files"}
                    </Button>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Recent Uploads ({uploadedFiles.length})</Label>
                    <ScrollArea className="h-32 w-full rounded border">
                      <div className="p-2 space-y-2">
                        {uploadedFiles.slice(-3).map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 bg-muted rounded-md"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {getFileIcon(file.name, file.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => removeFile(file.id)}
                              variant="ghost"
                              size="sm"
                              className="shrink-0"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {uploadedFiles.length > 3 && (
                          <div className="text-xs text-center text-muted-foreground py-1">
                            +{uploadedFiles.length - 3} more files...
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <Alert>
                  <Scissors className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> For better retrieval accuracy, process your uploaded files 
                    into chunks with embeddings using the Document Processor tab.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="processor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CubeTransparent className="w-5 h-5" />
                Document Preprocessing
              </CardTitle>
              <CardDescription>
                Process documents with advanced chunking strategies and embedding generation for improved retrieval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentProcessor onProcessingComplete={handleProcessingComplete} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Knowledge Base Overview
                </CardTitle>
                <CardDescription>
                  Comprehensive view of your knowledge base components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{sampleDocs.length}</div>
                    <div className="text-xs text-muted-foreground">Sample Docs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{uploadedFiles.length}</div>
                    <div className="text-xs text-muted-foreground">Uploaded Files</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{processedChunks.length}</div>
                    <div className="text-xs text-muted-foreground">Processed Chunks</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Documents:</span>
                    <span className="font-medium">{getAllDocuments().length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>With Embeddings:</span>
                    <span className="font-medium">{processedChunks.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Words:</span>
                    <span className="font-medium">
                      {processedChunks.reduce((sum, chunk) => sum + chunk.wordCount, 0) + 
                       uploadedFiles.reduce((sum, file) => sum + file.content.split(/\s+/).length, 0) + 
                       sampleDocs.reduce((sum, doc) => sum + doc.content.split(/\s+/).length, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processed Chunks Summary</CardTitle>
                <CardDescription>
                  Overview of your document chunks with embeddings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processedChunks.length > 0 ? (
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {processedChunks.slice(0, 10).map((chunk, index) => (
                        <div key={chunk.id} className="p-2 bg-muted rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              Chunk {chunk.chunkIndex + 1}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {chunk.wordCount} words
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {chunk.content.substring(0, 80)}...
                          </p>
                        </div>
                      ))}
                      {processedChunks.length > 10 && (
                        <div className="text-xs text-center text-muted-foreground py-2">
                          +{processedChunks.length - 10} more chunks...
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CubeTransparent className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No processed chunks yet</p>
                    <p className="text-xs">Use the Document Processor to create chunks with embeddings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
                            {doc.source === "Processed Chunk" && (
                              <Badge variant="secondary" className="text-xs">
                                <CubeTransparent className="w-3 h-3 mr-1" />
                                Embedded
                              </Badge>
                            )}
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
                          <div className="flex items-center gap-3">
                            {doc.chunk_index !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                Chunk: {doc.chunk_index + 1}
                              </span>
                            )}
                            {doc.embedding && (
                              <span className="text-xs text-muted-foreground">
                                Embedding: {doc.embedding.length}d
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <Ranking className="w-3 h-3" />
                              <span className="text-xs">Score: {doc.relevance_score.toFixed(3)}</span>
                            </div>
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
                    {processedChunks.length > 0 && ' Enhanced performance detected with processed chunks and embeddings. '}
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