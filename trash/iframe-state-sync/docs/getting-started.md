# Getting Started

## Installation

```bash
npm install @xstate/store
npm install @sandbox/iframe-state-sync
```

## Quick Start

### 1. Parent Window Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>Parent App</title>
</head>
<body>
  <h1>Counter: <span id="count">0</span></h1>
  <button id="increment">Increment</button>
  
  <iframe id="child-app" src="child.html"></iframe>
  
  <script src="path/to/iframe-state-sync.js"></script>
  <script>
    // Initialize sync manager
    const sync = new IframeStateSync({ debug: true });
    
    // Register atoms
    const countAtom = sync.registerAtom({
      key: 'count',
      initialValue: 0
    });
    
    // Update UI when count changes
    countAtom.subscribe((count) => {
      document.getElementById('count').textContent = count;
    });
    
    // Register iframe
    const iframe = document.getElementById('child-app');
    sync.registerIframe(iframe);
    
    // Handle button click
    document.getElementById('increment').addEventListener('click', () => {
      countAtom.set(countAtom.get() + 1);
    });
  </script>
</body>
</html>
```

### 2. Child Iframe Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>Child App</title>
</head>
<body>
  <h2>Child Counter: <span id="count">0</span></h2>
  <button id="increment">Increment</button>
  
  <script src="path/to/iframe-state-sync.js"></script>
  <script>
    // Initialize client - automatically syncs with parent
    const client = createChildClient([
      { key: 'count' }  // initialValue is optional
    ], { debug: true });
    
    // Subscribe to count changes
    client.subscribeToAtom('count', (count) => {
      document.getElementById('count').textContent = count;
    });
    
    // Handle button click
    document.getElementById('increment').addEventListener('click', () => {
      const current = client.getAtomValue('count');
      client.updateAtom('count', current + 1);
    });
  </script>
</body>
</html>
```

## How It Works

1. **Parent creates atoms** - The parent window creates and manages the source of truth
2. **Iframes register atoms** - Child iframes register matching atoms with the same keys
3. **Automatic sync** - Changes in any context automatically sync to all others
4. **Unified API** - Same concepts (atoms, subscribe, update) everywhere

## Key Concepts

### Atoms

Atoms are units of state with a key and value:

```javascript
const atom = sync.registerAtom({
  key: 'count',        // Unique identifier
  initialValue: 0      // Starting value
});
```

### Subscriptions

Subscribe to atom changes to update your UI:

```javascript
atom.subscribe((newValue) => {
  console.log('Value changed:', newValue);
});
```

### Updates

Update atoms to trigger synchronization:

```javascript
// Parent
atom.set(42);

// Child
client.updateAtom('count', 42);
```

## Common Patterns

### Multiple Atoms

```javascript
// Parent
const countAtom = sync.registerAtom({ key: 'count', initialValue: 0 });
const userAtom = sync.registerAtom({ key: 'user', initialValue: null });
const themeAtom = sync.registerAtom({ key: 'theme', initialValue: 'light' });

// Child - initialValue is optional, will sync from parent
const client = createChildClient([
  { key: 'count' },
  { key: 'user' },
  { key: 'theme' }
]);
```

### Computed Values

```javascript
client.subscribeToAtom('count', (count) => {
  const doubled = count * 2;
  document.getElementById('doubled').textContent = doubled;
});
```

### Conditional Updates

```javascript
document.getElementById('increment').addEventListener('click', () => {
  const current = client.getAtomValue('count');
  if (current < 100) {
    client.updateAtom('count', current + 1);
  }
});
```

### Batch Updates

```javascript
// Update multiple atoms
const updates = [
  { key: 'count', value: 10 },
  { key: 'theme', value: 'dark' }
];

updates.forEach(({ key, value }) => {
  client.updateAtom(key, value);
});
```

## Dynamic Iframe Loading

```javascript
const iframeConfigs = [
  { src: 'app1.html', title: 'App 1' },
  { src: 'app2.html', title: 'App 2' },
  { src: 'app3.html', title: 'App 3' }
];

const container = document.getElementById('iframe-container');

iframeConfigs.forEach((config) => {
  const iframe = document.createElement('iframe');
  iframe.src = config.src;
  iframe.title = config.title;
  container.appendChild(iframe);
  
  // Register with sync manager
  sync.registerIframe(iframe);
});
```

## TypeScript Support

The library is written in TypeScript and provides full type safety:

### Parent Window

```typescript
import { IframeStateSync } from '@sandbox/iframe-state-sync';

const sync = new IframeStateSync({ debug: true });

// Type-safe atoms
const countAtom = sync.registerAtom<number>({
  key: 'count',
  initialValue: 0
});

const userAtom = sync.registerAtom<{ name: string; id: number } | null>({
  key: 'user',
  initialValue: null
});

// Type-safe updates
countAtom.set(42);  // ✓ OK
// countAtom.set('invalid');  // ✗ Type error
```

### Child Iframe

```typescript
import { createChildClient } from '@sandbox/iframe-state-sync';
import type { ChildAtomConfig } from '@sandbox/iframe-state-sync';

// Optional: Define configs with types
const atomConfigs: ChildAtomConfig[] = [
  { key: 'count' },
  { key: 'user' }
];

const client = createChildClient(atomConfigs, { debug: true });

// Type-safe subscriptions
client.subscribeToAtom<number>('count', (count) => {
  console.log('Count:', count);  // count is number
});

// Type-safe updates
const current = client.getAtomValue<number>('count');
client.updateAtom('count', current + 1);
```

### Complete Examples

See `examples/typescript-example.ts` and `examples/typescript-child-example.ts` for complete working examples with advanced patterns.

## Next Steps

- Read [Architecture](./architecture.md) for system design details
- Check [API Reference](./api-reference.md) for complete API documentation
- See [Examples](../examples/) for working demos
- Review [Best Practices](./best-practices.md) for production tips
- Read [FAQ](./faq.md) for common questions
