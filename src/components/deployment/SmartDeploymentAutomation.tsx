import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Zap, 
  Shield, 
  Eye, 
  Play, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  GitBranch,
  Globe,
  Database
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DeploymentStrategy {
  id: string;
  name: string;
  description: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedTime: string;
  aiReasoning: string;
}

interface DeploymentPreview {
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  breakingChanges: boolean;
  performanceImpact: 'low' | 'medium' | 'high';
  securityRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

const SmartDeploymentAutomation: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [deploymentPreview, setDeploymentPreview] = useState<DeploymentPreview>({
    filesChanged: 12,
    linesAdded: 156,
    linesRemoved: 23,
    breakingChanges: false,
    performanceImpact: 'low',
    securityRisk: 'low',
    recommendations: [
      'Consider canary deployment for new API endpoints',
      'Database migrations detected - ensure backup before deployment',
      'Performance impact is minimal - safe for production'
    ]
  });

  const strategies: DeploymentStrategy[] = [
    {
      id: 'blue-green',
      name: 'Blue-Green Deployment',
      description: 'Zero-downtime deployment with instant rollback capability',
      confidence: 95,
      riskLevel: 'low',
      estimatedTime: '2-3 minutes',
      aiReasoning: 'Recommended for production deployments with high traffic. Provides instant rollback and zero downtime.'
    },
    {
      id: 'canary',
      name: 'Canary Deployment',
      description: 'Gradual rollout to 10% of users first',
      confidence: 88,
      riskLevel: 'medium',
      estimatedTime: '5-8 minutes',
      aiReasoning: 'Good for testing new features with real users. Allows monitoring before full rollout.'
    },
    {
      id: 'rolling',
      name: 'Rolling Update',
      description: 'Gradual replacement of instances',
      confidence: 82,
      riskLevel: 'medium',
      estimatedTime: '3-5 minutes',
      aiReasoning: 'Balanced approach for moderate risk changes. Provides gradual rollout with monitoring.'
    },
    {
      id: 'recreate',
      name: 'Recreate Deployment',
      description: 'Stop old version, deploy new version',
      confidence: 75,
      riskLevel: 'high',
      estimatedTime: '1-2 minutes',
      aiReasoning: 'Fastest deployment but includes downtime. Use only for non-critical services.'
    }
  ];

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setSelectedStrategy('blue-green');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDeploy = () => {
    // Implementation for deployment execution
    console.log('Deploying with strategy:', selectedStrategy);
  };

  const handleRollback = () => {
    // Implementation for intelligent rollback
    console.log('Initiating intelligent rollback');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-ai-primary" />
            <span>Smart Deployment Automation</span>
          </CardTitle>
          <Badge variant="outline" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
            <Zap className="w-3 h-3 mr-1" />
            AI Enhanced
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isAnalyzing ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-ai-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">AI analyzing deployment strategy...</p>
            <Progress value={65} className="mt-4" />
          </div>
        ) : (
          <>
            {/* Deployment Preview */}
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Deployment Preview</TabsTrigger>
                <TabsTrigger value="strategies">AI Strategies</TabsTrigger>
                <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Changes Preview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Files Changed</span>
                        <span className="font-medium">{deploymentPreview.filesChanged}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Lines Added</span>
                        <span className="font-medium text-green-600">+{deploymentPreview.linesAdded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Lines Removed</span>
                        <span className="font-medium text-red-600">-{deploymentPreview.linesRemoved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Breaking Changes</span>
                        <Badge variant={deploymentPreview.breakingChanges ? "destructive" : "secondary"}>
                          {deploymentPreview.breakingChanges ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Risk Assessment</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Performance Impact</span>
                        <Badge variant="outline" className={`${
                          deploymentPreview.performanceImpact === 'low' ? 'bg-green-50 text-green-700 border-green-200' :
                          deploymentPreview.performanceImpact === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {deploymentPreview.performanceImpact}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Security Risk</span>
                        <Badge variant="outline" className={`${
                          deploymentPreview.securityRisk === 'low' ? 'bg-green-50 text-green-700 border-green-200' :
                          deploymentPreview.securityRisk === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {deploymentPreview.securityRisk}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Recommendations:</strong> {deploymentPreview.recommendations[0]}
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="strategies" className="space-y-4">
                <div className="space-y-3">
                  {strategies.map((strategy) => (
                    <Card 
                      key={strategy.id}
                      className={`cursor-pointer transition-all ${
                        selectedStrategy === strategy.id 
                          ? 'ring-2 ring-ai-primary bg-ai-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedStrategy(strategy.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{strategy.name}</h4>
                              <Badge variant="outline" className={`${
                                strategy.riskLevel === 'low' ? 'bg-green-50 text-green-700 border-green-200' :
                                strategy.riskLevel === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {strategy.riskLevel} risk
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{strategy.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Confidence: {strategy.confidence}%</span>
                              <span>Time: {strategy.estimatedTime}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {strategy.aiReasoning}
                            </p>
                          </div>
                          {selectedStrategy === strategy.id && (
                            <CheckCircle className="w-5 h-5 text-ai-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Response Time</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">245ms</div>
                      <div className="text-xs text-muted-foreground">-12ms from last deployment</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Error Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">0.02%</div>
                      <div className="text-xs text-muted-foreground">Within acceptable range</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <GitBranch className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Active Users</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">1,247</div>
                      <div className="text-xs text-muted-foreground">+5% from yesterday</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-4 border-t border-border">
              <Button 
                onClick={handleDeploy}
                className="bg-gradient-to-r from-ai-primary to-ai-secondary"
                disabled={!selectedStrategy}
              >
                <Play className="w-4 h-4 mr-2" />
                Deploy with AI Strategy
              </Button>
              
              <Button variant="outline" onClick={handleRollback}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Smart Rollback
              </Button>
              
              <Button variant="ghost" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Schedule Deployment
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartDeploymentAutomation;