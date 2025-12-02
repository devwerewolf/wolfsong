import { IframeStateSync } from './IframeStateSync';
import type { AtomConfig, AtomValue, IframeSyncOptions } from './types';

/**
 * Configuration for child client atoms
 * initialValue is optional - will be synced from parent
 */
export interface ChildAtomConfig<T extends AtomValue = AtomValue> {
  key: string;
  initialValue?: T;
}

/**
 * Client interface for child iframes
 */
export interface ChildClient {
  sync: IframeStateSync;
  atoms: Record<string, ReturnType<IframeStateSync['registerAtom']>>;
  
  /**
   * Update an atom value and send to parent
   */
  updateAtom<T extends AtomValue>(key: string, value: T): void;
  
  /**
   * Get current atom value
   */
  getAtomValue<T extends AtomValue>(key: string): T;
  
  /**
   * Subscribe to atom changes
   */
  subscribeToAtom<T extends AtomValue>(
    key: string,
    callback: (value: T) => void
  ): () => void;
}

/**
 * Helper to create a sync client for child iframes
 * Automatically registers atoms and requests initial state from parent
 * 
 * @param atomConfigs - Array of atom configurations (initialValue is optional)
 * @param options - Sync options (targetOrigin, debug)
 * @returns Client object with helper methods
 * 
 * @example
 * ```typescript
 * const client = createChildClient([
 *   { key: 'count' },  // Will receive value from parent
 *   { key: 'user', initialValue: null }  // Optional fallback
 * ], { debug: true });
 * 
 * client.subscribeToAtom('count', (value) => {
 *   console.log('Count:', value);
 * });
 * 
 * client.updateAtom('count', 42);
 * ```
 */
export function createChildClient(
  atomConfigs: ChildAtomConfig[],
  options: IframeSyncOptions = {}
): ChildClient {
  const sync = new IframeStateSync(options);
  const atoms: Record<string, ReturnType<IframeStateSync['registerAtom']>> = {};
  
  // Register atoms with initialValue as fallback (will be overwritten by parent state)
  atomConfigs.forEach((config) => {
    const atomConfig: AtomConfig<AtomValue> = {
      key: config.key,
      initialValue: config.initialValue !== undefined ? config.initialValue : null,
    };
    atoms[config.key] = sync.registerAtom(atomConfig);
  });
  
  // Request initial state from parent (will update all atoms with real values)
  sync.requestStateFromParent();
  
  return {
    sync,
    atoms,
    
    updateAtom<T extends AtomValue>(key: string, value: T): void {
      const atom = atoms[key];
      if (!atom) {
        throw new Error(`Atom "${key}" not found`);
      }
      atom.set(value);
      sync.sendToParent(key, value);
    },
    
    getAtomValue<T extends AtomValue>(key: string): T {
      const atom = atoms[key];
      if (!atom) {
        throw new Error(`Atom "${key}" not found`);
      }
      return atom.get() as T;
    },
    
    subscribeToAtom<T extends AtomValue>(
      key: string,
      callback: (value: T) => void
    ): () => void {
      const atom = atoms[key];
      if (!atom) {
        throw new Error(`Atom "${key}" not found`);
      }
      const subscription = atom.subscribe(callback as (value: AtomValue) => void);
      // @xstate/store returns a Subscription object with an unsubscribe method
      return () => subscription.unsubscribe();
    },
  };
}
