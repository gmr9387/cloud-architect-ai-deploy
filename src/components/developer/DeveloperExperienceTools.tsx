import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Terminal, 
  GitBranch, 
  Code, 
  Smartphone, 
  Download,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Zap,
  Settings,
  Play,
  Stop,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CLITool {
  name: string;
  command: string;
  description: string;
  installed: boolean;
  version: string;
}

interface GitHook {
  name: string;
  description: string;
  enabled: boolean;
  trigger: string;
}

interface IDEPlugin {
  name: string;
  ide: string;
  description: string;
  installed: boolean;
  version: string;
  features: string[];
}

interface MobileApp {
  platform: string;
  status: 'available' | 'beta' | 'coming-soon';
  features: string[];
  downloadUrl?: string;
}

const DeveloperExperienceTools: React.FC = () => {
  const [cliTools] = useState<CLITool[]>([
    {
      name: 'CloudDeploy CLI',
      command: 'clouddeploy',
      description: 'Deploy applications from terminal',
      installed: true,
      version: '2.1.0'
    },
    {
      name: 'Deploy Status',
      command: 'clouddeploy status',
      description: 'Check deployment status',
      installed: true,
      version: '2.1.0'
    },
    {
      name: 'Quick Deploy',
      command: 'clouddeploy deploy',
      description: 'One-command deployment',
      installed: false,
      version: '2.1.0'
    }
  ]);

  const [gitHooks] = useState<GitHook[]>([
    {
      name: 'Pre-commit Hook',
      description: 'Run tests before commit',
      enabled: true,
      trigger: 'pre-commit'
    },
    {
      name: 'Post-push Hook',
      description: 'Auto-deploy on push to main',
      enabled: true,
      trigger: 'post-push'
    },
    {
      name: 'Pre-merge Hook',
      description: 'Validate before merge',
      enabled: false,
      trigger: 'pre-merge'
    }
  ]);

  const [idePlugins] = useState<IDEPlugin[]>([
    {
      name: 'VS Code Extension',
      ide: 'Visual Studio Code',
      description: 'Deploy directly from VS Code',
      installed: true,
      version: '1.2.0',
      features: ['Deploy from editor', 'Status in status bar', 'Quick commands']
    },
    {
      name: 'IntelliJ Plugin',
      ide: 'IntelliJ IDEA',
      description: 'Deploy from IntelliJ',
      installed: false,
      version: '1.0.0',
      features: ['Deploy from IDE', 'Integration with build tools']
    },
    {
      name: 'Sublime Text Package',
      ide: 'Sublime Text',
      description: 'Deploy from Sublime Text',
      installed: false,
      version: '0.9.0',
      features: ['Command palette integration', 'Status display']
    }
  ]);

  const [mobileApps] = useState<MobileApp[]>([
    {
      platform: 'iOS',
      status: 'available',
      features: ['Monitor deployments', 'Receive notifications', 'Quick rollbacks'],
      downloadUrl: 'https://apps.apple.com/clouddeploy'
    },
    {
      platform: 'Android',
      status: 'available',
      features: ['Monitor deployments', 'Receive notifications', 'Quick rollbacks'],
      downloadUrl: 'https://play.google.com/store/clouddeploy'
    },
    {
      platform: 'Web App',
      status: 'available',
      features: ['Full dashboard access', 'Real-time monitoring', 'Team collaboration'],
      downloadUrl: 'https://app.clouddeploy.com'
    }
  ]);

  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '$ clouddeploy status',
    'Checking deployment status...',
    '✅ Production: v2.1.0 (Healthy)',
    '✅ Staging: v2.1.0-rc (Healthy)',
    '⏳ Development: v2.1.0-dev (Building)',
    '',
    '$ clouddeploy deploy --env production',
    '🚀 Deploying to production...',
    '✅ Build completed',
    '✅ Tests passed',
    '✅ Deployed successfully',
    '🌐 Available at: https://myapp.com'
  ]);

  const handleInstallCLI = (toolName: string) => {
    console.log(`Installing ${toolName}...`);
    // Implementation for CLI installation
  };

  const handleToggleGitHook = (hookName: string, enabled: boolean) => {
    console.log(`${enabled ? 'Enabling' : 'Disabling'} ${hookName}`);
    // Implementation for git hook toggle
  };

  const handleInstallPlugin = (pluginName: string) => {
    console.log(`Installing ${pluginName}...`);
    // Implementation for plugin installation
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success message
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Developer Experience Tools</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Zap className="w-3 h-3 mr-1" />
              Enhanced DX
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="cli" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cli">CLI Tools</TabsTrigger>
            <TabsTrigger value="git">Git Hooks</TabsTrigger>
            <TabsTrigger value="ide">IDE Plugins</TabsTrigger>
            <TabsTrigger value="mobile">Mobile App</TabsTrigger>
          </TabsList>

          <TabsContent value="cli" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Terminal className="w-4 h-4" />
                    <span>Command Line Tools</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cliTools.map((tool) => (
                    <div key={tool.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{tool.name}</span>
                          <Badge variant={tool.installed ? "default" : "secondary"}>
                            {tool.installed ? "Installed" : "Not Installed"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{tool.description}</p>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{tool.command}</code>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => copyToClipboard(tool.command)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {tool.installed ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            v{tool.version}
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={() => handleInstallCLI(tool.name)}>
                            <Download className="w-3 h-3 mr-1" />
                            Install
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Terminal Demo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                    {terminalOutput.map((line, index) => (
                      <div key={index} className="mb-1">
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Play className="w-3 h-3 mr-1" />
                      Run Demo
                    </Button>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="git" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <GitBranch className="w-4 h-4" />
                    <span>Git Hooks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gitHooks.map((hook) => (
                    <div key={hook.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{hook.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {hook.trigger}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{hook.description}</p>
                      </div>
                      <Switch 
                        checked={hook.enabled}
                        onCheckedChange={(checked) => handleToggleGitHook(hook.name, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Git Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm">Auto-deploy on push</div>
                        <div className="text-xs text-muted-foreground">Deploy when pushing to main branch</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm">Pre-commit validation</div>
                        <div className="text-xs text-muted-foreground">Run tests before commit</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <div>
                        <div className="font-medium text-sm">Branch protection</div>
                        <div className="text-xs text-muted-foreground">Require PR reviews for main</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ide" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>IDE Plugins</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {idePlugins.map((plugin) => (
                    <div key={plugin.name} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{plugin.name}</span>
                            <Badge variant={plugin.installed ? "default" : "secondary"}>
                              {plugin.installed ? "Installed" : "Not Installed"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{plugin.description}</p>
                          <p className="text-xs text-muted-foreground">For {plugin.ide}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {plugin.installed ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              v{plugin.version}
                            </Badge>
                          ) : (
                            <Button size="sm" onClick={() => handleInstallPlugin(plugin.name)}>
                              <Download className="w-3 h-3 mr-1" />
                              Install
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {plugin.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">VS Code Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm">Deploy from Command Palette</div>
                        <div className="text-xs text-muted-foreground">Ctrl+Shift+P → Deploy</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm">Status in Status Bar</div>
                        <div className="text-xs text-muted-foreground">Real-time deployment status</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm">Quick Commands</div>
                        <div className="text-xs text-muted-foreground">Right-click → Deploy</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {mobileApps.map((app) => (
                <Card key={app.platform}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Smartphone className="w-4 h-4" />
                        <span>{app.platform}</span>
                      </CardTitle>
                      <Badge variant="outline" className={`${
                        app.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' :
                        app.status === 'beta' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {app.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    {app.downloadUrl && (
                      <Button className="w-full" size="sm">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    )}
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

export default DeveloperExperienceTools;