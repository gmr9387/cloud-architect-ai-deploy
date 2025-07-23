import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  AlertTriangle,
  BarChart3
} from "lucide-react";

interface TestSuite {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  tests: TestCase[];
  coverage: number;
  duration?: number;
}

interface TestCase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

// Mock test data for demonstration
const mockTestSuites: TestSuite[] = [
  {
    id: 'unit-tests',
    name: 'Unit Tests',
    status: 'passed',
    coverage: 94,
    duration: 1.2,
    tests: [
      { id: 'test-1', name: 'ProjectCard rendering', status: 'passed', duration: 0.1 },
      { id: 'test-2', name: 'Button interactions', status: 'passed', duration: 0.15 },
      { id: 'test-3', name: 'Form validation', status: 'passed', duration: 0.22 },
      { id: 'test-4', name: 'API data formatting', status: 'passed', duration: 0.08 }
    ]
  },
  {
    id: 'integration-tests',
    name: 'Integration Tests',
    status: 'running',
    coverage: 78,
    tests: [
      { id: 'test-5', name: 'Authentication flow', status: 'passed', duration: 0.8 },
      { id: 'test-6', name: 'Project deployment', status: 'running' },
      { id: 'test-7', name: 'WebSocket connection', status: 'pending' }
    ]
  },
  {
    id: 'e2e-tests',
    name: 'End-to-End Tests',
    status: 'failed',
    coverage: 65,
    duration: 3.4,
    tests: [
      { id: 'test-8', name: 'User registration', status: 'passed', duration: 1.1 },
      { id: 'test-9', name: 'Project creation', status: 'failed', duration: 2.3, error: 'Element not found: #submit-button' },
      { id: 'test-10', name: 'Dashboard navigation', status: 'pending' }
    ]
  }
];

const statusConfig = {
  pending: { icon: Clock, color: 'muted', label: 'Pending' },
  running: { icon: Play, color: 'primary', label: 'Running' },
  passed: { icon: CheckCircle, color: 'success', label: 'Passed' },
  failed: { icon: XCircle, color: 'destructive', label: 'Failed' }
};

export const TestRunner: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>(mockTestSuites);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    
    // Simulate test execution
    for (let i = 0; i < testSuites.length; i++) {
      setTestSuites(prev => 
        prev.map((suite, index) => 
          index === i ? { ...suite, status: 'running' as const } : suite
        )
      );
      
      // Simulate test duration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestSuites(prev => 
        prev.map((suite, index) => 
          index === i ? { 
            ...suite, 
            status: Math.random() > 0.8 ? 'failed' as const : 'passed' as const,
            duration: Math.random() * 3 + 0.5
          } : suite
        )
      );
    }
    
    setIsRunning(false);
  }, [testSuites.length]);

  const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'passed').length, 0
  );
  const failedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'failed').length, 0
  );
  const averageCoverage = testSuites.reduce((acc, suite) => acc + suite.coverage, 0) / testSuites.length;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>Test Suite Runner</CardTitle>
          </div>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-gradient-to-r from-primary to-primary-glow"
          >
            {isRunning ? (
              <>
                <Play className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Test Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalTests}</div>
            <div className="text-sm text-muted-foreground">Total Tests</div>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="text-2xl font-bold text-success">{passedTests}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </div>
          <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="text-2xl font-bold text-destructive">{failedTests}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div className="text-center p-4 bg-ai-primary/10 rounded-lg border border-ai-primary/20">
            <div className="text-2xl font-bold text-ai-primary">{averageCoverage.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Coverage</div>
          </div>
        </div>

        {/* Test Suites */}
        <div className="space-y-4">
          {testSuites.map((suite) => {
            const StatusIcon = statusConfig[suite.status].icon;
            
            return (
              <div key={suite.id} className="border border-border/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-5 h-5 text-${statusConfig[suite.status].color}`} />
                    <h3 className="font-semibold">{suite.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`bg-${statusConfig[suite.status].color}/10 text-${statusConfig[suite.status].color} border-${statusConfig[suite.status].color}/20`}
                    >
                      {statusConfig[suite.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{suite.tests.length} tests</span>
                    {suite.duration && <span>{suite.duration}s</span>}
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>{suite.coverage}%</span>
                    </div>
                  </div>
                </div>

                {/* Coverage Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Test Coverage</span>
                    <span className="font-medium">{suite.coverage}%</span>
                  </div>
                  <Progress value={suite.coverage} className="h-2" />
                </div>

                {/* Individual Tests */}
                <div className="space-y-2">
                  {suite.tests.map((test) => {
                    const TestIcon = statusConfig[test.status].icon;
                    
                    return (
                      <div key={test.id} className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                        <div className="flex items-center space-x-2">
                          <TestIcon className={`w-4 h-4 text-${statusConfig[test.status].color}`} />
                          <span>{test.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {test.duration && (
                            <span className="text-muted-foreground">{test.duration}s</span>
                          )}
                          {test.error && (
                            <div className="flex items-center space-x-1 text-destructive">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="max-w-40 truncate" title={test.error}>
                                {test.error}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};