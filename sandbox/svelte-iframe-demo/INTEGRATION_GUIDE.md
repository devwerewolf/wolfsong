# Integration Guide

## Using iframe-state-sync in Your Project

### Installation

```bash
npm install @xstate/store
```

Copy the `src/lib/iframe-state-sync` folder to your project.

### Basic Setup

#### 1. Parent Component (Svelte)

```svelte
<script lang="ts">
  import { IframeStateSync } from './lib/iframe-state-sync';
  
  const syncManager = new IframeStateSync({ 
    debug: false,  // Set to true for development
    targetOrigin: 'https://your-iframe-domain.com'  // Specify in production
  });
  
  // Register your state atoms
  syncManager.registerAtom({ key: 'user', initialValue: null });
  syncManager.registerAtom({ key: 'theme', initialValue: 'light' });
  
  // Subscribe to changes
  let user = $state(null);
  syncManager.subscribe('user', (value) => {
    user = value;
  });
  
  // Action to register iframes
  function registerIframe(iframe: HTMLIFrameElement) {
    syncManager.registerIframe(iframe);
    return () => syncManager.unregisterIframe(iframe);
  }
  
  // Update state
  function login(userData) {
    syncManager.setValue('user', userData);
  }
</script>

<iframe use:registerIframe src="/child.html" />
```

#### 2. Child Iframe (HTML + JS)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Child Iframe</title>
</head>
<body>
  <div id="app"></div>
  
  <script type="module">
    import { createChildClient } from '/src/lib/iframe-state-sync/index.ts';
    
    const client = createChildClient({
      debug: false,
      targetOrigin: 'https://your-parent-domain.com'
    });
    
    // Subscribe to state
    client.subscribe('user', (user) => {
      console.log('User updated:', user);
      updateUI(user);
    });
    
    // Update state
    function logout() {
      client.setValue('user', null);
    }
  </script>
</body>
</html>
```

### Advanced Patterns

#### Complex State Objects

```typescript
interface AppState {
  user: User | null;
  settings: Settings;
  notifications: Notification[];
}

syncManager.registerAtom<User | null>({ 
  key: 'user', 
  initialValue: null 
});

syncManager.registerAtom<Settings>({ 
  key: 'settings', 
  initialValue: { theme: 'light', language: 'en' }
});
```

#### Conditional Sync

```typescript
// Only sync if user is authenticated
function updateIfAuthenticated(key: string, value: any) {
  const user = syncManager.getValue('user');
  if (user) {
    syncManager.setValue(key, value);
  }
}
```

#### Multiple Iframe Groups

```typescript
// Create separate sync managers for different iframe groups
const adminSync = new IframeStateSync({ targetOrigin: 'admin.example.com' });
const publicSync = new IframeStateSync({ targetOrigin: 'public.example.com' });
```

### SvelteKit Integration

```typescript
// src/routes/+page.svelte
<script lang="ts">
  import { browser } from '$app/environment';
  import { IframeStateSync } from '$lib/iframe-state-sync';
  
  let syncManager: IframeStateSync;
  
  if (browser) {
    syncManager = new IframeStateSync();
    // ... setup
  }
</script>
```

### React Integration

```jsx
import { useEffect, useRef, useState } from 'react';
import { IframeStateSync } from './lib/iframe-state-sync';

function App() {
  const syncManagerRef = useRef(null);
  const iframeRef = useRef(null);
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    const syncManager = new IframeStateSync();
    syncManagerRef.current = syncManager;
    
    syncManager.registerAtom({ key: 'counter', initialValue: 0 });
    syncManager.subscribe('counter', setCounter);
    
    if (iframeRef.current) {
      syncManager.registerIframe(iframeRef.current);
    }
    
    return () => syncManager.destroy();
  }, []);
  
  return <iframe ref={iframeRef} src="/child.html" />;
}
```

### Vue Integration

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { IframeStateSync } from './lib/iframe-state-sync';

const iframeRef = ref(null);
const counter = ref(0);
let syncManager;

onMounted(() => {
  syncManager = new IframeStateSync();
  syncManager.registerAtom({ key: 'counter', initialValue: 0 });
  syncManager.subscribe('counter', (value) => {
    counter.value = value;
  });
  
  if (iframeRef.value) {
    syncManager.registerIframe(iframeRef.value);
  }
});

onUnmounted(() => {
  syncManager?.destroy();
});
</script>

<template>
  <iframe ref="iframeRef" src="/child.html" />
</template>
```

### Security Best Practices

