import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  GitBranch,
  Globe,
  Zap,
  AlertTriangle,
  UserPlus,
  Settings
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'developer' | 'reviewer';
  status: 'online' | 'away' | 'offline';
  lastActivity: string;
}

interface DeploymentActivity {
  id: string;
  type: 'deployment' | 'approval' | 'rollback' | 'comment';
  user: TeamMember;
  action: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  details?: string;
}

interface Notification {
  id: string;
  type: 'deployment' | 'approval' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: string;
}

const RealTimeCollaboration: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      avatar: '/avatars/sarah.jpg',
      role: 'admin',
      status: 'online',
      lastActivity: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      email: 'mike@company.com',
      avatar: '/avatars/mike.jpg',
      role: 'developer',
      status: 'online',
      lastActivity: '5 minutes ago'
    },
    {
      id: '3',
      name: 'Alex Rodriguez',
      email: 'alex@company.com',
      avatar: '/avatars/alex.jpg',
      role: 'reviewer',
      status: 'away',
      lastActivity: '15 minutes ago'
    }
  ]);

  const [activities, setActivities] = useState<DeploymentActivity[]>([
    {
      id: '1',
      type: 'deployment',
      user: teamMembers[1],
      action: 'Deployed v2.1.0 to production',
      timestamp: '2 minutes ago',
      status: 'completed',
      details: 'Blue-green deployment completed successfully'
    },
    {
      id: '2',
      type: 'approval',
      user: teamMembers[2],
      action: 'Approved deployment request',
      timestamp: '5 minutes ago',
      status: 'approved'
    },
    {
      id: '3',
      type: 'comment',
      user: teamMembers[0],
      action: 'Added comment on deployment',
      timestamp: '8 minutes ago',
      status: 'completed',
      details: 'Please ensure database migrations are tested before production'
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Deployment Successful',
      message: 'v2.1.0 deployed to production successfully',
      timestamp: '2 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'approval',
      title: 'Approval Required',
      message: 'Mike Johnson requested approval for production deployment',
      timestamp: '10 minutes ago',
      read: false,
      action: 'Review'
    },
    {
      id: '3',
      type: 'error',
      title: 'Deployment Failed',
      message: 'v2.0.9 deployment failed - check logs for details',
      timestamp: '1 hour ago',
      read: true
    }
  ]);

  const [approvalWorkflow, setApprovalWorkflow] = useState({
    enabled: true,
    requiredApprovers: 2,
    autoApprove: false,
    notifyOnApproval: true
  });

  const handleApproval = (activityId: string, approved: boolean) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, status: approved ? 'approved' : 'rejected' }
        : activity
    ));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Real-Time Collaboration</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Live
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="team" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="team">Team Status</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Online Team Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{member.name}</span>
                          <Badge variant="outline" size="sm" className={`${
                            member.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                            member.role === 'developer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {member.role}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <div className={`w-2 h-2 rounded-full ${
                            member.status === 'online' ? 'bg-green-500' :
                            member.status === 'away' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}></div>
                          <span>{member.status}</span>
                          <span>•</span>
                          <span>{member.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Team Member
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Team Chat
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Configure Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>{activity.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{activity.user.name}</span>
                          <Badge variant="outline" size="sm" className={`${
                            activity.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            activity.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            activity.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{activity.action}</p>
                        {activity.details && (
                          <p className="text-xs text-muted-foreground italic">{activity.details}</p>
                        )}
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {activity.type === 'approval' && activity.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="h-6 px-2">
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2">
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className={`cursor-pointer transition-all ${
                  !notification.read ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
                }`} onClick={() => markNotificationRead(notification.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'error' ? 'bg-red-500' :
                        notification.type === 'approval' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        {notification.action && (
                          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                            {notification.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Approval Workflow Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="approval-enabled" className="text-sm font-medium">Enable Approval Workflow</Label>
                    <p className="text-xs text-muted-foreground">Require approvals for production deployments</p>
                  </div>
                  <Switch 
                    id="approval-enabled"
                    checked={approvalWorkflow.enabled}
                    onCheckedChange={(checked) => setApprovalWorkflow(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-approve" className="text-sm font-medium">Auto-Approve Small Changes</Label>
                    <p className="text-xs text-muted-foreground">Automatically approve minor updates</p>
                  </div>
                  <Switch 
                    id="auto-approve"
                    checked={approvalWorkflow.autoApprove}
                    onCheckedChange={(checked) => setApprovalWorkflow(prev => ({ ...prev, autoApprove: checked }))}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <Label className="text-sm font-medium">Required Approvers: {approvalWorkflow.requiredApprovers}</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setApprovalWorkflow(prev => ({ 
                        ...prev, 
                        requiredApprovers: Math.max(1, prev.requiredApprovers - 1) 
                      }))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{approvalWorkflow.requiredApprovers}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setApprovalWorkflow(prev => ({ 
                        ...prev, 
                        requiredApprovers: Math.min(5, prev.requiredApprovers + 1) 
                      }))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RealTimeCollaboration;