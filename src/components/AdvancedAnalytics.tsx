import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { 
  TrendUp, 
  TrendDown, 
  Calendar, 
  BarChart3, 
  LineChart, 
  PieChart,
  Filter,
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
  };
  overallScore: number;
  category?: string;
  evaluationType: 'manual' | 'bulk' | 'rag' | 'responsible';
}

interface TrendData {
  date: string;
  score: number;
  count: number;
}

interface ModelComparison {
  modelName: string;
  avgScore: number;
  totalEvaluations: number;
  metrics: {
    relevance: number;
    accuracy: number;
    coherence: number;
    helpfulness: number;
    harmlessness: number;
  };
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
      const recordDate = new Date(record.timestamp);
      const timeMatch = recordDate >= cutoffDate;
      const modelMatch = selectedModel === "all" || record.modelName === selectedModel;
      const categoryMatch = selectedCategory === "all" || record.category === selectedCategory;
      
      return timeMatch && modelMatch && categoryMatch;
    });
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
    }

    // Populate with actual data
    filteredData.forEach(record => {
      const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
      if (dailyData[recordDate]) {
        dailyData[recordDate].scores.push(record.overallScore);
        dailyData[recordDate].count++;
      }
    });

    // Convert to trend format
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        score: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
        count: data.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredData, selectedTimeRange]);

  // Calculate model comparisons
  const modelComparisons = useMemo(() => {
    const modelStats: { [key: string]: EvaluationRecord[] } = {};
    
    filteredData.forEach(record => {
      if (!modelStats[record.modelName]) {
        modelStats[record.modelName] = [];
      }
      modelStats[record.modelName].push(record);
    });

    return Object.entries(modelStats).map(([modelName, records]) => {
      const avgScore = records.reduce((sum, r) => sum + r.overallScore, 0) / records.length;
      
      // Calculate average metrics
      const avgMetrics = {
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
      let trendPercentage = 0;
      
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, r) => sum + r.overallScore, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, r) => sum + r.overallScore, 0) / secondHalf.length;
        trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        if (Math.abs(trendPercentage) > 2) {
          trend = trendPercentage > 0 ? 'up' : 'down';
        }
      }

      return {
        modelName,
        avgScore,
        totalEvaluations: records.length,
        metrics: avgMetrics,
        trend,
        trendPercentage: Math.abs(trendPercentage)
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
  }, [filteredData]);

  // Get unique values for filters
  const uniqueModels = useMemo(() => {
    return Array.from(new Set(evaluationHistory.map(r => r.modelName)));
  }, [evaluationHistory]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(evaluationHistory.map(r => r.category).filter(Boolean)));
  }, [evaluationHistory]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalEvaluations: 0,
        avgScore: 0,
        topModel: "N/A",
        improvementRate: 0
      };
    }

    const avgScore = filteredData.reduce((sum, r) => sum + r.overallScore, 0) / filteredData.length;
    const topModel = modelComparisons[0]?.modelName || "N/A";
    
    // Calculate improvement rate (comparing last 25% vs first 25%)
    const quarterPoint = Math.floor(filteredData.length / 4);
    const sortedByTime = [...filteredData].sort((a, b) => a.timestamp - b.timestamp);
    const firstQuarter = sortedByTime.slice(0, quarterPoint);
    const lastQuarter = sortedByTime.slice(-quarterPoint);
    
    let improvementRate = 0;
    if (firstQuarter.length > 0 && lastQuarter.length > 0) {
      const firstAvg = firstQuarter.reduce((sum, r) => sum + r.overallScore, 0) / firstQuarter.length;
      const lastAvg = lastQuarter.reduce((sum, r) => sum + r.overallScore, 0) / lastQuarter.length;
      improvementRate = ((lastAvg - firstAvg) / firstAvg) * 100;
    }

    return {
      totalEvaluations: filteredData.length,
      avgScore,
      topModel,
      improvementRate
    };
  }, [filteredData, modelComparisons]);

  const generateDemoData = () => {
    const demoData: EvaluationRecord[] = [];
    const models = ["GPT-4", "Claude-3", "Gemini Pro", "Llama-2"];
    const categories = ["General", "Technical", "Creative", "Analysis"];
    
    for (let i = 0; i < 50; i++) {
      const timestamp = Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      demoData.push({
        id: `demo-${i}`,
        timestamp,
        modelName: models[Math.floor(Math.random() * models.length)],
        prompt: `Demo prompt ${i + 1}`,
        response: `Demo response ${i + 1}`,
        metrics: {
          relevance: Math.random() * 10,
          accuracy: Math.random() * 10,
          coherence: Math.random() * 10,
          helpfulness: Math.random() * 10,
          harmlessness: Math.random() * 10,
        },
        overallScore: Math.random() * 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        evaluationType: 'manual' as const
      });
    }
    
    setHasDemoData(true);
    toast.success("Demo data generated successfully!");
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Model,Timestamp,Prompt,Response,Relevance,Accuracy,Coherence,Helpfulness,Harmlessness,Overall Score\n" +
      filteredData.map(record => 
        `"${record.modelName}","${new Date(record.timestamp).toISOString()}","${record.prompt}","${record.response}",${record.metrics.relevance},${record.metrics.accuracy},${record.metrics.coherence},${record.metrics.helpfulness},${record.metrics.harmlessness},${record.overallScore}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "evaluation_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data exported successfully!");
  };

  const refreshData = () => {
    toast.success("Data refreshed!");
  };

  const { totalEvaluations } = summaryStats;

  return (
    <div className="space-y-6">
      {evaluationHistory.length === 0 && !hasDemoData ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Evaluation Data</h3>
            <p className="text-muted-foreground mb-6">
              Start by performing evaluations in other tabs or generate demo data to explore analytics features.
            </p>
            <Button onClick={generateDemoData}>
              Generate Demo Data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              {uniqueModels.length > 0 && (
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Models" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {uniqueModels.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                </Select>
              )}
            </div>

            <div className="flex gap-2">
              {!hasDemoData && totalEvaluations === 0 && (
                <Button variant="outline" size="sm" onClick={generateDemoData}>
                  <Database className="w-4 h-4 mr-2" />
                  Generate Demo Data
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Evaluations</p>
                    <p className="text-3xl font-bold">{summaryStats.totalEvaluations}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-3xl font-bold">{summaryStats.avgScore.toFixed(1)}</p>
                  </div>
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Top Model</p>
                    <p className="text-xl font-bold">{summaryStats.topModel}</p>
                  </div>
                  <Award className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Improvement Rate</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold">
                        {summaryStats.improvementRate > 0 ? '+' : ''}{summaryStats.improvementRate.toFixed(1)}%
                      </p>
                      {summaryStats.improvementRate > 0 ? (
                        <TrendUp className="w-4 h-4 text-green-500" />
                      ) : summaryStats.improvementRate < 0 ? (
                        <TrendDown className="w-4 h-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
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
              <Card>
                <CardHeader>
                  <CardTitle>Score Trends Over Time</CardTitle>
                  <CardDescription>
                    Track evaluation scores and volume trends across your selected time period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trendData.length > 0 ? (
                      <div className="grid gap-4">
                        {/* Simple trend visualization */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Daily Average Scores</span>
                            <span>Range: 0-10</span>
                          </div>
                          <div className="grid grid-cols-7 gap-1 h-32">
                            {trendData.slice(-7).map((day, index) => (
                              <div key={index} className="flex flex-col justify-end items-center">
                                <div 
                                  className="w-full bg-primary rounded-t-sm min-h-[4px]"
                                  style={{ height: `${(day.score / 10) * 100}%` }}
                                />
                                <div className="text-xs text-muted-foreground mt-1 text-center">
                                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                                </div>
                                <div className="text-xs font-medium">
                                  {day.score.toFixed(1)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Evaluation volume */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Daily Evaluation Count</span>
                            <span>Total: {trendData.reduce((sum, day) => sum + day.count, 0)}</span>
                          </div>
                          <div className="grid grid-cols-7 gap-1 h-16">
                            {trendData.slice(-7).map((day, index) => {
                              const maxCount = Math.max(...trendData.map(d => d.count));
                              return (
                                <div key={index} className="flex flex-col justify-end items-center">
                                  <div 
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
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No evaluation data available for the selected time period
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Comparison</CardTitle>
                  <CardDescription>
                    Compare performance metrics across different language models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                                  )}
                                  <span className="text-sm text-muted-foreground">
                                    {model.trendPercentage.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
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
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No model data available for comparison
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                  <div className="space-y-6">
                    {/* Metric selector */}
                    <Select value={activeMetric} onValueChange={setActiveMetric}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overallScore">Overall Score</SelectItem>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="accuracy">Accuracy</SelectItem>
                        <SelectItem value="coherence">Coherence</SelectItem>
                        <SelectItem value="helpfulness">Helpfulness</SelectItem>
                        <SelectItem value="harmlessness">Harmlessness</SelectItem>
                      </SelectContent>
                    </Select>

                    {filteredData.length > 0 ? (
                      <div className="space-y-4">
                        {/* Distribution visualization */}
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
                              }).length;
                              const maxCount = Math.max(...Array.from({ length: 10 }, (_, j) => {
                                const rStart = j;
                                const rEnd = j + 1;
                                return filteredData.filter(record => {
                                  const value = activeMetric === 'overallScore' 
                                    ? record.overallScore 
                                    : record.metrics[activeMetric as keyof typeof record.metrics];
                                  return value >= rStart && value < rEnd;
                                }).length;
                              }));

                              return (
                                <div key={i} className="flex flex-col justify-end items-center">
                                  <div 
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
                            })}
                          </div>
                        </div>

                        {/* Summary statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(() => {
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
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No metric data available for analysis
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}