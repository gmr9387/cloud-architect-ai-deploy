import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
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

interface SecurityIssue {
  id: string;
  type: 'vulnerability' | 'compliance' | 'access' | 'configuration';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedAssets: string[];
  cve?: string;
  cvssScore?: number;
  status: 'open' | 'in-progress' | 'resolved' | 'dismissed';
  detectedAt: Date;
  resolvedAt?: Date;
  recommendation: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  compliance: number;
  requirements: {
    id: string;
    title: string;
    status: 'compliant' | 'partial' | 'non-compliant';
    evidence: string[];
  }[];
  lastAssessment: Date;
}

interface SecurityMetrics {
  securityScore: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance: {
    overall: number;
    frameworks: number;
  };
  incidents: {
    total: number;
    resolved: number;
    mttr: number; // Mean Time To Resolution in hours
  };
  accessReviews: {
    pending: number;
    overdue: number;
  };
}

const mockSecurityIssues: SecurityIssue[] = [
  {
    id: '1',
    type: 'vulnerability',
    severity: 'critical',
    title: 'Remote Code Execution in Node.js',
    description: 'CVE-2024-12345: Critical vulnerability in Node.js version 18.17.0 allows remote code execution.',
    affectedAssets: ['my-portfolio', 'ecommerce-app'],
    cve: 'CVE-2024-12345',
    cvssScore: 9.8,
    status: 'open',
    detectedAt: new Date(Date.now() - 86400000),
    recommendation: 'Upgrade Node.js to version 18.19.0 or later immediately.'
  },
  {
    id: '2',
    type: 'compliance',
    severity: 'high',
    title: 'Missing Audit Logs',
    description: 'GDPR Article 30 requires maintaining records of processing activities.',
    affectedAssets: ['user-auth-service'],
    status: 'in-progress',
    detectedAt: new Date(Date.now() - 172800000),
    recommendation: 'Implement comprehensive audit logging for all user data processing activities.'
  },
  {
    id: '3',
    type: 'access',
    severity: 'medium',
    title: 'Excessive Admin Privileges',
    description: '3 users have unnecessary admin access to production environments.',
    affectedAssets: ['production-cluster'],
    status: 'open',
    detectedAt: new Date(Date.now() - 259200000),
    recommendation: 'Review and revoke unnecessary admin privileges following principle of least privilege.'
  }
];

const mockComplianceFrameworks: ComplianceFramework[] = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    version: '2017',
    compliance: 94,
    lastAssessment: new Date(Date.now() - 2592000000),
    requirements: [
      {
        id: 'cc1',
        title: 'Control Environment',
        status: 'compliant',
        evidence: ['Policy documents', 'Training records']
      },
      {
        id: 'cc2',
        title: 'Communication and Information',
        status: 'partial',
        evidence: ['Communication logs']
      }
    ]
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    version: '2018',
    compliance: 87,
    lastAssessment: new Date(Date.now() - 1296000000),
    requirements: [
      {
        id: 'art30',
        title: 'Records of Processing',
        status: 'non-compliant',
        evidence: []
      },
      {
        id: 'art32',
        title: 'Security of Processing',
        status: 'compliant',
        evidence: ['Encryption certificates', 'Access controls']
      }
    ]
  }
];

const mockMetrics: SecurityMetrics = {
  securityScore: 85,
  vulnerabilities: {
    critical: 1,
    high: 3,
    medium: 8,
    low: 15
  },
  compliance: {
    overall: 91,
    frameworks: 2
  },
  incidents: {
    total: 12,
    resolved: 10,
    mttr: 4.2
  },
  accessReviews: {
    pending: 5,
    overdue: 2
  }
};

