# Quick Start Guide

## Run the Demo

```bash
cd sandbox/svelte-iframe-demo
npm run dev
```

Then open http://localhost:5173 in your browser.

## What You'll See

- **Parent Controls**: Buttons and inputs to modify shared state
- **Three Iframes**: Each with a different focus (counter, color, message)
- **Real-time Sync**: Changes in any location instantly sync everywhere

## Try These Interactions

1. **Counter**: Click +/- buttons in parent or Iframe 1 - watch all update
2. **Color**: Pick a color in parent or Iframe 2 - see the theme change everywhere
3. **Message**: Type in parent or Iframe 3 - text syncs instantly
4. **Active Toggle**: Toggle the checkbox - see status indicator in Iframe 3

## Key Features Demonstrated

- ✅ Bidirectional state sync (parent ↔ iframes)
- ✅ Multiple state types (number, string, boolean)
- ✅ XState store integration
- ✅ Svelte 5 runes ($state, actions)
- ✅ TypeScript type safety
- ✅ Debug logging (check browser console)

## Architecture Highlights

### Parent (App.svelte)
- Creates `IframeStateSync` instance
- Registers state atoms with initial values
- Uses `use:registerIframe` action for automatic iframe registration
- Subscribes to state changes from iframes

### Children (iframe1-3.html)
- Use `createChildClient()` to connect
- Subscribe to specific atoms
- Can read and write state values
- Automatically request sync on load

## Next Steps

- Open browser DevTools console to see debug logs
- Modify state values and watch the sync happen
- Try adding new state atoms
- Experiment with different iframe configurations
