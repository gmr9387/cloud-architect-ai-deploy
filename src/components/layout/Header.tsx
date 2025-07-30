import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Zap, 
  Moon, 
  Sun, 
  Sparkles,
  Menu,
  Search,
  Command
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!mounted) return null;

  return (
    <header className={`
      sticky top-0 z-50 w-full transition-all duration-300 ease-out
      ${isScrolled 
        ? 'glass-morphism-dark shadow-xl border-glass-300' 
        : 'bg-transparent border-transparent'
      }
      border-b
    `}>
      <div className="container-premium">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-lg group-hover:shadow-glow-primary transition-all duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-ai-primary rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gradient-primary">
                  CloudDeploy
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  AI-Powered Platform
                </p>
              </div>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Search projects, deployments..."
                className="w-full pl-10 pr-12 py-2 input-premium text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted/50">
                  <Command className="w-3 h-3 mr-1" />
                  K
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Side - Actions & User */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>

            {/* Mobile Search */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative hover:bg-glass-200">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-status-error rounded-full animate-pulse"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 p-0 glass-morphism border-glass-300 shadow-premium"
              >
                <div className="p-4 border-b border-glass-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    <Badge variant="secondary" className="text-xs">3 new</Badge>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    {
                      id: 1,
                      title: "Deployment Complete",
                      message: "E-commerce Frontend deployed successfully",
                      time: "2 min ago",
                      type: "success"
                    },
                    {
                      id: 2,
                      title: "AI Optimization Available",
                      message: "Found 3 performance improvements",
                      time: "5 min ago",
                      type: "ai"
                    },
                    {
                      id: 3,
                      title: "Build Failed",
                      message: "Company Dashboard build failed",
                      time: "10 min ago",
                      type: "error"
                    }
                  ].map((notification) => (
                    <div key={notification.id} className="p-3 hover:bg-glass-100 transition-colors border-b border-glass-100 last:border-0">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-status-success' :
                          notification.type === 'ai' ? 'bg-ai-primary' :
                          notification.type === 'error' ? 'bg-status-error' : 'bg-muted'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-glass-200">
                  <Button variant="ghost" className="w-full text-sm">
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hover:bg-glass-200"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* AI Assistant */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-glass-200 relative group"
            >
              <Sparkles className="w-5 h-5 text-ai-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-ai-primary rounded-full animate-pulse opacity-75"></div>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all">
                  <Avatar className="h-10 w-10 ring-2 ring-glass-300">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-premium text-white font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-status-success rounded-full border-2 border-background"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 glass-morphism border-glass-300 shadow-premium" 
                align="end" 
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-premium text-white font-semibold text-lg">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          {user?.email}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {user?.role === 'admin' ? 'Administrator' : 'Developer'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-glass-200" />
                <DropdownMenuItem className="hover:bg-glass-100">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-glass-100">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-glass-100">
                  <Zap className="mr-2 h-4 w-4 text-ai-primary" />
                  <span>AI Features</span>
                  <Badge variant="secondary" className="ml-auto text-xs">New</Badge>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-glass-200" />
                <DropdownMenuItem 
                  className="hover:bg-destructive/10 focus:bg-destructive/10 text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Gradient Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </header>
  );
};

export default Header;