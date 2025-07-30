import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ProjectCreationModal } from "@/components/dashboard/ProjectCreationModal";
import { AIInsightsPanel } from "@/components/ai/AIInsightsPanel";
import { DeploymentPipeline } from "@/components/deployment/DeploymentPipeline";
import { PerformanceMetrics } from "@/components/monitoring/PerformanceMetrics";
import { TestRunner } from "@/components/testing/TestRunner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, GitBranch, Zap, TrendingUp, Users, Globe, Shield, Database, Sparkles, Rocket, Activity, Star, ArrowRight, ChevronRight } from "lucide-react";
import { useMemoizedCalculation, usePerformanceMonitoring } from "@/hooks/usePerformanceOptimization";
import { useAnnouncement } from "@/hooks/useAccessibility";
import { useAuth } from "@/contexts/AuthContext";
import { localStorageService } from "@/services/storage/LocalStorageService";
import { ImageProcessor } from "@/components/ai/ImageProcessor";
import { RealTimeAnalytics } from "@/components/analytics/RealTimeAnalytics";
import { CodeAnalyzer } from "@/components/tools/CodeAnalyzer";
import { FileUploadManager } from "@/components/tools/FileUploadManager";

// Memoized components for performance
const MemoizedProjectCard = memo(ProjectCard);
const MemoizedAIInsightsPanel = memo(AIInsightsPanel);
const MemoizedDeploymentPipeline = memo(DeploymentPipeline);
const MemoizedPerformanceMetrics = memo(PerformanceMetrics);
const MemoizedTestRunner = memo(TestRunner);

// Premium dashboard stats component
const DashboardStats = ({ stats }: { stats: any }) => {
  const statsConfig = [
    {
      title: "Active Projects",
      value: stats.activeProjects,
      change: "+12%",
      trend: "up",
      icon: GitBranch,
      gradient: "from-blue-500 to-cyan-500",
      bg: "from-blue-500/10 to-cyan-500/10"
    },
    {
      title: "Monthly Deploys",
      value: stats.monthlyDeploys,
      change: "+23%",
      trend: "up",
      icon: Rocket,
      gradient: "from-green-500 to-emerald-500",
      bg: "from-green-500/10 to-emerald-500/10"
    },
    {
      title: "AI Optimizations",
      value: stats.aiOptimizations,
      change: "+45%",
      trend: "up",
      icon: Sparkles,
      gradient: "from-purple-500 to-pink-500",
      bg: "from-purple-500/10 to-pink-500/10"
    },
    {
      title: "Global Uptime",
      value: `${stats.globalUptime}%`,
      change: "+0.1%",
      trend: "up",
      icon: Activity,
      gradient: "from-orange-500 to-yellow-500",
      bg: "from-orange-500/10 to-yellow-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat, index) => (
        <Card 
          key={stat.title}
          className={`
            relative overflow-hidden card-hover animate-fade-in-up
            bg-gradient-to-br ${stat.bg} border-glass-300 
            hover:shadow-glow-primary transition-all duration-300
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`
                w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} 
                flex items-center justify-center shadow-lg
              `}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <Badge variant="outline" className="text-xs bg-glass-200 border-glass-300">
                {stat.change}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-gradient-primary">
                {stat.value}
              </p>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 hover:opacity-100 transition-opacity"></div>
        </Card>
      ))}
    </div>
  );
};

// Premium hero section
const HeroSection = ({ user, onNewProject }: { user: any, onNewProject: () => void }) => (
  <div className="relative mb-12 animate-fade-in">
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
    <div className="relative p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge className="badge-premium animate-bounce-soft">
                <Star className="w-3 h-3 mr-1" />
                Premium Platform
              </Badge>
              <Badge variant="outline" className="badge-glass">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <h1 className="heading-premium text-gradient-primary">
              Welcome back, {user?.name || 'Developer'}!
            </h1>
            <p className="subheading-premium max-w-2xl">
              Deploy with confidence using our AI-powered platform. Monitor performance, 
              optimize automatically, and scale without limits.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onNewProject}
              className="btn-premium group"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Create New Project
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="btn-glass"
            >
              <Sparkles className="w-5 h-5 mr-2 text-ai-primary" />
              Explore AI Features
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center animate-float">
            <div className="w-48 h-48 rounded-2xl bg-gradient-premium flex items-center justify-center shadow-premium">
              <Rocket className="w-24 h-24 text-white animate-pulse-slow" />
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-ai-primary rounded-full animate-pulse shadow-glow-ai"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-status-success rounded-full animate-bounce-soft"></div>
        </div>
      </div>
    </div>
  </div>
);

// Quick actions component
const QuickActions = ({ onNewProject }: { onNewProject: () => void }) => {
  const actions = [
    { icon: Plus, label: "New Project", action: onNewProject },
    { icon: Zap, label: "AI Optimize", action: () => console.log('AI Optimize') },
    { icon: Rocket, label: "Deploy", action: () => console.log('Deploy') },
    { icon: Shield, label: "Security", action: () => console.log('Security') }
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {actions.map((action, index) => (
        <Button
          key={action.label}
          variant="outline"
          onClick={action.action}
          className={`
            btn-glass group animate-slide-in-right
            hover:scale-105 transition-all duration-200
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <action.icon className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
          {action.label}
          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      ))}
    </div>
  );
};

