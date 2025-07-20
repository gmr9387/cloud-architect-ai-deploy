// Local Storage utility for offline data management
// This will be replaced with Supabase integration later

export interface StorageKey {
  AUTH_TOKEN: string;
  USER_DATA: string;
  PROJECTS: string;
  DASHBOARD_STATS: string;
  AI_ANALYSIS_CACHE: string;
  CHAT_MESSAGES: string;
  TEAM_MEMBERS: string;
  ACTIVITY_FEED: string;
  SECURITY_DATA: string;
  APP_SETTINGS: string;
  DEPLOYMENT_HISTORY: string;
  PERFORMANCE_METRICS: string;
}

const STORAGE_KEYS: StorageKey = {
  AUTH_TOKEN: 'clouddeploy_auth_token',
  USER_DATA: 'clouddeploy_user_data',
  PROJECTS: 'clouddeploy_projects',
  DASHBOARD_STATS: 'clouddeploy_dashboard_stats',
  AI_ANALYSIS_CACHE: 'clouddeploy_ai_analysis',
  CHAT_MESSAGES: 'clouddeploy_chat_messages',
  TEAM_MEMBERS: 'clouddeploy_team_members',
  ACTIVITY_FEED: 'clouddeploy_activity_feed',
  SECURITY_DATA: 'clouddeploy_security_data',
  APP_SETTINGS: 'clouddeploy_app_settings',
  DEPLOYMENT_HISTORY: 'clouddeploy_deployment_history',
  PERFORMANCE_METRICS: 'clouddeploy_performance_metrics'
};

interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // milliseconds
}

class LocalStorageManager {
  private prefix = 'clouddeploy_';

  // Generic storage methods
  setItem<T>(key: keyof StorageKey, value: T, options: StorageOptions = {}): void {
    try {
      const storageKey = STORAGE_KEYS[key];
      const data = {
        value,
        timestamp: Date.now(),
        expiry: options.expiry ? Date.now() + options.expiry : null
      };

      const serialized = JSON.stringify(data);
      localStorage.setItem(storageKey, serialized);
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error);
    }
  }

  getItem<T>(key: keyof StorageKey, defaultValue: T | null = null): T | null {
    try {
      const storageKey = STORAGE_KEYS[key];
      const item = localStorage.getItem(storageKey);
      
      if (!item) return defaultValue;

      const data = JSON.parse(item);
      
      // Check expiry
      if (data.expiry && Date.now() > data.expiry) {
        this.removeItem(key);
        return defaultValue;
      }

      return data.value as T;
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  removeItem(key: keyof StorageKey): void {
    try {
      const storageKey = STORAGE_KEYS[key];
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${key}`, error);
    }
  }

  clear(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear localStorage', error);
    }
  }

  // Get storage usage stats
  getStorageStats(): { used: number; available: number; keys: number } {
    let used = 0;
    let keys = 0;

    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        used += item.length;
        keys++;
      }
    });

    // Estimate available space (5MB typical limit)
    const available = (5 * 1024 * 1024) - used;

    return { used, available, keys };
  }

  // Export data for backup
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const item = localStorage.getItem(storageKey);
      if (item) {
        try {
          data[key] = JSON.parse(item);
        } catch {
          data[key] = item;
        }
      }
    });

    return data;
  }

  // Import data from backup
  importData(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      if (key in STORAGE_KEYS) {
        try {
          const serialized = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(STORAGE_KEYS[key as keyof StorageKey], serialized);
        } catch (error) {
          console.warn(`Failed to import ${key}:`, error);
        }
      }
    });
  }
}

// Create singleton instance
export const storage = new LocalStorageManager();

// Specific data managers for different app sections
export class ProjectDataManager {
  static getProjects() {
    return storage.getItem('PROJECTS', []);
  }

  static saveProjects(projects: any[]) {
    storage.setItem('PROJECTS', projects);
  }

  static addProject(project: any) {
    const projects = this.getProjects() || [];
    const newProject = {
      ...project,
      id: `project_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  static updateProject(id: string, updates: any) {
    const projects = this.getProjects() || [];
    const index = projects.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveProjects(projects);
      return projects[index];
    }
    return null;
  }

  static deleteProject(id: string) {
    const projects = this.getProjects() || [];
    const filtered = projects.filter((p: any) => p.id !== id);
    this.saveProjects(filtered);
    return filtered;
  }
}

export class DashboardDataManager {
  static getStats() {
    return storage.getItem('DASHBOARD_STATS', {
      activeProjects: 0,
      monthlyDeploys: 0,
      aiOptimizations: 0,
      securityScore: 0
    });
  }

  static updateStats(stats: any) {
    storage.setItem('DASHBOARD_STATS', {
      ...stats,
      lastUpdated: new Date().toISOString()
    });
  }

  static incrementStat(statKey: string, value: number = 1) {
    const stats = this.getStats();
    stats[statKey] = (stats[statKey] || 0) + value;
    this.updateStats(stats);
    return stats;
  }
}

export class ActivityDataManager {
  static getActivities() {
    return storage.getItem('ACTIVITY_FEED', []);
  }

  static addActivity(activity: any) {
    const activities = this.getActivities() || [];
    const newActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString()
    };
    
    // Keep only last 100 activities
    activities.unshift(newActivity);
    if (activities.length > 100) {
      activities.splice(100);
    }
    
    storage.setItem('ACTIVITY_FEED', activities);
    return newActivity;
  }

  static clearActivities() {
    storage.setItem('ACTIVITY_FEED', []);
  }
}

export class ChatDataManager {
  static getMessages() {
    return storage.getItem('CHAT_MESSAGES', []);
  }

  static addMessage(message: any) {
    const messages = this.getMessages() || [];
    const newMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date()
    };
    
    messages.push(newMessage);
    
    // Keep only last 500 messages
    if (messages.length > 500) {
      messages.splice(0, messages.length - 500);
    }
    
    storage.setItem('CHAT_MESSAGES', messages);
    return newMessage;
  }

  static clearMessages() {
    storage.setItem('CHAT_MESSAGES', []);
  }
}

export class SettingsDataManager {
  static getSettings() {
    return storage.getItem('APP_SETTINGS', {
      theme: 'light',
      notifications: true,
      autoSave: true,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  static updateSettings(settings: any) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    storage.setItem('APP_SETTINGS', updated);
    return updated;
  }

  static getSetting(key: string, defaultValue: any = null) {
    const settings = this.getSettings();
    return settings[key] ?? defaultValue;
  }

  static setSetting(key: string, value: any) {
    const settings = this.getSettings();
    settings[key] = value;
    storage.setItem('APP_SETTINGS', settings);
    return settings;
  }
}