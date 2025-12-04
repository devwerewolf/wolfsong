# Design Document

## Overview ✅

The iframe state synchronization library provides a framework-agnostic TypeScript solution for managing shared state across arbitrarily nested iframe hierarchies. Each app (page or iframe) imports the same library, which automatically discovers its position in the tree, establishes bidirectional communication channels, and synchronizes state updates across the hierarchy.

The library uses the browser's `postMessage` API for cross-frame communication and implements a discovery protocol to dynamically build the tree structure. State updates flow both upward (to parents) and downward (to children) by default, with configurable synchronization directions per state key.

## Architecture ✅

### Core Components ✅

1. **StateManager**: The main class that each app instantiates to participate in state synchronization
2. **MessageBus**: Handles postMessage communication, message routing, and loop prevention
3. **HierarchyDiscovery**: Discovers parent and child windows to build the tree structure
4. **StateStore**: Manages local state and handles state merging from multiple sources
5. **SubscriptionManager**: Manages callbacks for state change notifications

### Communication Flow ✅

```
┌─────────────────┐
│   Root Window   │
│  (Auto-detected)│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Child 1│ │Child 2│
└───┬───┘ └───┬───┘
    │         │
┌───▼───┐ ┌──▼────┐
│Child 3│ │Child 4│
└───────┘ └───────┘
```

Each node:
- Maintains a reference to its immediate parent (if any)
- Maintains references to all direct children
- Forwards state updates up to parent
- Broadcasts state updates down to children
- Tracks message IDs to prevent loops

### Initialization Sequence ✅

1. App imports and instantiates StateManager
2. StateManager attempts to communicate with `window.parent`
3. If parent responds, StateManager registers as a child and requests initial state
4. StateManager scans for iframe elements and attempts to communicate with each
5. Children that respond are registered in the children registry
6. If no parent responds, StateManager designates itself as root
7. Tree hierarchy is now established and ready for state synchronization

## Components and Interfaces ✅

### StateManager ✅

The primary interface for developers:

```typescript
class StateManager<T = any> {
  constructor(config?: StateManagerConfig<T>)
  
  // State management
  getState(): T
  setState(updates: Partial<T>): void
  subscribe(callback: StateChangeCallback<T>): UnsubscribeFunction
  
  // Hierarchy information
  isRoot(): boolean
  getParent(): Window | null
  getChildren(): Window[]
  
  // Lifecycle
  destroy(): void
}

interface StateManagerConfig<T> {
  initialState?: Partial<T>
  syncConfig?: SyncConfig
  timeout?: number
}

interface SyncConfig {
  [key: string]: SyncDirection
}

type SyncDirection = 'up' | 'down' | 'bidirectional' | 'local'

type StateChangeCallback<T> = (state: T, source: StateChangeSource) => void

type StateChangeSource = 'parent' | 'child' | 'local' | 'root'

type UnsubscribeFunction = () => void
```

### MessageBus ✅

Handles all postMessage communication:

```typescript
interface MessageBus {
  send(target: Window, message: Message): void
  broadcast(targets: Window[], message: Message): void
  onMessage(handler: MessageHandler): void
  removeHandler(handler: MessageHandler): void
}

interface Message {
  id: string
  type: MessageType
  payload: any
  origin: string
  timestamp: number
}

type MessageType = 
  | 'DISCOVER_PARENT'
  | 'DISCOVER_CHILDREN'
  | 'REGISTER_CHILD'
  | 'STATE_UPDATE'
  | 'STATE_REQUEST'
  | 'STATE_RESPONSE'
  | 'PING'
  | 'PONG'

type MessageHandler = (message: Message, source: Window) => void
```

### HierarchyDiscovery ✅

Discovers and maintains the tree structure:

```typescript
interface HierarchyDiscovery {
  discoverParent(): Promise<Window | null>
  discoverChildren(): Promise<Window[]>
  registerChild(child: Window): void
  unregisterChild(child: Window): void
  onChildAdded(callback: (child: Window) => void): void
  onChildRemoved(callback: (child: Window) => void): void
}
```

