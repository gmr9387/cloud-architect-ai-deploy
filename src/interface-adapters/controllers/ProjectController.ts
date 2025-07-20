// Interface Adapters - Project Controller
// Handles user input and coordinates with use cases

import { Project, createProject, ProjectConfig } from "@/entities/Project";
import { DeployProjectUseCase, DeployProjectRequest } from "@/use-cases/deployments/DeployProject";

export interface CreateProjectRequest {
  name: string;
  repositoryUrl: string;
  ownerId: string;
  buildCommand: string;
  outputDirectory: string;
  environmentVariables?: Record<string, string>;
  nodeVersion?: string;
  framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'static';
}

export interface UpdateProjectRequest {
  projectId: string;
  name?: string;
  repositoryUrl?: string;
  buildCommand?: string;
  outputDirectory?: string;
  environmentVariables?: Record<string, string>;
  nodeVersion?: string;
  customDomain?: string;
}

export interface ProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  delete(id: string): Promise<void>;
}

export interface ProjectPresenter {
  presentProject(project: Project): ProjectViewModel;
  presentProjects(projects: Project[]): ProjectListViewModel;
  presentError(error: Error): ErrorViewModel;
}

export interface ProjectViewModel {
  id: string;
  name: string;
  repositoryUrl: string;
  status: string;
  customDomain?: string;
  createdAt: string;
  updatedAt: string;
  teamMembers: string[];
  deploymentConfig: {
    buildCommand: string;
    outputDirectory: string;
    nodeVersion?: string;
    framework?: string;
  };
}

export interface ProjectListViewModel {
  projects: ProjectViewModel[];
  total: number;
}

export interface ErrorViewModel {
  message: string;
  code?: string;
}

export class ProjectController {
  constructor(
    private projectRepository: ProjectRepository,
    private projectPresenter: ProjectPresenter,
    private deployProjectUseCase: DeployProjectUseCase
  ) {}

  async createProject(request: CreateProjectRequest): Promise<ProjectViewModel | ErrorViewModel> {
    try {
      // Validate required fields
      if (!request.name || !request.repositoryUrl || !request.ownerId) {
        throw new Error('Name, repository URL, and owner ID are required');
      }

      // Create project configuration
      const config: ProjectConfig = {
        buildCommand: request.buildCommand || 'npm run build',
        outputDirectory: request.outputDirectory || 'dist',
        environmentVariables: request.environmentVariables || {},
        nodeVersion: request.nodeVersion,
        framework: request.framework
      };

      // Create project entity
      const project = createProject(
        request.name,
        request.repositoryUrl,
        request.ownerId,
        config
      );

      // Save to repository
      await this.projectRepository.save(project);

      // Present response
      return this.projectPresenter.presentProject(project);

    } catch (error) {
      return this.projectPresenter.presentError(error as Error);
    }
  }

  async updateProject(request: UpdateProjectRequest): Promise<ProjectViewModel | ErrorViewModel> {
    try {
      // Retrieve existing project
      const project = await this.projectRepository.findById(request.projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Update project properties
      if (request.name) {
        project.setName(request.name);
      }

      if (request.repositoryUrl) {
        project.setRepositoryUrl(request.repositoryUrl);
      }

      if (request.buildCommand || request.outputDirectory || request.environmentVariables || request.nodeVersion) {
        const currentConfig = project.config;
        const updatedConfig: ProjectConfig = {
          buildCommand: request.buildCommand || currentConfig.buildCommand,
          outputDirectory: request.outputDirectory || currentConfig.outputDirectory,
          environmentVariables: request.environmentVariables || currentConfig.environmentVariables,
          nodeVersion: request.nodeVersion || currentConfig.nodeVersion,
          framework: currentConfig.framework
        };
        
        project.setConfig(updatedConfig);
      }

      if (request.customDomain !== undefined) {
        project.setDomainConfig({ customDomain: request.customDomain });
      }

      // Save updated project
      await this.projectRepository.save(project);

      // Present response
      return this.projectPresenter.presentProject(project);

    } catch (error) {
      return this.projectPresenter.presentError(error as Error);
    }
  }

  async getProject(projectId: string): Promise<ProjectViewModel | ErrorViewModel> {
    try {
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      return this.projectPresenter.presentProject(project);

    } catch (error) {
      return this.projectPresenter.presentError(error as Error);
    }
  }

  async getProjectsByOwner(ownerId: string): Promise<ProjectListViewModel | ErrorViewModel> {
    try {
      const projects = await this.projectRepository.findByOwnerId(ownerId);
      return this.projectPresenter.presentProjects(projects);

    } catch (error) {
      return this.projectPresenter.presentError(error as Error);
    }
  }

  async deployProject(projectId: string, branch?: string, enableAI?: boolean): Promise<any> {
    try {
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const request: DeployProjectRequest = {
        project,
        branch,
        enableAIOptimization: enableAI
      };

      const result = await this.deployProjectUseCase.execute(request);

      return {
        deploymentId: result.deployment.id,
        status: result.deployment.status,
        estimatedDuration: result.estimatedDuration,
        branch: result.deployment.branch,
        commitHash: result.deployment.commitInfo.hash
      };

    } catch (error) {
      return this.projectPresenter.presentError(error as Error);
    }
  }

  async addTeamMember(projectId: string, userId: string): Promise<ProjectViewModel | ErrorViewModel> {
    try {
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      project.addTeamMember(userId);
      await this.projectRepository.save(project);

      return this.projectPresenter.presentProject(project);

    } catch (error) {
      return this.projectPresenter.presentError(error as Error);
    }
  }

  async removeTeamMember(projectId: string, userId: string): Promise<ProjectViewModel | ErrorViewModel> {
    try {
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      project.removeTeamMember(userId);
      await this.projectRepository.save(project);

      return this.projectPresenter.presentProject(project);

    } catch (error) {
      return this.projectPresenter.presentError(error as Error);
    }
  }

  async deleteProject(projectId: string): Promise<{ success: boolean } | ErrorViewModel> {
    try {
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Business rule: Can only delete archived projects
      if (project.status !== 'archived') {
        throw new Error('Only archived projects can be deleted');
      }

      await this.projectRepository.delete(projectId);

      return { success: true };

    } catch (error) {
      return this.projectPresenter.presentError(error as Error);
    }
  }
}