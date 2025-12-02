# Iframe Communication Architecture

This document explains the iframe communication system built in this project, covering how state is shared across multiple iframes using `postMessage` and XState Store.

## Overview

This application demonstrates cross-iframe communication using the browser's `postMessage` API and a centralized state management system with `@xstate/store`. The root ancestor page maintains a single source of truth (a count atom), and all iframes can read and modify this state through message passing.

## Architecture

### Root Ancestor Page

The root page is the top-level document that:
- Creates and owns the `countAtom` (using `@xstate/store`)
- Loads iframe content via `<template>` tags and `srcdoc` attribute
- Listens for messages from all iframes
- Broadcasts state updates to all iframes
- Has a custom `window.isRootAncestor = true` property

### Iframes

The application contains 4 main iframes:
1. **Iframe 1** - Standard iframe with count controls
2. **Iframe 2** - Contains a nested iframe inside it
3. **Iframe 3** - Standard iframe with count controls
4. **Iframe 4** - Experimental iframe that attempts direct access to parent properties (fails as expected)

Additionally, there's a **nested iframe** inside Iframe 2 that demonstrates multi-level communication.

## Communication Flow

### Parent → Iframe

When the count atom changes, the root page broadcasts updates to all iframes:

```typescript
countAtom.subscribe((count) => {
  const message = { type: 'count-update', count };
  iframe1.contentWindow?.postMessage(message, '*');
  iframe2.contentWindow?.postMessage(message, '*');
  // ... etc
});
```

Each iframe listens for these messages:

```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'count-update') {
    countDisplay.textContent = event.data.count;
  }
});
```

### Iframe → Parent

Iframes send action messages to the parent to request state changes:

```javascript
// From iframe
window.parent.postMessage({ type: 'increment', from: 'iframe1' }, '*');
```

The parent listens and updates the atom:

```typescript
window.addEventListener('message', (event) => {
  if (event.data.type === 'increment') {
    countAtom.set(countAtom.get() + 1);
  }
});
```

### Nested Iframe → Root

The nested iframe uses `window.top` to communicate directly with the root ancestor, bypassing its immediate parent:

```javascript
// From nested iframe
window.top.postMessage({ type: 'increment', from: 'nested' }, '*');
```

This demonstrates that deeply nested iframes can communicate with the root without relying on message forwarding through intermediate parents.

## Key Concepts

### Why `postMessage`?

Even though all iframes are loaded with `srcdoc` from the same origin, they cannot directly access parent JavaScript variables. Each iframe has its own isolated JavaScript execution context. The `postMessage` API is the standard, secure way to communicate between these contexts.

**Iframe 4 proves this**: It attempts to access `window.parent.countAtom` directly, but finds it `undefined`. This isolation is a security feature that prevents frames from interfering with each other's state.

### State Management with XState Store

The root page uses `@xstate/store` to create an atom:

```typescript
const countAtom = createAtom(0);
```

Atoms are simple reactive state containers. When the atom changes, subscribers are notified:

```typescript
countAtom.subscribe((count) => {
  // Broadcast to all iframes
});
```

This creates a unidirectional data flow:
1. Iframes request changes via `postMessage`
2. Root updates the atom
3. Atom notifies subscribers
4. Root broadcasts new state to all iframes

### Template-Based Iframe Content

Instead of embedding iframe HTML in JavaScript strings (which causes escaping nightmares), we use `<template>` tags:

```html
<template id="iframe1-template">
  <!DOCTYPE html>
  <html>
    <!-- Full iframe HTML here -->
  </html>
</template>
```

Then load them via `srcdoc`:

```typescript
const template = document.getElementById('iframe1-template');
iframe.srcdoc = template.innerHTML;
```

This keeps the HTML clean and avoids complex string escaping issues.

### IIFE for Scope Isolation

Each iframe's script is wrapped in an Immediately Invoked Function Expression:

```javascript
(function() {
  const countDisplay = document.getElementById('count-display');
  // ... rest of code
})();
```

This prevents variable name collisions when the editor analyzes all templates in the same file.

## Message Protocol

### Messages from Iframes to Root

- `{ type: 'increment', from: 'iframe1' }` - Request count increment
- `{ type: 'decrement', from: 'iframe2' }` - Request count decrement
- `{ type: 'reset', from: 'nested' }` - Request count reset

### Messages from Root to Iframes

- `{ type: 'count-update', count: 5 }` - Broadcast new count value
- `{ type: 'init', text: 'Hello...' }` - Initial greeting on load
- `{ type: 'broadcast', text: '...' }` - General broadcast message

## Benefits of This Architecture

1. **Single Source of Truth**: Only the root owns the state
2. **Predictable Updates**: All state changes flow through the root
3. **Scalable**: Easy to add more iframes without changing the protocol
4. **Secure**: Uses standard browser APIs for cross-context communication
5. **Debuggable**: All messages are logged to the console

## Limitations

- **No Direct Access**: Iframes cannot directly read or write parent state
- **Async Communication**: All updates happen asynchronously via messages
- **Message Overhead**: Every state change requires message passing
- **No Type Safety**: Messages are plain objects without compile-time validation

## Future Enhancements

- Add message validation/schemas
- Implement request/response patterns with message IDs
- Add error handling for failed message delivery
- Create a typed message bus abstraction
- Support for more complex state beyond a single counter