### StateStore ✅

Manages state internally:

```typescript
interface StateStore<T> {
  get(): T
  set(updates: Partial<T>): void
  merge(updates: Partial<T>, source: StateChangeSource): void
  getSyncDirection(key: string): SyncDirection
  shouldSyncUp(key: string): boolean
  shouldSyncDown(key: string): boolean
}
```

### SubscriptionManager ✅

Manages state change subscriptions:

```typescript
interface SubscriptionManager<T> {
  subscribe(callback: StateChangeCallback<T>): UnsubscribeFunction
  notify(state: T, source: StateChangeSource): void
  clear(): void
}
```

## Data Models ✅

### State Update Message ✅

```typescript
interface StateUpdateMessage<T = unknown> {
  type: 'STATE_UPDATE'
  payload: {
    updates: Partial<T>
    messageId: string
    originWindow: string
    path: string[] // Track propagation path for loop prevention
  }
}
```

### Discovery Message ✅

```typescript
interface DiscoveryMessage {
  type: 'DISCOVER_PARENT' | 'DISCOVER_CHILDREN'
  payload: {
    requestId: string
    timestamp: number
  }
}
```

### Registration Message ✅

```typescript
interface RegistrationMessage<T = unknown> {
  type: 'REGISTER_CHILD'
  payload: {
    childId: string
    initialState: Partial<T>
  }
}
```

## Correctness Properties ✅

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Parent detection accuracy ✅
*For any* window context, when the State Manager initializes, it should correctly identify whether it has a parent window (true for iframes, false for top-level windows)
**Validates: Requirements 1.1**

Property 2: Discovery protocol initiation ✅
*For any* State Manager instance, initialization should trigger both upward discovery (to find parents) and downward discovery (to find children)
**Validates: Requirements 1.2, 1.3**

Property 3: Root self-designation ✅
*For any* State Manager instance that discovers no parent window, it should designate itself as the root ancestor
**Validates: Requirements 1.4**

Property 4: Dynamic role updates ✅
*For any* State Manager instance, when the hierarchy changes (e.g., a root becomes a child), the instance should update its role accordingly
**Validates: Requirements 1.5**

Property 5: Complete hierarchy discovery ✅
*For any* nested iframe structure, each State Manager instance should discover all ancestors up to the root and all descendants down to the leaves
**Validates: Requirements 2.1, 2.2**

Property 6: Correct hierarchy references ✅
*For any* established tree hierarchy, each State Manager should maintain accurate references to its immediate parent and all direct children matching the DOM structure
**Validates: Requirements 2.3**

Property 7: Dynamic child addition ✅
*For any* State Manager instance, when a new iframe is added to the DOM, the instance should discover and register the new child
**Validates: Requirements 2.4**

Property 8: Dynamic child removal ✅
*For any* State Manager instance, when an iframe is removed from the DOM, the instance should unregister that child and clean up references
**Validates: Requirements 2.5**

Property 9: Bidirectional propagation ✅
*For any* state update in any window, the update should propagate both upward to parents and downward to children (respecting sync configuration)
**Validates: Requirements 3.1, 3.2**

Property 10: Multi-level forwarding ✅
*For any* state update originating at any level, the update should be forwarded through intermediate nodes to reach all connected nodes in the tree
**Validates: Requirements 3.3, 3.4**

Property 11: Loop prevention ✅
*For any* state update, the message tracking system should prevent the same update from being processed multiple times by the same node
**Validates: Requirements 3.5**

Property 12: Subscription notification ✅
*For any* subscribed callback, when state is updated from any source (local, parent, child, root), the callback should be invoked with the new state
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

Property 13: Unsubscription effectiveness ✅
*For any* unsubscribed callback, subsequent state updates should not invoke that callback
**Validates: Requirements 4.5**

Property 14: Iframe failure isolation ✅
*For any* iframe that fails to load, other iframes in the hierarchy should continue to synchronize state normally
**Validates: Requirements 5.1**

Property 15: Communication error resilience ✅
*For any* postMessage communication failure, the State Manager should log the error and continue operating without crashing
**Validates: Requirements 5.2**

