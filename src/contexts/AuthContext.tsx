import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";
import { localStorageService } from '@/services/storage/LocalStorageService';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const currentUser = localStorageService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Initialize demo data if no users exist
          await localStorageService.initializeDemoData();
          const demoUser = localStorageService.getCurrentUser();
          if (demoUser) {
            setUser(demoUser);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await localStorageService.authenticateUser(email, password);
      localStorageService.setCurrentUser(authenticatedUser);
      setUser(authenticatedUser);
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${authenticatedUser.name}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    try {
      const newUser = await localStorageService.createUser(email, password, name);
      localStorageService.setCurrentUser(newUser);
      setUser(newUser);
      
      toast({
        title: "Account Created!",
        description: `Welcome to CloudDeploy, ${newUser.name}!`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      localStorageService.setCurrentUser(null);
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    setIsLoading(true);
    try {
      const updatedUser = { ...user, ...updates };
      localStorageService.setCurrentUser(updatedUser);
      setUser(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async (): Promise<void> => {
    const currentUser = localStorageService.getCurrentUser();
    setUser(currentUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
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