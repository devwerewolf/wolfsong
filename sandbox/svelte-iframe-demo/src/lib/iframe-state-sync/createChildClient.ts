import type { AtomValue, SyncMessage, SyncRequestMessage, IframeSyncOptions } from './types';

export interface ChildAtomConfig<T extends AtomValue> {
  key: string;
  defaultValue: T;
}

export interface ChildClient {
  getValue<T extends AtomValue>(key: string): T | undefined;
  setValue<T extends AtomValue>(key: string, value: T): void;
  subscribe<T extends AtomValue>(key: string, callback: (value: T) => void): () => void;
  requestSync(): void;
  destroy(): void;
}

export function createChildClient(options: IframeSyncOptions = {}): ChildClient {
  const targetOrigin = options.targetOrigin || '*';
  const debug = options.debug || false;
  const state = new Map<string, AtomValue>();
  const subscribers = new Map<string, Set<(value: any) => void>>();

  function log(...args: any[]) {
    if (debug) {
      console.log('[IframeStateSync Child]', ...args);
    }
  }

  function handleMessage(event: MessageEvent) {
    const message = event.data as SyncMessage;
    if (message.type === 'atom-sync') {
      log(`Received atom update: ${message.key}`, message.value);
      state.set(message.key, message.value);
      
      const subs = subscribers.get(message.key);
      if (subs) {
        subs.forEach((callback) => callback(message.value));
      }
    }
  }

  window.addEventListener('message', handleMessage);

  function requestSync() {
    const message: SyncRequestMessage = {
      type: 'atom-sync-request',
      timestamp: Date.now(),
    };
    window.parent.postMessage(message, targetOrigin);
    log('Requested sync from parent');
  }

  // Request initial sync
  requestSync();

  return {
    getValue<T extends AtomValue>(key: string): T | undefined {
      return state.get(key) as T;
    },

    setValue<T extends AtomValue>(key: string, value: T): void {
      state.set(key, value);
      const message: SyncMessage<T> = {
        type: 'atom-sync',
        key,
        value,
        timestamp: Date.now(),
      };
      window.parent.postMessage(message, targetOrigin);
      log(`Sent atom update: ${key}`, value);
    },

    subscribe<T extends AtomValue>(key: string, callback: (value: T) => void): () => void {
      if (!subscribers.has(key)) {
        subscribers.set(key, new Set());
      }
      subscribers.get(key)!.add(callback);
      log(`Subscribed to: ${key}`);

      // Call immediately with current value if available
      const currentValue = state.get(key);
      if (currentValue !== undefined) {
        callback(currentValue as T);
      }

      return () => {
        const subs = subscribers.get(key);
        if (subs) {
          subs.delete(callback);
          if (subs.size === 0) {
            subscribers.delete(key);
          }
        }
        log(`Unsubscribed from: ${key}`);
      };
    },

    requestSync,

    destroy() {
      window.removeEventListener('message', handleMessage);
      state.clear();
      subscribers.clear();
      log('Client destroyed');
    },
  };
}
