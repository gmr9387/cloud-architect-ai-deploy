// Browser-native storage service using localStorage and IndexedDB
import { User } from '@/contexts/AuthContext';

export interface Project {
  id: string;
  name: string;
  status: 'building' | 'success' | 'failed' | 'pending';
  lastDeploy: string;
  domain: string;
  branch: string;
  buildTime: string;
  visitors: string;
  aiOptimizations?: number;
  description: string;
  framework: string;
  repository: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deploymentUrl?: string;
  buildScript?: string;
  environmentVars?: Record<string, string>;
}

export interface Deployment {
  id: string;
  projectId: string;
  status: 'building' | 'success' | 'failed' | 'pending';
  branch: string;
  commit: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  buildLogs: string[];
  deploymentUrl?: string;
  userId: string;
}

export interface Metric {
  id: string;
  projectId: string;
  timestamp: Date;
  responseTime: number;
  uptime: number;
  errorRate: number;
  bandwidth: number;
  visitors: number;
}

export interface AIInsight {
  id: string;
  projectId?: string;
  type: 'optimization' | 'security' | 'performance' | 'cost';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedSavings?: string;
  status: 'new' | 'applied' | 'dismissed';
  createdAt: Date;
}

class LocalStorageService {
  private readonly STORAGE_KEYS = {
    USERS: 'clouddeploy_users',
    PROJECTS: 'clouddeploy_projects',
    DEPLOYMENTS: 'clouddeploy_deployments',
    METRICS: 'clouddeploy_metrics',
    AI_INSIGHTS: 'clouddeploy_ai_insights',
    CURRENT_USER: 'clouddeploy_current_user',
    SETTINGS: 'clouddeploy_settings'
  };

