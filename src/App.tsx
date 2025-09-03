import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar, Upload, Function as FunctionIcon } from "@phosphor-icons/react";
import { Toaster } from "@/components/ui/sonner";
import ManualEvaluation from "@/components/ManualEvaluation";
import BulkEvaluation from "@/components/BulkEvaluation";
import CustomMetricBuilder from "@/components/CustomMetricBuilder";

function App() {
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <ChartBar className="w-8 h-8 text-primary" weight="bold" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">LLM Evaluation Platform</h1>
              <p className="text-sm text-muted-foreground">Comprehensive assessment of language model outputs</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
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
        </Tabs>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;