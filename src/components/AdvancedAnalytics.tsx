import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigge
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
  Downloa
  Target,
  Award,
} from "@pho
interface Eva
  timestamp: 
  prompt: s
  metrics
  Download,
  RefreshCw,
  Target,
  Zap,
  Award,
  Database
} from "@phosphor-icons/react";

interface EvaluationRecord {
  id: string;
  timestamp: number;
  modelName: string;
  prompt: string;
  response: string;
  metrics: {
    relevance: number;
    accuracy: number;
    coherence: number;
    helpfulness: number;
    harmlessness: number;
    
  overallScore: number;
  category?: string;
  evaluationType: 'manual' | 'bulk' | 'rag' | 'responsible';
 

interface TrendData {
  date: string;
  const [selecte
  count: number;
}

  const filteredData = useM
  modelName: string;
  avgScore: number;
  totalEvaluations: number;
      const 
    relevance: number;
    accuracy: number;
    coherence: number;
    helpfulness: number;
    harmlessness: number;
  //
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export default function AdvancedAnalytics() {
  const [evaluationHistory] = useKV<EvaluationRecord[]>("evaluation-history", []);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeMetric, setActiveMetric] = useState("overallScore");
  const [hasDemoData, setHasDemoData] = useState(false);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    const days = parseInt(selectedTimeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return evaluationHistory.filter(record => {
  }, [filteredData, selectedTimeRange]);
      const timeMatch = recordDate >= cutoffDate;
      const modelMatch = selectedModel === "all" || record.modelName === selectedModel;
      const categoryMatch = selectedCategory === "all" || record.category === selectedCategory;
      
      return timeMatch && modelMatch && categoryMatch;
      }
  }, [evaluationHistory, selectedTimeRange, selectedModel, selectedCategory]);

