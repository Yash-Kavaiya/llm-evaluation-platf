import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar, Upload, Function as FunctionIcon, Shield, MagnifyingGlass, TrendUp, GithubLogo, LinkedinLogo, TwitterLogo, Article } from "@phosphor-icons/react";
import { Toaster } from "@/components/ui/sonner";
import ManualEvaluation from "@/components/ManualEvaluation";
import BulkEvaluation from "@/components/BulkEvaluation";
import CustomMetricBuilder from "@/components/CustomMetricBuilder";
import ResponsibleAI from "@/components/ResponsibleAI";
import RAGPlayground from "@/components/RAGPlayground";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";

function App() {
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChartBar className="w-8 h-8 text-primary" weight="bold" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">LLM Evaluation Platform</h1>
                <p className="text-sm text-muted-foreground">Comprehensive assessment of language model outputs</p>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/Yash-Kavaiya" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                title="GitHub Profile"
              >
                <GithubLogo className="w-5 h-5 text-secondary-foreground" />
              </a>
              <a 
                href="https://www.linkedin.com/in/yashkavaiya/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                title="LinkedIn Profile"
              >
                <LinkedinLogo className="w-5 h-5 text-secondary-foreground" />
              </a>
              <a 
                href="https://x.com/Yash_Kavaiya_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                title="Twitter Profile"
              >
                <TwitterLogo className="w-5 h-5 text-secondary-foreground" />
              </a>
              <a 
                href="https://medium.com/@yash.kavaiya3" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                title="Medium Articles"
              >
                <Article className="w-5 h-5 text-secondary-foreground" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-5xl grid-cols-6">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <ChartBar className="w-4 h-4" />
              Manual Evaluation
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Bulk Processing
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <FunctionIcon className="w-4 h-4" />
              Custom Metrics
            </TabsTrigger>
            <TabsTrigger value="responsible" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Responsible AI
            </TabsTrigger>
            <TabsTrigger value="rag" className="flex items-center gap-2">
              <MagnifyingGlass className="w-4 h-4" />
              RAG Playground
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Single Entry Evaluation</CardTitle>
                <CardDescription>
                  Evaluate individual model outputs with comprehensive metrics and manual scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ManualEvaluation />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk CSV Processing</CardTitle>
                <CardDescription>
                  Upload and evaluate multiple prompt-response pairs for comprehensive analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkEvaluation />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Metric Builder</CardTitle>
                <CardDescription>
                  Create domain-specific evaluation metrics with custom formulas and mathematical expressions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomMetricBuilder />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responsible" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Responsible AI Assessment</CardTitle>
                <CardDescription>
                  Evaluate AI systems for bias, fairness, toxicity, and ethical considerations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsibleAI />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rag" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>RAG Playground</CardTitle>
                <CardDescription>
                  Test and evaluate Retrieval-Augmented Generation systems with context and retrieval analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RAGPlayground />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive insights into evaluation trends, model performance comparisons, and historical tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;