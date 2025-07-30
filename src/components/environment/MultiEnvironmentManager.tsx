import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  ArrowRight, 
  Settings, 
  Globe, 
  Database, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  GitBranch,
  Zap,
  Lock,
  Unlock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface Environment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  status: 'healthy' | 'warning' | 'error' | 'deploying';
  url: string;
  lastDeployment: string;
  version: string;
  uptime: number;
  responseTime: number;
  errorRate: number;
  config: EnvironmentConfig;
}

interface EnvironmentConfig {
  database: string;
  cache: string;
  cdn: string;
  monitoring: boolean;
  backups: boolean;
  ssl: boolean;
  autoScaling: boolean;
}

const MultiEnvironmentManager: React.FC = () => {
  const [environments, setEnvironments] = useState<Environment[]>([
    {
      id: 'dev',
      name: 'Development',
      type: 'development',
      status: 'healthy',
      url: 'https://dev.myapp.com',
      lastDeployment: '2 hours ago',
      version: 'v2.1.0-dev',
      uptime: 99.8,
      responseTime: 120,
      errorRate: 0.1,
      config: {
        database: 'SQLite',
        cache: 'Redis (Local)',
        cdn: 'Disabled',
        monitoring: false,
        backups: false,
        ssl: true,
        autoScaling: false
      }
    },
    {
      id: 'staging',
      name: 'Staging',
      type: 'staging',
      status: 'healthy',
      url: 'https://staging.myapp.com',
      lastDeployment: '1 hour ago',
      version: 'v2.1.0-rc',
      uptime: 99.9,
      responseTime: 95,
      errorRate: 0.05,
      config: {
        database: 'PostgreSQL',
        cache: 'Redis',
        cdn: 'CloudFlare',
        monitoring: true,
        backups: true,
        ssl: true,
        autoScaling: false
      }
    },
    {
      id: 'prod',
      name: 'Production',
      type: 'production',
      status: 'healthy',
      url: 'https://myapp.com',
      lastDeployment: '30 minutes ago',
      version: 'v2.0.9',
      uptime: 99.95,
      responseTime: 85,
      errorRate: 0.02,
      config: {
        database: 'PostgreSQL (Multi-AZ)',
        cache: 'Redis Cluster',
        cdn: 'CloudFlare Pro',
        monitoring: true,
        backups: true,
        ssl: true,
        autoScaling: true
      }
    }
  ]);

  const [promotionWorkflow, setPromotionWorkflow] = useState({
    autoPromote: false,
    requireApproval: true,
    runTests: true,
    healthChecks: true,
    rollbackOnFailure: true
  });

  const handlePromote = (fromEnv: string, toEnv: string) => {
    console.log(`Promoting from ${fromEnv} to ${toEnv}`);
    // Implementation for environment promotion
  };

  const handleEnvironmentAction = (envId: string, action: string) => {
    console.log(`${action} for environment ${envId}`);
    // Implementation for environment actions
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      case 'deploying': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'development': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'staging': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'production': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>Multi-Environment Management</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              All Healthy
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Environment Overview</TabsTrigger>
            <TabsTrigger value="promotion">Promotion Workflow</TabsTrigger>
            <TabsTrigger value="configs">Environment Configs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {environments.map((env) => (
                <Card key={env.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          env.status === 'healthy' ? 'bg-green-500' :
                          env.status === 'warning' ? 'bg-yellow-500' :
                          env.status === 'error' ? 'bg-red-500' :
                          'bg-blue-500 animate-pulse'
                        }`}></div>
                        <CardTitle className="text-lg">{env.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className={getTypeColor(env.type)}>
                        {env.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-medium">{env.version}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{env.uptime}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium">{env.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Error Rate</span>
                        <span className="font-medium">{env.errorRate}%</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Health Score</span>
                        <span className="text-xs font-medium">{(env.uptime * 0.4 + (100 - env.errorRate) * 0.4 + (1000 - env.responseTime) / 10 * 0.2).toFixed(1)}%</span>
                      </div>
                      <Progress value={(env.uptime * 0.4 + (100 - env.errorRate) * 0.4 + (1000 - env.responseTime) / 10 * 0.2)} className="h-2" />
                    </div>

                    <div className="flex items-center space-x-2 pt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Globe className="w-3 h-3 mr-1" />
                        Visit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="promotion" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Promotion Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Development</div>
                        <div className="text-xs text-muted-foreground">v2.1.0-dev</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Staging</div>
                        <div className="text-xs text-muted-foreground">v2.1.0-rc</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Globe className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Production</div>
                        <div className="text-xs text-muted-foreground">v2.0.9</div>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button className="w-full" onClick={() => handlePromote('staging', 'prod')}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Promote to Production
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Promotion Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-promote" className="text-sm font-medium">Auto-Promote</Label>
                      <p className="text-xs text-muted-foreground">Automatically promote after tests pass</p>
                    </div>
                    <Switch 
                      id="auto-promote"
                      checked={promotionWorkflow.autoPromote}
                      onCheckedChange={(checked) => setPromotionWorkflow(prev => ({ ...prev, autoPromote: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-approval" className="text-sm font-medium">Require Approval</Label>
                      <p className="text-xs text-muted-foreground">Manual approval for production</p>
                    </div>
                    <Switch 
                      id="require-approval"
                      checked={promotionWorkflow.requireApproval}
                      onCheckedChange={(checked) => setPromotionWorkflow(prev => ({ ...prev, requireApproval: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="run-tests" className="text-sm font-medium">Run Tests</Label>
                      <p className="text-xs text-muted-foreground">Execute test suite before promotion</p>
                    </div>
                    <Switch 
                      id="run-tests"
                      checked={promotionWorkflow.runTests}
                      onCheckedChange={(checked) => setPromotionWorkflow(prev => ({ ...prev, runTests: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="health-checks" className="text-sm font-medium">Health Checks</Label>
                      <p className="text-xs text-muted-foreground">Verify environment health</p>
                    </div>
                    <Switch 
                      id="health-checks"
                      checked={promotionWorkflow.healthChecks}
                      onCheckedChange={(checked) => setPromotionWorkflow(prev => ({ ...prev, healthChecks: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="rollback-failure" className="text-sm font-medium">Rollback on Failure</Label>
                      <p className="text-xs text-muted-foreground">Auto-rollback if deployment fails</p>
                    </div>
                    <Switch 
                      id="rollback-failure"
                      checked={promotionWorkflow.rollbackOnFailure}
                      onCheckedChange={(checked) => setPromotionWorkflow(prev => ({ ...prev, rollbackOnFailure: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="configs" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {environments.map((env) => (
                <Card key={env.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>{env.name} Config</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Database</span>
                        <span className="font-medium">{env.config.database}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cache</span>
                        <span className="font-medium">{env.config.cache}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CDN</span>
                        <span className="font-medium">{env.config.cdn}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-border">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Monitoring</span>
                          <Badge variant={env.config.monitoring ? "default" : "secondary"}>
                            {env.config.monitoring ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Backups</span>
                          <Badge variant={env.config.backups ? "default" : "secondary"}>
                            {env.config.backups ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">SSL</span>
                          <Badge variant={env.config.ssl ? "default" : "secondary"}>
                            {env.config.ssl ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Auto Scaling</span>
                          <Badge variant={env.config.autoScaling ? "default" : "secondary"}>
                            {env.config.autoScaling ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MultiEnvironmentManager;