import { createStore } from '@xstate/store';
import type { AtomConfig, AtomValue, SyncMessage, SyncRequestMessage, IframeSyncOptions } from './types';

export class IframeStateSync {
  private stores = new Map<string, any>();
  private iframes = new Set<HTMLIFrameElement>();
  private targetOrigin: string;
  private debug: boolean;

  constructor(options: IframeSyncOptions = {}) {
    this.targetOrigin = options.targetOrigin || '*';
    this.debug = options.debug || false;
    this.setupMessageListener();
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[IframeStateSync Parent]', ...args);
    }
  }

  registerAtom<T extends AtomValue>(config: AtomConfig<T>) {
    if (this.stores.has(config.key)) {
      this.log(`Atom "${config.key}" already registered`);
      return;
    }

    const store = createStore({
      context: { value: config.initialValue },
      on: {
        setValue: (context, event: { value: T }) => ({
          value: event.value,
        }),
      },
    });

    this.stores.set(config.key, store);
    this.log(`Registered atom: ${config.key}`, config.initialValue);

    store.subscribe((snapshot) => {
      this.broadcastToIframes({
        type: 'atom-sync',
        key: config.key,
        value: snapshot.context.value,
        timestamp: Date.now(),
      });
    });
  }

  registerIframe(iframe: HTMLIFrameElement) {
    this.iframes.add(iframe);
    this.log(`Registered iframe, total: ${this.iframes.size}`);

    iframe.addEventListener('load', () => {
      this.log(`Iframe loaded, syncing all atoms`);
      this.syncAllToIframe(iframe);
    });
  }

  unregisterIframe(iframe: HTMLIFrameElement) {
    this.iframes.delete(iframe);
    this.log(`Unregistered iframe, remaining: ${this.iframes.size}`);
  }

  setValue<T extends AtomValue>(key: string, value: T) {
    const store = this.stores.get(key);
    if (!store) {
      this.log(`Atom "${key}" not found`);
      return;
    }
    store.send({ type: 'setValue', value });
  }

  getValue<T extends AtomValue>(key: string): T | undefined {
    const store = this.stores.get(key);
    return store?.getSnapshot().context.value as T;
  }

  subscribe<T extends AtomValue>(key: string, callback: (value: T) => void) {
    const store = this.stores.get(key);
    if (!store) {
      this.log(`Atom "${key}" not found for subscription`);
      return () => {};
    }

    return store.subscribe((snapshot: { context: { value: T; }; }) => {
      callback(snapshot.context.value as T);
    });
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      const message = event.data as SyncMessage | SyncRequestMessage;

      if (message.type === 'atom-sync-request') {
        this.log('Received sync request from iframe');
        const iframe = Array.from(this.iframes).find(
          (iframe) => iframe.contentWindow === event.source
        );
        if (iframe) {
          this.syncAllToIframe(iframe);
        }
      } else if (message.type === 'atom-sync') {
        this.log(`Received atom update from iframe: ${message.key}`, message.value);
        this.setValue(message.key, message.value);
      }
    });
  }

  private syncAllToIframe(iframe: HTMLIFrameElement) {
    if (!iframe.contentWindow) return;

    this.stores.forEach((store, key) => {
      const value = store.getSnapshot().context.value;
      const message: SyncMessage = {
        type: 'atom-sync',
        key,
        value,
        timestamp: Date.now(),
      };
      iframe.contentWindow!.postMessage(message, this.targetOrigin);
      this.log(`Synced ${key} to iframe:`, value);
    });
  }

  private broadcastToIframes(message: SyncMessage) {
    this.iframes.forEach((iframe) => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(message, this.targetOrigin);
      }
    });
  }

  destroy() {
    this.stores.clear();
    this.iframes.clear();
  }
}
