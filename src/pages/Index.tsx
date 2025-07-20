import { memo, lazy, Suspense, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, GitBranch, Zap, TrendingUp } from "lucide-react";

// Lazy load heavy components for better performance
const AIInsightsPanel = lazy(() => import("@/components/ai/AIInsightsPanel").then(module => ({ default: module.AIInsightsPanel })));
const DeploymentPipeline = lazy(() => import("@/components/deployment/DeploymentPipeline").then(module => ({ default: module.DeploymentPipeline })));
const PerformanceMetrics = lazy(() => import("@/components/monitoring/PerformanceMetrics").then(module => ({ default: module.PerformanceMetrics })));

// Component loading fallbacks
const ComponentSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardContent>
  </Card>
);

// Mock data for demonstration - moved outside component to prevent re-creation
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

// Quick stats data - memoized to prevent re-renders
const quickStatsData = [
  {
    title: "Active Projects",
    value: "12",
    color: "status-success",
    icon: GitBranch,
    gradient: "from-status-success/10 to-status-success/5",
    border: "border-status-success/20"
  },
  {
    title: "Monthly Deploys", 
    value: "247",
    color: "primary",
    icon: TrendingUp,
    gradient: "from-primary/10 to-primary/5",
    border: "border-primary/20"
  },
  {
    title: "AI Optimizations",
    value: "94", 
    color: "ai-primary",
    icon: Zap,
    gradient: "from-ai-primary/10 to-ai-secondary/10",
    border: "border-ai-primary/20"
  },
  {
    title: "Global Uptime",
    value: "99.97%",
    color: "warning",
    icon: null,
    gradient: "from-warning/10 to-warning/5", 
    border: "border-warning/20",
    badge: "Excellent"
  }
];

// Memoized QuickStats component
const QuickStats = memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {quickStatsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`bg-gradient-to-r ${stat.gradient} ${stat.border}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
                {Icon ? (
                  <Icon className={`w-8 h-8 text-${stat.color}/60`} />
                ) : (
                  <Badge variant="success" className="text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

QuickStats.displayName = 'QuickStats';

// Memoized ProjectList component
const ProjectList = memo(() => {
  const projectCards = useMemo(() => 
    mockProjects.map((project) => (
      <ProjectCard key={project.id} project={project} />
    )), []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
      <div className="grid gap-4">
        {projectCards}
      </div>
    </div>
  );
});

ProjectList.displayName = 'ProjectList';

const Index = memo(() => {
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
          <QuickStats />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Projects */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectList />
            
            <Suspense fallback={<ComponentSkeleton />}>
              <DeploymentPipeline />
            </Suspense>
          </div>

          {/* Right Column - Insights & Monitoring */}
          <div className="space-y-6">
            <Suspense fallback={<ComponentSkeleton />}>
              <AIInsightsPanel />
            </Suspense>
            <Suspense fallback={<ComponentSkeleton />}>
              <PerformanceMetrics />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
