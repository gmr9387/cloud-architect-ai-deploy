import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  GitBranch, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Package,
  Globe,
  Zap
} from "lucide-react";

const pipelineSteps = [
  {
    id: "source",
    name: "Source",
    description: "Pull from Git repository",
    status: "completed",
    duration: "2s"
  },
  {
    id: "build",
    name: "Build",
    description: "Installing dependencies & building",
    status: "running",
    duration: "45s",
    progress: 73
  },
  {
    id: "optimize",
    name: "AI Optimize",
    description: "AI-powered build optimization",
    status: "pending",
    duration: "~15s"
  },
  {
    id: "deploy",
    name: "Deploy",
    description: "Deploy to global CDN",
    status: "pending",
    duration: "~10s"
  }
];

const statusConfig = {
  completed: { 
    icon: CheckCircle, 
    color: "status-success", 
    bgColor: "bg-status-success/10",
    borderColor: "border-status-success/20"
  },
  running: { 
    icon: Loader2, 
    color: "status-building", 
    bgColor: "bg-status-building/10",
    borderColor: "border-status-building/20",
    animate: true
  },
  pending: { 
    icon: Clock, 
    color: "muted-foreground", 
    bgColor: "bg-muted/10",
    borderColor: "border-muted/20"
  },
  failed: { 
    icon: AlertCircle, 
    color: "status-failed", 
    bgColor: "bg-status-failed/10",
    borderColor: "border-status-failed/20"
  }
};

export const DeploymentPipeline = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Deployment Pipeline</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-status-building/10 text-status-building border-status-building/20">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Building
            </Badge>
            <Badge variant="outline" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
          <GitBranch className="w-4 h-4 text-primary" />
          <div>
            <div className="font-medium">main</div>
            <div className="text-xs text-muted-foreground">Commit: feat: add user dashboard</div>
          </div>
          <div className="flex-1"></div>
          <div className="text-xs text-muted-foreground">2 minutes ago</div>
        </div>

        <div className="space-y-4">
          {pipelineSteps.map((step, index) => {
            const config = statusConfig[step.status as keyof typeof statusConfig];
            const Icon = config.icon;
            
            return (
              <div key={step.id} className="relative">
                {index < pipelineSteps.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-8 bg-border"></div>
                )}
                
                <div className={`flex items-start space-x-4 p-4 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
                  <div className={`w-8 h-8 rounded-full border-2 border-${config.color} bg-background flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${config.color} ${step.status === 'running' ? 'animate-spin' : ''}`} />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{step.name}</h4>
                      <span className="text-xs text-muted-foreground">{step.duration}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    
                    {step.status === "running" && step.progress && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{step.progress}%</span>
                        </div>
                        <Progress value={step.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Estimated completion: <span className="font-medium">1m 20s</span>
            </div>
            <Button variant="outline" size="sm">
              View Logs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};