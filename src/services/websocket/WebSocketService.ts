// WebSocket service for real-time deployment updates
// Following Clean Architecture - this is an Interface Adapter

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface DeploymentUpdate {
  deploymentId: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  progress?: number;
  logs?: string[];
  error?: string;
  url?: string;
}

export interface BuildLogMessage {
  deploymentId: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface WebSocketEvents {
  'deployment.status': DeploymentUpdate;
  'deployment.logs': BuildLogMessage;
  'deployment.progress': { deploymentId: string; progress: number };
  'project.updated': { projectId: string; changes: Record<string, any> };
  'user.notification': { message: string; type: 'info' | 'success' | 'warning' | 'error' };
}

export type WebSocketEventType = keyof WebSocketEvents;

export interface WebSocketServiceInterface {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe<T extends WebSocketEventType>(
    event: T,
    callback: (data: WebSocketEvents[T]) => void
  ): () => void;
  send(message: WebSocketMessage): void;
  getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'error';
}

export class WebSocketService implements WebSocketServiceInterface {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners = new Map<string, Set<Function>>();
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionUrl: string;

  constructor(url: string) {
    this.connectionUrl = url;
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionState = 'connecting';
        this.ws = new WebSocket(this.connectionUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.connectionState = 'disconnected';
          this.stopHeartbeat();
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connectionState = 'error';
          reject(new Error('WebSocket connection failed'));
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.connectionState === 'connecting') {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.connectionState = 'error';
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.connectionState = 'disconnected';
    this.eventListeners.clear();
  }

  subscribe<T extends WebSocketEventType>(
    event: T,
    callback: (data: WebSocketEvents[T]) => void
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
      }
    };
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  getConnectionState() {
    return this.connectionState;
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.eventListeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.payload);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          payload: {},
          timestamp: Date.now()
        });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(() => {
        // Failed to reconnect, will try again if attempts remaining
      });
    }, delay);
  }
}

// Mock WebSocket service for development
export class MockWebSocketService implements WebSocketServiceInterface {
  private eventListeners = new Map<string, Set<Function>>();
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private mockIntervals: NodeJS.Timeout[] = [];

  async connect(): Promise<void> {
    this.connectionState = 'connecting';
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.connectionState = 'connected';
    console.log('Mock WebSocket connected');
    
    // Start mock deployment simulation
    this.startMockDeploymentSimulation();
  }

  disconnect(): void {
    this.connectionState = 'disconnected';
    this.eventListeners.clear();
    this.mockIntervals.forEach(interval => clearInterval(interval));
    this.mockIntervals = [];
    console.log('Mock WebSocket disconnected');
  }

  subscribe<T extends WebSocketEventType>(
    event: T,
    callback: (data: WebSocketEvents[T]) => void
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)!.add(callback);

    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  send(message: WebSocketMessage): void {
    console.log('Mock WebSocket send:', message);
  }

  getConnectionState() {
    return this.connectionState;
  }

  private startMockDeploymentSimulation(): void {
    // Simulate deployment status updates
    const deploymentSimulation = () => {
      const deploymentId = 'deploy_' + Math.random().toString(36).substring(7);
      const statuses: Array<'pending' | 'building' | 'deploying' | 'success' | 'failed'> = 
        ['pending', 'building', 'deploying', 'success'];
      
      let currentStatusIndex = 0;
      
      const updateStatus = () => {
        if (currentStatusIndex < statuses.length) {
          const status = statuses[currentStatusIndex];
          const progress = (currentStatusIndex / (statuses.length - 1)) * 100;
          
          this.emitEvent('deployment.status', {
            deploymentId,
            status,
            progress: Math.round(progress)
          });

          // Emit build logs
          this.emitEvent('deployment.logs', {
            deploymentId,
            timestamp: Date.now(),
            level: 'info' as const,
            message: `${status.charAt(0).toUpperCase() + status.slice(1)} deployment...`
          });

          currentStatusIndex++;
          
          if (currentStatusIndex < statuses.length) {
            setTimeout(updateStatus, 2000 + Math.random() * 3000);
          }
        }
      };
      
      updateStatus();
    };

    // Start a new simulation every 15-30 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        deploymentSimulation();
      }
    }, 15000 + Math.random() * 15000);
    
    this.mockIntervals.push(interval);

    // Simulate notifications
    const notificationInterval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance
        this.emitEvent('user.notification', {
          message: 'Your deployment completed successfully!',
          type: 'success' as const
        });
      }
    }, 30000);
    
    this.mockIntervals.push(notificationInterval);
  }

  private emitEvent<T extends WebSocketEventType>(event: T, payload: WebSocketEvents[T]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in mock WebSocket event handler:', error);
        }
      });
    }
  }
}

// Factory function for creating WebSocket service
export const createWebSocketService = (
  url?: string,
  useMock = process.env.NODE_ENV === 'development'
): WebSocketServiceInterface => {
  if (useMock) {
    return new MockWebSocketService();
  }
  
  const wsUrl = url || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
  return new WebSocketService(wsUrl);
};