# Best Practices

## Security

### Always Specify Target Origin in Production

```javascript
// ❌ Bad - allows any origin
const sync = new IframeStateSync({
  targetOrigin: '*'
});

// ✅ Good - restricts to trusted domain
const sync = new IframeStateSync({
  targetOrigin: 'https://trusted-domain.com'
});
```

### Validate Message Sources

```javascript
window.addEventListener('message', (event) => {
  // Validate origin
  if (event.origin !== 'https://trusted-domain.com') {
    console.warn('Rejected message from untrusted origin:', event.origin);
    return;
  }
  
  // Process message
});
```

### Sanitize Values

```javascript
client.subscribeToAtom('userInput', (value) => {
  // Sanitize before using in DOM
  const sanitized = DOMPurify.sanitize(value);
  element.innerHTML = sanitized;
});
```

## Performance

### Debounce Frequent Updates

```javascript
let timeoutId;

function debouncedUpdate(key, value) {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    client.updateAtom(key, value);
  }, 300);
}

input.addEventListener('input', (e) => {
  debouncedUpdate('searchQuery', e.target.value);
});
```

### Unsubscribe When Done

```javascript
// Component lifecycle
function mountComponent() {
  const unsubscribe = client.subscribeToAtom('count', updateUI);
  
  return () => {
    // Cleanup
    unsubscribe();
  };
}

const cleanup = mountComponent();
// Later...
cleanup();
```

### Batch Updates

```javascript
// ❌ Bad - multiple broadcasts
countAtom.set(1);
userAtom.set({ name: 'Alice' });
themeAtom.set('dark');

// ✅ Better - batch if possible
const updates = [
  { atom: countAtom, value: 1 },
  { atom: userAtom, value: { name: 'Alice' } },
  { atom: themeAtom, value: 'dark' }
];

updates.forEach(({ atom, value }) => atom.set(value));
```

### Unregister Removed Iframes

```javascript
function removeIframe(iframe) {
  // Unregister first
  sync.unregisterIframe(iframe);
  
  // Then remove from DOM
  iframe.remove();
}
```

## Code Organization

### Centralize Atom Definitions

```javascript
// atoms.js
export const ATOM_KEYS = {
  COUNT: 'count',
  USER: 'user',
  THEME: 'theme'
};

export const ATOM_CONFIGS = [
  { key: ATOM_KEYS.COUNT, initialValue: 0 },
  { key: ATOM_KEYS.USER, initialValue: null },
  { key: ATOM_KEYS.THEME, initialValue: 'light' }
];
```

```javascript
// parent.js
import { ATOM_CONFIGS } from './atoms.js';

ATOM_CONFIGS.forEach(config => {
  sync.registerAtom(config);
});
```

```javascript
// child.js
import { ATOM_CONFIGS, ATOM_KEYS } from './atoms.js';

const client = createChildClient(ATOM_CONFIGS);
client.subscribeToAtom(ATOM_KEYS.COUNT, updateUI);
```

### Create Wrapper Functions

```javascript
// sync-helpers.js
export function createSyncManager(atomConfigs) {
  const sync = new IframeStateSync({ debug: process.env.NODE_ENV === 'development' });
  
  const atoms = {};
  atomConfigs.forEach(config => {
    atoms[config.key] = sync.registerAtom(config);
  });
  
  return { sync, atoms };
}

export function autoRegisterIframes(sync, selector = 'iframe') {
  const iframes = document.querySelectorAll(selector);
  iframes.forEach(iframe => sync.registerIframe(iframe));
}
```

### Type-Safe Helpers

```javascript
// For TypeScript projects
export function createTypedClient<T extends Record<string, any>>(
  configs: AtomConfig[]
) {
  const client = createChildClient(configs);
  
  return {
    ...client,
    updateAtom: <K extends keyof T>(key: K, value: T[K]) => {
      client.updateAtom(key as string, value);
    },
    getAtomValue: <K extends keyof T>(key: K): T[K] => {
      return client.getAtomValue(key as string) as T[K];
    }
  };
}

// Usage
interface AppState {
  count: number;
  user: { name: string } | null;
}

const client = createTypedClient<AppState>([...]);
client.updateAtom('count', 42); // Type-safe!
```

## Testing

### Mock the Client

```javascript
// test-utils.js
export function createMockClient(initialValues = {}) {
  const values = { ...initialValues };
  const subscribers = {};
  
  return {
    updateAtom: jest.fn((key, value) => {
      values[key] = value;
      subscribers[key]?.forEach(fn => fn(value));
    }),
    getAtomValue: jest.fn((key) => values[key]),
    subscribeToAtom: jest.fn((key, callback) => {
      if (!subscribers[key]) subscribers[key] = [];
      subscribers[key].push(callback);
      callback(values[key]);
      return () => {
        subscribers[key] = subscribers[key].filter(fn => fn !== callback);
      };
    })
  };
}
```

```javascript
// component.test.js
import { createMockClient } from './test-utils';

test('updates UI when count changes', () => {
  const client = createMockClient({ count: 0 });
  
  const component = new Component(client);
  
  // Simulate update
  client.updateAtom('count', 5);
  
  expect(component.element.textContent).toBe('5');
});
```

### Test Message Protocol

```javascript
test('sends correct message format', () => {
  const postMessageSpy = jest.spyOn(window.parent, 'postMessage');
  
  client.updateAtom('count', 42);
  
  expect(postMessageSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'atom-sync',
      key: 'count',
      value: 42,
      timestamp: expect.any(Number)
    }),
    '*'
  );
});
```

## Error Handling

### Graceful Degradation

```javascript
function safeUpdateAtom(client, key, value) {
  try {
    client.updateAtom(key, value);
  } catch (error) {
    console.error(`Failed to update atom "${key}":`, error);
    // Fallback to local state
    localStorage.setItem(key, JSON.stringify(value));
  }
}
```

### Validate Before Update

```javascript
function updateCount(value) {
  if (typeof value !== 'number') {
    console.error('Count must be a number');
    return;
  }
  
  if (value < 0 || value > 100) {
    console.error('Count must be between 0 and 100');
    return;
  }
  
  client.updateAtom('count', value);
}
```

## Debugging

### Enable Debug Mode in Development

```javascript
const sync = new IframeStateSync({
  debug: process.env.NODE_ENV === 'development'
});
```

### Add Custom Logging

```javascript
client.subscribeToAtom('count', (value) => {
  console.log('[Counter] Value changed:', value);
  console.trace('Update source');
});
```

### Monitor All Messages

```javascript
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'atom-sync') {
      console.log('[Message]', event.data);
    }
  });
}
```

## Documentation

### Document Atom Schema

```javascript
/**
 * Application State Schema
 * 
 * @atom count - Current counter value (number, 0-100)
 * @atom user - Current user object { name: string, id: number } | null
 * @atom theme - UI theme ('light' | 'dark')
 * @atom settings - User preferences object
 */
```

### Add JSDoc Comments

```javascript
/**
 * Updates the counter value
 * @param {number} delta - Amount to increment/decrement
 * @throws {Error} If delta would result in invalid value
 */
function updateCounter(delta) {
  const current = client.getAtomValue('count');
  const newValue = current + delta;
  
  if (newValue < 0 || newValue > 100) {
    throw new Error('Counter value must be between 0 and 100');
  }
  
  client.updateAtom('count', newValue);
}
```
