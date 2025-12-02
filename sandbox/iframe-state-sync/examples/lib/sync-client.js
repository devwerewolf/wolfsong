/**
 * Shared library for iframe state synchronization
 * This provides a unified API for both parent and child iframes
 */

export class IframeStateSync {
  constructor(options = {}) {
    this.atoms = new Map();
    this.iframes = new Set();
    this.options = { targetOrigin: '*', debug: true, ...options };
    this.isRoot = window.self === window.top;
    this.setupMessageListener();
    
    if (this.options.debug) {
      console.log('[IframeStateSync] Initialized', { isRoot: this.isRoot });
    }
  }

  registerAtom(config) {
    const atom = {
      value: config.initialValue,
      subscribers: new Set(),
      get: function() { return this.value; },
      set: function(newValue) {
        this.value = newValue;
        this.subscribers.forEach(fn => fn(newValue));
      },
      subscribe: function(fn) {
        this.subscribers.add(fn);
        fn(this.value);
        return () => this.subscribers.delete(fn);
      }
    };
    
    this.atoms.set(config.key, atom);
    
    if (this.isRoot) {
      atom.subscribe((value) => this.broadcastToIframes(config.key, value));
    }
    
    if (this.options.debug) {
      console.log(`[IframeStateSync] Registered atom "${config.key}"`, config.initialValue);
    }
    
    return atom;
  }

  getAtom(key) {
    const atom = this.atoms.get(key);
    if (!atom) {
      throw new Error(`Atom with key "${key}" not found`);
    }
    return atom;
  }

  registerIframe(iframe) {
    this.iframes.add(iframe);
    iframe.addEventListener('load', () => this.syncToIframe(iframe));
    
    if (this.options.debug) {
      console.log('[IframeStateSync] Registered iframe', iframe.id || iframe.src);
    }
  }

  broadcastToIframes(key, value) {
    const message = { type: 'atom-sync', key, value, timestamp: Date.now() };
    this.iframes.forEach(iframe => {
      iframe.contentWindow?.postMessage(message, this.options.targetOrigin);
    });
    if (this.options.debug) {
      console.log(`[IframeStateSync] Broadcasted "${key}":`, value);
    }
  }

  syncToIframe(iframe) {
    this.atoms.forEach((atom, key) => {
      iframe.contentWindow?.postMessage({
        type: 'atom-sync',
        key,
        value: atom.get(),
        timestamp: Date.now()
      }, this.options.targetOrigin);
    });
    
    if (this.options.debug) {
      console.log('[IframeStateSync] Synced all atoms to iframe', iframe.id || iframe.src);
    }
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      const data = event.data;
      
      // Handle state sync messages
      if (data.type === 'atom-sync') {
        const atom = this.atoms.get(data.key);
        if (atom) {
          atom.set(data.value);
          if (this.options.debug) {
            console.log(`[IframeStateSync] Received "${data.key}":`, data.value);
          }
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
          event.source?.postMessage({
            type: 'atom-sync',
            key,
            value: atom.get(),
            timestamp: Date.now()
          }, this.options.targetOrigin);
        });
      }
    });
  }

  requestStateFromParent() {
    if (this.isRoot) {
      if (this.options.debug) {
        console.warn('[IframeStateSync] Cannot request state from parent in root window');
      }
      return;
    }

    window.parent.postMessage({
      type: 'atom-sync-request',
      timestamp: Date.now()
    }, this.options.targetOrigin);
    
    if (this.options.debug) {
      console.log('[IframeStateSync] Requested initial state from parent');
    }
  }

  sendToParent(key, value) {
    if (this.isRoot) {
      if (this.options.debug) {
        console.warn('[IframeStateSync] Cannot send to parent from root window');
      }
      return;
    }

    const message = { type: 'atom-sync', key, value, timestamp: Date.now() };
    window.parent.postMessage(message, this.options.targetOrigin);
    
    if (this.options.debug) {
      console.log(`[IframeStateSync] Sent to parent "${key}":`, value);
    }
  }
}

/**
 * Helper to create a sync client for child iframes
 * Automatically registers atoms and provides update methods
 */
/**
 * Helper to create a sync client for child iframes
 * Automatically registers atoms and requests initial state from parent
 * 
 * @param {Array<{key: string, initialValue?: any}>} atomConfigs - Array of atom configurations
 * @param {Object} options - Sync options (targetOrigin, debug)
 * @returns {Object} Client object with helper methods
 */
export function createChildClient(atomConfigs, options = {}) {
  const sync = new IframeStateSync(options);
  const atoms = {};
  
  // Register atoms with initialValue as fallback (will be overwritten by parent state)
  atomConfigs.forEach(config => {
    const atomConfig = {
      key: config.key,
      initialValue: config.initialValue !== undefined ? config.initialValue : null
    };
    atoms[config.key] = sync.registerAtom(atomConfig);
  });
  
  // Request initial state from parent (will update all atoms with real values)
  sync.requestStateFromParent();
  
  return {
    sync,
    atoms,
    /**
     * Update an atom value and send to parent
     */
    updateAtom(key, value) {
      const atom = atoms[key];
      if (!atom) {
        throw new Error(`Atom "${key}" not found`);
      }
      atom.set(value);
      sync.sendToParent(key, value);
    },
    /**
     * Get current atom value
     */
    getAtomValue(key) {
      const atom = atoms[key];
      if (!atom) {
        throw new Error(`Atom "${key}" not found`);
      }
      return atom.get();
    },
    /**
     * Subscribe to atom changes
     */
    subscribeToAtom(key, callback) {
      const atom = atoms[key];
      if (!atom) {
        throw new Error(`Atom "${key}" not found`);
      }
      return atom.subscribe(callback);
    }
  };
}
