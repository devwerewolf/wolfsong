# Architecture Overview

## System Design

The `@sandbox/iframe-state-sync` library enables centralized state management across multiple iframes using `@xstate/store` atoms and the browser's `postMessage` API.

## Key Concepts

### 1. Independent Apps with Shared Protocol

Each application (parent and iframes) independently bundles the library:

```
┌─────────────────────────────────────────┐
│         Parent App                      │
│  ┌───────────────────────────────────┐  │
│  │ Library (bundled)                 │  │
│  │ - IframeStateSync                 │  │
│  │ - Manages root atoms              │  │
│  │ - Broadcasts to children          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │           │
    postMessage   postMessage
           │           │
    ┌──────▼──────┐   ┌▼──────────────┐
    │  App 1      │   │  App 2        │
    │ ┌─────────┐ │   │ ┌───────────┐ │
    │ │ Library │ │   │ │  Library  │ │
    │ │(bundled)│ │   │ │ (bundled) │ │
    │ └─────────┘ │   │ └───────────┘ │
    └─────────────┘   └───────────────┘
```

**Important**: Each app has its own copy of the library. They don't share code, only the message protocol.

### 2. Message Protocol

All state synchronization uses standardized message formats:

#### State Sync Message

```typescript
interface SyncMessage {
  type: 'atom-sync';
  key: string;           // Atom identifier
  value: AtomValue;      // Current value
  timestamp: number;     // For debugging/ordering
}
```

Sent when:
- Parent broadcasts state changes to children
- Parent sends initial state to newly loaded child
- Child sends state update to parent

#### State Request Message

```typescript
interface SyncRequestMessage {
  type: 'atom-sync-request';
  timestamp: number;     // For debugging
}
```

Sent when:
- Child initializes and needs current state from parent

### 3. State Flow

#### Initial Sync (Child Initialization)

```
┌─────────────────────────────────────────────┐
│  1. Child initializes                       │
│     createChildClient([...])                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼ postMessage (atom-sync-request)
┌─────────────────────────────────────────────┐
│  2. Parent receives request                 │
│     - Sends all current atom values         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼ postMessage (atom-sync × N)
┌─────────────────────────────────────────────┐
│  3. Child receives initial state            │
│     - Updates all local atoms               │
│     - Triggers subscribers                  │
│     - UI shows current state                │
└─────────────────────────────────────────────┘
```

#### State Updates

```
┌─────────────────────────────────────────────┐
│  1. Child updates local atom                │
│     client.updateAtom('count', 5)           │
└─────────────────┬───────────────────────────┘
                  │
                  ▼ postMessage (atom-sync)
┌─────────────────────────────────────────────┐
│  2. Parent receives update                  │
│     - Updates root atom                     │
│     - Triggers subscribers                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼ broadcast (atom-sync × N)
┌─────────────────────────────────────────────┐
│  3. All children receive update             │
│     - Update local atoms                    │
│     - Trigger local subscribers             │
│     - UI updates automatically              │
└─────────────────────────────────────────────┘
```

## Components

### Parent Window (Root)

**Responsibilities:**
- Create and manage root atoms
- Register child iframes
- Broadcast state changes to all children
- Receive updates from children

**API:**
```javascript
const sync = new IframeStateSync({ debug: true });

// Register atoms
const countAtom = sync.registerAtom({
  key: 'count',
  initialValue: 0
});

// Register iframes
sync.registerIframe(iframeElement);

// Update state (broadcasts automatically)
countAtom.set(42);
```

### Child Iframes

**Responsibilities:**
- Register matching atoms with same keys
- Subscribe to state changes
- Send updates to parent
- Update local UI

**API:**
```javascript
const client = createChildClient([
  { key: 'count', initialValue: 0 }
], { debug: true });

// Subscribe to changes
client.subscribeToAtom('count', (value) => {
  updateUI(value);
});

// Send updates
client.updateAtom('count', newValue);
```

## Nested Iframes

Nested iframes work by forwarding messages:

```
Parent
  └─ Iframe A
       └─ Nested Iframe B
```

**Option 1: Forward through parent iframe**
```javascript
// In Iframe A
client.subscribeToAtom('count', (value) => {
  // Forward to nested iframe
  nestedIframe.contentWindow.postMessage({
    type: 'atom-sync',
    key: 'count',
    value,
    timestamp: Date.now()
  }, '*');
});
```

**Option 2: Send directly to top**
```javascript
// In Nested Iframe B
window.top.postMessage({
  type: 'atom-sync',
  key: 'count',
  value: 0,
  timestamp: Date.now()
}, '*');
```

## Atom Lifecycle

1. **Registration**: Atoms registered with unique keys
2. **Subscription**: Components subscribe to changes
3. **Update**: Value changes trigger subscribers
4. **Broadcast**: Root broadcasts to all iframes
5. **Sync**: Children receive and update local atoms

## Security Considerations

### Origin Validation

In production, always specify `targetOrigin`:

```javascript
const sync = new IframeStateSync({
  targetOrigin: 'https://trusted-domain.com'
});
```

### Message Validation

The library validates message type before processing:

```javascript
if (event.data.type !== 'atom-sync') return;
```

### Atom Key Validation

Always validate atom keys exist before updating:

```javascript
const atom = this.atoms.get(key);
if (!atom) {
  console.warn(`Unknown atom: ${key}`);
  return;
}
```

## Performance Considerations

### Broadcast Optimization

- Updates only broadcast to registered iframes
- No unnecessary re-renders
- Subscribers only called when values change

### Memory Management

- Unregister iframes when removed
- Unsubscribe from atoms when components unmount

```javascript
// Cleanup
const unsubscribe = client.subscribeToAtom('count', callback);
// Later...
unsubscribe();

sync.unregisterIframe(iframe);
```

## Debugging

Enable debug mode to see all state changes:

```javascript
const sync = new IframeStateSync({ debug: true });
```

Console output:
```
[IframeStateSync] Initialized { isRoot: true }
[IframeStateSync] Registered atom "count" 0
[IframeStateSync] Broadcasted "count": 5
[IframeStateSync] Received "count": 5
```

## Extension Points

### Custom Atom Types

Add validation or transformation:

```javascript
const userAtom = sync.registerAtom({
  key: 'user',
  initialValue: { name: 'Guest', id: null }
});

// Add validation
userAtom.subscribe((user) => {
  if (!user.name) {
    console.error('User must have a name');
  }
});
```

### Middleware

Intercept messages before processing:

```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'atom-sync') {
    console.log('Intercepted:', event.data);
    // Add custom logic here
  }
}, true); // Use capture phase
```

### Custom Sync Strategies

Implement debouncing or batching:

```javascript
let updateQueue = [];
let timeoutId = null;

function queueUpdate(key, value) {
  updateQueue.push({ key, value });
  
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    updateQueue.forEach(({ key, value }) => {
      client.updateAtom(key, value);
    });
    updateQueue = [];
  }, 100);
}
```
