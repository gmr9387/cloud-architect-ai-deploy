import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, Users, GitBranch } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-ai-primary flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-ai-primary bg-clip-text text-transparent">
                CloudDeploy
              </h1>
            </div>
            <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
              AI-Powered
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-status-building rounded-full"></div>
            </Button>
            
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Team
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary text-primary-foreground">TC</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};