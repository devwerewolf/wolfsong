# Refactoring Your Existing App

This guide shows how to refactor your current `iframe-web-app` to use the `IframeStateSync` library.

## Before (Current Implementation)

Your current `main.ts` manually:
- Creates atoms
- Subscribes to changes
- Broadcasts to each iframe individually
- Handles message events manually
- Tracks iframes manually

## After (With IframeStateSync)

### Parent Window (`main.ts`)

```typescript
import './style.css';
import { IframeStateSync } from '@sandbox/iframe-state-sync';

// Initialize sync manager
const sync = new IframeStateSync({ debug: true });

// Register count atom
const countAtom = sync.registerAtom({
  key: 'count',
  initialValue: 0
});

// Update root display
const rootCountDisplay = document.getElementById('root-count-display') as HTMLElement;
countAtom.subscribe((count) => {
  if (rootCountDisplay) {
    rootCountDisplay.textContent = count.toString();
  }
});

// Get iframes
const iframe1 = document.getElementById('content-frame') as HTMLIFrameElement;
const iframe2 = document.getElementById('content-frame-2') as HTMLIFrameElement;
const iframe3 = document.getElementById('content-frame-3') as HTMLIFrameElement;
const iframe4 = document.getElementById('content-frame-4') as HTMLIFrameElement;

// Load iframe content from templates
const iframe1Template = document.getElementById('iframe1-template') as HTMLTemplateElement;
const iframe2Template = document.getElementById('iframe2-template') as HTMLTemplateElement;
const iframe3Template = document.getElementById('iframe3-template') as HTMLTemplateElement;
const iframe4Template = document.getElementById('iframe4-template') as HTMLTemplateElement;

iframe1.srcdoc = iframe1Template.innerHTML;
iframe2.srcdoc = iframe2Template.innerHTML;
iframe3.srcdoc = iframe3Template.innerHTML;
iframe4.srcdoc = iframe4Template.innerHTML;

// Register iframes (this handles all the broadcasting!)
sync.registerIframe(iframe1);
sync.registerIframe(iframe2);
sync.registerIframe(iframe3);
sync.registerIframe(iframe4);

// Load nested iframe
iframe2.addEventListener('load', () => {
  setTimeout(() => {
    const nestedFrame = iframe2.contentWindow?.document.getElementById('nested-frame') as HTMLIFrameElement;
    if (nestedFrame) {
      const nestedTemplate = document.getElementById('nested-template') as HTMLTemplateElement;
      nestedFrame.srcdoc = nestedTemplate.innerHTML;
      // Note: Nested iframe will communicate via window.top
    }
  }, 100);
});

// Root controls - much simpler!
document.getElementById('root-increment-btn')?.addEventListener('click', () => {
  countAtom.set(countAtom.get() + 1);
});

document.getElementById('root-decrement-btn')?.addEventListener('click', () => {
  countAtom.set(countAtom.get() - 1);
});

document.getElementById('root-reset-btn')?.addEventListener('click', () => {
  countAtom.set(0);
});
```

### Iframe Scripts (in templates)

Replace the manual postMessage handling with:

```javascript
// Old way
window.addEventListener('message', (event) => {
  if (event.data.type === 'count-update') {
    countDisplay.textContent = event.data.count;
  }
});

document.getElementById('increment-btn').addEventListener('click', () => {
  window.parent.postMessage({ type: 'increment', from: 'iframe1' }, '*');
});

// New way
window.addEventListener('message', (event) => {
  if (event.data.type === 'atom-sync' && event.data.key === 'count') {
    countDisplay.textContent = event.data.value;
  }
});

document.getElementById('increment-btn').addEventListener('click', () => {
  window.parent.postMessage({
    type: 'atom-sync',
    key: 'count',
    value: parseInt(countDisplay.textContent) + 1,
    timestamp: Date.now()
  }, '*');
});
```

## Benefits

1. **Less boilerplate**: No manual iframe tracking or broadcasting
2. **Type safety**: TypeScript types for all messages and atoms
3. **Scalability**: Easy to add more atoms and iframes
4. **Consistency**: Standardized message protocol
5. **Debugging**: Built-in debug logging
6. **Reusability**: Same library works across projects

## Migration Steps

1. Install the library in your iframe-web-app:
   ```bash
   cd sandbox/iframe-web-app
   npm link @sandbox/iframe-state-sync
   ```

2. Update `main.ts` to use `IframeStateSync`

3. Update iframe template scripts to use the new message format

4. Test thoroughly with all iframes and nested scenarios

5. Remove old manual postMessage handling code

## Advanced: Multiple Atoms

You can easily add more state:

```typescript
const userAtom = sync.registerAtom({
  key: 'user',
  initialValue: { name: 'Guest', isLoggedIn: false }
});

const themeAtom = sync.registerAtom({
  key: 'theme',
  initialValue: 'light'
});

// All atoms automatically sync to all iframes!
```
