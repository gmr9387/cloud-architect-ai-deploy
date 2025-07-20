import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Project Card Loading Skeleton
export const ProjectCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </CardContent>
  </Card>
);

// AI Insights Panel Loading
export const AIInsightsSkeleton = () => (
  <Card className="border-ai-primary/20">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 p-4 rounded-lg border border-border/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

// Deployment Pipeline Loading
export const DeploymentPipelineSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
        <Skeleton className="w-4 h-4 rounded" />
        <div className="flex-1">
          <Skeleton className="h-5 w-16 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative">
            <div className="flex items-start space-x-4 p-4 rounded-lg border border-border/50">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-full" />
                {i === 2 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Performance Metrics Loading
export const PerformanceMetricsSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center space-x-1">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-2 flex-1" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="w-4 h-4 rounded" />
              <div className="flex items-center space-x-1">
                <Skeleton className="w-3 h-3 rounded" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

// Centered Loading Spinner
export const LoadingSpinner = ({ size = "default", text }: { 
  size?: "sm" | "default" | "lg"; 
  text?: string;
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

// Full Page Loading
export const FullPageLoading = ({ text = "Loading platform..." }: { text?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-r from-primary to-ai-primary flex items-center justify-center animate-pulse">
        <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">CloudDeploy</h2>
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  </div>
);

// Inline Loading Button Content
export const ButtonLoading = ({ text = "Loading..." }: { text?: string }) => (
  <>
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    {text}
  </>
);