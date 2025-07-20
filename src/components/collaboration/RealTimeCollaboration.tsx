import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Screen,
  Edit3,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useWebSocket } from '@/utils/webSocket';

interface CollaborationUser {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  status: 'online' | 'idle' | 'offline';
  cursor?: {
    x: number;
    y: number;
    element?: string;
  };
  currentView: string;
  lastActive: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'deployment' | 'alert';
  attachments?: {
    type: 'image' | 'file' | 'code';
    name: string;
    url: string;
  }[];
}

interface LiveActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: Date;
  type: 'deployment' | 'edit' | 'view' | 'comment';
}

const mockUsers: CollaborationUser[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    role: 'owner',
    status: 'online',
    currentView: 'dashboard',
    lastActive: new Date(),
    cursor: { x: 120, y: 350, element: 'project-card-1' }
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    avatar: '/avatars/mike.jpg',
    role: 'developer',
    status: 'online',
    currentView: 'deployment-logs',
    lastActive: new Date()
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: '/avatars/emma.jpg',
    role: 'admin',
    status: 'idle',
    currentView: 'analytics',
    lastActive: new Date(Date.now() - 300000)
  },
  {
    id: '4',
    name: 'David Kumar',
    avatar: '/avatars/david.jpg',
    role: 'developer',
    status: 'offline',
    currentView: 'projects',
    lastActive: new Date(Date.now() - 3600000)
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Mike Rodriguez',
    userAvatar: '/avatars/mike.jpg',
    message: 'Deployment pipeline is running smoothly. ETA 3 minutes.',
    timestamp: new Date(Date.now() - 300000),
    type: 'deployment'
  },
  {
    id: '2',
    userId: '1',
    userName: 'Sarah Chen',
    userAvatar: '/avatars/sarah.jpg',
    message: 'Great! I can see the build progress in real-time. The new caching optimizations are working well.',
    timestamp: new Date(Date.now() - 240000),
    type: 'message'
  },
  {
    id: '3',
    userId: 'system',
    userName: 'System',
    userAvatar: '/system-avatar.svg',
    message: 'Deployment completed successfully. Performance improved by 23%.',
    timestamp: new Date(Date.now() - 120000),
    type: 'system'
  }
];

const mockActivities: LiveActivity[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Sarah Chen',
    action: 'started deployment',
    target: 'my-portfolio',
    timestamp: new Date(Date.now() - 180000),
    type: 'deployment'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Mike Rodriguez',
    action: 'commented on',
    target: 'deployment logs',
    timestamp: new Date(Date.now() - 120000),
    type: 'comment'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Emma Wilson',
    action: 'viewed',
    target: 'performance analytics',
    timestamp: new Date(Date.now() - 60000),
    type: 'view'
  }
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'owner': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'developer': return 'bg-green-100 text-green-700 border-green-200';
    case 'viewer': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusIndicator = (status: string) => {
  switch (status) {
    case 'online': return 'w-3 h-3 bg-green-500 rounded-full';
    case 'idle': return 'w-3 h-3 bg-yellow-500 rounded-full';
    case 'offline': return 'w-3 h-3 bg-gray-400 rounded-full';
    default: return 'w-3 h-3 bg-gray-400 rounded-full';
  }
};

