import { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  FileText,
  Globe,
  Key,
  UserCheck,
  Clock,
  TrendingUp,
  Settings,
  Download,
  RefreshCw,
  Zap,
  Database,
  Wifi,
  Terminal
} from 'lucide-react';

interface SecurityVulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  package: string;
  version: string;
  fixedIn?: string;
  cve?: string;
  status: 'open' | 'ignored' | 'fixed';
  detectedAt: Date;
}

interface ComplianceCheck {
  id: string;
  framework: 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'ISO27001';
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  description: string;
  lastChecked: Date;
  evidence?: string[];
}

interface AccessEvent {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure' | 'blocked';
  riskLevel: 'low' | 'medium' | 'high';
}

interface SecurityMetrics {
  overallScore: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance: {
    compliant: number;
    total: number;
    frameworks: string[];
  };
  accessAttempts: {
    total: number;
    blocked: number;
    suspicious: number;
  };
  lastScan: Date;
}

// API functions for security features
const fetchSecurityMetrics = async (): Promise<SecurityMetrics> => {
  // TODO: Replace with actual API call
  // Example: const response = await fetch('/api/security/metrics');
  // return response.json();
  
  // For now, return default metrics - real data will come from backend
  return {
    overallScore: 0,
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    compliance: {
      compliant: 0,
      total: 0,
      frameworks: []
    },
    accessAttempts: {
      total: 0,
      blocked: 0,
      suspicious: 0
    },
    lastScan: new Date()
  };
};

const fetchVulnerabilities = async (): Promise<SecurityVulnerability[]> => {
  // TODO: Replace with actual API call
  // Example: const response = await fetch('/api/security/vulnerabilities');
  // return response.json();
  
  // For now, return empty array - real data will come from backend
  return [];
};

const fetchComplianceChecks = async (): Promise<ComplianceCheck[]> => {
  // TODO: Replace with actual API call
  // Example: const response = await fetch('/api/security/compliance');
  // return response.json();
  
  // For now, return empty array - real data will come from backend
  return [];
};

const fetchAccessEvents = async (): Promise<AccessEvent[]> => {
  // TODO: Replace with actual API call
  // Example: const response = await fetch('/api/security/access-events');
  // return response.json();
  
  // For now, return empty array - real data will come from backend
  return [];
};

const runSecurityScan = async (): Promise<void> => {
  // TODO: Replace with actual API call
  // Example: await fetch('/api/security/scan', { method: 'POST' });
  
  // Simulate scan delay
  await new Promise(resolve => setTimeout(resolve, 5000));
};

const generateComplianceReport = async (framework: string): Promise<void> => {
  // TODO: Replace with actual API call
  // Example: await fetch(`/api/security/compliance/report/${framework}`, { method: 'POST' });
  
  // Simulate report generation delay
  await new Promise(resolve => setTimeout(resolve, 3000));
};

const severityConfig = {
  critical: { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical', priority: 4 },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High', priority: 3 },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium', priority: 2 },
  low: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Low', priority: 1 }
};

const complianceConfig = {
  'SOC2': { icon: Shield, color: 'text-blue-600' },
  'GDPR': { icon: Globe, color: 'text-green-600' },
  'HIPAA': { icon: FileText, color: 'text-purple-600' },
  'PCI-DSS': { icon: Lock, color: 'text-red-600' },
  'ISO27001': { icon: CheckCircle, color: 'text-indigo-600' }
};

