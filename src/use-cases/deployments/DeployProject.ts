// Application Business Rules - Deploy Project Use Case
// Independent of frameworks, UI, database, and external agencies

import { Project } from "@/entities/Project";

export interface DeploymentRepository {
  save(deployment: Deployment): Promise<void>;
  findByProjectId(projectId: string): Promise<Deployment[]>;
  findById(id: string): Promise<Deployment | null>;
}

export interface GitProvider {
  cloneRepository(url: string, branch: string): Promise<string>;
  getLatestCommit(url: string, branch: string): Promise<CommitInfo>;
}

export interface BuildService {
  build(config: BuildConfig): Promise<BuildResult>;
}

export interface CDNService {
  deploy(artifacts: string[], domain: string): Promise<DeploymentResult>;
}

export interface AIOptimizationService {
  optimizeBuild(config: BuildConfig, history: BuildHistory[]): Promise<OptimizedConfig>;
  analyzeBuildLogs(logs: string[]): Promise<BuildInsights>;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
}

export interface BuildConfig {
  buildCommand: string;
  outputDirectory: string;
  environmentVariables: Record<string, string>;
  nodeVersion?: string;
}

export interface BuildResult {
  success: boolean;
  artifacts: string[];
  logs: string[];
  duration: number;
  errorMessage?: string;
}

export interface DeploymentResult {
  success: boolean;
  url: string;
  cdnDistributionId: string;
  errorMessage?: string;
}

export interface OptimizedConfig extends BuildConfig {
  optimizations: string[];
  estimatedImprovement: number;
}

export interface BuildInsights {
  suggestions: string[];
  performanceScore: number;
  potentialIssues: string[];
}

export interface BuildHistory {
  duration: number;
  success: boolean;
  timestamp: Date;
  config: BuildConfig;
}

export type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'success' | 'failed';

