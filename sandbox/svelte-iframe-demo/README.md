# Svelte Iframe State Sync Demo

A comprehensive demonstration of the `iframe-state-sync` library integrated with Svelte 5, showcasing real-time state synchronization between a parent application and multiple iframe children.

## Features

- 🎯 **Bidirectional State Sync** - Changes in parent or any iframe instantly sync to all others
- 🎨 **Multiple State Types** - Counter (number), Color (string), Message (string), Active status (boolean)
- 🔄 **Real-time Updates** - Uses XState stores for reactive state management
- 🎭 **Three Themed Iframes**:
  - **Iframe 1**: Counter control with increment/decrement
  - **Iframe 2**: Color picker with presets
  - **Iframe 3**: Message board with quick messages and status indicator

## Architecture

### Parent (Svelte App)
- Uses `IframeStateSync` class to manage state
- Registers atoms (state keys) with initial values
- Subscribes to changes from iframes
- Provides UI controls to modify state

### Children (Iframes)
- Use `createChildClient()` to connect to parent
- Subscribe to specific state atoms
- Can read and write state values
- Automatically request sync on load

## State Atoms

| Key | Type | Description |
|-----|------|-------------|
| `counter` | number | Shared counter value |
| `color` | string | Hex color code |
| `message` | string | Text message |
| `isActive` | boolean | Active/inactive status |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## How It Works

1. **Parent Setup**:
   ```typescript
   const syncManager = new IframeStateSync({ debug: true });
   syncManager.registerAtom({ key: 'counter', initialValue: 0 });
   syncManager.registerIframe(iframeElement);
   ```

2. **Child Setup**:
   ```typescript
   const client = createChildClient({ debug: true });
   client.subscribe('counter', (value) => {
     // Handle value changes
   });
   client.setValue('counter', newValue);
   ```

3. **Communication Flow**:
   - Parent and children communicate via `postMessage`
   - XState stores manage reactive state
   - Changes trigger subscriptions across all contexts

## Key Learnings

- Svelte 5's `$state` rune integrates seamlessly with external state management
- `onMount` lifecycle hook is perfect for initializing iframe communication
- `bind:this` directive provides direct DOM access for iframe registration
- TypeScript provides excellent type safety for state values

## Tech Stack

- **Svelte 5** - UI framework with runes
- **TypeScript** - Type safety
- **Vite** - Build tool
- **XState Store** - State management
- **PostMessage API** - Cross-origin communication

## Next Steps

- Add more complex state types (arrays, nested objects)
- Implement state persistence (localStorage)
- Add error handling and reconnection logic
- Create a visual state debugger
- Add performance monitoring