export const RealTimeCollaboration = memo(() => {
  const [users, setUsers] = useState<CollaborationUser[]>(mockUsers);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [activities, setActivities] = useState<LiveActivity[]>(mockActivities);
  const [newMessage, setNewMessage] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showCursors, setShowCursors] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { connectionState, subscribe, send } = useWebSocket({
    url: process.env.VITE_WS_URL || 'wss://api.clouddeploy.com/ws',
    enableLogging: process.env.NODE_ENV === 'development',
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle real-time updates
  useEffect(() => {
    const unsubscribeUserActivity = subscribe('user_activity', (message) => {
      const { type, userId, data } = message.payload;
      
      switch (type) {
        case 'cursor_move':
          setUsers(prev => prev.map(user => 
            user.id === userId 
              ? { ...user, cursor: data.cursor }
              : user
          ));
          break;
        case 'view_change':
          setUsers(prev => prev.map(user => 
            user.id === userId 
              ? { ...user, currentView: data.view }
              : user
          ));
          break;
        case 'status_change':
          setUsers(prev => prev.map(user => 
            user.id === userId 
              ? { ...user, status: data.status }
              : user
          ));
          break;
      }
    });

    const unsubscribeMessages = subscribe('chat_message', (message) => {
      const newMsg: ChatMessage = {
        id: message.id,
        userId: message.payload.userId,
        userName: message.payload.userName,
        userAvatar: message.payload.userAvatar,
        message: message.payload.message,
        timestamp: new Date(message.timestamp),
        type: message.payload.type || 'message'
      };
      setMessages(prev => [...prev, newMsg]);
    });

    return () => {
      unsubscribeUserActivity();
      unsubscribeMessages();
    };
  }, [subscribe]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || connectionState !== 'connected') return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      userAvatar: '/avatars/current-user.jpg',
      message: newMessage,
      timestamp: new Date(),
      type: 'message'
    };

    send('chat_message', {
      userId: 'current-user',
      userName: 'You',
      userAvatar: '/avatars/current-user.jpg',
      message: newMessage,
      type: 'message'
    });

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  }, [newMessage, connectionState, send]);

  // Handle keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  const onlineUsers = users.filter(user => user.status === 'online');
  const idleUsers = users.filter(user => user.status === 'idle');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Live Users Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Team ({users.length})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">{onlineUsers.length} online</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Online Users */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Online</h4>
            <div className="space-y-3">
              {onlineUsers.map(user => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 ${getStatusIndicator(user.status)} border-2 border-white`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs ${getRoleColor(user.role)}`}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.currentView}
                      </span>
                    </div>
                  </div>
                  {user.cursor && showCursors && (
                    <Mouse className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Idle/Offline Users */}
          {idleUsers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Away</h4>
              <div className="space-y-2">
                {idleUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg opacity-60">
                    <div className="relative">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 ${getStatusIndicator(user.status)} border border-white`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(user.lastActive)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Collaboration Controls */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Collaboration</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={isVoiceEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className="justify-start"
              >
                {isVoiceEnabled ? <Mic className="w-4 h-4 mr-1" /> : <MicOff className="w-4 h-4 mr-1" />}
                Voice
              </Button>
              <Button
                variant={isVideoEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className="justify-start"
              >
                {isVideoEnabled ? <Video className="w-4 h-4 mr-1" /> : <VideoOff className="w-4 h-4 mr-1" />}
                Video
              </Button>
              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className="justify-start col-span-2"
              >
                <Screen className="w-4 h-4 mr-1" />
                {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat and Activity */}
      <div className="lg:col-span-2 space-y-6">
        {/* Real-time Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span>Team Chat</span>
              <Badge variant="outline" className={connectionState === 'connected' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}>
                {connectionState}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages */}
              <ScrollArea className="h-64 border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.map(message => {
                    const isSystem = message.type === 'system';
                    const isDeployment = message.type === 'deployment';
                    
                    return (
                      <div key={message.id} className={`flex space-x-3 ${isSystem ? 'justify-center' : ''}`}>
                        {!isSystem && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.userAvatar} alt={message.userName} />
                            <AvatarFallback className="text-xs">
                              {message.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex-1 ${isSystem ? 'text-center' : ''}`}>
                          {!isSystem && (
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">{message.userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.timestamp)}
                              </span>
                              {isDeployment && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Deployment
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className={`text-sm ${isSystem ? 'bg-muted p-2 rounded-lg inline-block' : ''} ${isDeployment ? 'bg-blue-50 p-2 rounded border border-blue-200' : ''}`}>
                            {isSystem && <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />}
                            {message.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type a message... (Ctrl+Enter to send)"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-0 resize-none"
                  rows={2}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || connectionState !== 'connected'}
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <span>Live Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {activities.map(activity => (
                  <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.userName}</span>
                        {' '}
                        <span className="text-muted-foreground">{activity.action}</span>
                        {' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline" className={
                      activity.type === 'deployment' ? 'text-blue-600 border-blue-600' :
                      activity.type === 'edit' ? 'text-green-600 border-green-600' :
                      activity.type === 'comment' ? 'text-purple-600 border-purple-600' :
                      'text-gray-600 border-gray-600'
                    }>
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

RealTimeCollaboration.displayName = 'RealTimeCollaboration';