export class Deployment {
  readonly id: string;
  readonly projectId: string;
  readonly branch: string;
  readonly commitInfo: CommitInfo;
  private _status: DeploymentStatus;
  private _buildResult?: BuildResult;
  private _deploymentResult?: DeploymentResult;
  private _aiInsights?: BuildInsights;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: string, projectId: string, branch: string, commitInfo: CommitInfo) {
    this.id = id;
    this.projectId = projectId;
    this.branch = branch;
    this.commitInfo = commitInfo;
    this._status = 'pending';
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  updateStatus(status: DeploymentStatus): void {
    const validTransitions: Record<DeploymentStatus, DeploymentStatus[]> = {
      pending: ['building', 'failed'],
      building: ['deploying', 'failed'],
      deploying: ['success', 'failed'],
      success: [],
      failed: []
    };

    if (!validTransitions[this._status].includes(status)) {
      throw new Error(`Invalid status transition from ${this._status} to ${status}`);
    }

    this._status = status;
    this._updatedAt = new Date();
  }

  setBuildResult(result: BuildResult): void {
    this._buildResult = result;
    this._updatedAt = new Date();
  }

  setDeploymentResult(result: DeploymentResult): void {
    this._deploymentResult = result;
    this._updatedAt = new Date();
  }

  setAIInsights(insights: BuildInsights): void {
    this._aiInsights = insights;
    this._updatedAt = new Date();
  }

  get status(): DeploymentStatus {
    return this._status;
  }

  get buildResult(): BuildResult | undefined {
    return this._buildResult;
  }

  get deploymentResult(): DeploymentResult | undefined {
    return this._deploymentResult;
  }

  get aiInsights(): BuildInsights | undefined {
    return this._aiInsights;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
}

export interface DeployProjectRequest {
  project: Project;
  branch?: string;
  enableAIOptimization?: boolean;
}

export interface DeployProjectResponse {
  deployment: Deployment;
  estimatedDuration: number;
}

export class DeployProjectUseCase {
  constructor(
    private deploymentRepository: DeploymentRepository,
    private gitProvider: GitProvider,
    private buildService: BuildService,
    private cdnService: CDNService,
    private aiOptimizationService: AIOptimizationService
  ) {}

  async execute(request: DeployProjectRequest): Promise<DeployProjectResponse> {
    const { project, branch = 'main', enableAIOptimization = false } = request;

    // Validate project can be deployed
    if (!project.canDeploy()) {
      throw new Error('Project cannot be deployed in current status');
    }

    // Get latest commit information
    const commitInfo = await this.gitProvider.getLatestCommit(
      project.repositoryUrl,
      branch
    );

    // Create deployment record
    const deploymentId = this.generateDeploymentId();
    const deployment = new Deployment(deploymentId, project.id, branch, commitInfo);

    // Save initial deployment record
    await this.deploymentRepository.save(deployment);

    // Start async deployment process
    this.executeDeploymentPipeline(deployment, project, enableAIOptimization)
      .catch(error => {
        console.error('Deployment pipeline failed:', error);
        deployment.updateStatus('failed');
        this.deploymentRepository.save(deployment);
      });

    // Estimate deployment duration based on project size and history
    const estimatedDuration = await this.estimateDeploymentDuration(project.id);

    return {
      deployment,
      estimatedDuration
    };
  }

  private async executeDeploymentPipeline(
    deployment: Deployment,
    project: Project,
    enableAIOptimization: boolean
  ): Promise<void> {
    try {
      // Update status to building
      deployment.updateStatus('building');
      await this.deploymentRepository.save(deployment);

      // Get deployment configuration
      const deployConfig = project.getDeploymentConfig();
      let buildConfig: BuildConfig = {
        buildCommand: deployConfig.buildCommand,
        outputDirectory: deployConfig.outputDirectory,
        environmentVariables: deployConfig.environmentVariables,
        nodeVersion: deployConfig.nodeVersion
      };

      // AI Optimization (if enabled)
      if (enableAIOptimization) {
        const buildHistory = await this.getBuildHistory(project.id);
        const optimizedConfig = await this.aiOptimizationService.optimizeBuild(
          buildConfig,
          buildHistory
        );
        buildConfig = optimizedConfig;
      }

      // Clone repository
      await this.gitProvider.cloneRepository(project.repositoryUrl, deployment.branch);

      // Execute build
      const buildResult = await this.buildService.build(buildConfig);
      deployment.setBuildResult(buildResult);

      if (!buildResult.success) {
        deployment.updateStatus('failed');
        await this.deploymentRepository.save(deployment);
        return;
      }

      // AI Build Analysis
      if (enableAIOptimization) {
        const insights = await this.aiOptimizationService.analyzeBuildLogs(buildResult.logs);
        deployment.setAIInsights(insights);
      }

      // Update status to deploying
      deployment.updateStatus('deploying');
      await this.deploymentRepository.save(deployment);

      // Deploy to CDN
      const domain = deployConfig.domainConfig.customDomain || 
                    `${project.name}.your-platform.com`;
      
      const deploymentResult = await this.cdnService.deploy(buildResult.artifacts, domain);
      deployment.setDeploymentResult(deploymentResult);

      if (deploymentResult.success) {
        deployment.updateStatus('success');
      } else {
        deployment.updateStatus('failed');
      }

      await this.deploymentRepository.save(deployment);

    } catch (error) {
      deployment.updateStatus('failed');
      await this.deploymentRepository.save(deployment);
      throw error;
    }
  }

  private async getBuildHistory(projectId: string): Promise<BuildHistory[]> {
    const deployments = await this.deploymentRepository.findByProjectId(projectId);
    
    return deployments
      .filter(d => d.buildResult?.success)
      .map(d => ({
        duration: d.buildResult!.duration,
        success: d.buildResult!.success,
        timestamp: d.createdAt,
        config: {
          buildCommand: '', // Would be stored in deployment record
          outputDirectory: '',
          environmentVariables: {}
        }
      }))
      .slice(-10); // Last 10 successful builds
  }

  private async estimateDeploymentDuration(projectId: string): Promise<number> {
    const history = await this.getBuildHistory(projectId);
    
    if (history.length === 0) {
      return 180; // Default 3 minutes for new projects
    }

    // Calculate average of recent builds
    const avgDuration = history.reduce((sum, h) => sum + h.duration, 0) / history.length;
    
    // Add buffer for deployment step
    return Math.round(avgDuration + 30);
  }

  private generateDeploymentId(): string {
    return `deploy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}