Property 16: Timeout fallback ✅
*For any* state sync request that times out, the State Manager should use default or cached state values instead of blocking
**Validates: Requirements 5.3**

Property 17: Cleanup on removal ✅
*For any* iframe removed from the DOM, the State Manager should remove all message listeners and clear references to prevent memory leaks
**Validates: Requirements 5.4**

Property 18: Cross-origin error handling ✅
*For any* cross-origin communication attempt that fails due to security restrictions, the State Manager should handle the error gracefully without crashing
**Validates: Requirements 5.5**

Property 19: Environment compatibility ✅
*For any* JavaScript environment (browser, Node with jsdom, different frameworks), the State Manager API should work correctly
**Validates: Requirements 6.2**

Property 20: Sync configuration acceptance ✅
*For any* valid sync configuration specifying directions (up, down, bidirectional, local) for state keys, the State Manager should accept and apply the configuration
**Validates: Requirements 7.1**

Property 21: Default bidirectional sync ✅
*For any* state key without explicit sync configuration, updates should propagate both upward and downward
**Validates: Requirements 7.2**

Property 22: Upward-only propagation ✅
*For any* state key configured as "up", updates should propagate only to parent windows and not to children
**Validates: Requirements 7.3**

Property 23: Downward-only propagation ✅
*For any* state key configured as "down", updates should propagate only to child iframes and not to parents
**Validates: Requirements 7.4**

Property 24: Bidirectional propagation configuration ✅
*For any* state key explicitly configured as "bidirectional", updates should propagate both upward and downward
**Validates: Requirements 7.5**

Property 25: Local-only state ✅
*For any* state key configured as "local", updates should not propagate to any other window
**Validates: Requirements 7.6**

Property 26: Runtime configuration updates ✅
*For any* sync configuration update at runtime, subsequent state updates should follow the new configuration rules
**Validates: Requirements 7.7**

## Error Handling ✅

### Communication Errors ✅

- **postMessage failures**: Wrapped in try-catch blocks, logged, and operation continues
- **Timeout handling**: Discovery and state requests have configurable timeouts (default 5000ms)
- **Cross-origin errors**: Detected via SecurityError exceptions, logged, and gracefully skipped

### Hierarchy Changes ✅

- **Iframe removal**: MutationObserver detects DOM changes and triggers cleanup
- **Iframe addition**: MutationObserver detects new iframes and triggers discovery
- **Parent loss**: Periodic health checks detect parent disconnection and trigger re-discovery

### State Conflicts ✅

- **Concurrent updates**: Last-write-wins strategy with timestamp comparison
- **Merge conflicts**: State updates are shallow merged, with newer values taking precedence
- **Invalid state**: State updates are validated against TypeScript types (if provided)

### Loop Prevention ✅

- **Message IDs**: Each message has a unique ID generated via UUID
- **Path tracking**: Messages include the path of windows they've traversed
- **Duplicate detection**: Each window maintains a Set of processed message IDs
- **TTL mechanism**: Messages have a time-to-live to prevent indefinite circulation

## Testing Strategy ✅

### Unit Testing ✅

The library will use **Vitest** as the testing framework for unit tests. Unit tests will cover:

- **StateManager API**: Test public methods (getState, setState, subscribe, etc.)
- **MessageBus**: Test message sending, receiving, and routing
- **HierarchyDiscovery**: Test parent/child discovery logic
- **StateStore**: Test state merging and sync direction logic
- **SubscriptionManager**: Test subscription and notification mechanisms
- **Loop prevention**: Test message ID tracking and duplicate detection
- **Error handling**: Test specific error scenarios (timeouts, cross-origin, etc.)

### Property-Based Testing ✅

The library will use **fast-check** for property-based testing. Each property-based test will:

- Run a minimum of 100 iterations to ensure statistical confidence
- Be tagged with a comment referencing the specific correctness property from this design document
- Use the format: `// Feature: iframe-state-sync, Property {number}: {property_text}`

Property-based tests will cover:

