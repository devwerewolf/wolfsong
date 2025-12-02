# Quick Start Guide

## Installation

```bash
cd sandbox/iframe-state-sync
npm install
npm run build
```

## Try the Example

Open `examples/counter-app.html` in your browser to see the library in action with:
- Multiple iframes sharing state
- Nested iframe support
- Bidirectional updates
- Real-time synchronization

## Integrate into Your Project

### 1. Link the library (for local development)

```bash
cd sandbox/iframe-state-sync
npm link

cd ../your-project
npm link @sandbox/iframe-state-sync
```

### 2. Use in your parent window

```typescript
import { IframeStateSync } from '@sandbox/iframe-state-sync';

const sync = new IframeStateSync({ debug: true });

// Register your atoms
const countAtom = sync.registerAtom({
  key: 'count',
  initialValue: 0
});

// Register iframes
const iframe = document.getElementById('my-iframe') as HTMLIFrameElement;
sync.registerIframe(iframe);

// Use the atom
countAtom.subscribe(count => {
  console.log('Count:', count);
});

countAtom.set(42); // Updates all iframes automatically
```

### 3. Use in your iframes (Recommended)

```typescript
import { createChildClient } from '@sandbox/iframe-state-sync';

// Initialize client - automatically syncs with parent
const client = createChildClient([
  { key: 'count' }  // initialValue is optional
], { debug: true });

// Subscribe to updates
client.subscribeToAtom('count', (count) => {
  document.getElementById('display')!.textContent = count.toString();
});

// Send updates to parent
button.addEventListener('click', () => {
  const current = client.getAtomValue('count');
  client.updateAtom('count', current + 1);
});
```

### TypeScript Examples

See `examples/typescript-example.ts` and `examples/typescript-child-example.ts` for complete type-safe examples.

## Key Concepts

1. **Atoms must have matching keys** across parent and iframes
2. **Parent broadcasts** to all registered iframes automatically
3. **Iframes send updates** to parent using `sendToParent()`
4. **Nested iframes** work by forwarding messages to `window.top`

## Next Steps

- Check out the full API in `README.md`
- Explore the example in `examples/counter-app.html`
- Adapt the library to your specific use case
- Add more atom types (objects, arrays, etc.)
