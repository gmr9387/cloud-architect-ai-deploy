import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Zap, 
  Globe, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Users,
  Database,
  Cpu
} from "lucide-react";

const metrics = [
  {
    label: "Response Time",
    value: "127ms",
    change: -12,
    icon: Clock,
    color: "status-success"
  },
  {
    label: "Active Users",
    value: "2,847",
    change: 23,
    icon: Users,
    color: "primary"
  },
  {
    label: "Uptime",
    value: "99.97%",
    change: 0.1,
    icon: Activity,
    color: "status-success"
  },
  {
    label: "Bandwidth",
    value: "1.2GB",
    change: 8,
    icon: Database,
    color: "warning"
  }
];

const performanceScore = 94;

export const PerformanceMetrics = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Performance Metrics</span>
          </CardTitle>
          <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">
            <TrendingUp className="w-3 h-3 mr-1" />
            Healthy
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Performance Score */}
        <div className="p-4 bg-gradient-to-r from-status-success/10 to-primary/10 rounded-lg border border-status-success/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Overall Performance Score</h4>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-ai-primary" />
              <span className="text-xs text-ai-primary">AI Optimized</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-status-success">{performanceScore}</div>
            <div className="flex-1">
              <Progress value={performanceScore} className="h-2" />
            </div>
            <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">
              Excellent
            </Badge>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const isPositive = metric.change > 0;
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;
            
            return (
              <div key={index} className="p-3 border border-border rounded-lg bg-card/50">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 text-${metric.color}`} />
                  <div className="flex items-center space-x-1 text-xs">
                    <TrendIcon className={`w-3 h-3 ${isPositive ? 'text-status-success' : 'text-status-failed'}`} />
                    <span className={isPositive ? 'text-status-success' : 'text-status-failed'}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
                <div className="text-lg font-semibold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            );
          })}
        </div>

        {/* Real-time Status */}
        <div className="space-y-3">
          <h4 className="font-medium">Real-time Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm">Global CDN</span>
              </div>
              <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">
                Operational
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-sm">Edge Functions</span>
              </div>
              <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">
                Running
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-primary" />
                <span className="text-sm">Database</span>
              </div>
              <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">
                Connected
              </Badge>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          View Detailed Analytics
        </Button>
      </CardContent>
    </Card>
  );
};