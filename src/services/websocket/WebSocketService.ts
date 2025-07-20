// WebSocket service for real-time deployment updates
// Following Clean Architecture - this is an Interface Adapter

export interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export interface WebSocketEventHandler {
  (message: WebSocketMessage): void;
}

export interface WebSocketServiceInterface {
  connect(): Promise<void>;
  disconnect(): void;
  send(type: string, payload: any): void;
  subscribe(eventType: string, handler: WebSocketEventHandler): () => void;
  isConnected(): boolean;
  getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'error';
}

// Real WebSocket service implementation
export class WebSocketService implements WebSocketServiceInterface {
  private ws: WebSocket | null = null;
  private url: string;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.connectionState = 'connecting';

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.connectionState = 'disconnected';
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connectionState = 'error';
          reject(error);
        };
      } catch (error) {
        this.connectionState = 'error';
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionState = 'disconnected';
  }

  send(type: string, payload: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        id: Date.now().toString(),
        type,
        payload,
        timestamp: Date.now()
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', type);
    }
  }

  subscribe(eventType: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    return this.connectionState;
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.connectionState = 'error';
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }
}

// Factory function to create WebSocket service
export function createWebSocketService(): WebSocketServiceInterface {
  // TODO: Replace with actual WebSocket URL from environment variables
  const wsUrl = process.env.VITE_WS_URL || 'wss://api.example.com/ws';
  
  // In development, you might want to use a different URL or mock service
  if (process.env.NODE_ENV === 'development') {
    console.warn('WebSocket service not configured for development. Using placeholder URL.');
  }
  
  return new WebSocketService(wsUrl);
}