- **Hierarchy discovery**: Generate random iframe trees and verify correct discovery
- **State propagation**: Generate random state updates and verify correct propagation based on sync config
- **Loop prevention**: Generate complex update patterns and verify no infinite loops
- **Subscription notifications**: Generate random subscription/update patterns and verify callbacks fire correctly
- **Sync direction enforcement**: Generate random sync configs and verify updates respect the configuration
- **Error resilience**: Generate random error scenarios and verify graceful handling

### Integration Testing ✅

Integration tests will use a test harness that creates actual iframe elements in a test DOM environment:

- **Multi-level hierarchies**: Test 3+ levels of nesting
- **Dynamic hierarchy changes**: Test adding/removing iframes during operation
- **Cross-frame state sync**: Test end-to-end state synchronization across real iframes
- **Framework integration**: Test usage with React, Vue, and Svelte examples

### Test Environment ✅

- **Unit tests**: Run in Node.js with Vitest
- **Integration tests**: Run in a browser environment using Playwright or Puppeteer
- **Property tests**: Run in Node.js with fast-check and jsdom for DOM simulation

## Implementation Notes ✅

### Browser Compatibility ✅

- Target ES2020+ for modern browser features
- Use `postMessage` API (universally supported)
- Use `MutationObserver` for DOM change detection (IE11+)
- Provide polyfills for older browsers if needed

### Performance Considerations ✅

- **Debouncing**: State updates can be debounced to reduce message frequency
- **Batching**: Multiple state updates can be batched into a single message
- **Lazy discovery**: Children can be discovered on-demand rather than eagerly
- **Weak references**: Use WeakMap for window references to allow garbage collection

### Security Considerations ✅

This library is designed for self-hosted, multi-app websites where developers control all iframe sources. Users should be warned not to use this library with untrusted or external iframe sources.

- **Message namespace**: All library messages include a unique namespace identifier to distinguish them from other postMessage traffic
- **Message validation**: Validate message structure and types before processing to prevent malformed messages
- **Trusted sources**: Documentation should emphasize that all iframes must be from trusted sources under developer control
- **CSP compliance**: Ensure library works with strict Content Security Policies

Note: Origin validation is intentionally omitted since programmatically created iframes (via `srcdoc`) have "null" origins, and this library is designed for controlled environments where all iframes are created by the developer.

### TypeScript Support ✅

- Full TypeScript implementation with strict mode enabled
- Generic type parameter for state shape: `StateManager<T>`
- Exported type definitions for all public interfaces
- JSDoc comments for IDE autocomplete support

### Bundle Size ✅

- Target bundle size: < 10KB minified + gzipped
- Tree-shakeable exports for unused features
- No external runtime dependencies
- Optional features can be imported separately

## API Usage Examples ✅

### Basic Usage ✅

```typescript
import { StateManager } from 'iframe-state-sync'

// In root window
const manager = new StateManager({
  initialState: { count: 0, user: null }
})

manager.subscribe((state, source) => {
  console.log('State updated from:', source, state)
})

manager.setState({ count: 1 })

// In child iframe
const childManager = new StateManager()

// Automatically syncs with parent and root
childManager.subscribe((state) => {
  console.log('Received state:', state)
})
```

### Sync Direction Configuration ✅

```typescript
const manager = new StateManager({
  initialState: { 
    globalCount: 0,
    localData: null,
    childConfig: {}
  },
  syncConfig: {
    localData: 'local',        // Will be local only
    childConfig: 'down',       // Will only sync down to children
    globalCount: 'bidirectional' // Will sync bidirectionally (this is also the default)
  }
})
```

### Hierarchy Information ✅

```typescript
const manager = new StateManager()

if (manager.isRoot()) {
  console.log('I am the root ancestor')
} else {
  console.log('I have a parent:', manager.getParent())
}

console.log('My children:', manager.getChildren())
```

### Cleanup ✅

```typescript
const manager = new StateManager()
const unsubscribe = manager.subscribe((state) => {
  console.log(state)
})

// Later...
unsubscribe()
manager.destroy() // Clean up all listeners and references
```