  // User Management
  async createUser(email: string, password: string, name: string): Promise<User> {
    const users = this.getUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: this.generateId(),
      email,
      name,
      role: 'user',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    // Store password separately (in real app, would be hashed)
    const userWithPassword = { ...user, password };
    users.push(userWithPassword);
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User> {
    const users = this.getUsers();
    const userWithPassword = users.find(u => u.email === email && u.password === password);
    
    if (!userWithPassword) {
      throw new Error('Invalid credentials');
    }

    const user: User = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name,
      role: userWithPassword.role,
      createdAt: new Date(userWithPassword.createdAt),
      lastLoginAt: new Date()
    };

    // Update last login
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, lastLoginAt: new Date() } : u
    );
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    return user;
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      lastLoginAt: new Date(user.lastLoginAt)
    };
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Project Management
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const projects = this.getProjects();
    
    const project: Project = {
      ...projectData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    projects.push(project);
    localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

    return project;
  }

  getProjects(userId?: string): Project[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    
    const projects = JSON.parse(data).map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));

    return userId ? projects.filter(p => p.userId === userId) : projects;
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date()
    };

    projects[projectIndex] = updatedProject;
    localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

    return updatedProject;
  }

  async deleteProject(projectId: string): Promise<void> {
    const projects = this.getProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(filteredProjects));

    // Also delete related deployments and metrics
    const deployments = this.getDeployments().filter(d => d.projectId !== projectId);
    localStorage.setItem(this.STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(deployments));

    const metrics = this.getMetrics().filter(m => m.projectId !== projectId);
    localStorage.setItem(this.STORAGE_KEYS.METRICS, JSON.stringify(metrics));
  }

  // Deployment Management
  async createDeployment(deploymentData: Omit<Deployment, 'id'>): Promise<Deployment> {
    const deployments = this.getDeployments();
    
    const deployment: Deployment = {
      ...deploymentData,
      id: this.generateId()
    };

    deployments.push(deployment);
    localStorage.setItem(this.STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(deployments));

    return deployment;
  }

  getDeployments(projectId?: string): Deployment[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.DEPLOYMENTS);
    if (!data) return [];
    
    const deployments = JSON.parse(data);
    return projectId ? deployments.filter(d => d.projectId === projectId) : deployments;
  }

  async updateDeployment(deploymentId: string, updates: Partial<Deployment>): Promise<Deployment> {
    const deployments = this.getDeployments();
    const deploymentIndex = deployments.findIndex(d => d.id === deploymentId);
    
    if (deploymentIndex === -1) {
      throw new Error('Deployment not found');
    }

    const updatedDeployment = { ...deployments[deploymentIndex], ...updates };
    deployments[deploymentIndex] = updatedDeployment;
    localStorage.setItem(this.STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(deployments));

    return updatedDeployment;
  }

  // Metrics
  async addMetric(metric: Omit<Metric, 'id'>): Promise<Metric> {
    const metrics = this.getMetrics();
    
    const newMetric: Metric = {
      ...metric,
      id: this.generateId()
    };

    metrics.push(newMetric);
    
    // Keep only last 1000 metrics per project for performance
    const filteredMetrics = metrics
      .filter(m => m.projectId === metric.projectId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 1000);

    const otherMetrics = metrics.filter(m => m.projectId !== metric.projectId);
    const allMetrics = [...otherMetrics, ...filteredMetrics];

    localStorage.setItem(this.STORAGE_KEYS.METRICS, JSON.stringify(allMetrics));

    return newMetric;
  }

  getMetrics(projectId?: string): Metric[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.METRICS);
    if (!data) return [];
    
    const metrics = JSON.parse(data).map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));

    return projectId ? metrics.filter(m => m.projectId === projectId) : metrics;
  }

  // AI Insights
  async createAIInsight(insight: Omit<AIInsight, 'id' | 'createdAt'>): Promise<AIInsight> {
    const insights = this.getAIInsights();
    
    const newInsight: AIInsight = {
      ...insight,
      id: this.generateId(),
      createdAt: new Date()
    };

    insights.push(newInsight);
    localStorage.setItem(this.STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));

    return newInsight;
  }

  getAIInsights(projectId?: string): AIInsight[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.AI_INSIGHTS);
    if (!data) return [];
    
    const insights = JSON.parse(data).map((i: any) => ({
      ...i,
      createdAt: new Date(i.createdAt)
    }));

    return projectId ? insights.filter(i => i.projectId === projectId) : insights;
  }

  async updateAIInsight(insightId: string, updates: Partial<AIInsight>): Promise<AIInsight> {
    const insights = this.getAIInsights();
    const insightIndex = insights.findIndex(i => i.id === insightId);
    
    if (insightIndex === -1) {
      throw new Error('Insight not found');
    }

    const updatedInsight = { ...insights[insightIndex], ...updates };
    insights[insightIndex] = updatedInsight;
    localStorage.setItem(this.STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));

    return updatedInsight;
  }

  // Settings
  getSettings(): Record<string, any> {
    const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  }

  setSetting(key: string, value: any): void {
    const settings = this.getSettings();
    settings[key] = value;
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Utility methods
  private getUsers(): any[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Data export/import for backup
  exportData(): string {
    const data = {
      users: this.getUsers(),
      projects: this.getProjects(),
      deployments: this.getDeployments(),
      metrics: this.getMetrics(),
      aiInsights: this.getAIInsights(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.users) localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(data.users));
      if (data.projects) localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
      if (data.deployments) localStorage.setItem(this.STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(data.deployments));
      if (data.metrics) localStorage.setItem(this.STORAGE_KEYS.METRICS, JSON.stringify(data.metrics));
      if (data.aiInsights) localStorage.setItem(this.STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(data.aiInsights));
      if (data.settings) localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }

  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Initialize with demo data if empty
  async initializeDemoData(): Promise<void> {
    const projects = this.getProjects();
    if (projects.length > 0) return; // Already has data

    // Create demo user
    const demoUser = await this.createUser('demo@clouddeploy.dev', 'demo123', 'Demo User');
    this.setCurrentUser(demoUser);

    // Create demo projects
    await this.createProject({
      name: 'E-commerce Frontend',
      status: 'success',
      lastDeploy: '2 minutes ago',
      domain: 'shop.example.com',
      branch: 'main',
      buildTime: '1m 23s',
      visitors: '12.4K',
      aiOptimizations: 3,
      description: 'React e-commerce platform with Stripe integration',
      framework: 'React + Vite',
      repository: 'github.com/demo/ecommerce-frontend',
      userId: demoUser.id,
      deploymentUrl: 'https://shop.example.com'
    });

    await this.createProject({
      name: 'Company Dashboard',
      status: 'building',
      lastDeploy: 'Deploying...',
      domain: 'dashboard.company.com',
      branch: 'feature/analytics',
      buildTime: '45s',
      visitors: '8.7K',
      aiOptimizations: 5,
      description: 'Internal analytics dashboard with real-time metrics',
      framework: 'Next.js',
      repository: 'github.com/demo/company-dashboard',
      userId: demoUser.id
    });

    // Add some AI insights
    await this.createAIInsight({
      type: 'performance',
      title: 'Optimize Image Compression',
      description: 'Your images could be 40% smaller with modern formats like WebP and AVIF',
      impact: 'high',
      effort: 'low',
      estimatedSavings: '2.3s faster load time',
      status: 'new'
    });
  }
}

export const localStorageService = new LocalStorageService();