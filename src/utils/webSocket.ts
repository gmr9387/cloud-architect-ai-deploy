// WebSocket utility for real-time features
// Handles connection management, reconnection, and message routing

type WebSocketEventType = 
  | 'deployment_started'
  | 'deployment_progress' 
  | 'deployment_completed'
  | 'deployment_failed'
  | 'project_updated'
  | 'metrics_updated'
  | 'user_activity'
  | 'notification';

interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
  timestamp: number;
  id: string;
}

interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  enableLogging?: boolean;
}

type WebSocketHandler = (message: WebSocketMessage) => void;
type ConnectionHandler = (event: Event) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private handlers = new Map<WebSocketEventType, Set<WebSocketHandler>>();
  private connectionHandlers = new Map<'open' | 'close' | 'error', Set<ConnectionHandler>>();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectCount = 0;
  private isManuallyDisconnected = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      protocols: [],
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      heartbeatInterval: 30000,
      enableLogging: false,
      ...config,
    };
  }

  // Connection management
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isManuallyDisconnected = false;
        this.ws = new WebSocket(this.config.url, this.config.protocols);

        this.ws.onopen = (event) => {
          this.log('WebSocket connected');
          this.reconnectCount = 0;
          this.startHeartbeat();
          this.notifyConnectionHandlers('open', event);
          resolve();
        };

        this.ws.onclose = (event) => {
          this.log('WebSocket disconnected', event.code, event.reason);
          this.stopHeartbeat();
          this.notifyConnectionHandlers('close', event);
          
          if (!this.isManuallyDisconnected && this.shouldReconnect()) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (event) => {
          this.log('WebSocket error', event);
          this.notifyConnectionHandlers('error', event);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManuallyDisconnected = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  // Message handling
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      this.log('Received message', message.type, message.payload);
      
      const handlers = this.handlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in WebSocket handler:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // Send message
  send(type: WebSocketEventType, payload: any): boolean {
    if (!this.isConnected()) {
      this.log('Cannot send message: WebSocket not connected');
      return false;
    }

    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateId(),
    };

    try {
      this.ws!.send(JSON.stringify(message));
      this.log('Sent message', message.type, message.payload);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  // Event subscription
  on(type: WebSocketEventType, handler: WebSocketHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    this.handlers.get(type)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  // Connection event subscription
  onConnection(event: 'open' | 'close' | 'error', handler: ConnectionHandler): () => void {
    if (!this.connectionHandlers.has(event)) {
      this.connectionHandlers.set(event, new Set());
    }
    
    this.connectionHandlers.get(event)!.add(handler);
    
    return () => {
      const handlers = this.connectionHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.connectionHandlers.delete(event);
        }
      }
    };
  }

  // Connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  // Private methods
  private shouldReconnect(): boolean {
    return this.reconnectCount < this.config.reconnectAttempts;
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    
    const delay = this.config.reconnectInterval * Math.pow(1.5, this.reconnectCount);
    
    this.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectCount + 1})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectCount++;
      this.connect().catch(() => {
        // Reconnection failed, will be handled by onclose
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send('heartbeat' as WebSocketEventType, { timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private notifyConnectionHandlers(event: 'open' | 'close' | 'error', wsEvent: Event): void {
    const handlers = this.connectionHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(wsEvent);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(...args: any[]): void {
    if (this.config.enableLogging) {
      console.log('[WebSocket]', ...args);
    }
  }
}

// React hook for WebSocket management
export function useWebSocket(config: WebSocketConfig) {
  const wsManager = useRef<WebSocketManager | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    wsManager.current = new WebSocketManager(config);

    const unsubscribeOpen = wsManager.current.onConnection('open', () => {
      setConnectionState('connected');
    });

    const unsubscribeClose = wsManager.current.onConnection('close', () => {
      setConnectionState('disconnected');
    });

    // Auto-connect
    setConnectionState('connecting');
    wsManager.current.connect().catch(() => {
      setConnectionState('disconnected');
    });

    return () => {
      unsubscribeOpen();
      unsubscribeClose();
      wsManager.current?.disconnect();
    };
  }, [config.url]);

  const subscribe = useCallback((type: WebSocketEventType, handler: WebSocketHandler) => {
    return wsManager.current?.on(type, handler) ?? (() => {});
  }, []);

  const send = useCallback((type: WebSocketEventType, payload: any) => {
    return wsManager.current?.send(type, payload) ?? false;
  }, []);

  const connect = useCallback(() => {
    if (wsManager.current) {
      setConnectionState('connecting');
      return wsManager.current.connect();
    }
    return Promise.reject(new Error('WebSocket manager not initialized'));
  }, []);

  const disconnect = useCallback(() => {
    wsManager.current?.disconnect();
  }, []);

  return {
    connectionState,
    subscribe,
    send,
    connect,
    disconnect,
    isConnected: connectionState === 'connected',
  };
}

// Utility hooks for specific features
export function useDeploymentUpdates(projectId?: string) {
  const { subscribe, isConnected } = useWebSocket({
    url: process.env.VITE_WS_URL || 'wss://api.clouddeploy.com/ws',
    enableLogging: process.env.NODE_ENV === 'development',
  });

  const [deploymentStatus, setDeploymentStatus] = useState<{
    status: string;
    progress: number;
    logs: string[];
  } | null>(null);

  useEffect(() => {
    if (!projectId || !isConnected) return;

    const unsubscribeProgress = subscribe('deployment_progress', (message) => {
      if (message.payload.projectId === projectId) {
        setDeploymentStatus(prev => ({
          status: message.payload.status,
          progress: message.payload.progress,
          logs: [...(prev?.logs || []), message.payload.log],
        }));
      }
    });

    const unsubscribeCompleted = subscribe('deployment_completed', (message) => {
      if (message.payload.projectId === projectId) {
        setDeploymentStatus(prev => ({
          status: 'completed',
          progress: 100,
          logs: prev?.logs || [],
        }));
      }
    });

    const unsubscribeFailed = subscribe('deployment_failed', (message) => {
      if (message.payload.projectId === projectId) {
        setDeploymentStatus(prev => ({
          status: 'failed',
          progress: prev?.progress || 0,
          logs: [...(prev?.logs || []), message.payload.error],
        }));
      }
    });

    return () => {
      unsubscribeProgress();
      unsubscribeCompleted();
      unsubscribeFailed();
    };
  }, [projectId, isConnected, subscribe]);

  return { deploymentStatus, isConnected };
}

export default WebSocketManager;