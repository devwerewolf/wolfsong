# @sandbox/iframe-state-sync

A TypeScript library for centralized state management with `@xstate/store` atoms that automatically syncs across iframes.

## Features

- 🎯 Centralized state management using `@xstate/store` atoms
- 🔄 Automatic synchronization across parent and child iframes
- 🔒 Type-safe API with TypeScript
- 🪆 Support for nested iframes
- 🐛 Optional debug logging
- 🎨 Simple, intuitive API
- 📦 Each app bundles independently (no shared resources)
- 🔌 Standardized message protocol

## Quick Start

### Installation

```bash
npm install @xstate/store
npm install @sandbox/iframe-state-sync
```

### Parent Window

```javascript
import { IframeStateSync } from '@sandbox/iframe-state-sync';

// Initialize sync manager
const sync = new IframeStateSync({ debug: true });

// Register atoms
const countAtom = sync.registerAtom({
  key: 'count',
  initialValue: 0
});

// Register iframes
const iframe = document.getElementById('my-iframe');
sync.registerIframe(iframe);

// Subscribe and update
countAtom.subscribe((count) => {
  console.log('Count:', count);
});

countAtom.set(42); // Syncs to all iframes
```

### Child Iframe

```javascript
import { createChildClient } from '@sandbox/iframe-state-sync';

// Initialize client (initialValue is optional, used as fallback)
const client = createChildClient([
  { key: 'count' },  // Will receive actual value from parent
  { key: 'user', initialValue: null }  // Optional: provide fallback
], { debug: true });

// Subscribe to changes
client.subscribeToAtom('count', (count) => {
  document.getElementById('display').textContent = count;
});

// Update state
button.addEventListener('click', () => {
  const current = client.getAtomValue('count');
  client.updateAtom('count', current + 1);
});
```

## Documentation

- **[Getting Started](./docs/getting-started.md)** - Installation and basic usage
- **[Architecture](./docs/architecture.md)** - System design and concepts
- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Best Practices](./docs/best-practices.md)** - Security, performance, and patterns

## Examples

See the `examples/` directory for working demos:
- **counter-app.html** - Complete example with multiple iframes
- **iframes/** - Individual iframe applications
- **lib/** - Shared library code (each app bundles independently)
- **typescript-example.ts** - Type-safe parent window example
- **typescript-child-example.ts** - Type-safe child iframe example

## How It Works

Each application (parent and iframes) independently bundles the library. They communicate via a standardized message protocol:

```javascript
// State sync message
{
  type: 'atom-sync',
  key: 'count',
  value: 42,
  timestamp: 1234567890
}

// State request message (child → parent)
{
  type: 'atom-sync-request',
  timestamp: 1234567890
}
```

**Flow:**
1. Child initializes → requests initial state from parent
2. Parent responds → sends all current atom values
3. Child updates local atom → sends message to parent
4. Parent updates root atom → broadcasts to all children
5. All children receive update → update local atoms → UI updates

## Key Concepts

- **Atoms**: Units of state with unique keys
- **Sync Manager**: Coordinates state across contexts
- **Message Protocol**: Standardized format for communication
- **Independent Bundles**: Each app has its own copy of the library

## License

MIT