const severityConfig = {
  critical: { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  low: { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' }
};

const typeConfig = {
  vulnerability: { icon: AlertTriangle, color: 'text-red-500', label: 'Vulnerability' },
  compliance: { icon: FileText, color: 'text-blue-500', label: 'Compliance' },
  access: { icon: UserCheck, color: 'text-purple-500', label: 'Access Control' },
  configuration: { icon: Settings, color: 'text-orange-500', label: 'Configuration' }
};

export const SecurityCenter = memo(() => {
  const [issues, setIssues] = useState<SecurityIssue[]>(mockSecurityIssues);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>(mockComplianceFrameworks);
  const [metrics, setMetrics] = useState<SecurityMetrics>(mockMetrics);
  const [isScanning, setIsScanning] = useState(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  // Start security scan
  const startSecurityScan = async () => {
    setIsScanning(true);
    // Simulate scan duration
    setTimeout(() => {
      setIsScanning(false);
      // Update metrics after scan
      setMetrics(prev => ({
        ...prev,
        securityScore: prev.securityScore + Math.floor(Math.random() * 5),
      }));
    }, 3000);
  };

  // Resolve security issue
  const resolveIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, status: 'resolved', resolvedAt: new Date() }
        : issue
    ));
  };

  // Export compliance report
  const exportComplianceReport = (frameworkId: string) => {
    const framework = frameworks.find(f => f.id === frameworkId);
    if (framework) {
      // Simulate report generation
      const reportData = {
        framework: framework.name,
        compliance: framework.compliance,
        timestamp: new Date().toISOString(),
        requirements: framework.requirements
      };
      console.log('Exporting compliance report:', reportData);
      // In real implementation, this would trigger a download
    }
  };

  const openIssues = issues.filter(issue => issue.status === 'open');
  const criticalIssues = openIssues.filter(issue => issue.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary">{metrics.securityScore}</p>
            <p className="text-sm text-muted-foreground">Security Score</p>
            <Progress value={metrics.securityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{metrics.vulnerabilities.critical}</p>
            <p className="text-sm text-muted-foreground">Critical Issues</p>
            {metrics.vulnerabilities.critical > 0 && (
              <Badge variant="destructive" className="mt-2">
                Immediate Action Required
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{metrics.compliance.overall}%</p>
            <p className="text-sm text-muted-foreground">Compliance</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.compliance.frameworks} frameworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{metrics.incidents.mttr}h</p>
            <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.incidents.resolved}/{metrics.incidents.total} resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalIssues.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-red-800">
              {criticalIssues.length} critical security issue{criticalIssues.length > 1 ? 's' : ''} require immediate attention
            </span>
            <Button variant="destructive" size="sm">
              View Critical Issues
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Security Controls</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Auto-scan</span>
                <Switch
                  checked={autoScanEnabled}
                  onCheckedChange={setAutoScanEnabled}
                />
              </div>
              <Button
                onClick={startSecurityScan}
                disabled={isScanning}
                size="sm"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1" />
                    Start Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vulnerabilities" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vulnerabilities">
                Vulnerabilities ({openIssues.length})
              </TabsTrigger>
              <TabsTrigger value="compliance">
                Compliance ({frameworks.length})
              </TabsTrigger>
              <TabsTrigger value="access">
                Access Control
              </TabsTrigger>
              <TabsTrigger value="monitoring">
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vulnerabilities" className="space-y-4">
              {openIssues.map(issue => {
                const typeInfo = typeConfig[issue.type];
                const severityInfo = severityConfig[issue.severity];
                const TypeIcon = typeInfo.icon;

                return (
                  <Card key={issue.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex space-x-4 flex-1">
                          <div className={`p-2 rounded-lg ${severityInfo.bg}`}>
                            <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{issue.title}</h4>
                              <Badge variant="outline" className={`${severityInfo.bg} ${severityInfo.color} ${severityInfo.border}`}>
                                {issue.severity.toUpperCase()}
                              </Badge>
                              {issue.cve && (
                                <Badge variant="outline">
                                  {issue.cve}
                                </Badge>
                              )}
                              {issue.cvssScore && (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  CVSS {issue.cvssScore}
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">{issue.description}</p>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-medium">Affected Assets: </span>
                                <span className="text-muted-foreground">
                                  {issue.affectedAssets.join(', ')}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Recommendation: </span>
                                <span className="text-muted-foreground">{issue.recommendation}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Detected {new Date(issue.detectedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => setSelectedIssue(issue.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          <Button
                            onClick={() => resolveIssue(issue.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              {frameworks.map(framework => (
                <Card key={framework.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{framework.name}</h4>
                        <p className="text-muted-foreground">Version {framework.version}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {framework.compliance}%
                        </div>
                        <p className="text-sm text-muted-foreground">Compliant</p>
                      </div>
                    </div>

                    <Progress value={framework.compliance} className="mb-4" />

                    <div className="grid gap-3">
                      {framework.requirements.slice(0, 3).map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{req.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Evidence: {req.evidence.length} items
                            </p>
                          </div>
                          <Badge variant={
                            req.status === 'compliant' ? 'default' :
                            req.status === 'partial' ? 'secondary' : 'destructive'
                          }>
                            {req.status === 'compliant' ? 'Compliant' :
                             req.status === 'partial' ? 'Partial' : 'Non-compliant'}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Last assessment: {framework.lastAssessment.toLocaleDateString()}
                      </p>
                      <Button
                        onClick={() => exportComplianceReport(framework.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserCheck className="w-5 h-5 text-green-500" />
                      <span>Access Reviews</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <p className="font-medium">Quarterly Access Review</p>
                          <p className="text-sm text-muted-foreground">
                            {metrics.accessReviews.pending} users pending review
                          </p>
                        </div>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Due in 5 days
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <p className="font-medium">Admin Privilege Review</p>
                          <p className="text-sm text-muted-foreground">
                            {metrics.accessReviews.overdue} users overdue
                          </p>
                        </div>
                        <Badge variant="destructive">
                          Overdue
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="w-5 h-5 text-purple-500" />
                      <span>Authentication & Authorization</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">MFA Enabled</span>
                        </div>
                        <p className="text-sm text-muted-foreground">98% of users</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">SSO Integration</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wifi className="w-5 h-5 text-blue-500" />
                      <span>Security Monitoring</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">WAF Protection</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Active</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">DDoS Protection</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Enabled</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Threat Intelligence</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Real-time</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Terminal className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">SIEM Integration</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Connected</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="w-5 h-5 text-orange-500" />
                      <span>Data Protection</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Encryption at Rest</span>
                        <Badge variant="default" className="bg-green-600">
                          AES-256
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Encryption in Transit</span>
                        <Badge variant="default" className="bg-green-600">
                          TLS 1.3
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Key Management</span>
                        <Badge variant="default" className="bg-blue-600">
                          HSM
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Backup Encryption</span>
                        <Badge variant="default" className="bg-green-600">
                          Enabled
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});

SecurityCenter.displayName = 'SecurityCenter';