  // Calculate trend data for charts
  const trendData = useMemo(() => {
    const days = parseInt(selectedTimeRange);
    const dailyData: { [key: string]: { scores: number[], count: number } } = {};
    
    // Initialize days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = { scores: [], count: 0 };
     

    // Populate with actual data
    filteredData.forEach(record => {
      const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
      if (dailyData[recordDate]) {
        dailyData[recordDate].scores.push(record.overallScore);
        dailyData[recordDate].count++;

    });

    // Convert to trend format
    return Object.entries(dailyData)
      .map(([date, data]) => ({
    }).sort((
        score: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
  // Get unique values fo
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredData, selectedTimeRange]);

  // Calculate model comparisons
  const modelComparisons = useMemo(() => {
    const modelStats: { [key: string]: EvaluationRecord[] } = {};
  //
    filteredData.forEach(record => {
      if (!modelStats[record.modelName]) {
        modelStats[record.modelName] = [];
    }
      modelStats[record.modelName].push(record);
    con

    return Object.entries(modelStats).map(([modelName, records]) => {
      const avgScore = records.reduce((sum, r) => sum + r.overallScore, 0) / records.length;
    co
      // Calculate average metrics
    if (firstQuarter.lengt
        relevance: records.reduce((sum, r) => sum + r.metrics.relevance, 0) / records.length,
        accuracy: records.reduce((sum, r) => sum + r.metrics.accuracy, 0) / records.length,
        coherence: records.reduce((sum, r) => sum + r.metrics.coherence, 0) / records.length,
        helpfulness: records.reduce((sum, r) => sum + r.metrics.helpfulness, 0) / records.length,
        harmlessness: records.reduce((sum, r) => sum + r.metrics.harmlessness, 0) / records.length,
      };

      // Calculate trend (simple comparison of last 50% vs first 50%)
      const midPoint = Math.floor(records.length / 2);
      const firstHalf = records.slice(0, midPoint);
      const secondHalf = records.slice(midPoint);
    
      let trend: 'up' | 'down' | 'stable' = 'stable';
      demoData.push({
      
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, r) => sum + r.overallScore, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, r) => sum + r.overallScore, 0) / secondHalf.length;
        trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        if (Math.abs(trendPercentage) > 2) {
          trend = trendPercentage > 0 ? 'up' : 'down';
        }
       

    
        modelName,
  };
        totalEvaluations: records.length,
        metrics: avgMetrics,
        trend,
        `"${record.modelName}","${new Date(record.
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
  }, [filteredData]);

  // Get unique values for filters
  const uniqueModels = useMemo(() => {
    return Array.from(new Set(evaluationHistory.map(r => r.modelName)));
  };

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(evaluationHistory.map(r => r.category).filter(Boolean)));
  const { totalEvaluations

    <div className="space-y-6">
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalEvaluations: 0,
        avgScore: 0,
            <Button onCl
        improvementRate: 0
        
    }

    const avgScore = filteredData.reduce((sum, r) => sum + r.overallScore, 0) / filteredData.length;
    const topModel = modelComparisons[0]?.modelName || "N/A";
    
    // Calculate improvement rate (comparing last 25% vs first 25%)
    const quarterPoint = Math.floor(filteredData.length / 4);
    const sortedByTime = [...filteredData].sort((a, b) => a.timestamp - b.timestamp);
    const firstQuarter = sortedByTime.slice(0, quarterPoint);
    const lastQuarter = sortedByTime.slice(-quarterPoint);
    

    if (firstQuarter.length > 0 && lastQuarter.length > 0) {
      const firstAvg = firstQuarter.reduce((sum, r) => sum + r.overallScore, 0) / firstQuarter.length;
      const lastAvg = lastQuarter.reduce((sum, r) => sum + r.overallScore, 0) / lastQuarter.length;
                  <SelectContent>
    }

    return {
                </Select>
      avgScore,
              {
      improvementRate
      
  }, [filteredData, modelComparisons]);

  const generateDemoData = () => {
    const demoData: EvaluationRecord[] = [];
    const models = ["GPT-4", "Claude-3", "Gemini Pro", "Llama-2"];
    const categories = ["General", "Technical", "Creative", "Analysis"];
    
            <div className="flex g
      const timestamp = Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
                  <Da
        id: `demo-${i}`,
        timestamp,
        modelName: models[Math.floor(Math.random() * models.length)],
                Export
        response: `Demo response ${i + 1}`,
                <R
          relevance: Math.random() * 10,
          accuracy: Math.random() * 10,
          coherence: Math.random() * 10,
          {/* Summary Cards */}
          harmlessness: Math.random() * 10,
          
        overallScore: Math.random() * 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        evaluationType: 'manual' as const
         
    }
    
    setHasDemoData(true);
              <CardContent className="p-6">
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Model,Timestamp,Prompt,Response,Relevance,Accuracy,Coherence,Helpfulness,Harmlessness,Overall Score\n" +
            </Card>
        `"${record.modelName}","${new Date(record.timestamp).toISOString()}","${record.prompt}","${record.response}",${record.metrics.relevance},${record.metrics.accuracy},${record.metrics.coherence},${record.metrics.helpfulness},${record.metrics.harmlessness},${record.overallScore}`
              <Card
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
                  <Award className="w-8 h-
    link.setAttribute("download", "evaluation_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
                    <p className="text-sm font-me
  };

  const refreshData = () => {
    toast.success("Data refreshed!");
  };

  const { totalEvaluations } = summaryStats;

  return (
            </Card>
      {evaluationHistory.length === 0 && !hasDemoData ? (
          {/* 
          <CardContent className="p-8 text-center">
              <TabsTrigger value="trends" className="flex items-center gap-2">
            <h3 className="text-xl font-semibold mb-2">No Evaluation Data</h3>
              </TabsTrigger>
              Start by performing evaluations in other tabs or generate demo data to explore analytics features.
                
            <Button onClick={generateDemoData}>
              Generate Demo Data
            </Button>
          </CardContent>
        </Card>
           
        <>
                  <CardDe
          <div className="flex flex-wrap gap-4 items-center justify-between">
                </CardHeader>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                            <sp
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              {uniqueModels.length > 0 && (
                                <div className="text-xs font-medium">
                  <SelectTrigger className="w-[180px]">
                              </div>
                  </SelectTrigger>
                        </div>
                    <SelectItem value="all">All Models</SelectItem>
                    {uniqueModels.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                       
                  </SelectContent>
                         
              )}

              {uniqueCategories.length > 0 && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                    )}
              )}
              </Ca

            <div className="flex gap-2">
              {!hasDemoData && totalEvaluations === 0 && (
                <Button variant="outline" size="sm" onClick={generateDemoData}>
                  <Database className="w-4 h-4 mr-2" />
                  Generate Demo Data
                </Button>
                
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
                       
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
                

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Evaluations</p>
                    <p className="text-3xl font-bold">{summaryStats.totalEvaluations}</p>
                        
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
                   

                  
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-3xl font-bold">{summaryStats.avgScore.toFixed(1)}</p>
                        
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
                   

                </
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Top Model</p>
                    <p className="text-xl font-bold">{summaryStats.topModel}</p>
                  </div>
                  <Award className="w-8 h-8 text-primary" />
                <CardC
              </CardContent>
                   

            <Card>
              <CardContent className="p-6">
                        <SelectItem value="relevance">Relevance</Se
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Improvement Rate</p>
                    <div className="flex items-center gap-2">
                    </Select>
                        {summaryStats.improvementRate > 0 ? '+' : ''}{summaryStats.improvementRate.toFixed(1)}%
                      <div
                      {summaryStats.improvementRate > 0 ? (
                        <TrendUp className="w-4 h-4 text-green-500" />
                      ) : summaryStats.improvementRate < 0 ? (
                        <TrendDown className="w-4 h-4 text-red-500" />
                      ) : null}
                          
                  </div>
                                return value >= rangeStart
                </div>
                            
            </Card>
                

                                
          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Models
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-6">
                    
                <CardHeader>
                  <CardTitle>Score Trends Over Time</CardTitle>
                  <CardDescription>
                    Track evaluation scores and volume trends across your selected time period
                  </CardDescription>
                             
                <CardContent>
                              { label: 'Max',
                    {trendData.length > 0 ? (
                                <p className="text
                        {/* Simple trend visualization */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Daily Average Scores</span>
                            <span>Range: 0-10</span>
                        No metri
                          <div className="grid grid-cols-7 gap-1 h-32">
                            {trendData.slice(-7).map((day, index) => (
                              <div key={index} className="flex flex-col justify-end items-center">
                                <div 
                                  className="w-full bg-primary rounded-t-sm min-h-[4px]"
                                  style={{ height: `${(day.score / 10) * 100}%` }}
                                />
                                <div className="text-xs text-muted-foreground mt-1 text-center">
                                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}

                                <div className="text-xs font-medium">
                                  {day.score.toFixed(1)}
                                </div>
                              </div>
                            ))}

                        </div>

                        {/* Evaluation volume */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Daily Evaluation Count</span>
                            <span>Total: {trendData.reduce((sum, day) => sum + day.count, 0)}</span>

                          <div className="grid grid-cols-7 gap-1 h-16">
                            {trendData.slice(-7).map((day, index) => {
                              const maxCount = Math.max(...trendData.map(d => d.count));

                                <div key={index} className="flex flex-col justify-end items-center">

                                    className="w-full bg-accent rounded-t-sm min-h-[2px]"
                                    style={{ height: maxCount > 0 ? `${(day.count / maxCount) * 100}%` : '2px' }}
                                  />
                                  <div className="text-xs font-medium mt-1">
                                    {day.count}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No evaluation data available for the selected time period
                      </div>
                    )}

                </CardContent>

            </TabsContent>

            <TabsContent value="models" className="space-y-6">

                <CardHeader>

                  <CardDescription>
                    Compare performance metrics across different language models
                  </CardDescription>
                </CardHeader>
                <CardContent>

                    {modelComparisons.length > 0 ? (
                      modelComparisons.map((model, index) => (
                        <div key={model.modelName} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                #{index + 1}
                              </Badge>
                              <h3 className="font-semibold">{model.modelName}</h3>
                              <Badge variant="outline">
                                {model.totalEvaluations} evaluations
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold">
                                {model.avgScore.toFixed(1)}
                              </span>
                              {model.trend !== 'stable' && (
                                <div className="flex items-center gap-1">
                                  {model.trend === 'up' ? (
                                    <TrendUp className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <TrendDown className="w-4 h-4 text-red-500" />

                                  <span className="text-sm text-muted-foreground">
                                    {model.trendPercentage.toFixed(1)}%
                                  </span>
                                </div>
                              )}

                          </div>
                          
                          <div className="grid grid-cols-5 gap-4 text-sm">
                            {Object.entries(model.metrics).map(([metric, value]) => (
                              <div key={metric} className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="capitalize text-muted-foreground">{metric}</span>
                                  <span className="font-medium">{value.toFixed(1)}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary rounded-full h-2 transition-all"
                                    style={{ width: `${(value / 10) * 100}%` }}

                                </div>

                            ))}

                        </div>

                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No model data available for comparison

                    )}

                </CardContent>

            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metric Distribution Analysis</CardTitle>
                  <CardDescription>
                    Analyze the distribution and performance of individual evaluation metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>

                    {/* Metric selector */}
                    <Select value={activeMetric} onValueChange={setActiveMetric}>
                      <SelectTrigger className="w-[200px]">

                      </SelectTrigger>

                        <SelectItem value="overallScore">Overall Score</SelectItem>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="accuracy">Accuracy</SelectItem>
                        <SelectItem value="coherence">Coherence</SelectItem>
                        <SelectItem value="helpfulness">Helpfulness</SelectItem>
                        <SelectItem value="harmlessness">Harmlessness</SelectItem>
                      </SelectContent>



                      <div className="space-y-4">

                        <div className="space-y-2">
                          <h4 className="font-medium">Score Distribution</h4>
                          <div className="grid grid-cols-10 gap-1 h-32">
                            {Array.from({ length: 10 }, (_, i) => {
                              const rangeStart = i;
                              const rangeEnd = i + 1;
                              const count = filteredData.filter(record => {
                                const value = activeMetric === 'overallScore' 
                                  ? record.overallScore 
                                  : record.metrics[activeMetric as keyof typeof record.metrics];
                                return value >= rangeStart && value < rangeEnd;

                              const maxCount = Math.max(...Array.from({ length: 10 }, (_, j) => {

                                const rEnd = j + 1;
                                return filteredData.filter(record => {
                                  const value = activeMetric === 'overallScore' 
                                    ? record.overallScore 
                                    : record.metrics[activeMetric as keyof typeof record.metrics];
                                  return value >= rStart && value < rEnd;
                                }).length;



                                <div key={i} className="flex flex-col justify-end items-center">

                                    className="w-full bg-secondary rounded-t-sm min-h-[4px]"
                                    style={{ height: maxCount > 0 ? `${(count / maxCount) * 100}%` : '4px' }}
                                  />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {rangeStart}
                                  </div>
                                  <div className="text-xs font-medium">
                                    {count}
                                  </div>
                                </div>
                              );

                          </div>



                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                            const values = filteredData.map(record => 
                              activeMetric === 'overallScore' 
                                ? record.overallScore 
                                : record.metrics[activeMetric as keyof typeof record.metrics]
                            );
                            const avg = values.reduce((a, b) => a + b, 0) / values.length;
                            const min = Math.min(...values);
                            const max = Math.max(...values);
                            const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];

                            return [
                              { label: 'Average', value: avg.toFixed(2) },
                              { label: 'Median', value: median.toFixed(2) },
                              { label: 'Min', value: min.toFixed(2) },
                              { label: 'Max', value: max.toFixed(2) }
                            ].map(stat => (
                              <div key={stat.label} className="text-center p-3 border rounded-lg">
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-xl font-bold">{stat.value}</p>
                              </div>
                            ));
                          })()}
                        </div>

                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No metric data available for analysis

                    )}

                </CardContent>

            </TabsContent>

        </>

    </div>

}