import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  BarChart3
} from "lucide-react";

const insights = [
  {
    type: "optimization",
    title: "Build Performance",
    description: "Your build times can be improved by 35% with dependency optimization",
    impact: "high",
    confidence: 94,
    action: "Review Dependencies"
  },
  {
    type: "security",
    title: "Vulnerability Scan",
    description: "2 medium-risk vulnerabilities detected in your dependencies",
    impact: "medium",
    confidence: 87,
    action: "Update Packages"
  },
  {
    type: "performance",
    title: "Traffic Prediction",
    description: "Expected 23% traffic increase next week based on patterns",
    impact: "medium",
    confidence: 78,
    action: "Scale Resources"
  },
  {
    type: "content",
    title: "SEO Optimization",
    description: "Image compression could improve page load by 1.2s",
    impact: "high",
    confidence: 91,
    action: "Optimize Images"
  }
];

const typeConfig = {
  optimization: { icon: Zap, color: "ai-primary", label: "Build Optimization" },
  security: { icon: Shield, color: "status-failed", label: "Security" },
  performance: { icon: TrendingUp, color: "status-success", label: "Performance" },
  content: { icon: Lightbulb, color: "warning", label: "Content" }
};

const impactConfig = {
  high: { color: "status-success", label: "High Impact" },
  medium: { color: "warning", label: "Medium Impact" },
  low: { color: "muted", label: "Low Impact" }
};

export const AIInsightsPanel = () => {
  return (
    <Card className="border-ai-primary/20 bg-gradient-to-br from-ai-primary/5 to-ai-secondary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-ai-primary" />
            <CardTitle className="bg-gradient-to-r from-ai-primary to-ai-secondary bg-clip-text text-transparent">
              AI Insights
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
            <BarChart3 className="w-3 h-3 mr-1" />
            Live Analysis
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const typeInfo = typeConfig[insight.type as keyof typeof typeConfig];
          const impactInfo = impactConfig[insight.impact as keyof typeof impactConfig];
          const TypeIcon = typeInfo.icon;
          
          return (
            <div key={index} className="space-y-3 p-4 rounded-lg border border-border/50 bg-card/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <TypeIcon className={`w-4 h-4 text-${typeInfo.color}`} />
                  <h4 className="font-medium">{insight.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs bg-${impactInfo.color}/10 text-${impactInfo.color} border-${impactInfo.color}/20`}
                  >
                    {impactInfo.label}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  {typeInfo.label}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">AI Confidence</span>
                  <span className="font-medium">{insight.confidence}%</span>
                </div>
                <Progress value={insight.confidence} className="h-1.5" />
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                {insight.action}
              </Button>
            </div>
          );
        })}
        
        <div className="pt-2">
          <Button className="w-full bg-gradient-to-r from-ai-primary to-ai-secondary">
            <Brain className="w-4 h-4 mr-2" />
            Run Full AI Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};