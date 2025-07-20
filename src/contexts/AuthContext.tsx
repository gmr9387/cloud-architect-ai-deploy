import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

// Authentication service interface
interface AuthService {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  register(email: string, password: string, name: string): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(updates: Partial<User>): Promise<User>;
  refreshToken(): Promise<string>;
}

// Real authentication service implementation
class AuthenticationService implements AuthService {
  private readonly apiUrl = process.env.VITE_API_URL || 'https://api.example.com';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // TODO: Replace with actual API call
    // Example:
    // const response = await fetch(`${this.apiUrl}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Invalid credentials');
    // }
    // 
    // const data = await response.json();
    // this.token = data.token;
    // localStorage.setItem('auth_token', this.token);
    // return data;

    // For now, throw error - real implementation needed
    throw new Error('Authentication service not configured. Please set up your backend API.');
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    // TODO: Replace with actual API call
    // Example:
    // const response = await fetch(`${this.apiUrl}/auth/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password, name })
    // });
    // 
    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new Error(error.message || 'Registration failed');
    // }
    // 
    // const data = await response.json();
    // this.token = data.token;
    // localStorage.setItem('auth_token', this.token);
    // return data;

    // For now, throw error - real implementation needed
    throw new Error('Authentication service not configured. Please set up your backend API.');
  }

  async logout(): Promise<void> {
    // TODO: Replace with actual API call
    // Example:
    // if (this.token) {
    //   await fetch(`${this.apiUrl}/auth/logout`, {
    //     method: 'POST',
    //     headers: { 
    //       'Authorization': `Bearer ${this.token}`,
    //       'Content-Type': 'application/json'
    //     }
    //   });
    // }

    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    // TODO: Replace with actual API call
    // Example:
    // try {
    //   const response = await fetch(`${this.apiUrl}/auth/me`, {
    //     headers: { 'Authorization': `Bearer ${this.token}` }
    //   });
    //   
    //   if (!response.ok) {
    //     throw new Error('Failed to get user');
    //   }
    //   
    //   return await response.json();
    // } catch (error) {
    //   this.token = null;
    //   localStorage.removeItem('auth_token');
    //   return null;
    // }

    // For now, return null - real implementation needed
    return null;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    // TODO: Replace with actual API call
    // Example:
    // const response = await fetch(`${this.apiUrl}/auth/profile`, {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${this.token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(updates)
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to update profile');
    // }
    // 
    // return await response.json();

    // For now, throw error - real implementation needed
    throw new Error('Authentication service not configured. Please set up your backend API.');
  }

  async refreshToken(): Promise<string> {
    if (!this.token) {
      throw new Error('No token to refresh');
    }

    // TODO: Replace with actual API call
    // Example:
    // const response = await fetch(`${this.apiUrl}/auth/refresh`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${this.token}` }
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to refresh token');
    // }
    // 
    // const data = await response.json();
    // this.token = data.token;
    // localStorage.setItem('auth_token', this.token);
    // return this.token;

    // For now, throw error - real implementation needed
    throw new Error('Authentication service not configured. Please set up your backend API.');
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create auth service instance
const authService = new AuthenticationService();

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
        // Not throwing error here as this could be normal (no auth configured)
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