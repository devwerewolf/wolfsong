import { createAtom } from '@xstate/store';
import type { AtomConfig, AtomValue, SyncMessage, IframeSyncOptions } from './types';

export class IframeStateSync {
  private atoms = new Map<string, ReturnType<typeof createAtom>>();
  private iframes = new Set<HTMLIFrameElement>();
  private options: Required<IframeSyncOptions>;
  private isRoot: boolean;

  constructor(options: IframeSyncOptions = {}) {
    this.options = {
      targetOrigin: options.targetOrigin ?? '*',
      debug: options.debug ?? false,
    };
    
    this.isRoot = window.self === window.top;
    this.setupMessageListener();
    
    if (this.options.debug) {
      console.log('[IframeStateSync] Initialized', { isRoot: this.isRoot });
    }
  }

  /**
   * Register an atom with the sync manager
   */
  registerAtom<T extends AtomValue>(config: AtomConfig<T>) {
    if (this.atoms.has(config.key)) {
      throw new Error(`Atom with key "${config.key}" already registered`);
    }

    const atom = createAtom(config.initialValue);
    this.atoms.set(config.key, atom);

    // Subscribe to changes and broadcast to iframes (only if root)
    if (this.isRoot) {
      atom.subscribe((value) => {
        this.broadcastToIframes(config.key, value);
      });
    }

    if (this.options.debug) {
      console.log(`[IframeStateSync] Registered atom "${config.key}"`, config.initialValue);
    }

    return atom;
  }

  /**
   * Get an atom by key
   */
  getAtom<T extends AtomValue>(key: string) {
    const atom = this.atoms.get(key);
    if (!atom) {
      throw new Error(`Atom with key "${key}" not found`);
    }
    return atom as ReturnType<typeof createAtom<T>>;
  }

  /**
   * Register an iframe for state synchronization
   */
  registerIframe(iframe: HTMLIFrameElement) {
    this.iframes.add(iframe);
    
    // Send current state to newly registered iframe
    iframe.addEventListener('load', () => {
      this.syncToIframe(iframe);
    });

    if (this.options.debug) {
      console.log('[IframeStateSync] Registered iframe', iframe.id || iframe);
    }
  }

  /**
   * Unregister an iframe
   */
  unregisterIframe(iframe: HTMLIFrameElement) {
    this.iframes.delete(iframe);
    
    if (this.options.debug) {
      console.log('[IframeStateSync] Unregistered iframe', iframe.id || iframe);
    }
  }

  /**
   * Broadcast a state change to all registered iframes
   */
  private broadcastToIframes<T extends AtomValue>(key: string, value: T) {
    const message: SyncMessage<T> = {
      type: 'atom-sync',
      key,
      value,
      timestamp: Date.now(),
    };

    this.iframes.forEach((iframe) => {
      iframe.contentWindow?.postMessage(message, this.options.targetOrigin);
    });

    if (this.options.debug) {
      console.log(`[IframeStateSync] Broadcasted "${key}"`, value);
    }
  }

  /**
   * Sync all current state to a specific iframe
   */
  private syncToIframe(iframe: HTMLIFrameElement) {
    this.atoms.forEach((atom, key) => {
      const message: SyncMessage = {
        type: 'atom-sync',
        key,
        value: atom.get() as AtomValue,
        timestamp: Date.now(),
      };
      iframe.contentWindow?.postMessage(message, this.options.targetOrigin);
    });

    if (this.options.debug) {
      console.log('[IframeStateSync] Synced all atoms to iframe', iframe.id || iframe);
    }
  }

  /**
   * Setup message listener for receiving updates from parent or iframes
   */
  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      const data = event.data;
      
      // Handle state sync messages
      if (data.type === 'atom-sync') {
        const atom = this.atoms.get(data.key);
        if (!atom) {
          if (this.options.debug) {
            console.warn(`[IframeStateSync] Received update for unknown atom "${data.key}"`);
          }
          return;
        }

        // Update local atom without triggering broadcast (prevent loops)
        atom.set(data.value);

        if (this.options.debug) {
          console.log(`[IframeStateSync] Received update for "${data.key}"`, data.value);
        }
        return;
      }
      
      // Handle state request from child (parent only)
      if (data.type === 'atom-sync-request' && this.isRoot) {
        if (this.options.debug) {
          console.log('[IframeStateSync] Received state request from child');
        }
        
        // Send all current atom values to the requesting child
        this.atoms.forEach((atom, key) => {
          const source = event.source as WindowProxy;
          source?.postMessage({
            type: 'atom-sync',
            key,
            value: atom.get() as AtomValue,
            timestamp: Date.now(),
          }, this.options.targetOrigin);
        });
      }
    });
  }

  /**
   * Request current state from parent (for child iframes)
   */
  requestStateFromParent() {
    if (this.isRoot) {
      if (this.options.debug) {
        console.warn('[IframeStateSync] Cannot request state from parent in root window');
      }
      return;
    }

    window.parent.postMessage({
      type: 'atom-sync-request',
      timestamp: Date.now(),
    }, this.options.targetOrigin);
    
    if (this.options.debug) {
      console.log('[IframeStateSync] Requested initial state from parent');
    }
  }

  /**
   * Send an update to parent (for child iframes)
   */
  sendToParent<T extends AtomValue>(key: string, value: T) {
    if (this.isRoot) {
      if (this.options.debug) {
        console.warn('[IframeStateSync] Cannot send to parent from root window');
      }
      return;
    }

    const message: SyncMessage<T> = {
      type: 'atom-sync',
      key,
      value,
      timestamp: Date.now(),
    };

    window.parent.postMessage(message, this.options.targetOrigin);

    if (this.options.debug) {
      console.log(`[IframeStateSync] Sent to parent "${key}"`, value);
    }
  }
}
