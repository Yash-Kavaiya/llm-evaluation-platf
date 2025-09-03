import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Download, Play, Pause, ArrowCounterClockwise, FileText, Folder } from "@phosphor-icons/react";
import { toast } from "sonner";

interface CSVData {
  headers: string[];
  rows: string[][];
}

interface ProcessingResults {
  totalRows: number;
  processedRows: number;
  results: Array<{
    question: string;
    answer: string;
    model?: string;
    metrics: Record<string, number>;
    frameworkMetrics?: {
      deepeval: Record<string, number>;
      mlflow: Record<string, number>;
      ragas: Record<string, number>;
      phoenix: Record<string, number>;
      deepchecks: Record<string, number>;
    };
    overallScore: number;
  }>;
}

const AUTOMATED_METRICS = [
  { id: "coherence", label: "Coherence Score" },
  { id: "fluency", label: "Fluency Score" },
  { id: "relevance", label: "Relevance Score" },
  { id: "semantic", label: "Semantic Similarity" },
  { id: "length", label: "Response Length" }
];

// CSV template URLs for download
const CSV_TEMPLATES = {
  basic: {
    name: "Basic Template",
    description: "Simple question and answer format",
    headers: ["Question", "Answer"],
    file: "/src/assets/templates/basic_template.csv",
    sampleRows: [
      ["What is machine learning?", "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed."],
      ["Explain photosynthesis", "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen using chlorophyll."],
      ["What causes seasons?", "Seasons are caused by Earth's axial tilt as it orbits the sun, resulting in varying amounts of sunlight reaching different regions throughout the year."]
    ]
  },
  extended: {
    name: "Extended Template",
    description: "Includes domain categorization and difficulty ratings",
    headers: ["Question", "Answer", "Model", "Reference_Answer", "Domain", "Difficulty", "Expected_Length"],
    file: "/src/assets/templates/extended_template.csv",
    sampleRows: [
      ["Write a function to implement binary search.", "Binary search implementation with O(log n) complexity", "GPT-4", "Reference implementation", "Programming", "Medium", "Short"]
    ]
  },
  withRatings: {
    name: "With Manual Ratings",
    description: "Pre-filled manual quality ratings for comprehensive evaluation",
    headers: ["Question", "Answer", "Model", "Reference_Answer", "Accuracy_Rating", "Completeness_Rating", "Clarity_Rating", "Creativity_Rating", "Helpfulness_Rating", "Safety_Rating"],
    file: "/src/assets/templates/with_ratings_template.csv",
    sampleRows: [
      ["Write a creative story about time travel.", "Creative time travel story with paradox elements", "GPT-4", "Reference story", "4", "4", "5", "5", "4", "5"]
    ]
  }
};