const Index: React.FC = () => {
  const { measureFunction } = usePerformanceMonitoring('Dashboard');
  const { announce } = useAnnouncement();
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Load projects from local storage
  const loadProjects = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userProjects = localStorageService.getProjects(user.id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Dashboard stats calculation
  const dashboardStats = useMemoizedCalculation(() => {
    return {
      activeProjects: projects.length,
      monthlyDeploys: projects.reduce((total, project) => total + (project.deployments?.length || 0), 0),
      aiOptimizations: projects.reduce((total, project) => total + (project.aiOptimizations || 0), 0),
      globalUptime: 99.9
    };
  }, [projects]);

  const handleNewProject = useCallback(() => {
    measureFunction(() => {
      announce('New project dialog opened');
      setShowProjectModal(true);
    }, 'openNewProjectDialog');
  }, [measureFunction, announce]);

  const handleProjectCreated = useCallback((newProject: any) => {
    // Refresh projects list
    loadProjects();
    announce(`Project ${newProject.name} created successfully`);
  }, [loadProjects, announce]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <div className="container-premium py-12">
          <div className="space-y-6 animate-fade-in">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <main className="container-premium py-8" role="main">
        {/* Hero Section */}
        <HeroSection user={user} onNewProject={handleNewProject} />

        {/* Quick Actions */}
        <QuickActions onNewProject={handleNewProject} />

        {/* Dashboard Stats */}
        <DashboardStats stats={dashboardStats} />

        {/* Tabbed Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex items-center justify-between">
            <TabsList className="glass-morphism border-glass-300 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Globe className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="ai-tools" className="data-[state=active]:bg-ai-primary data-[state=active]:text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Tools
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="testing" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Testing
              </TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Team
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="badge-glass">
                <Database className="w-3 h-3 mr-1" />
                Browser Storage
              </Badge>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Projects */}
              <div className="lg:col-span-2 space-y-8">
                <section aria-labelledby="projects-heading">
                  <div className="flex items-center justify-between mb-6">
                    <h2 id="projects-heading" className="text-2xl font-bold text-gradient-primary">
                      Recent Projects
                    </h2>
                    <Button variant="outline" className="btn-glass">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-6" role="list">
                    {projects.length > 0 ? (
                      projects.slice(0, 3).map((project, index) => (
                        <div 
                          key={project.id} 
                          role="listitem"
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <MemoizedProjectCard project={project} />
                        </div>
                      ))
                    ) : (
                      <Card className="card-glass animate-scale-in">
                        <CardContent className="p-12 text-center">
                          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-premium flex items-center justify-center animate-float">
                            <GitBranch className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-xl font-bold mb-3 text-gradient-primary">Ready to Deploy?</h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Create your first project and experience the power of AI-driven deployment optimization.
                          </p>
                          <Button 
                            onClick={handleNewProject}
                            className="btn-premium"
                            size="lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Your First Project
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </section>
                
                <section aria-labelledby="deployment-heading" className="animate-fade-in-up delay-300">
                  <MemoizedDeploymentPipeline />
                </section>
              </div>

              {/* Right Column - Insights & Monitoring */}
              <div className="space-y-8">
                <section aria-labelledby="ai-insights-heading" className="animate-slide-in-right">
                  <MemoizedAIInsightsPanel />
                </section>
                <section aria-labelledby="performance-heading" className="animate-slide-in-right delay-200">
                  <MemoizedPerformanceMetrics />
                </section>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="animate-scale-in">
                <ImageProcessor />
              </div>
              <div className="space-y-8">
                <div className="animate-scale-in delay-100">
                  <CodeAnalyzer />
                </div>
                <div className="animate-scale-in delay-200">
                  <FileUploadManager />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8 animate-fade-in">
            <RealTimeAnalytics />
          </TabsContent>

          <TabsContent value="testing" className="space-y-8 animate-fade-in">
            <section aria-labelledby="testing-heading">
              <h2 id="testing-heading" className="text-2xl font-bold mb-6 text-gradient-primary">
                Testing Infrastructure
              </h2>
              <MemoizedTestRunner />
            </section>
          </TabsContent>

          <TabsContent value="team" className="space-y-8 animate-fade-in">
            <section aria-labelledby="team-heading">
              <h2 id="team-heading" className="text-2xl font-bold mb-6 text-gradient-primary">
                Team Management
              </h2>
              <Card className="card-glass">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse-slow">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gradient-primary">Team Features</h3>
                  <p className="text-muted-foreground mb-6">
                    Advanced team management and collaboration features are coming soon. 
                    Invite team members, manage permissions, and collaborate seamlessly.
                  </p>
                  <Button variant="outline" className="btn-glass">
                    <Users className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* Project Creation Modal */}
      <ProjectCreationModal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default memo(Index);
