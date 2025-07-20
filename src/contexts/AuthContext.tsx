import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";

// User entity following Clean Architecture
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt: Date;
}

// Authentication state
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Authentication actions
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar'>>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Combined auth context type
export type AuthContextType = AuthState & AuthActions;

// Authentication service interface (Interface Adapter)
export interface AuthService {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  register(email: string, password: string, name: string): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User>;
  refreshToken(): Promise<string>;
}

// Mock implementation for development
class MockAuthService implements AuthService {
  private mockUsers: Array<User & { password: string }> = [
    {
      id: '1',
      email: 'demo@clouddeploy.dev',
      name: 'Demo User',
      avatar: '/placeholder.svg',
      role: 'user',
      password: 'demo123',
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date()
    }
  ];

  private currentUser: User | null = null;
  private token: string | null = null;

  async login(email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    this.token = `mock-token-${user.id}`;
    this.currentUser = {
      ...user,
      lastLoginAt: new Date()
    };
    
    localStorage.setItem('auth-token', this.token);
    localStorage.setItem('auth-user', JSON.stringify(this.currentUser));

    return this.currentUser;
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  }

  async register(email: string, password: string, name: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if user already exists
    if (this.mockUsers.find(u => u.email === email)) {
      throw new Error('User already exists with this email');
    }

    const newUser: User & { password: string } = {
      id: `user_${Date.now()}`,
      email,
      name,
      role: 'user',
      password,
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    this.mockUsers.push(newUser);
    
    // Auto-login after registration
    return this.login(email, password);
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('auth-user');
    
    if (token && userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.token = token;
        return this.currentUser;
      } catch {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
      }
    }
    
    return null;
  }

  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!this.currentUser || this.currentUser.id !== userId) {
      throw new Error('Unauthorized');
    }

    this.currentUser = { ...this.currentUser, ...updates };
    localStorage.setItem('auth-user', JSON.stringify(this.currentUser));

    return this.currentUser;
  }

  async refreshToken(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!this.token) {
      throw new Error('No token to refresh');
    }

    return this.token;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
  authService?: AuthService;
}

export const AuthProvider = ({ 
  children, 
  authService = new MockAuthService() 
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
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
  }, [authService]);

  // Auth actions
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await authService.login(email, password);
      setUser(user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to logout properly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const user = await authService.register(email, password, name);
      setUser(user);
      
      toast({
        title: "Registration successful",
        description: `Welcome to CloudDeploy, ${user.name}!`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<User, 'name' | 'avatar'>>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const updatedUser = await authService.updateProfile(user.id, updates);
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      await authService.refreshToken();
    } catch (error) {
      // Session refresh failed, log out user
      await logout();
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected route wrapper
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    // In a real app, this would redirect to login
    return <div className="min-h-screen flex items-center justify-center">Please log in</div>;
  }

  return <>{children}</>;
};