export const SecurityCenter = memo(() => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<SecurityVulnerability[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [accessEvents, setAccessEvents] = useState<AccessEvent[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load security data
  const loadSecurityData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [metricsData, vulnData, complianceData, accessData] = await Promise.all([
        fetchSecurityMetrics(),
        fetchVulnerabilities(),
        fetchComplianceChecks(),
        fetchAccessEvents()
      ]);
      
      setMetrics(metricsData);
      setVulnerabilities(vulnData);
      setComplianceChecks(complianceData);
      setAccessEvents(accessData);
    } catch (error) {
      console.error('Failed to load security data:', error);
      // Handle error state - could show error message to user
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run security scan
  const handleSecurityScan = useCallback(async () => {
    try {
      setIsScanning(true);
      await runSecurityScan();
      // Reload data after scan
      await loadSecurityData();
    } catch (error) {
      console.error('Security scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  }, [loadSecurityData]);

  // Generate compliance report
  const handleGenerateReport = useCallback(async (framework: string) => {
    try {
      setIsGeneratingReport(true);
      await generateComplianceReport(framework);
      // In real implementation, this would trigger download or show success message
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state when no security data
  if (!metrics || (vulnerabilities.length === 0 && complianceChecks.length === 0 && accessEvents.length === 0)) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Shield className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Security Center Setup Required</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Initialize security monitoring to track vulnerabilities, compliance status, and access control.
          </p>
          <Button
            onClick={handleSecurityScan}
            disabled={isScanning}
            className="bg-gradient-to-r from-red-600 to-red-700"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Initializing Security...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Initialize Security Monitoring
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalVulnerabilities = vulnerabilities.length;
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
  const compliancePercentage = metrics.compliance.total > 0 
    ? Math.round((metrics.compliance.compliant / metrics.compliance.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Security Overview</CardTitle>
                <p className="text-muted-foreground">
                  Enterprise-grade security monitoring and compliance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`
                ${metrics.overallScore >= 80 ? 'bg-green-100 text-green-700' : 
                  metrics.overallScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'}
              `}>
                Score: {metrics.overallScore}/100
              </Badge>
              <Button onClick={handleSecurityScan} variant="outline" size="sm" disabled={isScanning}>
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-1" />
                    Run Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{criticalVulns}</p>
            <p className="text-sm text-muted-foreground">Critical Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{compliancePercentage}%</p>
            <p className="text-sm text-muted-foreground">Compliance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{metrics.accessAttempts.blocked}</p>
            <p className="text-sm text-muted-foreground">Blocked Attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {Math.floor((Date.now() - metrics.lastScan.getTime()) / (1000 * 60 * 60))}h
            </p>
            <p className="text-sm text-muted-foreground">Last Scan</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalVulns > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalVulns} critical security vulnerabilities</strong> require immediate attention. 
            These issues pose significant risk to your application security.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Tabs */}
      <Tabs defaultValue="vulnerabilities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vulnerabilities">
            Vulnerabilities ({totalVulnerabilities})
          </TabsTrigger>
          <TabsTrigger value="compliance">
            Compliance ({metrics.compliance.frameworks.length})
          </TabsTrigger>
          <TabsTrigger value="access">
            Access Control
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Vulnerabilities Tab */}
        <TabsContent value="vulnerabilities" className="space-y-4">
          {vulnerabilities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Vulnerabilities Found</h3>
                <p className="text-muted-foreground text-center">
                  Your application is currently free of known security vulnerabilities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vulnerabilities.map(vuln => {
                const severityInfo = severityConfig[vuln.severity];
                return (
                  <Card key={vuln.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{vuln.title}</h4>
                            <Badge className={`${severityInfo.bg} ${severityInfo.color} border-current`}>
                              {severityInfo.label}
                            </Badge>
                            {vuln.cve && (
                              <Badge variant="outline" className="text-xs">
                                {vuln.cve}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{vuln.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span><strong>Package:</strong> {vuln.package}@{vuln.version}</span>
                            {vuln.fixedIn && (
                              <span className="text-green-600">
                                <strong>Fixed in:</strong> {vuln.fixedIn}
                              </span>
                            )}
                            <span className="text-muted-foreground">
                              {vuln.detectedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {vuln.fixedIn && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Update Package
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4">
            {metrics.compliance.frameworks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Compliance Frameworks Configured</h3>
                  <p className="text-muted-foreground text-center">
                    Configure compliance frameworks to monitor adherence to security standards.
                  </p>
                </CardContent>
              </Card>
            ) : (
              complianceChecks.map(check => {
                const frameworkConfig = complianceConfig[check.framework];
                const FrameworkIcon = frameworkConfig.icon;
                
                return (
                  <Card key={check.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex space-x-4 flex-1">
                          <div className="p-2 bg-muted rounded-lg">
                            <FrameworkIcon className={`w-5 h-5 ${frameworkConfig.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{check.framework}</h4>
                              <Badge variant={
                                check.status === 'compliant' ? 'default' :
                                check.status === 'non-compliant' ? 'destructive' : 'secondary'
                              }>
                                {check.status}
                              </Badge>
                            </div>
                            <h5 className="font-medium mb-2">{check.requirement}</h5>
                            <p className="text-muted-foreground mb-3">{check.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Last checked: {check.lastChecked.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => handleGenerateReport(check.framework)}
                            variant="outline"
                            size="sm"
                            disabled={isGeneratingReport}
                          >
                            {isGeneratingReport ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-1" />
                                Report
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Access Events</CardTitle>
            </CardHeader>
            <CardContent>
              {accessEvents.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent access events to display.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accessEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          event.result === 'success' ? 'bg-green-500' :
                          event.result === 'failure' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="font-medium">{event.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.action} • {event.resource}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {event.ipAddress} • {event.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          event.riskLevel === 'high' ? 'destructive' :
                          event.riskLevel === 'medium' ? 'secondary' : 'outline'
                        }>
                          {event.riskLevel} risk
                        </Badge>
                        <Badge variant={
                          event.result === 'success' ? 'default' :
                          event.result === 'failure' ? 'destructive' : 'secondary'
                        }>
                          {event.result}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="w-5 h-5 mr-2 text-blue-500" />
                  <span>Security Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {metrics.accessAttempts.total.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      Total access attempts (24h)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-red-600">
                        {metrics.accessAttempts.blocked}
                      </p>
                      <p className="text-xs text-muted-foreground">Blocked</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-orange-600">
                        {metrics.accessAttempts.suspicious}
                      </p>
                      <p className="text-xs text-muted-foreground">Suspicious</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Terminal className="w-5 h-5 mr-2 text-green-500" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Security Posture</span>
                      <span className="text-sm font-bold">{metrics.overallScore}%</span>
                    </div>
                    <Progress value={metrics.overallScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Compliance Score</span>
                      <span className="text-sm font-bold">{compliancePercentage}%</span>
                    </div>
                    <Progress value={compliancePercentage} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Last updated: {metrics.lastScan.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});

SecurityCenter.displayName = 'SecurityCenter';