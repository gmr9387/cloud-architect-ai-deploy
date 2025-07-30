import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { 
  GitBranch, 
  Globe, 
  Zap, 
  Settings, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Code,
  Rocket,
  Shield
} from 'lucide-react';
import { localStorageService } from '@/services/storage/LocalStorageService';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCreationModalProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  repository: string;
  framework: string;
  domain: string;
  branch: string;
  buildScript?: string;
  nodeVersion?: string;
}

const frameworks = [
  { id: 'react', name: 'React', icon: '⚛️', description: 'Modern React application' },
  { id: 'next', name: 'Next.js', icon: '▲', description: 'Full-stack React framework' },
  { id: 'vue', name: 'Vue.js', icon: '🟢', description: 'Progressive Vue application' },
  { id: 'svelte', name: 'Svelte', icon: '🔥', description: 'Compile-time optimized' },
  { id: 'angular', name: 'Angular', icon: '🅰️', description: 'Enterprise Angular app' },
  { id: 'vite', name: 'Vite', icon: '⚡', description: 'Lightning fast builds' },
  { id: 'static', name: 'Static Site', icon: '📄', description: 'HTML/CSS/JS site' },
  { id: 'node', name: 'Node.js API', icon: '🟩', description: 'Backend API service' }
];

const nodeVersions = ['18.x', '20.x', '21.x'];

export const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  open,
  onClose,
  onProjectCreated
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      branch: 'main',
      nodeVersion: '20.x',
      buildScript: 'npm run build'
    }
  });

  const watchedName = watch('name');
  const watchedFramework = watch('framework');

  // Auto-generate domain from project name
  React.useEffect(() => {
    if (watchedName) {
      const domain = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('domain', `${domain}.vercel.app`);
    }
  }, [watchedName, setValue]);

  const steps = [
    {
      id: 'basic',
      title: 'Project Details',
      icon: Code,
      description: 'Basic information about your project'
    },
    {
      id: 'framework',
      title: 'Framework & Build',
      icon: Zap,
      description: 'Choose your technology stack'
    },
    {
      id: 'deployment',
      title: 'Deployment Config',
      icon: Rocket,
      description: 'Configure deployment settings'
    },
    {
      id: 'review',
      title: 'Review & Create',
      icon: CheckCircle,
      description: 'Review and create your project'
    }
  ];

  const onSubmit = async (data: ProjectFormData) => {
    if (!user?.id) return;

    setIsCreating(true);
    try {
      const project = await localStorageService.createProject({
        ...data,
        status: 'pending',
        lastDeploy: 'Never',
        buildTime: '0s',
        visitors: '0',
        aiOptimizations: 0,
        userId: user.id
      });

      toast({
        title: "Project Created!",
        description: `${data.name} has been successfully created and is ready for deployment.`,
      });

      onProjectCreated?.(project);
      onClose();
      
      // Reset form
      setCurrentStep(0);
      setSelectedFramework('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 glass-morphism border-glass-300 shadow-premium">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-gradient-primary">
            Create New Project
          </DialogTitle>
          <p className="text-muted-foreground">
            Deploy your application with AI-powered optimization
          </p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${index <= currentStep 
                    ? 'bg-gradient-premium text-white shadow-glow-primary' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-12 h-px mx-4 transition-colors duration-300
                    ${index < currentStep ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-2">
                    <span>Project Name</span>
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Project name is required' })}
                    placeholder="my-awesome-app"
                    className="input-premium"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    {...register('domain')}
                    placeholder="my-awesome-app.vercel.app"
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe what your project does..."
                  className="input-premium resize-none h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repository" className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4" />
                  <span>Repository URL</span>
                </Label>
                <Input
                  id="repository"
                  {...register('repository', { required: 'Repository URL is required' })}
                  placeholder="https://github.com/username/repo"
                  className="input-premium"
                />
                {errors.repository && (
                  <p className="text-sm text-destructive">{errors.repository.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Framework Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label className="text-lg font-semibold mb-4 block">Choose your framework</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {frameworks.map((framework) => (
                    <Card
                      key={framework.id}
                      className={`
                        cursor-pointer transition-all duration-200 card-hover
                        ${selectedFramework === framework.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                        }
                      `}
                      onClick={() => {
                        setSelectedFramework(framework.id);
                        setValue('framework', framework.name);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{framework.icon}</div>
                        <h3 className="font-medium">{framework.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {framework.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="branch">Default Branch</Label>
                  <Input
                    id="branch"
                    {...register('branch')}
                    className="input-premium"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nodeVersion">Node.js Version</Label>
                  <Select value={watch('nodeVersion')} onValueChange={(value) => setValue('nodeVersion', value)}>
                    <SelectTrigger className="input-premium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {nodeVersions.map((version) => (
                        <SelectItem key={version} value={version}>
                          Node.js {version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildScript">Build Command</Label>
                <Input
                  id="buildScript"
                  {...register('buildScript')}
                  placeholder="npm run build"
                  className="input-premium"
                />
              </div>
            </div>
          )}

          {/* Step 2: Deployment Config */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-glass p-4 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-medium">Security</h3>
                  <p className="text-xs text-muted-foreground">SSL & DDoS protection</p>
                </Card>
                
                <Card className="card-glass p-4 text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <h3 className="font-medium">Performance</h3>
                  <p className="text-xs text-muted-foreground">Global CDN & caching</p>
                </Card>
                
                <Card className="card-glass p-4 text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-medium">AI Optimization</h3>
                  <p className="text-xs text-muted-foreground">Auto performance tuning</p>
                </Card>
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Deployment Configuration
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Auto-deploy on push:</span>
                    <Badge className="badge-premium">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Build optimization:</span>
                    <Badge className="badge-premium">AI-Powered</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Preview deployments:</span>
                    <Badge className="badge-premium">Enabled</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <Card className="card-glass">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-gradient-primary">Project Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{watch('name')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Framework:</span>
                      <p className="font-medium">{watch('framework')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Domain:</span>
                      <p className="font-medium">{watch('domain')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Branch:</span>
                      <p className="font-medium">{watch('branch')}</p>
                    </div>
                  </div>
                  
                  {watch('description') && (
                    <div className="mt-4">
                      <span className="text-muted-foreground">Description:</span>
                      <p className="text-sm mt-1">{watch('description')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-glass-200">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="btn-glass"
            >
              Previous
            </Button>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="btn-glass"
              >
                Cancel
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!watchedName || (currentStep === 1 && !selectedFramework)}
                  className="btn-premium"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="btn-premium"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Project
                      <Rocket className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};