// Demo data for presentation purposes
// This simulates realistic deployment platform data

export interface DemoProject {
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
}

export interface DemoDeployment {
  id: string;
  projectId: string;
  status: 'building' | 'success' | 'failed' | 'pending';
  branch: string;
  commit: string;
  startTime: string;
  duration?: string;
  buildLogs: string[];
}

export interface DemoMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export interface DemoAIInsight {
  id: string;
  type: 'optimization' | 'security' | 'performance' | 'cost';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedSavings?: string;
  status: 'new' | 'applied' | 'dismissed';
}

// Demo Projects
export const demoProjects: DemoProject[] = [
  {
    id: 'proj_1',
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
    repository: 'github.com/demo/ecommerce-frontend'
  },
  {
    id: 'proj_2',
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
    repository: 'github.com/demo/company-dashboard'
  },
  {
    id: 'proj_3',
    name: 'Landing Page',
    status: 'success',
    lastDeploy: '1 hour ago',
    domain: 'startup.io',
    branch: 'main',
    buildTime: '32s',
    visitors: '45.2K',
    aiOptimizations: 2,
    description: 'Marketing landing page with conversion optimization',
    framework: 'Astro',
    repository: 'github.com/demo/landing-page'
  },
  {
    id: 'proj_4',
    name: 'API Documentation',
    status: 'failed',
    lastDeploy: '3 hours ago',
    domain: 'docs.api.com',
    branch: 'docs/v2',
    buildTime: '1m 12s',
    visitors: '3.1K',
    description: 'Interactive API documentation site',
    framework: 'Docusaurus',
    repository: 'github.com/demo/api-docs'
  }
];

// Demo Deployments
export const demoDeployments: DemoDeployment[] = [
  {
    id: 'deploy_1',
    projectId: 'proj_1',
    status: 'success',
    branch: 'main',
    commit: 'feat: add payment integration',
    startTime: '2 minutes ago',
    duration: '1m 23s',
    buildLogs: [
      'Installing dependencies...',
      'Running type check...',
      'Building for production...',
      'Optimizing assets...',
      'Deploy successful!'
    ]
  },
  {
    id: 'deploy_2',
    projectId: 'proj_2',
    status: 'building',
    branch: 'feature/analytics',
    commit: 'add: real-time analytics',
    startTime: '30 seconds ago',
    buildLogs: [
      'Installing dependencies...',
      'Running type check...',
      'Building for production...'
    ]
  }
];

// Demo Performance Metrics
export const demoMetrics: DemoMetric[] = [
  {
    id: 'metric_1',
    name: 'Response Time',
    value: 89,
    unit: 'ms',
    change: -12,
    trend: 'down',
    status: 'good'
  },
  {
    id: 'metric_2',
    name: 'Uptime',
    value: 99.97,
    unit: '%',
    change: 0.02,
    trend: 'up',
    status: 'good'
  },
  {
    id: 'metric_3',
    name: 'Error Rate',
    value: 0.03,
    unit: '%',
    change: -0.01,
    trend: 'down',
    status: 'good'
  },
  {
    id: 'metric_4',
    name: 'Bandwidth',
    value: 1.2,
    unit: 'GB',
    change: 15,
    trend: 'up',
    status: 'warning'
  }
];

// Demo AI Insights
export const demoAIInsights: DemoAIInsight[] = [
  {
    id: 'insight_1',
    type: 'performance',
    title: 'Optimize Image Compression',
    description: 'Your images could be 40% smaller with modern formats like WebP and AVIF',
    impact: 'high',
    effort: 'low',
    estimatedSavings: '2.3s faster load time',
    status: 'new'
  },
  {
    id: 'insight_2',
    type: 'cost',
    title: 'CDN Cache Optimization',
    description: 'Improve cache hit ratio by adjusting TTL settings for static assets',
    impact: 'medium',
    effort: 'low',
    estimatedSavings: '$120/month',
    status: 'new'
  },
  {
    id: 'insight_3',
    type: 'security',
    title: 'Update Dependencies',
    description: '3 packages have security updates available',
    impact: 'high',
    effort: 'low',
    status: 'applied'
  },
  {
    id: 'insight_4',
    type: 'optimization',
    title: 'Bundle Size Reduction',
    description: 'Tree-shake unused lodash utilities to reduce bundle size by 45KB',
    impact: 'medium',
    effort: 'medium',
    estimatedSavings: '0.8s faster load time',
    status: 'new'
  }
];

// Demo Analytics Data
export const demoAnalytics = {
  totalDeployments: 1247,
  successRate: 97.8,
  averageBuildTime: '1m 45s',
  activeProjects: 23,
  totalTraffic: '156.8K',
  globalEdgeLocations: 285,
  aiOptimizationsApplied: 156,
  costSavings: '$2,340'
};

// Demo Team Members
export const demoTeamMembers = [
  {
    id: 'user_1',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'Frontend Lead',
    avatar: '/placeholder.svg',
    status: 'online',
    lastActive: 'now'
  },
  {
    id: 'user_2',
    name: 'Mike Rodriguez',
    email: 'mike@company.com',
    role: 'DevOps Engineer',
    avatar: '/placeholder.svg',
    status: 'away',
    lastActive: '5m ago'
  },
  {
    id: 'user_3',
    name: 'Lisa Park',
    email: 'lisa@company.com',
    role: 'Full Stack Developer',
    avatar: '/placeholder.svg',
    status: 'online',
    lastActive: '2m ago'
  }
];

// Demo Build History
export const demoBuildHistory = [
  { date: '2024-01-29', builds: 47, success: 45, failed: 2 },
  { date: '2024-01-28', builds: 52, success: 51, failed: 1 },
  { date: '2024-01-27', builds: 38, success: 37, failed: 1 },
  { date: '2024-01-26', builds: 41, success: 39, failed: 2 },
  { date: '2024-01-25', builds: 33, success: 33, failed: 0 },
  { date: '2024-01-24', builds: 28, success: 27, failed: 1 },
  { date: '2024-01-23', builds: 35, success: 34, failed: 1 }
];

// Toggle for demo mode
export const DEMO_MODE = true;