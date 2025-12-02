# Shared Library - Unified Type System

This library provides a unified API for state synchronization between parent windows and iframes.

## Architecture

```
┌─────────────────────────────────────┐
│         Parent Window               │
│  ┌───────────────────────────────┐  │
│  │   IframeStateSync (Root)      │  │
│  │   - Manages atoms             │  │
│  │   - Broadcasts to iframes     │  │
│  │   - Receives updates          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           │           │
    postMessage   postMessage
           │           │
    ┌──────▼──────┐   ┌▼──────────┐
    │  Iframe 1   │   │ Iframe 2  │
    │  ┌────────┐ │   │ ┌────────┐│
    │  │ Client │ │   │ │ Client ││
    │  └────────┘ │   │ └────────┘│
    └─────────────┘   └───────────┘
```

## Message Protocol

All communication uses a standardized message format:

```javascript
{
  type: 'atom-sync',      // Message type identifier
  key: 'count',           // Atom key
  value: 42,              // Current value
  timestamp: 1234567890   // Timestamp for debugging
}
```

## Parent Window API

```javascript
import { IframeStateSync } from './lib/sync-client.js';

// Initialize sync manager
const sync = new IframeStateSync({ debug: true });

// Register atoms
const countAtom = sync.registerAtom({
  key: 'count',
  initialValue: 0
});

// Subscribe to changes
countAtom.subscribe((value) => {
  console.log('Count changed:', value);
});

// Update value (broadcasts to all iframes)
countAtom.set(42);

// Register iframes
const iframe = document.getElementById('my-iframe');
sync.registerIframe(iframe);
```

## Child Iframe API

```javascript
import { createChildClient } from '../lib/sync-client.js';

// Initialize client with atom configuration
const client = createChildClient([
  { key: 'count', initialValue: 0 },
  { key: 'user', initialValue: null }
], { debug: true });

// Subscribe to changes
client.subscribeToAtom('count', (value) => {
  console.log('Count:', value);
});

// Get current value
const current = client.getAtomValue('count');

// Update value (sends to parent, which broadcasts to all)
client.updateAtom('count', current + 1);
```

## Type System Benefits

1. **Unified API**: Same concepts (atoms, subscribe, update) across parent and children
2. **Type Safety**: Atom keys are strings, values can be any serializable type
3. **Predictable Flow**: Updates always go through parent, ensuring consistency
4. **Easy Testing**: Mock the client for unit tests
5. **Extensible**: Easy to add new atom types or features

## Adding New Atoms

To add a new atom type, just register it in both parent and children:

**Parent:**
```javascript
const userAtom = sync.registerAtom({
  key: 'user',
  initialValue: { name: 'Guest', id: null }
});
```

**Child:**
```javascript
const client = createChildClient([
  { key: 'count', initialValue: 0 },
  { key: 'user', initialValue: { name: 'Guest', id: null } }  // Add here
]);

// Use it
client.subscribeToAtom('user', (user) => {
  console.log('User:', user.name);
});

client.updateAtom('user', { name: 'Alice', id: 123 });
```

## Best Practices

1. **Always register atoms with the same keys** in parent and children
2. **Use meaningful initial values** that match your expected type
3. **Enable debug mode** during development
4. **Handle nested iframes** by forwarding messages or using `window.top`
5. **Validate values** before updating atoms in production
