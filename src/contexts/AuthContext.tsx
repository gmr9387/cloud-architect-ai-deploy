import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/utils/localStorage';
import { ActivityDataManager } from '@/utils/localStorage';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isDemoMode: boolean;
}

// Demo users for local development
const DEMO_USERS = [
  {
    id: 'demo_admin',
    email: 'admin@clouddeploy.dev',
    name: 'Admin User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'admin' as const,
    password: 'admin123',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date()
  },
  {
    id: 'demo_user',
    email: 'user@clouddeploy.dev',
    name: 'Demo User',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b108?w=150&h=150&fit=crop&crop=face',
    role: 'user' as const,
    password: 'user123',
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date()
  },
  {
    id: 'demo_viewer',
    email: 'viewer@clouddeploy.dev',
    name: 'Viewer User',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'viewer' as const,
    password: 'viewer123',
    createdAt: new Date('2024-02-01'),
    lastLoginAt: new Date()
  }
];

// Local authentication service for demo/development
class LocalAuthService {
  private readonly isDemoMode = process.env.NODE_ENV === 'development' || !process.env.VITE_SUPABASE_URL;

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.isDemoMode) {
      // Demo mode: check against demo users
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (!demoUser) {
        throw new Error('Invalid email or password. Try: admin@clouddeploy.dev / admin123');
      }

      const user: User = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        avatar: demoUser.avatar,
        role: demoUser.role,
        createdAt: demoUser.createdAt,
        lastLoginAt: new Date()
      };

      const token = `demo_token_${user.id}_${Date.now()}`;
      storage.setItem('AUTH_TOKEN', token);
      storage.setItem('USER_DATA', user);

      // Add login activity
      ActivityDataManager.addActivity({
        userId: user.id,
        userName: user.name,
        action: 'logged in',
        target: 'application',
        type: 'auth'
      });

      return { user, token };
    } else {
      // Production mode: will use Supabase
      throw new Error('Authentication service not configured. Please set up Supabase integration.');
    }
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (this.isDemoMode) {
      // Check if user already exists
      const existingUsers = storage.getItem('DEMO_USERS', []) || [];
      if (existingUsers.find((u: any) => u.email === email) || DEMO_USERS.find(u => u.email === email)) {
        throw new Error('User already exists with this email');
      }

      const user: User = {
        id: `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email,
        name,
        role: 'user',
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      // Save to local storage
      existingUsers.push({ ...user, password });
      storage.setItem('DEMO_USERS', existingUsers);

      const token = `demo_token_${user.id}_${Date.now()}`;
      storage.setItem('AUTH_TOKEN', token);
      storage.setItem('USER_DATA', user);

      // Add registration activity
      ActivityDataManager.addActivity({
        userId: user.id,
        userName: user.name,
        action: 'registered',
        target: 'application',
        type: 'auth'
      });

      return { user, token };
    } else {
      // Production mode: will use Supabase
      throw new Error('Authentication service not configured. Please set up Supabase integration.');
    }
  }

  async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = storage.getItem('USER_DATA', null);
    if (user) {
      // Add logout activity
      ActivityDataManager.addActivity({
        userId: user.id,
        userName: user.name,
        action: 'logged out',
        target: 'application',
        type: 'auth'
      });
    }

    storage.removeItem('AUTH_TOKEN');
    storage.removeItem('USER_DATA');
  }

  async getCurrentUser(): Promise<User | null> {
    const token = storage.getItem('AUTH_TOKEN', null);
    const userData = storage.getItem('USER_DATA', null);

    if (token && userData) {
      return userData;
    }

    return null;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const currentUser = storage.getItem('USER_DATA', null);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const updatedUser: User = {
      ...currentUser,
      ...updates,
      id: currentUser.id, // Prevent ID changes
      createdAt: currentUser.createdAt // Prevent creation date changes
    };

    storage.setItem('USER_DATA', updatedUser);

    // Add profile update activity
    ActivityDataManager.addActivity({
      userId: updatedUser.id,
      userName: updatedUser.name,
      action: 'updated profile',
      target: 'user settings',
      type: 'edit'
    });

    return updatedUser;
  }

  getDemoMode(): boolean {
    return this.isDemoMode;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create auth service instance
const authService = new LocalAuthService();

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const { user } = await authService.login(email, password);
      setUser(user);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setIsLoading(true);
      const { user } = await authService.register(email, password, name);
      setUser(user);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    isDemoMode: authService.getDemoMode(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}