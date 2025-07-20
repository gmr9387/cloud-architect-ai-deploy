import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { AIInsightsPanel } from "@/components/ai/AIInsightsPanel";
import { DeploymentPipeline } from "@/components/deployment/DeploymentPipeline";
import { PerformanceMetrics } from "@/components/monitoring/PerformanceMetrics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, GitBranch, Zap, TrendingUp } from "lucide-react";

// Mock data for demonstration
const mockProjects = [
  {
    id: "1",
    name: "my-portfolio",
    status: "success" as const,
    lastDeploy: "2h ago",
    domain: "portfolio.yourdomain.com",
    branch: "main",
    buildTime: "1m 23s",
    visitors: "2.1k",
    aiOptimizations: 28
  },
  {
    id: "2", 
    name: "ecommerce-app",
    status: "building" as const,
    lastDeploy: "5m ago",
    domain: "shop.yourdomain.com",
    branch: "feature/checkout",
    buildTime: "2m 15s",
    visitors: "8.5k",
    aiOptimizations: 35
  },
  {
    id: "3",
    name: "docs-site",
    status: "success" as const,
    lastDeploy: "1d ago",
    domain: "docs.yourdomain.com", 
    branch: "main",
    buildTime: "45s",
    visitors: "1.2k"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Tech Team!</h1>
              <p className="text-muted-foreground">
                Monitor your deployments, view AI insights, and scale with confidence.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-status-success/10 to-status-success/5 border-status-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-status-success">12</p>
                  </div>
                  <GitBranch className="w-8 h-8 text-status-success/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Deploys</p>
                    <p className="text-2xl font-bold text-primary">247</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-ai-primary/10 to-ai-secondary/10 border-ai-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Optimizations</p>
                    <p className="text-2xl font-bold text-ai-primary">94</p>
                  </div>
                  <Zap className="w-8 h-8 text-ai-primary/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Global Uptime</p>
                    <p className="text-2xl font-bold text-warning">99.97%</p>
                  </div>
                  <Badge variant="success" className="text-xs">
                    Excellent
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
              <div className="grid gap-4">
                {mockProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
            
            <DeploymentPipeline />
          </div>

          {/* Right Column - Insights & Monitoring */}
          <div className="space-y-6">
            <AIInsightsPanel />
            <PerformanceMetrics />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
