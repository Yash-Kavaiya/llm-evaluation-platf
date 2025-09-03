import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, Car
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/se
import { useKV } from '@github/spark/hooks';
import { 
  LineChart,
  Calendar,
  RefreshCw,
import { 
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Target,
  timestam
  prompt: st
  metric
    accura
    helpfulness: number;

  category?: string;
}
interface TrendData 
  score: number;
}
interface ModelComp
  avgScore: 
  metrics: {
    accuracy: number;
    helpfulness: numbe
  };
  trendPercentage: number

  const [evaluationHist
  const [selectedMod
  const [activeMetric, setActiveMetric] = useState("overallS


    const cutoffDate 

      const reco
      const mode
 


  const trendData = 
    const dailyData
    // Initialize days
      const 
      const dateKey = 
    }
    // Populate with a
      const recordDate =
        dailyData[recordD
    

    return Object.entries(
 

      .sort((a, b) => new Date(a.date).getTim

  const modelComparisons = useMemo(() => {
    
      if (!modelStats[record.modelName]) {
      }
    });

      
      const avgMetrics = {
        accuracy: records.reduce((sum, r) => 
        helpfulness: records.reduc
      };

      const firstHalf = records.slice(0, midPoi
    
      let trendPercentage = 0;
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const secondAvg = secondHalf.reduce((sum, r) => sum + r.overallScore, 0) / secondHalf.l
      
          trend = trendPercentage > 0 ? 'up' : 'down';
      }
      return {

        metrics: avgMetrics,
        trendPercentage
    }).sort((a, b) => b.avgScore - a.avgScore

  co
  }, [evaluationHistor
  const uniqueCategories = useMemo((
  }, [evaluationHistory]);
  // Calculate summary statistics
    if (filteredData.length === 0) {
        totalEvaluations: 0,
     


    const topModel = modelComparison
    // Calculate improvement rate (comparing last 25% vs first 25%)
    const sortedByTime = [...filte
    const lastQuarter = sortedByTime.slice(-quarterPoint);
    let improvementRate = 0;
      c
      i

      totalEvaluations: filter
      topModel,
    };

    const demoData: Evalua
    const categories = ["General", "Technical", "Creative", "Analysis"];
    for (
      demoData.push({
        timestamp,

        metrics: {
          accuracy: Math.random() * 10,
          helpfulness: Math.random() * 10,
    
        category: categories[Math.fl
      });
    
    toa

    con

      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    li
    document.body.appendChild(link
    document.body.removeCh
    toast.success("Data exported successfully!");

    toast.success("Data refreshed!");

    <div className="space-y-6">
        

            <p className="text-muted-foreground mb-4">
            </p>
              Generate Demo Data
          </CardContent>
    
          {/* Filters and Controls */}
            <div className="fl
      
                  <SelectValue />
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>

                <Select value={selectedModel
                    <SelectValue placeholder="All Mode
         
       

              

                <
                    <SelectValue placehol
                  <SelectCon
              
                    ))}
        
            </div>
            <div clas

                  Generate Demo Da
              )}
                <Download className="w-4 h-4 mr-2" />
              </Button>

              </Button>
          </div>
          {/* Summary Card

                <div className="f
                    <p className="text
                  </div>
              
            </Card>
            <Card>
                <div cla
                    <p cla
        
     

            <Card>
                <div className="flex items-center justify-bet
    
                  </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center justify-
    
                      <span 
                      </span>
                        <TrendUp className="w-4 h-4 text-green-500" />
                        <TrendDown className="w-4 h-4 text-red-500" />
                    </div>
     


          <Tabs defaultValue="trends" classN
              <
               
              <TabsTr
      
              <TabsTrigger value="metri

            </TabsList>
            <TabsContent value="trends" clas
                <CardHeader>
                  <CardDescription>
    
                <CardContent>
                    <div className="space-y-6">
                     
                        
                  
                          {trendData.slice(-7).map((day, index) => (
                              <div 
                                style={{ he
                  
                              </div>
                                {day.sc
                            </div>
                        </div>

          
                          <span>Daily Eva
                        </div>
                          {trendData.slic
         
     
    
                         
                                </div>
    

                    </div>
                    <div className="text-center py-8 tex
                    </div>
                </CardContent>
            </TabsContent>
            <TabsCo
    
                  <CardDescription>
                  </CardDescription>
                <CardContent>
                    {modelComparisons.length > 0 ? (
                        <div key={mo
                 
                                #{in
    
                                {model.totalEvalu
    

                             
                                <div 
    

          
                               
                              )}
              
                          <div className="grid grid
                              <div key={metric} className="space-y-1">
                                  <span className="capitalize text-muted-foreg
                                </div>
                                  <div 
                
                                </div>
                            ))}
                     
                    ) : 
               
           
          
            </TabsContent>
            <TabsContent value="metrics" className="space-y-6">
                <CardHeader>
                  <CardDescription>
                  </CardDescription>
                <CardContent>
                    {/* Metric se
                      <SelectTri
                      </SelectT
                        <SelectItem value="overallScore">Overall
                        <SelectItem value="accuracy">Accuracy</Sel
                        <SelectItem value="helpfulness">Helpfulnes
                      </SelectCo


                        <div className="spa
                          <div className="grid grid-cols-10 gap-1 h-32">
                              const rangeStart = i;
                              const count = filteredData.fil
                                  
                                r
                              const maxCount = Math.max(...Array.fr
                                const rEnd = j +
                                  const value = activeMetric === 'overallScore' 
                       
                                })

                

                                  />
                                    {rangeStart}
                                  <div className="text-
                                  </div>
                              );
                          </div>

                        <div className="grid grid-cols-
                            const values = filteredData.map(record => 
                       
                            );
                         
                
                  

                              { label: '
                              <div key={stat.label} className="text-cen
                                <p className="text-xl font-bold">{stat.value}</
                            ));
                        </div>
                    ) : (
                
                    )}
                </CardContent>
            </TabsCont
        </>
    </div>
}









































































































































































































































































































































