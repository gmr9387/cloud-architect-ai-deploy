// Enterprise Business Rules - Project Entity
// Core business logic independent of frameworks, UI, database, or external agencies

export interface ProjectConfig {
  buildCommand: string;
  outputDirectory: string;
  environmentVariables: Record<string, string>;
  nodeVersion?: string;
  framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'static';
}

export interface DomainConfig {
  customDomain?: string;
  httpsEnabled: boolean;
  redirects: Array<{
    source: string;
    destination: string;
    statusCode: number;
  }>;
}

export type ProjectStatus = 'active' | 'paused' | 'archived';

export class Project {
  readonly id: string;
  private _name: string;
  private _repositoryUrl: string;
  private _status: ProjectStatus;
  private _config: ProjectConfig;
  private _domainConfig: DomainConfig;
  private _teamMembers: Set<string>;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    name: string,
    repositoryUrl: string,
    ownerId: string,
    config: ProjectConfig
  ) {
    this.id = id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._status = 'active';
    this._teamMembers = new Set([ownerId]);
    this._domainConfig = {
      httpsEnabled: true,
      redirects: []
    };

    this.setName(name);
    this.setRepositoryUrl(repositoryUrl);
    this.setConfig(config);
  }

  // Business Rules for Project Name
  setName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }
    
    if (name.length > 50) {
      throw new Error('Project name cannot exceed 50 characters');
    }

    // Only allow alphanumeric, hyphens, and underscores
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      throw new Error('Project name can only contain letters, numbers, hyphens, and underscores');
    }

    this._name = name.trim();
    this._updatedAt = new Date();
  }

  get name(): string {
    return this._name;
  }

  // Business Rules for Repository URL
  setRepositoryUrl(url: string): void {
    if (!url || url.trim().length === 0) {
      throw new Error('Repository URL cannot be empty');
    }

    // Basic URL validation for Git repositories
    const validProtocols = ['https://', 'ssh://'];
    const validHosts = ['github.com', 'gitlab.com', 'bitbucket.org'];
    
    if (!validProtocols.some(protocol => url.startsWith(protocol))) {
      throw new Error('Repository URL must use HTTPS or SSH protocol');
    }

    if (!validHosts.some(host => url.includes(host))) {
      throw new Error('Repository must be hosted on GitHub, GitLab, or Bitbucket');
    }

    this._repositoryUrl = url.trim();
    this._updatedAt = new Date();
  }

  get repositoryUrl(): string {
    return this._repositoryUrl;
  }

  // Business Rules for Project Configuration
  setConfig(config: ProjectConfig): void {
    if (!config.buildCommand || config.buildCommand.trim().length === 0) {
      throw new Error('Build command is required');
    }

    if (!config.outputDirectory || config.outputDirectory.trim().length === 0) {
      throw new Error('Output directory is required');
    }

    // Validate environment variables
    for (const [key, value] of Object.entries(config.environmentVariables)) {
      if (!key || key.trim().length === 0) {
        throw new Error('Environment variable names cannot be empty');
      }
      
      if (key.includes(' ')) {
        throw new Error('Environment variable names cannot contain spaces');
      }
    }

    this._config = { ...config };
    this._updatedAt = new Date();
  }

  get config(): ProjectConfig {
    return { ...this._config };
  }

  // Business Rules for Domain Configuration
  setDomainConfig(domainConfig: Partial<DomainConfig>): void {
    if (domainConfig.customDomain) {
      // Basic domain validation
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domainConfig.customDomain)) {
        throw new Error('Invalid domain format');
      }
    }

    // Validate redirects
    if (domainConfig.redirects) {
      for (const redirect of domainConfig.redirects) {
        if (!redirect.source || !redirect.destination) {
          throw new Error('Redirect source and destination are required');
        }
        
        if (![301, 302, 307, 308].includes(redirect.statusCode)) {
          throw new Error('Invalid redirect status code');
        }
      }
    }

    this._domainConfig = { ...this._domainConfig, ...domainConfig };
    this._updatedAt = new Date();
  }

  get domainConfig(): DomainConfig {
    return { ...this._domainConfig };
  }

  // Business Rules for Team Management
  addTeamMember(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }

    if (this._teamMembers.has(userId)) {
      throw new Error('User is already a team member');
    }

    this._teamMembers.add(userId);
    this._updatedAt = new Date();
  }

  removeTeamMember(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }

    if (!this._teamMembers.has(userId)) {
      throw new Error('User is not a team member');
    }

    if (this._teamMembers.size === 1) {
      throw new Error('Cannot remove the last team member');
    }

    this._teamMembers.delete(userId);
    this._updatedAt = new Date();
  }

  isTeamMember(userId: string): boolean {
    return this._teamMembers.has(userId);
  }

  get teamMembers(): string[] {
    return Array.from(this._teamMembers);
  }

  // Business Rules for Project Status
  setStatus(status: ProjectStatus): void {
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      active: ['paused', 'archived'],
      paused: ['active', 'archived'],
      archived: [] // Cannot transition from archived
    };

    if (!validTransitions[this._status].includes(status)) {
      throw new Error(`Cannot transition from ${this._status} to ${status}`);
    }

    this._status = status;
    this._updatedAt = new Date();
  }

  get status(): ProjectStatus {
    return this._status;
  }

  // Business Rules for Project Activity
  canDeploy(): boolean {
    return this._status === 'active';
  }

  canEdit(): boolean {
    return this._status !== 'archived';
  }

  // Getters for metadata
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  // Generate deployment-ready configuration
  getDeploymentConfig(): {
    name: string;
    repositoryUrl: string;
    buildCommand: string;
    outputDirectory: string;
    environmentVariables: Record<string, string>;
    nodeVersion?: string;
    domainConfig: DomainConfig;
  } {
    if (!this.canDeploy()) {
      throw new Error('Project cannot be deployed in current status');
    }

    return {
      name: this._name,
      repositoryUrl: this._repositoryUrl,
      buildCommand: this._config.buildCommand,
      outputDirectory: this._config.outputDirectory,
      environmentVariables: this._config.environmentVariables,
      nodeVersion: this._config.nodeVersion,
      domainConfig: this._domainConfig
    };
  }
}

// Factory function for creating projects with validation
export function createProject(
  name: string,
  repositoryUrl: string,
  ownerId: string,
  config: ProjectConfig
): Project {
  // Generate unique ID (in real implementation, this would come from external ID service)
  const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  return new Project(id, name, repositoryUrl, ownerId, config);
}