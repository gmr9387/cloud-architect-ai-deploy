import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
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
import { Plus, GitBranch, Zap, TrendingUp, Users, Globe, Shield, Database, Sparkles } from "lucide-react";
import { useMemoizedCalculation, usePerformanceMonitoring } from "@/hooks/usePerformanceOptimization";
import { useAnnouncement } from "@/hooks/useAccessibility";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_MODE, demoProjects, demoAnalytics } from "@/data/demoData";
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

const Index: React.FC = () => {
  const { measureFunction } = usePerformanceMonitoring('Dashboard');
  const { announce } = useAnnouncement();
  const { user, isAuthenticated } = useAuth();
  const [showDemoData, setShowDemoData] = useState(DEMO_MODE);

  // Production-ready dashboard stats with demo fallback
  const dashboardStats = useMemoizedCalculation(() => {
    if (showDemoData) {
      return {
        activeProjects: demoProjects.length,
        monthlyDeploys: demoAnalytics.totalDeployments,
        aiOptimizations: demoAnalytics.aiOptimizationsApplied,
        globalUptime: 99.9
      };
    }
    return {
      activeProjects: 0, // Connect to your project management API
      monthlyDeploys: 0, // Connect to your deployment analytics API
      aiOptimizations: 0, // Connect to your AI optimization service
      globalUptime: 99.9 // Connect to your monitoring service
    };
  }, [showDemoData]);

  const handleNewProject = useCallback(() => {
    measureFunction(() => {
      announce('New project dialog opened');
      // Production: Integrate with your project creation API
      console.log('Ready for project creation API integration');
    }, 'openNewProjectDialog');
  }, [measureFunction, announce]);

  // Demo data toggle for presentation
  const recentProjects = showDemoData ? demoProjects : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8" role="main">
        {/* Welcome Section */}
        <section className="mb-8" aria-labelledby="welcome-heading">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h1 
                id="welcome-heading" 
                className="text-2xl lg:text-3xl font-bold mb-2"
              >
                Welcome back, {user?.name || 'Developer'}!
              </h1>
              <p className="text-muted-foreground">
                Monitor your deployments, view AI insights, and scale with confidence.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Demo Data Toggle */}
              <div className="flex items-center space-x-2 bg-card/50 border rounded-lg p-3">
                <Database className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="demo-mode" className="text-sm">Demo Data</Label>
                <Switch 
                  id="demo-mode"
                  checked={showDemoData}
                  onCheckedChange={setShowDemoData}
                />
              </div>
              <Button 
                onClick={handleNewProject}
                className="bg-gradient-to-r from-primary to-primary-glow"
                aria-label="Create new project"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                New Project
              </Button>
            </div>
          </div>
          
          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" role="region" aria-label="Dashboard statistics">
            <Card className="bg-gradient-to-r from-status-success/10 to-status-success/5 border-status-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-status-success" aria-label={`${dashboardStats.activeProjects} active projects`}>
                      {dashboardStats.activeProjects}
                    </p>
                  </div>
                  <GitBranch className="w-8 h-8 text-status-success/60" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Deploys</p>
                    <p className="text-2xl font-bold text-primary" aria-label={`${dashboardStats.monthlyDeploys} monthly deployments`}>
                      {dashboardStats.monthlyDeploys}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary/60" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-ai-primary/10 to-ai-secondary/10 border-ai-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Optimizations</p>
                    <p className="text-2xl font-bold text-ai-primary" aria-label={`${dashboardStats.aiOptimizations} AI optimizations applied`}>
                      {dashboardStats.aiOptimizations}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-ai-primary/60" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Global Uptime</p>
                    <p className="text-2xl font-bold text-warning" aria-label={`${dashboardStats.globalUptime}% global uptime`}>
                      {dashboardStats.globalUptime}%
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                    Excellent
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabbed Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-[600px]">
            <TabsTrigger value="overview" className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span>AI Tools</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Testing</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Projects */}
              <div className="lg:col-span-2 space-y-6">
                <section aria-labelledby="projects-heading">
                  <h2 id="projects-heading" className="text-xl font-semibold mb-4">Recent Projects</h2>
                  <div className="grid gap-4" role="list">
                    {recentProjects.length > 0 ? (
                      recentProjects.map((project) => (
                        <div key={project.id} role="listitem">
                          <MemoizedProjectCard project={project} />
                        </div>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <GitBranch className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="font-semibold mb-2">No projects yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Get started by creating your first project or connecting to your existing repository.
                          </p>
                          <Button 
                            onClick={handleNewProject}
                            className="bg-gradient-to-r from-primary to-primary-glow"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Project
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </section>
                
                <section aria-labelledby="deployment-heading">
                  <MemoizedDeploymentPipeline />
                </section>
              </div>

              {/* Right Column - Insights & Monitoring */}
              <div className="space-y-6">
                <section aria-labelledby="ai-insights-heading">
                  <MemoizedAIInsightsPanel />
                </section>
                <section aria-labelledby="performance-heading">
                  <MemoizedPerformanceMetrics />
                </section>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ImageProcessor />
              <div className="space-y-6">
                <CodeAnalyzer />
                <FileUploadManager />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <RealTimeAnalytics />
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <section aria-labelledby="testing-heading">
              <h2 id="testing-heading" className="text-xl font-semibold mb-4">Testing Infrastructure</h2>
              <MemoizedTestRunner />
            </section>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <section aria-labelledby="team-heading">
              <h2 id="team-heading" className="text-xl font-semibold mb-4">Team Management</h2>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-center">
                    Team management features coming soon. Connect to Supabase for user management.
                  </p>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MemoizedAIInsightsPanel />
              <MemoizedPerformanceMetrics />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default memo(Index);
