import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  BarChart3, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Globe,
  Cpu,
  HardDrive
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CostData {
  date: string;
  compute: number;
  storage: number;
  network: number;
  total: number;
}

interface PerformanceData {
  deployment: string;
  responseTime: number;
  errorRate: number;
  userSatisfaction: number;
  costPerDeployment: number;
  roi: number;
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  recommendations: string[];
}

const UsageAnalytics: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [costData] = useState<CostData[]>([
    { date: '2024-01-01', compute: 120, storage: 45, network: 30, total: 195 },
    { date: '2024-01-02', compute: 135, storage: 48, network: 32, total: 215 },
    { date: '2024-01-03', compute: 110, storage: 42, network: 28, total: 180 },
    { date: '2024-01-04', compute: 150, storage: 50, network: 35, total: 235 },
    { date: '2024-01-05', compute: 125, storage: 46, network: 31, total: 202 },
    { date: '2024-01-06', compute: 140, storage: 49, network: 33, total: 222 },
    { date: '2024-01-07', compute: 130, storage: 47, network: 30, total: 207 }
  ]);

  const [performanceData] = useState<PerformanceData[]>([
    {
      deployment: 'v2.1.0',
      responseTime: 85,
      errorRate: 0.02,
      userSatisfaction: 4.8,
      costPerDeployment: 45,
      roi: 320
    },
    {
      deployment: 'v2.0.9',
      responseTime: 95,
      errorRate: 0.05,
      userSatisfaction: 4.6,
      costPerDeployment: 52,
      roi: 280
    },
    {
      deployment: 'v2.0.8',
      responseTime: 110,
      errorRate: 0.08,
      userSatisfaction: 4.4,
      costPerDeployment: 58,
      roi: 240
    }
  ]);

  const [resourceUsage] = useState<ResourceUsage>({
    cpu: 65,
    memory: 78,
    storage: 45,
    network: 32,
    recommendations: [
      'Consider upgrading to larger instance types for better performance',
      'Implement caching to reduce database load by 30%',
      'Optimize image sizes to reduce storage costs by 25%',
      'Use CDN for static assets to reduce bandwidth costs'
    ]
  });

  const [roiMetrics] = useState({
    totalInvestment: 15420,
    totalSavings: 48250,
    timeToValue: 3.2,
    deploymentSuccessRate: 98.5,
    costPerDeployment: 42,
    averageROI: 313
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Usage Analytics & Cost Optimization</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15% ROI
            </Badge>
            <Button variant="outline" size="sm">
              <DollarSign className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="costs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance ROI</TabsTrigger>
            <TabsTrigger value="resources">Resource Usage</TabsTrigger>
            <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Monthly Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">$4,250</div>
                  <div className="text-xs text-muted-foreground">-12% from last month</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Cost per Deployment</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">$42</div>
                  <div className="text-xs text-muted-foreground">-8% from last month</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">ROI</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">313%</div>
                  <div className="text-xs text-muted-foreground">+15% from last month</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Time to Value</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">3.2h</div>
                  <div className="text-xs text-muted-foreground">-0.5h from last month</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cost Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="compute" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="storage" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="network" stroke="#ffc658" strokeWidth={2} />
                    <Line type="monotone" dataKey="total" stroke="#ff7300" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Performance vs ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="deployment" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="roi" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Deployment Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceData.map((deployment, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{deployment.deployment}</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          ROI: {deployment.roi}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span className="font-medium">{deployment.responseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Error Rate:</span>
                          <span className="font-medium">{deployment.errorRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">User Satisfaction:</span>
                          <span className="font-medium">{deployment.userSatisfaction}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">${deployment.costPerDeployment}</span>
                        </div>
                      </div>
                      {index < performanceData.length - 1 && <hr />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Resource Utilization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">CPU Usage</span>
                        <span className="font-medium">{resourceUsage.cpu}%</span>
                      </div>
                      <Progress value={resourceUsage.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Memory Usage</span>
                        <span className="font-medium">{resourceUsage.memory}%</span>
                      </div>
                      <Progress value={resourceUsage.memory} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Storage Usage</span>
                        <span className="font-medium">{resourceUsage.storage}%</span>
                      </div>
                      <Progress value={resourceUsage.storage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Network Usage</span>
                        <span className="font-medium">{resourceUsage.network}%</span>
                      </div>
                      <Progress value={resourceUsage.network} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Cost Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Compute', value: 65 },
                          { name: 'Storage', value: 20 },
                          { name: 'Network', value: 10 },
                          { name: 'Other', value: 5 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>AI Optimization Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resourceUsage.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{recommendation}</p>
                        <Button size="sm" variant="outline" className="mt-2">
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">ROI Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${roiMetrics.totalSavings.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Savings</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">${roiMetrics.totalInvestment.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Investment</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time to Value</span>
                      <span className="font-medium">{roiMetrics.timeToValue} hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deployment Success Rate</span>
                      <span className="font-medium">{roiMetrics.deploymentSuccessRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average ROI</span>
                      <span className="font-medium">{roiMetrics.averageROI}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UsageAnalytics;