```typescript
// 1. Always specify targetOrigin in production
const syncManager = new IframeStateSync({
  targetOrigin: 'https://trusted-domain.com'
});

// 2. Validate messages in production
class SecureIframeStateSync extends IframeStateSync {
  private validateMessage(event: MessageEvent) {
    if (event.origin !== 'https://trusted-domain.com') {
      console.warn('Rejected message from untrusted origin:', event.origin);
      return false;
    }
    return true;
  }
}

// 3. Sanitize user input before syncing
function updateMessage(text: string) {
  const sanitized = sanitizeHTML(text);
  syncManager.setValue('message', sanitized);
}
```

### Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { IframeStateSync } from './IframeStateSync';

describe('IframeStateSync', () => {
  it('should register and sync atoms', () => {
    const syncManager = new IframeStateSync();
    syncManager.registerAtom({ key: 'test', initialValue: 42 });
    
    expect(syncManager.getValue('test')).toBe(42);
    
    syncManager.setValue('test', 100);
    expect(syncManager.getValue('test')).toBe(100);
  });
  
  it('should notify subscribers', () => {
    const syncManager = new IframeStateSync();
    const callback = vi.fn();
    
    syncManager.registerAtom({ key: 'test', initialValue: 0 });
    syncManager.subscribe('test', callback);
    syncManager.setValue('test', 1);
    
    expect(callback).toHaveBeenCalledWith(1);
  });
});
```

### Performance Optimization

```typescript
// Debounce high-frequency updates
import { debounce } from 'lodash-es';

const debouncedUpdate = debounce((key, value) => {
  syncManager.setValue(key, value);
}, 300);

// Throttle scroll position sync
import { throttle } from 'lodash-es';

const throttledScroll = throttle((position) => {
  syncManager.setValue('scrollPosition', position);
}, 100);

// Batch multiple updates
function updateMultiple(updates: Record<string, any>) {
  Object.entries(updates).forEach(([key, value]) => {
    syncManager.setValue(key, value);
  });
}
```

### Error Handling

```typescript
class RobustIframeStateSync extends IframeStateSync {
  setValue<T>(key: string, value: T) {
    try {
      super.setValue(key, value);
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      // Optionally: retry, fallback, or notify user
    }
  }
  
  registerIframe(iframe: HTMLIFrameElement) {
    try {
      super.registerIframe(iframe);
    } catch (error) {
      console.error('Failed to register iframe:', error);
      // Handle gracefully
    }
  }
}
```

## Common Patterns

### Authentication Flow

```typescript
// Parent
syncManager.registerAtom({ key: 'auth', initialValue: null });

async function login(credentials) {
  const user = await api.login(credentials);
  syncManager.setValue('auth', user);
}

// Child
client.subscribe('auth', (user) => {
  if (user) {
    showAuthenticatedUI();
  } else {
    showLoginForm();
  }
});
```

### Theme Switching

```typescript
// Parent
syncManager.registerAtom({ key: 'theme', initialValue: 'light' });

function toggleTheme() {
  const current = syncManager.getValue('theme');
  syncManager.setValue('theme', current === 'light' ? 'dark' : 'light');
}

// Child
client.subscribe('theme', (theme) => {
  document.body.className = theme;
});
```

### Form State Sync

```typescript
// Parent
syncManager.registerAtom({ key: 'formData', initialValue: {} });

// Child fills form
client.setValue('formData', {
  name: 'John',
  email: 'john@example.com'
});

// Parent submits
const formData = syncManager.getValue('formData');
await api.submit(formData);
```

## Troubleshooting

### Iframes not syncing?
- Check browser console for errors
- Verify `targetOrigin` matches
- Ensure iframes are fully loaded
- Check for CORS issues

### State not updating?
- Verify atom is registered
- Check subscription is active
- Ensure setValue is called correctly
- Look for TypeScript type mismatches

### Performance issues?
- Add debouncing/throttling
- Reduce sync frequency
- Use `$state.raw` for large objects
- Profile with DevTools

## Migration from Other Solutions

### From Redux + postMessage

```typescript
// Before (Redux)
store.subscribe(() => {
  iframe.contentWindow.postMessage(store.getState(), '*');
});

// After (iframe-state-sync)
syncManager.registerAtom({ key: 'state', initialValue: initialState });
syncManager.registerIframe(iframe);
```

### From Custom postMessage

```typescript
// Before
window.addEventListener('message', (e) => {
  if (e.data.type === 'UPDATE') {
    setState(e.data.value);
  }
});

// After
client.subscribe('state', (value) => {
  setState(value);
});
```

Happy integrating! 🚀
