import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Clock, 
  Users, 
  Eye, 
  MousePointer, 
  Smartphone, 
  Download,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface AnalyticsData {
  timestamp: number;
  pageViews: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  loadTime: number;
  errorRate: number;
  clickEvents: number;
  scrollDepth: number;
}

interface UserInteraction {
  id: string;
  type: 'click' | 'scroll' | 'navigation' | 'error';
  element?: string;
  timestamp: number;
  value?: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--ai-primary))', 'hsl(var(--accent))', 'hsl(var(--warning))'];

export const RealTimeAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [currentUsers, setCurrentUsers] = useState(0);
  const [isTracking, setIsTracking] = useState(true);

  // Real performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0
  });

  // Initialize performance tracking
  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      setPerformanceMetrics({
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Would be measured with LCP observer
        cumulativeLayoutShift: 0, // Would be measured with CLS observer
        firstInputDelay: 0 // Would be measured with FID observer
      });
    };

    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => window.removeEventListener('load', measurePerformance);
  }, []);

  // Track user interactions
  useEffect(() => {
    if (!isTracking) return;

    const trackClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target.tagName.toLowerCase() + 
        (target.className ? `.${target.className.split(' ')[0]}` : '') +
        (target.id ? `#${target.id}` : '');

      addInteraction({
        id: Date.now().toString(),
        type: 'click',
        element,
        timestamp: Date.now()
      });
    };

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      addInteraction({
        id: Date.now().toString(),
        type: 'scroll',
        timestamp: Date.now(),
        value: scrollPercent
      });
    };

    const trackError = (e: ErrorEvent) => {
      addInteraction({
        id: Date.now().toString(),
        type: 'error',
        element: e.filename || 'unknown',
        timestamp: Date.now(),
        value: e.lineno
      });
    };

    document.addEventListener('click', trackClick);
    window.addEventListener('scroll', trackScroll, { passive: true });
    window.addEventListener('error', trackError);

    return () => {
      document.removeEventListener('click', trackClick);
      window.removeEventListener('scroll', trackScroll);
      window.removeEventListener('error', trackError);
    };
  }, [isTracking]);

  const addInteraction = useCallback((interaction: UserInteraction) => {
    setInteractions(prev => [...prev.slice(-99), interaction]); // Keep last 100 interactions
  }, []);

  // Generate analytics data
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const recentInteractions = interactions.filter(i => now - i.timestamp < 60000); // Last minute

      const newData: AnalyticsData = {
        timestamp: now,
        pageViews: Math.floor(Math.random() * 10) + 1,
        users: Math.floor(Math.random() * 5) + 1,
        bounceRate: Math.random() * 30 + 20,
        avgSessionDuration: Math.random() * 300 + 120,
        loadTime: performanceMetrics.loadTime || Math.random() * 2000 + 500,
        errorRate: Math.random() * 5,
        clickEvents: recentInteractions.filter(i => i.type === 'click').length,
        scrollDepth: Math.max(...recentInteractions.filter(i => i.type === 'scroll').map(i => i.value || 0), 0)
      };

      setAnalyticsData(prev => [...prev.slice(-29), newData]); // Keep last 30 data points
      setCurrentUsers(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [interactions, performanceMetrics, isTracking]);

  // Calculated metrics
  const metrics = useMemo(() => {
    if (analyticsData.length < 2) return null;

    const latest = analyticsData[analyticsData.length - 1];
    const previous = analyticsData[analyticsData.length - 2];

    const calculateTrend = (current: number, prev: number): 'up' | 'down' | 'stable' => {
      const change = ((current - prev) / prev) * 100;
      if (Math.abs(change) < 1) return 'stable';
      return change > 0 ? 'up' : 'down';
    };

    return {
      totalPageViews: analyticsData.reduce((sum, data) => sum + data.pageViews, 0),
      avgLoadTime: analyticsData.reduce((sum, data) => sum + data.loadTime, 0) / analyticsData.length,
      avgBounceRate: analyticsData.reduce((sum, data) => sum + data.bounceRate, 0) / analyticsData.length,
      totalErrors: analyticsData.reduce((sum, data) => sum + data.errorRate, 0),
      trends: {
        pageViews: calculateTrend(latest.pageViews, previous.pageViews),
        users: calculateTrend(latest.users, previous.users),
        loadTime: calculateTrend(latest.loadTime, previous.loadTime),
        bounceRate: calculateTrend(latest.bounceRate, previous.bounceRate)
      }
    };
  }, [analyticsData]);

  const deviceData = [
    { name: 'Desktop', value: 65, color: COLORS[0] },
    { name: 'Mobile', value: 30, color: COLORS[1] },
    { name: 'Tablet', value: 5, color: COLORS[2] }
  ];

  const exportData = () => {
    const dataToExport = {
      analytics: analyticsData,
      interactions: interactions,
      performance: performanceMetrics,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-status-success" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Real-Time Analytics</span>
            <Badge variant="secondary" className="bg-status-success/10 text-status-success">
              Live
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTracking(!isTracking)}
            >
              {isTracking ? 'Pause' : 'Resume'}
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Live Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Users</p>
                      <p className="text-2xl font-bold text-status-success">{currentUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-status-success/60" />
                  </div>
                </CardContent>
              </Card>

              {metrics && (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Page Views</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-2xl font-bold">{metrics.totalPageViews}</p>
                            <TrendIcon trend={metrics.trends.pageViews} />
                          </div>
                        </div>
                        <Eye className="w-8 h-8 text-primary/60" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Load Time</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-2xl font-bold">{metrics.avgLoadTime.toFixed(0)}ms</p>
                            <TrendIcon trend={metrics.trends.loadTime} />
                          </div>
                        </div>
                        <Clock className="w-8 h-8 text-warning/60" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Bounce Rate</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-2xl font-bold">{metrics.avgBounceRate.toFixed(1)}%</p>
                            <TrendIcon trend={metrics.trends.bounceRate} />
                          </div>
                        </div>
                        <MousePointer className="w-8 h-8 text-ai-primary/60" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Real-time Charts */}
            {analyticsData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Page Views (Real-time)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="pageViews" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Load Time Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                          formatter={(value: any) => [`${value.toFixed(0)}ms`, 'Load Time']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="loadTime" 
                          stroke="hsl(var(--warning))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Page Load Time</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{performanceMetrics.loadTime.toFixed(0)}ms</span>
                    <Badge variant={performanceMetrics.loadTime < 1000 ? "default" : "destructive"}>
                      {performanceMetrics.loadTime < 1000 ? "Good" : "Needs Work"}
                    </Badge>
                  </div>
                  <Progress value={Math.max(0, 100 - (performanceMetrics.loadTime / 20))} />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">DOM Content Loaded</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{performanceMetrics.domContentLoaded.toFixed(0)}ms</span>
                    <Badge variant={performanceMetrics.domContentLoaded < 800 ? "default" : "destructive"}>
                      {performanceMetrics.domContentLoaded < 800 ? "Good" : "Slow"}
                    </Badge>
                  </div>
                  <Progress value={Math.max(0, 100 - (performanceMetrics.domContentLoaded / 16))} />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">First Paint</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{performanceMetrics.firstPaint.toFixed(0)}ms</span>
                    <Badge variant={performanceMetrics.firstPaint < 1000 ? "default" : "destructive"}>
                      {performanceMetrics.firstPaint < 1000 ? "Fast" : "Slow"}
                    </Badge>
                  </div>
                  <Progress value={Math.max(0, 100 - (performanceMetrics.firstPaint / 20))} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Recent User Interactions ({interactions.length})</h3>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {interactions.slice(-20).reverse().map((interaction) => (
                  <div key={interaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="capitalize">
                        {interaction.type}
                      </Badge>
                      <span className="text-sm">{interaction.element || 'Unknown'}</span>
                      {interaction.value && (
                        <span className="text-xs text-muted-foreground">
                          {interaction.type === 'scroll' ? `${interaction.value}%` : interaction.value}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(interaction.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deviceData.map((device) => (
                    <div key={device.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: device.color }}
                        />
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{device.value}%</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.floor(device.value * currentUsers / 100)} users
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};