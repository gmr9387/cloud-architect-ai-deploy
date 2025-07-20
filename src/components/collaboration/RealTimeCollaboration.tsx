import { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Eye, 
  Mouse, 
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Edit3,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  currentPage?: string;
  cursor?: {
    x: number;
    y: number;
    color: string;
  };
  isTyping?: boolean;
  permissions: 'admin' | 'editor' | 'viewer';
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'file';
  edited?: boolean;
}

interface ActivityItem {
  id: string;
  userId: string;
  action: string;
  target: string;
  timestamp: Date;
  type: 'deploy' | 'edit' | 'comment' | 'join' | 'leave';
}

interface CollaborationSession {
  id: string;
  projectId: string;
  activeMembers: TeamMember[];
  isRecording: boolean;
  startTime: Date;
}

// API functions for collaboration features
const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  // TODO: Replace with actual API call
  // Example: const response = await fetch('/api/collaboration/members');
  // return response.json();
  
  // For now, return empty array - real data will come from backend
  return [];
};

const fetchChatMessages = async (): Promise<ChatMessage[]> => {
  // TODO: Replace with actual API call
  // Example: const response = await fetch('/api/collaboration/chat');
  // return response.json();
  
  // For now, return empty array - real data will come from backend
  return [];
};

const fetchRecentActivity = async (): Promise<ActivityItem[]> => {
  // TODO: Replace with actual API call
  // Example: const response = await fetch('/api/collaboration/activity');
  // return response.json();
  
  // For now, return empty array - real data will come from backend
  return [];
};

const sendChatMessage = async (message: string): Promise<void> => {
  // TODO: Replace with actual API call
  // Example: await fetch('/api/collaboration/chat', { 
  //   method: 'POST', 
  //   body: JSON.stringify({ message }) 
  // });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
};

const updateMemberStatus = async (status: 'online' | 'offline' | 'away'): Promise<void> => {
  // TODO: Replace with actual API call
  // Example: await fetch('/api/collaboration/status', { 
  //   method: 'PUT', 
  //   body: JSON.stringify({ status }) 
  // });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
};

export const RealTimeCollaboration = memo(() => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeUsers, setActiveUsers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load collaboration data
  const loadCollaborationData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [members, messages, activity] = await Promise.all([
        fetchTeamMembers(),
        fetchChatMessages(),
        fetchRecentActivity()
      ]);
      
      setTeamMembers(members);
      setChatMessages(messages);
      setRecentActivity(activity);
      setActiveUsers(members.filter(member => member.status === 'online'));
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
      // Handle error state - could show error message to user
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send message handler
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    
    try {
      await sendChatMessage(newMessage);
      setNewMessage('');
      // In real implementation, new message would be received via WebSocket
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [newMessage]);

  // Toggle audio/video handlers
  const toggleAudio = useCallback(async () => {
    setIsAudioEnabled(prev => !prev);
    // TODO: Implement actual audio toggle logic
  }, []);

  const toggleVideo = useCallback(async () => {
    setIsVideoEnabled(prev => !prev);
    // TODO: Implement actual video toggle logic
  }, []);

  const toggleScreenShare = useCallback(async () => {
    setIsScreenSharing(prev => !prev);
    // TODO: Implement actual screen sharing logic
  }, []);

  // Initial data load
  useEffect(() => {
    loadCollaborationData();
  }, [loadCollaborationData]);

  // Empty state when no team members
  if (!isLoading && teamMembers.length === 0) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Team Members Yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Invite team members to start collaborating in real-time. Share projects, chat, and work together seamlessly.
          </p>
          <Button>
            <Share2 className="w-4 h-4 mr-2" />
            Invite Team Members
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Real-Time Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-muted rounded-full animate-pulse" />
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const onlineMembers = teamMembers.filter(member => member.status === 'online');

  return (
    <div className="space-y-6">
      {/* Session Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Active Collaboration Session</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {onlineMembers.length} Online
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {/* Active Users Avatars */}
            <div className="flex -space-x-2">
              {onlineMembers.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="border-2 border-white">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {onlineMembers.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-white flex items-center justify-center text-xs font-medium">
                  +{onlineMembers.length - 5}
                </div>
              )}
            </div>

            {/* Voice/Video Controls */}
            <div className="flex space-x-2 ml-auto">
              <Button
                variant={isAudioEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4 mr-1" /> : <MicOff className="w-4 h-4 mr-1" />}
                Audio
              </Button>
              <Button
                variant={isVideoEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="w-4 h-4 mr-1" /> : <VideoOff className="w-4 h-4 mr-1" />}
                Video
              </Button>
              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="sm"
                onClick={toggleScreenShare}
                className="justify-start col-span-2"
              >
                <Monitor className="w-4 h-4 mr-1" />
                {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Tabs */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Team Chat</span>
            {chatMessages.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {chatMessages.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Activity Feed</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Team Members</span>
            <Badge variant="outline" className="ml-1">
              {teamMembers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Team Chat */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Chat</CardTitle>
            </CardHeader>
            <CardContent>
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {chatMessages.map((message) => {
                    const sender = teamMembers.find(m => m.id === message.userId);
                    return (
                      <div key={message.id} className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={sender?.avatar} />
                          <AvatarFallback className="text-xs">
                            {sender?.name.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">{sender?.name || 'Unknown User'}</span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.edited && (
                              <Badge variant="outline" className="text-xs">
                                edited
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{message.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Message Input */}
              <div className="flex space-x-2 mt-4">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Feed */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity to show.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const user = teamMembers.find(m => m.id === activity.userId);
                    const getActivityIcon = () => {
                      switch (activity.type) {
                        case 'deploy': return <CheckCircle className="w-4 h-4 text-green-500" />;
                        case 'edit': return <Edit3 className="w-4 h-4 text-blue-500" />;
                        case 'comment': return <MessageCircle className="w-4 h-4 text-purple-500" />;
                        case 'join': return <Users className="w-4 h-4 text-green-500" />;
                        case 'leave': return <Users className="w-4 h-4 text-red-500" />;
                        default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
                      }
                    };

                    return (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                        <div className="mt-0.5">
                          {getActivityIcon()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{user?.name || 'Unknown User'}</span>
                            {' '}{activity.action}{' '}
                            <span className="font-medium">{activity.target}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Members */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Team Members ({teamMembers.length})</span>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === 'online' ? 'bg-green-500' : 
                          member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {member.currentPage && member.status === 'online' && (
                          <p className="text-xs text-blue-600 flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Viewing: {member.currentPage}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        member.status === 'online' ? 'default' : 
                        member.status === 'away' ? 'secondary' : 'outline'
                      }>
                        {member.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {member.permissions}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

RealTimeCollaboration.displayName = 'RealTimeCollaboration';