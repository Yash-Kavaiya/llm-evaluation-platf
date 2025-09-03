import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKV } from '@github/spark/hooks';
import { 
  ChartBar,
  ChartLine,
  ChartPie,
  Calendar,
  Download,
  ArrowClockwise,
  Target,
  TrendUp,
  TrendDown
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface EvaluationRecord {
  id: string;
  timestamp: number;
  prompt: string;
  response: string;
  modelName: string;
  overallScore: number;
  metrics: {
    accuracy: number;
    helpfulness: number;
    clarity: number;
    relevance: number;
  };
  category?: string;
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
    accuracy: number;
    helpfulness: number;
    clarity: number;
    relevance: number;
  };
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

function AdvancedAnalytics() {
  const [evaluationHistory] = useKV<EvaluationRecord[]>("evaluation-history", []);
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");
  const [activeMetric, setActiveMetric] = useState("overallScore");

  // Filter data based on selected options
  const filteredData = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));

    return evaluationHistory.filter(record => {
      const recordDate = new Date(record.timestamp);
      const isInDateRange = recordDate >= cutoffDate;
      const isSelectedModel = selectedModel === "all" || record.modelName === selectedModel;
      
      return isInDateRange && isSelectedModel;
    });
  }, [evaluationHistory, selectedModel, dateRange]);

  // Generate trend data for charts
  const trendData = useMemo(() => {
    const dailyData: { [key: string]: { scores: number[], count: number } } = {};
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
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

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      score: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b) / data.scores.length : 0,
      count: data.count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredData]);

  // Generate model comparison data
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
      const avgMetrics = {
        accuracy: records.reduce((sum, r) => sum + r.metrics.accuracy, 0) / records.length,
        helpfulness: records.reduce((sum, r) => sum + r.metrics.helpfulness, 0) / records.length,
        clarity: records.reduce((sum, r) => sum + r.metrics.clarity, 0) / records.length,
        relevance: records.reduce((sum, r) => sum + r.metrics.relevance, 0) / records.length,
      };

      // Calculate trend
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
        trendPercentage
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
  }, [filteredData]);

  // Get unique models and categories
  const uniqueModels = useMemo(() => {
    return [...new Set(evaluationHistory.map(r => r.modelName))];
  }, [evaluationHistory]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(evaluationHistory.map(r => r.category).filter(Boolean))];
  }, [evaluationHistory]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalEvaluations: 0,
        avgScore: 0,
        topModel: null,
        improvementRate: 0
      };
    }

    const avgScore = filteredData.reduce((sum, r) => sum + r.overallScore, 0) / filteredData.length;
    const topModel = modelComparisons[0]?.modelName || null;
    
    // Calculate improvement rate (comparing last 25% vs first 25%)
    const sortedByTime = [...filteredData].sort((a, b) => a.timestamp - b.timestamp);
    const quarterPoint = Math.floor(sortedByTime.length / 4);
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
    const models = ["GPT-4", "Claude", "Gemini", "LLaMA"];
    const categories = ["General", "Technical", "Creative", "Analysis"];
    
    for (let i = 0; i < 50; i++) {
      const timestamp = Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000);
      demoData.push({
        id: `demo-${i}`,
        timestamp,
        prompt: `Demo prompt ${i + 1}`,
        response: `Demo response ${i + 1}`,
        modelName: models[Math.floor(Math.random() * models.length)],
        overallScore: Math.random() * 10,
        metrics: {
          accuracy: Math.random() * 10,
          helpfulness: Math.random() * 10,
          clarity: Math.random() * 10,
          relevance: Math.random() * 10,
        },
        category: categories[Math.floor(Math.random() * categories.length)]
      });
    }
    
    toast.success("Demo data generated!");
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Model,Score,Accuracy,Helpfulness,Clarity,Relevance,Category\n" +
      filteredData.map(record => 
        `${new Date(record.timestamp).toLocaleDateString()},${record.modelName},${record.overallScore},${record.metrics.accuracy},${record.metrics.helpfulness},${record.metrics.clarity},${record.metrics.relevance},${record.category || ''}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "evaluation_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data exported successfully!");
  };

  const refreshData = () => {
    toast.success("Data refreshed!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Overview
          </CardTitle>
          <CardDescription>
            Comprehensive insights into evaluation trends and model performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateDemoData} className="mb-4">
            Generate Demo Data
          </Button>
          
          {/* Filters and Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {uniqueModels.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={refreshData}>
                <ArrowClockwise className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Evaluations</p>
                    <p className="text-2xl font-bold">{summaryStats.totalEvaluations}</p>
                  </div>
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{summaryStats.avgScore.toFixed(1)}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Top Model</p>
                    <p className="text-lg font-semibold">{summaryStats.topModel || 'N/A'}</p>
                  </div>
                  <LineChart className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Improvement</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {Math.abs(summaryStats.improvementRate).toFixed(1)}%
                      </span>
                      {summaryStats.improvementRate > 0 ? (
                        <TrendUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="models">Model Comparison</TabsTrigger>
              <TabsTrigger value="metrics">Metric Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Score Trends</CardTitle>
                  <CardDescription>
                    Daily average scores and evaluation counts over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <div className="space-y-6">
                      {/* Simple trend visualization */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Score Trend (Last 7 Days)</h4>
                        <div className="flex items-end gap-2 h-32">
                          {trendData.slice(-7).map((day, index) => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className="w-full bg-primary rounded-t" 
                                style={{ height: `${(day.score / 10) * 100}%` }}
                              />
                              <span className="text-xs text-muted-foreground">
                                {day.score.toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Daily Evaluations</h4>
                        <div className="flex items-end gap-2 h-20">
                          {trendData.slice(-7).map((day, index) => (
                            <div key={`count-${day.date}`} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className="w-full bg-secondary rounded-t" 
                                style={{ height: `${Math.min((day.count / Math.max(...trendData.map(d => d.count))) * 100, 100)}%` }}
                              />
                              <span className="text-xs text-muted-foreground">{day.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No trend data available. Generate some demo data to see charts.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="models" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Comparison</CardTitle>
                  <CardDescription>
                    Compare average scores and metrics across different models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {modelComparisons.length > 0 ? (
                    <div className="space-y-4">
                      {modelComparisons.map((model, index) => (
                        <div key={model.modelName} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-muted-foreground">
                                #{index + 1}
                              </span>
                              <h4 className="font-semibold">{model.modelName}</h4>
                              <span className="text-sm text-muted-foreground">
                                {model.totalEvaluations} evaluations
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">{model.avgScore.toFixed(1)}</span>
                              {model.trend !== 'stable' && (
                                <div className="flex items-center gap-1">
                                  {model.trend === 'up' ? (
                                    <TrendUp className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <TrendDown className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className="text-sm text-muted-foreground">
                                    {Math.abs(model.trendPercentage).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(model.metrics).map(([metric, value]) => (
                              <div key={metric} className="space-y-1">
                                <span className="text-sm text-muted-foreground capitalize">{metric}</span>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full" 
                                      style={{ width: `${(value / 10) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{value.toFixed(1)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No model data available. Generate some demo data to see comparisons.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Metric Distribution Analysis</CardTitle>
                  <CardDescription>
                    Analyze the distribution and patterns of evaluation metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredData.length > 0 ? (
                    <div className="space-y-6">
                      {/* Metric selector */}
                      <Select value={activeMetric} onValueChange={setActiveMetric}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overallScore">Overall Score</SelectItem>
                          <SelectItem value="accuracy">Accuracy</SelectItem>
                          <SelectItem value="helpfulness">Helpfulness</SelectItem>
                          <SelectItem value="clarity">Clarity</SelectItem>
                          <SelectItem value="relevance">Relevance</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Distribution histogram */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Score Distribution</h4>
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
                              return filteredData.filter(r => {
                                const value = activeMetric === 'overallScore' 
                                  ? r.overallScore 
                                  : r.metrics[activeMetric as keyof typeof r.metrics];
                                return value >= rStart && value < rEnd;
                              }).length;
                            }));

                            return (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <div 
                                  className="w-full bg-primary rounded-t" 
                                  style={{ height: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' }}
                                />
                                <div className="text-xs text-muted-foreground">
                                  {rangeStart}-{rangeEnd}
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
                            <div key={stat.label} className="text-center">
                              <p className="text-sm text-muted-foreground">{stat.label}</p>
                              <p className="text-xl font-bold">{stat.value}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No metric data available. Generate some demo data to see statistics.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
  );










export default AdvancedAnalytics;