function BulkEvaluation() {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [columnMapping, setColumnMapping] = useState({
    question: "",
    answer: "",
    model: ""
  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["coherence", "fluency", "relevance"]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResults | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = (templateKey: keyof typeof CSV_TEMPLATES) => {
    const template = CSV_TEMPLATES[templateKey];
    
    // For file templates from assets, download directly
    if (template.file) {
      const a = document.createElement('a');
      a.href = template.file;
      a.download = `llm-evaluation-template-${templateKey}.csv`;
      a.click();
      toast.success(`${template.name} downloaded successfully`);
      return;
    }
    
    // For generated templates, create CSV content
    const csvContent = [
      template.headers.join(','),
      ...template.sampleRows.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `llm-evaluation-template-${templateKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`${template.name} downloaded successfully`);
  };

  const downloadAllTemplates = () => {
    Object.keys(CSV_TEMPLATES).forEach((key, index) => {
      setTimeout(() => {
        downloadTemplate(key as keyof typeof CSV_TEMPLATES);
      }, index * 500); // Stagger downloads
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV file must have at least a header and one data row");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      );

      setCsvData({ headers, rows });
      setColumnMapping({ question: "", answer: "", model: "" });
      toast.success(`Loaded ${rows.length} rows from CSV file`);
    };

    reader.readAsText(file);
  };

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const startProcessing = async () => {
    if (!csvData || !columnMapping.question || !columnMapping.answer) {
      toast.error("Please upload a CSV file and map the required columns");
      return;
    }

    if (selectedMetrics.length === 0) {
      toast.error("Please select at least one metric to calculate");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    setProgress(0);

    const questionIndex = csvData.headers.indexOf(columnMapping.question);
    const answerIndex = csvData.headers.indexOf(columnMapping.answer);
    const modelIndex = columnMapping.model ? csvData.headers.indexOf(columnMapping.model) : -1;

    const processedResults: ProcessingResults = {
      totalRows: csvData.rows.length,
      processedRows: 0,
      results: []
    };

    try {
      for (let i = 0; i < csvData.rows.length; i++) {
        if (isPaused) {
          toast.info("Processing paused");
          break;
        }

        const row = csvData.rows[i];
        const question = row[questionIndex] || "";
        const answer = row[answerIndex] || "";
        const model = modelIndex >= 0 ? row[modelIndex] : undefined;

        if (!question.trim() || !answer.trim()) {
          continue;
        }

        // Simulate comprehensive framework metric calculations
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate framework-specific results for each framework
        const generateFrameworkMetrics = (frameworkName: string, metrics: string[]) => {
          return metrics.reduce((acc, metric) => {
            acc[metric] = Math.random() * 0.3 + 0.6; // 0.6-0.9 range
            return acc;
          }, {} as Record<string, number>);
        };

        // Basic legacy metrics
        const basicMetrics = selectedMetrics.reduce((acc, metric) => {
          acc[metric] = Math.random() * 0.4 + 0.6; // Random score between 0.6-1.0
          return acc;
        }, {} as Record<string, number>);

        // DeepEval metrics
        const deepevalMetrics = generateFrameworkMetrics('DeepEval', [
          'g_eval', 'answer_relevancy', 'faithfulness', 'contextual_precision', 
          'hallucination', 'correctness', 'toxicity', 'bias'
        ]);

        // MLFlow metrics  
        const mlflowMetrics = generateFrameworkMetrics('MLFlow', [
          'answer_similarity', 'answer_correctness', 'answer_relevance', 'relevance', 'faithfulness'
        ]);

        // RAGAs metrics
        const ragasMetrics = generateFrameworkMetrics('RAGAs', [
          'faithful', 'answer_rel', 'context_rel', 'answer_sim', 'factual_cor', 'answer_cor'
        ]);

        // Phoenix metrics
        const phoenixMetrics = generateFrameworkMetrics('Phoenix', [
          'qa_correctness', 'hallucination', 'toxicity', 'retrieval_relevance'
        ]);

        // Deepchecks metrics
        const deepchecksMetrics = generateFrameworkMetrics('Deepchecks', [
          'relevance', 'grounded_in_context', 'fluency', 'coherence', 'toxicity', 
          'avoided_answer', 'sentiment', 'reading_ease', 'formality', 'safety_score'
        ]);

        // Calculate comprehensive overall score
        const allMetrics = [
          ...Object.values(basicMetrics),
          ...Object.values(deepevalMetrics),
          ...Object.values(mlflowMetrics),
          ...Object.values(ragasMetrics),
          ...Object.values(phoenixMetrics),
          ...Object.values(deepchecksMetrics)
        ];
        
        const overallScore = allMetrics.reduce((sum, score) => sum + score, 0) / allMetrics.length;

        processedResults.results.push({
          question,
          answer,
          model,
          metrics: basicMetrics,
          frameworkMetrics: {
            deepeval: deepevalMetrics,
            mlflow: mlflowMetrics,
            ragas: ragasMetrics,
            phoenix: phoenixMetrics,
            deepchecks: deepchecksMetrics
          },
          overallScore
        });

        processedResults.processedRows = i + 1;
        setProgress(((i + 1) / csvData.rows.length) * 100);
        setResults({ ...processedResults });
      }

      if (!isPaused) {
        toast.success(`Processing completed! Evaluated ${processedResults.results.length} entries`);
      }
    } catch (error) {
      toast.error("Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  const resetProcessing = () => {
    setIsProcessing(false);
    setIsPaused(false);
    setProgress(0);
    setResults(null);
  };

  const exportResults = () => {
    if (!results) return;

    // Create comprehensive headers including all framework metrics
    const frameworkHeaders = [
      // DeepEval
      'DeepEval_G_Eval', 'DeepEval_Answer_Relevancy', 'DeepEval_Faithfulness', 'DeepEval_Contextual_Precision',
      'DeepEval_Hallucination', 'DeepEval_Correctness', 'DeepEval_Toxicity', 'DeepEval_Bias',
      // MLFlow
      'MLFlow_Answer_Similarity', 'MLFlow_Answer_Correctness', 'MLFlow_Answer_Relevance', 'MLFlow_Relevance', 'MLFlow_Faithfulness',
      // RAGAs
      'RAGAs_Faithful', 'RAGAs_Answer_Rel', 'RAGAs_Context_Rel', 'RAGAs_Answer_Sim', 'RAGAs_Factual_Cor', 'RAGAs_Answer_Cor',
      // Phoenix
      'Phoenix_QA_Correctness', 'Phoenix_Hallucination', 'Phoenix_Toxicity', 'Phoenix_Retrieval_Relevance',
      // Deepchecks
      'Deepchecks_Relevance', 'Deepchecks_Grounded_Context', 'Deepchecks_Fluency', 'Deepchecks_Coherence',
      'Deepchecks_Toxicity', 'Deepchecks_Avoided_Answer', 'Deepchecks_Sentiment', 'Deepchecks_Reading_Ease',
      'Deepchecks_Formality', 'Deepchecks_Safety_Score'
    ];

    const csvContent = [
      ['Question', 'Answer', 'Model', ...selectedMetrics, ...frameworkHeaders, 'Overall Score'].join(','),
      ...results.results.map(result => {
        const frameworkValues = [];
        
        // Add framework metric values in order
        if (result.frameworkMetrics) {
          // DeepEval values
          ['g_eval', 'answer_relevancy', 'faithfulness', 'contextual_precision', 'hallucination', 'correctness', 'toxicity', 'bias']
            .forEach(metric => frameworkValues.push(result.frameworkMetrics?.deepeval[metric]?.toFixed(3) || "N/A"));
          
          // MLFlow values
          ['answer_similarity', 'answer_correctness', 'answer_relevance', 'relevance', 'faithfulness']
            .forEach(metric => frameworkValues.push(result.frameworkMetrics?.mlflow[metric]?.toFixed(3) || "N/A"));
          
          // RAGAs values
          ['faithful', 'answer_rel', 'context_rel', 'answer_sim', 'factual_cor', 'answer_cor']
            .forEach(metric => frameworkValues.push(result.frameworkMetrics?.ragas[metric]?.toFixed(3) || "N/A"));
          
          // Phoenix values
          ['qa_correctness', 'hallucination', 'toxicity', 'retrieval_relevance']
            .forEach(metric => frameworkValues.push(result.frameworkMetrics?.phoenix[metric]?.toFixed(3) || "N/A"));
          
          // Deepchecks values
          ['relevance', 'grounded_in_context', 'fluency', 'coherence', 'toxicity', 'avoided_answer', 'sentiment', 'reading_ease', 'formality', 'safety_score']
            .forEach(metric => frameworkValues.push(result.frameworkMetrics?.deepchecks[metric]?.toFixed(3) || "N/A"));
        } else {
          // Fill with N/A if no framework metrics
          frameworkValues.push(...Array(frameworkHeaders.length).fill("N/A"));
        }

        return [
          `"${result.question}"`,
          `"${result.answer}"`, 
          result.model || "N/A",
          ...selectedMetrics.map(metric => result.metrics[metric]?.toFixed(3) || "N/A"),
          ...frameworkValues,
          result.overallScore.toFixed(3)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive-evaluation-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Comprehensive results exported successfully with all framework metrics");
  };

  return (
    <div className="space-y-8">
      {/* CSV Templates */}
      <Card className="bg-accent/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-foreground" />
            CSV Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Download ready-to-use CSV templates with sample data to get started quickly
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAllTemplates}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(CSV_TEMPLATES).map(([key, template]) => (
                <Card key={key} className="border border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.headers.map(header => (
                        <Badge key={header} variant="outline" className="text-xs">
                          {header}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadTemplate(key as keyof typeof CSV_TEMPLATES)}
                      className="w-full flex items-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop your CSV file here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with your question-answer data for bulk evaluation
              </p>
              <p className="text-xs text-muted-foreground">
                Tip: Use our templates above if you need a starting format
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {csvData && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{csvData.rows.length} rows</Badge>
                <Badge variant="outline">{csvData.headers.length} columns</Badge>
              </div>
              
              {/* Preview */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {csvData.headers.slice(0, 5).map((header, i) => (
                        <TableHead key={i}>{header}</TableHead>
                      ))}
                      {csvData.headers.length > 5 && <TableHead>...</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.rows.slice(0, 3).map((row, i) => (
                      <TableRow key={i}>
                        {row.slice(0, 5).map((cell, j) => (
                          <TableCell key={j} className="max-w-[200px] truncate">
                            {cell}
                          </TableCell>
                        ))}
                        {row.length > 5 && <TableCell>...</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {csvData && (
        <>
          {/* Column Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Column Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Column *</label>
                  <Select value={columnMapping.question} onValueChange={(value) => 
                    setColumnMapping(prev => ({ ...prev, question: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {csvData.headers.map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Answer Column *</label>
                  <Select value={columnMapping.answer} onValueChange={(value) => 
                    setColumnMapping(prev => ({ ...prev, answer: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {csvData.headers.map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Model Column (Optional)</label>
                  <Select value={columnMapping.model} onValueChange={(value) => 
                    setColumnMapping(prev => ({ ...prev, model: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {csvData.headers.map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metric Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metric Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AUTOMATED_METRICS.map(metric => (
                  <div key={metric.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`bulk-${metric.id}`}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => handleMetricToggle(metric.id)}
                    />
                    <label htmlFor={`bulk-${metric.id}`} className="text-sm font-medium">
                      {metric.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Processing Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(isProcessing || results) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                  {results && (
                    <p className="text-sm text-muted-foreground">
                      Processed {results.processedRows} of {results.totalRows} rows
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                {!isProcessing && !results && (
                  <Button 
                    onClick={startProcessing}
                    disabled={!columnMapping.question || !columnMapping.answer || selectedMetrics.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Processing
                  </Button>
                )}

                {isProcessing && (
                  <Button onClick={pauseProcessing} variant="outline" className="flex items-center gap-2">
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                )}

                {(results || isPaused) && (
                  <Button onClick={resetProcessing} variant="outline" className="flex items-center gap-2">
                    <ArrowCounterClockwise className="w-4 h-4" />
                    Reset
                  </Button>
                )}

                {results && results.results.length > 0 && (
                  <Button onClick={exportResults} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Preview */}
          {results && results.results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Showing first 10 results. Export for complete data.
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                        {columnMapping.model && <TableHead>Model</TableHead>}
                        <TableHead>Overall Score</TableHead>
                        {selectedMetrics.map(metric => (
                          <TableHead key={metric}>
                            {AUTOMATED_METRICS.find(m => m.id === metric)?.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.results.slice(0, 10).map((result, i) => (
                        <TableRow key={i}>
                          <TableCell className="max-w-[200px] truncate">{result.question}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{result.answer}</TableCell>
                          {columnMapping.model && (
                            <TableCell>{result.model || "N/A"}</TableCell>
                          )}
                          <TableCell className="font-medium">
                            {(result.overallScore * 100).toFixed(1)}%
                          </TableCell>
                          {selectedMetrics.map(metric => (
                            <TableCell key={metric}>
                              {(result.metrics[metric] * 100).toFixed(1)}%
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default BulkEvaluation;