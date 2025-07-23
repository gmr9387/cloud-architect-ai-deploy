// Realistic mock data for the deployment platform
import { Project } from "@/entities/Project";

// Enhanced project data with real-world scenarios
export const mockProjects = [
  {
    id: "proj_001",
    name: "ecommerce-storefront",
    status: "success" as const,
    lastDeploy: "12 minutes ago",
    domain: "shop.techcorp.com",
    branch: "main",
    buildTime: "2m 34s",
    visitors: "14.2k",
    aiOptimizations: 32,
    repository: "https://github.com/techcorp/ecommerce-storefront",
    framework: "Next.js",
    nodeVersion: "18.17.1",
    lastCommit: {
      hash: "a1b2c3d",
      message: "feat: add product filtering and search optimization",
      author: "Sarah Chen",
      timestamp: new Date(Date.now() - 12 * 60 * 1000)
    },
    metrics: {
      buildSuccess: 98.5,
      deployTime: "1m 45s",
      bundleSize: "2.1 MB",
      lighthouse: { performance: 95, accessibility: 89, seo: 94 }
    },
    team: ["sarah.chen@techcorp.com", "mike.johnson@techcorp.com"],
    environment: "production"
  },
  {
    id: "proj_002", 
    name: "marketing-website",
    status: "building" as const,
    lastDeploy: "3 minutes ago",
    domain: "marketing.techcorp.com",
    branch: "feature/newsletter-signup",
    buildTime: "1m 12s",
    visitors: "8.9k",
    aiOptimizations: 28,
    repository: "https://github.com/techcorp/marketing-site",
    framework: "React",
    nodeVersion: "18.17.1",
    lastCommit: {
      hash: "x7y8z9a",
      message: "feat: implement newsletter signup with validation",
      author: "Alex Rodriguez",
      timestamp: new Date(Date.now() - 3 * 60 * 1000)
    },
    metrics: {
      buildSuccess: 96.2,
      deployTime: "58s",
      bundleSize: "1.4 MB",
      lighthouse: { performance: 92, accessibility: 95, seo: 98 }
    },
    team: ["alex.rodriguez@techcorp.com", "jenny.kim@techcorp.com"],
    environment: "staging"
  },
  {
    id: "proj_003",
    name: "docs-platform",
    status: "success" as const,
    lastDeploy: "2 hours ago",
    domain: "docs.techcorp.com",
    branch: "main",
    buildTime: "45s",
    visitors: "3.1k",
    repository: "https://github.com/techcorp/docs-platform",
    framework: "Docusaurus",
    nodeVersion: "18.17.1",
    lastCommit: {
      hash: "m4n5o6p",
      message: "docs: update API reference and add new examples",
      author: "David Park",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    metrics: {
      buildSuccess: 99.1,
      deployTime: "32s",
      bundleSize: "890 KB",
      lighthouse: { performance: 98, accessibility: 97, seo: 96 }
    },
    team: ["david.park@techcorp.com"],
    environment: "production"
  },
  {
    id: "proj_004",
    name: "admin-dashboard",
    status: "failed" as const,
    lastDeploy: "25 minutes ago",
    domain: "admin.techcorp.com",
    branch: "hotfix/security-patch",
    buildTime: "3m 21s",
    visitors: "1.2k",
    aiOptimizations: 15,
    repository: "https://github.com/techcorp/admin-dashboard",
    framework: "Vue.js",
    nodeVersion: "18.17.1",
    lastCommit: {
      hash: "q8r9s0t",
      message: "fix: resolve security vulnerability in auth middleware",
      author: "Emily Watson",
      timestamp: new Date(Date.now() - 25 * 60 * 1000)
    },
    metrics: {
      buildSuccess: 87.3,
      deployTime: "N/A",
      bundleSize: "N/A",
      lighthouse: { performance: 0, accessibility: 0, seo: 0 }
    },
    team: ["emily.watson@techcorp.com", "robert.chang@techcorp.com"],
    environment: "production",
    errorLog: "Build failed: Module not found: Error: Can't resolve 'crypto-js'"
  },
  {
    id: "proj_005",
    name: "mobile-api",
    status: "pending" as const,
    lastDeploy: "1 minute ago",
    domain: "api.mobile.techcorp.com",
    branch: "release/v2.1.0",
    buildTime: "4m 18s",
    visitors: "25.8k",
    repository: "https://github.com/techcorp/mobile-api",
    framework: "Express.js",
    nodeVersion: "20.10.0",
    lastCommit: {
      hash: "u1v2w3x",
      message: "release: v2.1.0 with enhanced caching and rate limiting",
      author: "Michael Zhang",
      timestamp: new Date(Date.now() - 1 * 60 * 1000)
    },
    metrics: {
      buildSuccess: 94.7,
      deployTime: "Pending",
      bundleSize: "45 MB",
      lighthouse: { performance: 0, accessibility: 0, seo: 0 }
    },
    team: ["michael.zhang@techcorp.com", "lisa.patel@techcorp.com", "james.wilson@techcorp.com"],
    environment: "production"
  }
];

// Enhanced AI insights with realistic scenarios
export const mockAIInsights = [
  {
    id: "insight_001",
    type: "performance",
    title: "Bundle Size Optimization",
    description: "Your ecommerce-storefront bundle size can be reduced by 40% by implementing code splitting and removing unused dependencies",
    impact: "high",
    confidence: 94,
    action: "Optimize Bundle",
    projectId: "proj_001",
    estimatedSavings: "1.2s page load time",
    implementation: {
      effort: "medium",
      timeEstimate: "4-6 hours",
      steps: ["Analyze bundle composition", "Implement code splitting", "Remove unused packages"]
    }
  },
  {
    id: "insight_002",
    type: "security",
    title: "Dependency Vulnerabilities",
    description: "3 medium-risk and 1 high-risk vulnerabilities detected across your projects",
    impact: "high",
    confidence: 98,
    action: "Update Dependencies",
    affectedProjects: ["proj_001", "proj_004"],
    vulnerabilities: [
      { package: "axios", version: "0.21.1", severity: "high", cve: "CVE-2021-3749" },
      { package: "lodash", version: "4.17.15", severity: "medium", cve: "CVE-2021-23337" }
    ]
  },
  {
    id: "insight_003",
    type: "scalability",
    title: "Traffic Surge Prediction",
    description: "Expected 45% traffic increase next week based on historical patterns and marketing campaigns",
    impact: "medium",
    confidence: 82,
    action: "Scale Infrastructure",
    affectedProjects: ["proj_001", "proj_005"],
    prediction: {
      timeframe: "Next 7 days",
      expectedIncrease: "45%",
      peakTimes: ["Monday 9-11 AM", "Friday 2-4 PM"]
    }
  },
  {
    id: "insight_004",
    type: "optimization",
    title: "Database Query Performance",
    description: "API response times can be improved by 60% with query optimization and caching strategies",
    impact: "high",
    confidence: 89,
    action: "Optimize Queries",
    projectId: "proj_005",
    metrics: {
      currentAvgResponse: "1.2s",
      projectedImprovement: "480ms",
      affectedEndpoints: 12
    }
  },
  {
    id: "insight_005",
    type: "content",
    title: "SEO Content Optimization",
    description: "Image optimization and meta tag improvements could boost SEO score by 15 points",
    impact: "medium",
    confidence: 76,
    action: "Optimize SEO",
    projectId: "proj_002",
    seoImprovements: {
      imageCompression: "1.8s faster load",
      metaTags: "Better search ranking",
      altTexts: "Improved accessibility"
    }
  }
];

// Realistic deployment pipeline data
export const mockDeploymentPipeline = [
  {
    id: "deploy_001",
    projectId: "proj_001",
    projectName: "ecommerce-storefront",
    stage: "completed",
    branch: "main",
    commit: "a1b2c3d",
    startTime: new Date(Date.now() - 15 * 60 * 1000),
    endTime: new Date(Date.now() - 12 * 60 * 1000),
    duration: "2m 34s",
    steps: [
      { name: "Source", status: "completed", duration: "5s" },
      { name: "Build", status: "completed", duration: "2m 10s" },
      { name: "Test", status: "completed", duration: "14s" },
      { name: "Deploy", status: "completed", duration: "5s" }
    ]
  },
  {
    id: "deploy_002",
    projectId: "proj_002",
    projectName: "marketing-website",
    stage: "building",
    branch: "feature/newsletter-signup",
    commit: "x7y8z9a",
    startTime: new Date(Date.now() - 3 * 60 * 1000),
    endTime: null,
    duration: "3m 12s",
    steps: [
      { name: "Source", status: "completed", duration: "4s" },
      { name: "Build", status: "running", duration: "3m 8s" },
      { name: "Test", status: "pending", duration: null },
      { name: "Deploy", status: "pending", duration: null }
    ]
  },
  {
    id: "deploy_003",
    projectId: "proj_004",
    projectName: "admin-dashboard",
    stage: "failed",
    branch: "hotfix/security-patch",
    commit: "q8r9s0t",
    startTime: new Date(Date.now() - 28 * 60 * 1000),
    endTime: new Date(Date.now() - 25 * 60 * 1000),
    duration: "3m 21s",
    error: "Build failed: Module not found: Error: Can't resolve 'crypto-js'",
    steps: [
      { name: "Source", status: "completed", duration: "6s" },
      { name: "Build", status: "failed", duration: "3m 15s", error: "Module resolution error" },
      { name: "Test", status: "skipped", duration: null },
      { name: "Deploy", status: "skipped", duration: null }
    ]
  }
];

// Performance metrics data
export const mockPerformanceMetrics = {
  overview: {
    totalProjects: 12,
    activeDeployments: 3,
    successRate: 94.7,
    averageBuildTime: "2m 15s",
    totalTraffic: "52.2k",
    uptime: 99.97
  },
  buildMetrics: {
    last24Hours: [
      { time: "00:00", builds: 12, success: 11 },
      { time: "06:00", builds: 8, success: 8 },
      { time: "12:00", builds: 15, success: 14 },
      { time: "18:00", builds: 22, success: 21 }
    ],
    averageTimes: {
      build: "2m 15s",
      test: "45s",
      deploy: "30s"
    }
  },
  trafficMetrics: {
    last7Days: [
      { date: "Mon", visits: 8200, deployments: 5 },
      { date: "Tue", visits: 9100, deployments: 8 },
      { date: "Wed", visits: 7800, deployments: 3 },
      { date: "Thu", visits: 10200, deployments: 12 },
      { date: "Fri", visits: 11500, deployments: 7 },
      { date: "Sat", visits: 6800, deployments: 2 },
      { date: "Sun", visits: 5900, deployments: 1 }
    ]
  }
};

// Team and user data
export const mockTeamData = [
  {
    id: "user_001",
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.com",
    role: "Frontend Lead",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b6121700?w=150",
    projects: ["proj_001"],
    lastActive: new Date(Date.now() - 5 * 60 * 1000),
    deploymentsThisWeek: 12
  },
  {
    id: "user_002",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@techcorp.com",
    role: "Full Stack Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    projects: ["proj_002"],
    lastActive: new Date(Date.now() - 15 * 60 * 1000),
    deploymentsThisWeek: 8
  },
  {
    id: "user_003",
    name: "Emily Watson",
    email: "emily.watson@techcorp.com",
    role: "DevOps Engineer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    projects: ["proj_004"],
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    deploymentsThisWeek: 15
  }
];