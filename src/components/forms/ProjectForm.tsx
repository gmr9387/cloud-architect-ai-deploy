import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, GitBranch, Settings, Plus, X } from "lucide-react";
import { ButtonLoading } from "@/components/common/LoadingStates";

// Validation schema using Zod
const projectFormSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(50, "Project name must be 50 characters or less")
    .regex(/^[a-zA-Z0-9-_]+$/, "Only letters, numbers, hyphens, and underscores allowed"),
  
  repositoryUrl: z.string()
    .min(1, "Repository URL is required")
    .url("Must be a valid URL")
    .refine((url) => {
      const validHosts = ['github.com', 'gitlab.com', 'bitbucket.org'];
      return validHosts.some(host => url.includes(host));
    }, "Repository must be hosted on GitHub, GitLab, or Bitbucket"),
  
  buildCommand: z.string()
    .min(1, "Build command is required")
    .max(200, "Build command too long"),
  
  outputDirectory: z.string()
    .min(1, "Output directory is required")
    .max(100, "Output directory path too long"),
  
  nodeVersion: z.string()
    .optional()
    .refine((val) => !val || /^\d+\.\d+\.\d+$/.test(val), "Invalid Node.js version format"),
  
  framework: z.enum(['react', 'vue', 'angular', 'svelte', 'static']).optional(),
  
  customDomain: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      return domainRegex.test(val);
    }, "Invalid domain format"),
  
  environmentVariables: z.array(z.object({
    key: z.string().min(1, "Variable name required").regex(/^[A-Z_][A-Z0-9_]*$/, "Use UPPERCASE with underscores"),
    value: z.string().min(1, "Variable value required")
  })).optional()
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export const ProjectForm = ({ 
  initialData, 
  onSubmit, 
  isLoading = false, 
  mode = 'create' 
}: ProjectFormProps) => {
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>(
    initialData?.environmentVariables?.filter((ev): ev is { key: string; value: string } => 
      Boolean(ev.key && ev.value)
    ) || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    trigger
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      repositoryUrl: initialData?.repositoryUrl || "",
      buildCommand: initialData?.buildCommand || "npm run build",
      outputDirectory: initialData?.outputDirectory || "dist",
      nodeVersion: initialData?.nodeVersion || "",
      framework: initialData?.framework || undefined,
      customDomain: initialData?.customDomain || "",
      environmentVariables: envVars.filter(ev => ev.key && ev.value)
    },
    mode: "onChange"
  });

  const watchedRepo = watch("repositoryUrl");

  // Auto-detect framework from repository URL
  const detectFramework = (url: string) => {
    if (url.includes('react')) return 'react';
    if (url.includes('vue')) return 'vue';
    if (url.includes('angular')) return 'angular';
    if (url.includes('svelte')) return 'svelte';
    return undefined;
  };

  // Environment variable management
  const addEnvVar = () => {
    const newEnvVars = [...envVars, { key: "", value: "" }];
    setEnvVars(newEnvVars);
    setValue("environmentVariables", newEnvVars);
  };

  const removeEnvVar = (index: number) => {
    const newEnvVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newEnvVars);
    setValue("environmentVariables", newEnvVars);
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const newEnvVars = [...envVars];
    newEnvVars[index] = { ...newEnvVars[index], [field]: value };
    setEnvVars(newEnvVars);
    setValue("environmentVariables", newEnvVars);
    trigger("environmentVariables");
  };

  const onFormSubmit = async (data: ProjectFormData) => {
    try {
      await onSubmit({
        ...data,
        environmentVariables: envVars.filter(ev => ev.key && ev.value)
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getFieldError = (fieldName: keyof ProjectFormData) => {
    return errors[fieldName]?.message;
  };

  const isFieldValid = (fieldName: keyof ProjectFormData) => {
    return !errors[fieldName] && isDirty;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5" />
          <span>{mode === 'create' ? 'Create New Project' : 'Edit Project'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center space-x-2">
              <span>Project Name</span>
              {isFieldValid('name') && <CheckCircle className="w-4 h-4 text-success" />}
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="my-awesome-project"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Repository URL */}
          <div className="space-y-2">
            <Label htmlFor="repositoryUrl" className="flex items-center space-x-2">
              <span>Repository URL</span>
              {isFieldValid('repositoryUrl') && <CheckCircle className="w-4 h-4 text-success" />}
            </Label>
            <Input
              id="repositoryUrl"
              {...register("repositoryUrl")}
              placeholder="https://github.com/username/repository"
              className={errors.repositoryUrl ? "border-destructive" : ""}
              onChange={(e) => {
                register("repositoryUrl").onChange(e);
                const detected = detectFramework(e.target.value);
                if (detected) {
                  setValue("framework", detected);
                }
              }}
            />
            {errors.repositoryUrl && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.repositoryUrl.message}</span>
              </p>
            )}
          </div>

          {/* Framework Selection */}
          <div className="space-y-2">
            <Label htmlFor="framework">Framework (Optional)</Label>
            <Select 
              value={watch("framework")} 
              onValueChange={(value) => setValue("framework", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Auto-detect or select framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue.js</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
                <SelectItem value="static">Static HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Build Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buildCommand">Build Command</Label>
              <Input
                id="buildCommand"
                {...register("buildCommand")}
                placeholder="npm run build"
                className={errors.buildCommand ? "border-destructive" : ""}
              />
              {errors.buildCommand && (
                <p className="text-sm text-destructive">{errors.buildCommand.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="outputDirectory">Output Directory</Label>
              <Input
                id="outputDirectory"
                {...register("outputDirectory")}
                placeholder="dist"
                className={errors.outputDirectory ? "border-destructive" : ""}
              />
              {errors.outputDirectory && (
                <p className="text-sm text-destructive">{errors.outputDirectory.message}</p>
              )}
            </div>
          </div>

          {/* Node Version */}
          <div className="space-y-2">
            <Label htmlFor="nodeVersion">Node.js Version (Optional)</Label>
            <Input
              id="nodeVersion"
              {...register("nodeVersion")}
              placeholder="18.17.0"
              className={errors.nodeVersion ? "border-destructive" : ""}
            />
            {errors.nodeVersion && (
              <p className="text-sm text-destructive">{errors.nodeVersion.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave empty to use the latest LTS version
            </p>
          </div>

          {/* Custom Domain */}
          <div className="space-y-2">
            <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
            <Input
              id="customDomain"
              {...register("customDomain")}
              placeholder="yourdomain.com"
              className={errors.customDomain ? "border-destructive" : ""}
            />
            {errors.customDomain && (
              <p className="text-sm text-destructive">{errors.customDomain.message}</p>
            )}
          </div>

          {/* Environment Variables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Environment Variables</span>
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addEnvVar}>
                <Plus className="w-4 h-4 mr-1" />
                Add Variable
              </Button>
            </div>

            {envVars.map((envVar, index) => (
              <div key={index} className="flex space-x-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="VARIABLE_NAME"
                    value={envVar.key}
                    onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="variable_value"
                    value={envVar.value}
                    onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeEnvVar(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {envVars.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                No environment variables defined. Click "Add Variable" to add one.
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex items-center space-x-2">
              {isValid && (
                <Badge variant="success" className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Ready to deploy</span>
                </Badge>
              )}
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!isValid || isLoading}
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                {isLoading ? (
                  <ButtonLoading text={mode === 'create' ? 'Creating...' : 'Updating...'} />
                ) : (
                  <>
                    {mode === 'create' ? 'Create Project' : 'Update Project'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};