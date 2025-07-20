import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  Globe, 
  Clock, 
  TrendingUp, 
  Zap,
  ExternalLink,
  Activity
} from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    status: 'building' | 'success' | 'failed' | 'pending';
    lastDeploy: string;
    domain: string;
    branch: string;
    buildTime: string;
    visitors: string;
    aiOptimizations?: number;
  };
}

const statusConfig = {
  building: { color: 'status-building', label: 'Building', icon: Activity },
  success: { color: 'status-success', label: 'Live', icon: Globe },
  failed: { color: 'status-failed', label: 'Failed', icon: TrendingUp },
  pending: { color: 'status-pending', label: 'Pending', icon: Clock }
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  return (
    <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
          <Badge 
            variant="outline" 
            className={`border-${status.color} text-${status.color} bg-${status.color}/10`}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground space-x-4">
          <div className="flex items-center">
            <GitBranch className="w-3 h-3 mr-1" />
            {project.branch}
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {project.lastDeploy}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Domain:</span>
          <div className="flex items-center space-x-1">
            <span className="font-mono text-primary">{project.domain}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Build Time:</span>
            <div className="font-semibold">{project.buildTime}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Visitors:</span>
            <div className="font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-success" />
              {project.visitors}
            </div>
          </div>
        </div>

        {project.aiOptimizations && (
          <div className="flex items-center justify-between p-2 bg-ai-primary/5 rounded-lg border border-ai-primary/10">
            <div className="flex items-center text-sm">
              <Zap className="w-4 h-4 mr-2 text-ai-primary" />
              <span className="text-ai-primary font-medium">AI Optimizations Applied</span>
            </div>
            <Badge variant="outline" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
              +{project.aiOptimizations}%
            </Badge>
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-primary-glow">
            Deploy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};