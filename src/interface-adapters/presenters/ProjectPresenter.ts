// Interface Adapters - Project Presenter
// Formats data for presentation layer

import { Project } from "@/entities/Project";
import { 
  ProjectPresenter as IProjectPresenter, 
  ProjectViewModel, 
  ProjectListViewModel, 
  ErrorViewModel 
} from "@/interface-adapters/controllers/ProjectController";

export class ProjectPresenter implements IProjectPresenter {
  presentProject(project: Project): ProjectViewModel {
    return {
      id: project.id,
      name: project.name,
      repositoryUrl: project.repositoryUrl,
      status: project.status,
      customDomain: project.domainConfig.customDomain,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      teamMembers: project.teamMembers,
      deploymentConfig: {
        buildCommand: project.config.buildCommand,
        outputDirectory: project.config.outputDirectory,
        nodeVersion: project.config.nodeVersion,
        framework: project.config.framework
      }
    };
  }

  presentProjects(projects: Project[]): ProjectListViewModel {
    return {
      projects: projects.map(project => this.presentProject(project)),
      total: projects.length
    };
  }

  presentError(error: Error): ErrorViewModel {
    // Map specific business rule errors to user-friendly messages
    const errorMappings: Record<string, string> = {
      'Project name cannot be empty': 'Please provide a project name',
      'Project name cannot exceed 50 characters': 'Project name must be 50 characters or less',
      'Repository URL cannot be empty': 'Please provide a repository URL',
      'Repository must be hosted on GitHub, GitLab, or Bitbucket': 'Only GitHub, GitLab, and Bitbucket repositories are supported',
      'Build command is required': 'Please specify a build command',
      'Output directory is required': 'Please specify an output directory',
      'Invalid domain format': 'Please provide a valid domain name',
      'User is already a team member': 'This user is already part of the team',
      'Cannot remove the last team member': 'Projects must have at least one team member',
      'Project cannot be deployed in current status': 'Cannot deploy paused or archived projects',
      'Only archived projects can be deleted': 'Please archive the project before deleting it'
    };

    const userFriendlyMessage = errorMappings[error.message] || error.message;

    return {
      message: userFriendlyMessage,
      code: this.getErrorCode(error.message)
    };
  }

  private getErrorCode(errorMessage: string): string {
    if (errorMessage.includes('name')) return 'INVALID_NAME';
    if (errorMessage.includes('repository') || errorMessage.includes('URL')) return 'INVALID_REPOSITORY';
    if (errorMessage.includes('build')) return 'INVALID_BUILD_CONFIG';
    if (errorMessage.includes('domain')) return 'INVALID_DOMAIN';
    if (errorMessage.includes('team member')) return 'TEAM_MANAGEMENT_ERROR';
    if (errorMessage.includes('deploy')) return 'DEPLOYMENT_ERROR';
    if (errorMessage.includes('delete')) return 'DELETION_ERROR';
    if (errorMessage.includes('not found')) return 'NOT_FOUND';
    
    return 'UNKNOWN_ERROR';
  }
}