import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/localStorage';

interface PendingAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retries: number;
}

interface OfflineSyncState {
  isOnline: boolean;
  pendingActions: PendingAction[];
  isSyncing: boolean;
  lastSyncAt: Date | null;
}

export function useOfflineSync() {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    pendingActions: storage.getItem('PENDING_SYNC_ACTIONS', []) || [],
    isSyncing: false,
    lastSyncAt: null
  });

  // Add action to queue when offline
  const queueAction = useCallback((type: string, payload: any) => {
    const action: PendingAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      payload,
      timestamp: Date.now(),
      retries: 0
    };

    setState(prev => {
      const newPendingActions = [...prev.pendingActions, action];
      storage.setItem('PENDING_SYNC_ACTIONS', newPendingActions);
      return {
        ...prev,
        pendingActions: newPendingActions
      };
    });

    return action.id;
  }, []);

  // Remove action from queue
  const removeAction = useCallback((actionId: string) => {
    setState(prev => {
      const newPendingActions = prev.pendingActions.filter(a => a.id !== actionId);
      storage.setItem('PENDING_SYNC_ACTIONS', newPendingActions);
      return {
        ...prev,
        pendingActions: newPendingActions
      };
    });
  }, []);

  // Sync pending actions when online
  const syncPendingActions = useCallback(async () => {
    if (!state.isOnline || state.isSyncing || state.pendingActions.length === 0) {
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      // TODO: Replace with actual Supabase sync when ready
      // For now, simulate sync process
      
      for (const action of state.pendingActions) {
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // TODO: Implement actual sync logic based on action type
          console.log('Syncing action:', action.type, action.payload);
          
          // Remove successful action
          removeAction(action.id);
        } catch (error) {
          console.error('Failed to sync action:', action, error);
          
          // Increment retry count
          setState(prev => ({
            ...prev,
            pendingActions: prev.pendingActions.map(a => 
              a.id === action.id 
                ? { ...a, retries: a.retries + 1 }
                : a
            )
          }));
          
          // Remove action if too many retries
          if (action.retries >= 3) {
            removeAction(action.id);
          }
        }
      }

      setState(prev => ({
        ...prev,
        lastSyncAt: new Date()
      }));

    } finally {
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [state.isOnline, state.isSyncing, state.pendingActions, removeAction]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (state.isOnline && state.pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [state.isOnline, syncPendingActions]);

  // Clear all pending actions
  const clearPendingActions = useCallback(() => {
    setState(prev => {
      storage.setItem('PENDING_SYNC_ACTIONS', []);
      return {
        ...prev,
        pendingActions: []
      };
    });
  }, []);

  // Force sync (for manual refresh)
  const forceSync = useCallback(async () => {
    if (state.isOnline) {
      await syncPendingActions();
    }
  }, [state.isOnline, syncPendingActions]);

  return {
    isOnline: state.isOnline,
    pendingActions: state.pendingActions,
    isSyncing: state.isSyncing,
    lastSyncAt: state.lastSyncAt,
    queueAction,
    removeAction,
    clearPendingActions,
    forceSync,
    hasPendingActions: state.pendingActions.length > 0
  };
}