import { memo, lazy, Suspense, useMemo, useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, GitBranch, Zap, TrendingUp, Brain, Users, Shield, Sparkles } from "lucide-react";

// Lazy load heavy components for better performance
const AIInsightsPanel = lazy(() => import("@/components/ai/AIInsightsPanel").then(module => ({ default: module.AIInsightsPanel })));
const DeploymentPipeline = lazy(() => import("@/components/deployment/DeploymentPipeline").then(module => ({ default: module.DeploymentPipeline })));
const PerformanceMetrics = lazy(() => import("@/components/monitoring/PerformanceMetrics").then(module => ({ default: module.PerformanceMetrics })));

// Lazy load premium features
const AIOptimizationEngine = lazy(() => import("@/components/ai/AIOptimizationEngine").then(module => ({ default: module.AIOptimizationEngine })));
const RealTimeCollaboration = lazy(() => import("@/components/collaboration/RealTimeCollaboration").then(module => ({ default: module.RealTimeCollaboration })));
const SecurityCenter = lazy(() => import("@/components/enterprise/SecurityCenter").then(module => ({ default: module.SecurityCenter })));

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

// Premium feature skeleton
const PremiumSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

// Project interface
interface Project {
  id: string;
  name: string;
  status: 'building' | 'success' | 'failed' | 'pending';
  lastDeploy: string;
  domain: string;
  branch: string;
  buildTime: string;
  visitors: string;
  aiOptimizations?: number;
}

// Stats interface
interface DashboardStats {
  activeProjects: number;
  monthlyDeploys: number;
  aiOptimizations: number;
  securityScore: number;
}

// Quick stats data structure
const getQuickStatsData = (stats: DashboardStats) => [
  {
    title: "Active Projects",
    value: stats.activeProjects.toString(),
    color: "status-success",
    icon: GitBranch,
    gradient: "from-status-success/10 to-status-success/5",
    border: "border-status-success/20"
  },
  {
    title: "Monthly Deploys", 
    value: stats.monthlyDeploys.toString(),
    color: "primary",
    icon: TrendingUp,
    gradient: "from-primary/10 to-primary/5",
    border: "border-primary/20"
  },
  {
    title: "AI Optimizations",
    value: stats.aiOptimizations.toString(), 
    color: "ai-primary",
    icon: Zap,
    gradient: "from-ai-primary/10 to-ai-secondary/10",
    border: "border-ai-primary/20",
    badge: "Premium"
  },
  {
    title: "Security Score",
    value: `${stats.securityScore}/100`,
    color: "green-600",
    icon: Shield,
    gradient: "from-green-100/50 to-green-50",
    border: "border-green-200",
    badge: "Enterprise"
  }
];

// Memoized QuickStats component
const QuickStats = memo(({ stats }: { stats: DashboardStats }) => {
  const quickStatsData = useMemo(() => getQuickStatsData(stats), [stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {quickStatsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`bg-gradient-to-r ${stat.gradient} ${stat.border} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Icon className={`w-8 h-8 text-${stat.color}/60`} />
                  {stat.badge && (
                    <Badge variant="outline" className="text-xs">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
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
const ProjectList = memo(({ projects, isLoading }: { projects: Project[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <ComponentSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GitBranch className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Get started by creating your first project. Deploy any framework in seconds.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
      <div className="grid gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
});

ProjectList.displayName = 'ProjectList';

// API functions (to be implemented with real backend)
const fetchProjects = async (): Promise<Project[]> => {
  // TODO: Replace with actual API call
  // Example: const response = await fetch('/api/projects');
  // return response.json();
  
  // For now, return empty array - real data will come from backend
  return [];
};

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // TODO: Replace with actual API call
  // Example: const response = await fetch('/api/dashboard/stats');
  // return response.json();
  
  // For now, return default stats - real data will come from backend
  return {
    activeProjects: 0,
    monthlyDeploys: 0,
    aiOptimizations: 0,
    securityScore: 0
  };
};

const Index = memo(() => {
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    monthlyDeploys: 0,
    aiOptimizations: 0,
    securityScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [projectsData, statsData] = await Promise.all([
          fetchProjects(),
          fetchDashboardStats()
        ]);
        
        setProjects(projectsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Handle error state - could show error message to user
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
                Monitor deployments, leverage AI insights, collaborate in real-time, and maintain enterprise security.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="bg-gradient-to-r from-ai-primary/10 to-ai-secondary/10 border-ai-primary/20">
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </Button>
              <Button className="bg-gradient-to-r from-primary to-primary-glow">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <QuickStats stats={stats} />
        </div>

        {/* Premium Features Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ai-optimization" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Optimization</span>
              <Badge variant="secondary" className="ml-1">Premium</Badge>
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Team Collaboration</span>
              <Badge variant="secondary" className="ml-1">Live</Badge>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security Center</span>
              <Badge variant="secondary" className="ml-1">Enterprise</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Original Dashboard */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Projects */}
              <div className="lg:col-span-2 space-y-6">
                <ProjectList projects={projects} isLoading={isLoading} />
                
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
          </TabsContent>

          {/* AI Optimization Tab */}
          <TabsContent value="ai-optimization">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-ai-primary/20 rounded-lg">
                  <Brain className="w-8 h-8 text-ai-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI-Powered Optimization Engine</h2>
                  <p className="text-muted-foreground">
                    Automatically analyze, optimize, and improve your applications with advanced AI
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-ai-primary to-ai-secondary text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Market Leading
                </Badge>
              </div>
              
              <Suspense fallback={<PremiumSkeleton />}>
                <AIOptimizationEngine />
              </Suspense>
            </div>
          </TabsContent>

          {/* Collaboration Tab */}
          <TabsContent value="collaboration">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Real-Time Team Collaboration</h2>
                  <p className="text-muted-foreground">
                    Work together seamlessly with live cursors, team chat, and shared deployments
                  </p>
                </div>
                <Badge className="bg-blue-600 text-white">
                  Real-time
                </Badge>
              </div>
              
              <Suspense fallback={<PremiumSkeleton />}>
                <RealTimeCollaboration />
              </Suspense>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Enterprise Security Center</h2>
                  <p className="text-muted-foreground">
                    Comprehensive security monitoring, compliance tracking, and vulnerability management
                  </p>
                </div>
                <Badge className="bg-red-600 text-white">
                  Enterprise Grade
                </Badge>
              </div>
              
              <Suspense fallback={<PremiumSkeleton />}>
                <SecurityCenter />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
