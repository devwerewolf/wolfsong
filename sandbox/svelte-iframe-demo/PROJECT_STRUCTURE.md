# Project Structure

```
svelte-iframe-demo/
├── public/                          # Static assets served by Vite
│   ├── iframe1.html                # Counter-focused iframe
│   ├── iframe2.html                # Color picker iframe
│   ├── iframe3.html                # Message board iframe
│   └── vite.svg
│
├── src/
│   ├── lib/
│   │   └── iframe-state-sync/      # State sync library (local copy)
│   │       ├── IframeStateSync.ts  # Parent-side state manager
│   │       ├── createChildClient.ts # Child iframe client
│   │       ├── types.ts            # TypeScript type definitions
│   │       └── index.ts            # Public API exports
│   │
│   ├── App.svelte                  # Main parent application
│   ├── main.ts                     # Application entry point
│   └── app.css                     # Global styles
│
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── svelte.config.js                # Svelte configuration
│
├── README.md                       # Project overview and features
├── QUICKSTART.md                   # Quick start guide
├── LEARNINGS.md                    # Key learnings and patterns
└── PROJECT_STRUCTURE.md            # This file
```

## Key Files

### Parent Application
- **`src/App.svelte`**: Main Svelte component with state management
  - Uses `IframeStateSync` to manage shared state
  - Registers iframes using `use:registerIframe` action
  - Provides UI controls for state manipulation

### Iframe Children
- **`public/iframe1.html`**: Counter control with increment/decrement
- **`public/iframe2.html`**: Color picker with visual feedback
- **`public/iframe3.html`**: Message board with status indicator

### State Sync Library
- **`IframeStateSync.ts`**: Parent-side manager
  - Registers state atoms
  - Manages iframe connections
  - Broadcasts state changes
  
- **`createChildClient.ts`**: Child-side client
  - Connects to parent
  - Subscribes to state atoms
  - Sends state updates

- **`types.ts`**: Shared type definitions
  - `AtomConfig`, `SyncMessage`, etc.

## State Flow

```
Parent (App.svelte)
    ↓ registers atoms
IframeStateSync
    ↓ postMessage
Iframe 1, 2, 3
    ↓ createChildClient
Subscribe to atoms
    ↓ user interaction
Update state
    ↓ postMessage
IframeStateSync
    ↓ broadcast
All iframes + parent update
```

## Tech Stack

- **Svelte 5.43.8**: UI framework with runes
- **TypeScript 5.9.3**: Type safety
- **Vite 7.2.4**: Build tool and dev server
- **XState Store 3.12.0**: State management
- **PostMessage API**: Cross-origin communication

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run check    # Type check
```
