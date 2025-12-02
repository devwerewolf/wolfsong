# Frequently Asked Questions

## General

### Why do child iframes need to specify `initialValue`?

The `initialValue` in child iframes serves several purposes:

1. **Fallback value** - Used temporarily until parent responds with real state
2. **Type hint** - Helps document what type of value to expect
3. **Standalone mode** - If iframe runs outside a parent context, it has a sensible default
4. **Optional** - You can omit it, and it will default to `null`

```javascript
// With initialValue (recommended for documentation)
const client = createChildClient([
  { key: 'count', initialValue: 0 }
]);

// Without initialValue (uses null as fallback)
const client = createChildClient([
  { key: 'count' }
]);
```

The real value from the parent will overwrite the initial value within milliseconds.

---

### What happens if parent and child have different `initialValue`?

The parent's value always wins. Child `initialValue` is just a temporary fallback:

```javascript
// Parent
const countAtom = sync.registerAtom({
  key: 'count',
  initialValue: 100  // This is the source of truth
});

// Child
const client = createChildClient([
  { key: 'count', initialValue: 0 }  // Temporarily 0, then becomes 100
]);
```

The child will briefly show `0`, then immediately update to `100` when it receives the parent's state.

---

### Do atoms need to be registered in the same order?

No! Atoms are matched by `key`, not by order:

```javascript
// Parent
sync.registerAtom({ key: 'count', initialValue: 0 });
sync.registerAtom({ key: 'user', initialValue: null });

// Child - different order is fine
const client = createChildClient([
  { key: 'user', initialValue: null },
  { key: 'count', initialValue: 0 }
]);
```

---

### Can I add atoms dynamically after initialization?

Yes, but you'll need to manually request the state:

```javascript
// Initial setup
const client = createChildClient([
  { key: 'count', initialValue: 0 }
]);

// Later, add a new atom
const newAtom = client.sync.registerAtom({
  key: 'theme',
  initialValue: 'light'
});

// Request current state from parent
client.sync.requestStateFromParent();
```

---

### What if the parent doesn't have an atom that the child registered?

The child will keep its `initialValue` and log a warning (if debug mode is enabled). Updates to that atom won't be synced.

```javascript
// Parent only has 'count'
sync.registerAtom({ key: 'count', initialValue: 0 });

// Child tries to register 'theme' too
const client = createChildClient([
  { key: 'count', initialValue: 0 },    // ✓ Will sync
  { key: 'theme', initialValue: 'light' } // ✗ Won't sync, keeps 'light'
]);
```

---

## Performance

### Does every keystroke send a message?

Yes, but you can debounce updates:

```javascript
let timeoutId;

input.addEventListener('input', (e) => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    client.updateAtom('searchQuery', e.target.value);
  }, 300);
});
```

---

### How many iframes can I have?

There's no hard limit, but consider:
- Each iframe receives every state update
- More iframes = more postMessage overhead
- Test with your expected load

For 10-20 iframes with moderate updates, performance should be fine.

---

### Should I batch updates?

If you're updating multiple atoms at once, they'll each trigger a broadcast. This is usually fine, but for many simultaneous updates, consider:

```javascript
// Multiple updates
const updates = [
  { key: 'count', value: 10 },
  { key: 'user', value: { name: 'Alice' } },
  { key: 'theme', value: 'dark' }
];

// Apply all at once
updates.forEach(({ key, value }) => {
  client.updateAtom(key, value);
});
```

---

## Security

### Is `targetOrigin: '*'` safe?

No! Always specify the exact origin in production:

```javascript
// ❌ Development only
const sync = new IframeStateSync({
  targetOrigin: '*'
});

// ✅ Production
const sync = new IframeStateSync({
  targetOrigin: 'https://trusted-domain.com'
});
```

---

### Can malicious iframes inject state?

If you use `targetOrigin: '*'`, yes. Always:
1. Specify exact `targetOrigin`
2. Validate message sources
3. Sanitize values before using in DOM

```javascript
window.addEventListener('message', (event) => {
  // Validate origin
  if (event.origin !== 'https://trusted-domain.com') {
    return;
  }
  // Process message
});
```

---

### Should I sanitize atom values?

Yes, especially if they're user-generated or displayed in HTML:

```javascript
client.subscribeToAtom('userInput', (value) => {
  // Sanitize before using in DOM
  element.textContent = value; // Safe
  // element.innerHTML = value; // Unsafe!
});
```

---

## Debugging

### How do I see all messages?

Enable debug mode:

```javascript
const sync = new IframeStateSync({ debug: true });
```

Or monitor all postMessage traffic:

```javascript
window.addEventListener('message', (event) => {
  console.log('[Message]', event.data);
});
```

---

### Why isn't my iframe receiving updates?

Check:
1. Is the iframe registered? `sync.registerIframe(iframe)`
2. Are atom keys matching exactly?
3. Is debug mode showing any errors?
4. Is the iframe loaded? (Check `iframe.addEventListener('load', ...)`)

---

### Can I see the message flow?

Yes, with debug mode enabled:

```
[IframeStateSync] Initialized { isRoot: false }
[IframeStateSync] Registered atom "count" 0
[IframeStateSync] Requested initial state from parent
[IframeStateSync] Received "count": 42
```

---

## Advanced

### Can I use this with React/Vue/Svelte?

Yes! Wrap the client in a hook/composable/store:

**React:**
```javascript
function useAtom(client, key) {
  const [value, setValue] = useState(client.getAtomValue(key));
  
  useEffect(() => {
    return client.subscribeToAtom(key, setValue);
  }, [client, key]);
  
  return [value, (newValue) => client.updateAtom(key, newValue)];
}
```

**Vue:**
```javascript
export function useAtom(client, key) {
  const value = ref(client.getAtomValue(key));
  
  onMounted(() => {
    const unsubscribe = client.subscribeToAtom(key, (v) => {
      value.value = v;
    });
    onUnmounted(unsubscribe);
  });
  
  return {
    value,
    update: (v) => client.updateAtom(key, v)
  };
}
```

---

### Can I sync localStorage too?

Yes, subscribe to atoms and persist:

```javascript
client.subscribeToAtom('theme', (theme) => {
  localStorage.setItem('theme', theme);
});

// On load, restore from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  client.updateAtom('theme', savedTheme);
}
```

---

### Can nested iframes communicate directly?

Not directly through this library. They must go through the parent:

```
Nested Iframe → Parent Iframe → Root → All Iframes
```

Or use `window.top.postMessage()` to send directly to root.

---

### Can I use this across different domains?

Yes! That's what `postMessage` is designed for. Just ensure:
1. Set correct `targetOrigin`
2. Validate message sources
3. Be aware of CORS for iframe loading

```javascript
// Parent on domain-a.com
const sync = new IframeStateSync({
  targetOrigin: 'https://domain-b.com'
});

// Child on domain-b.com
const client = createChildClient([...], {
  targetOrigin: 'https://domain-a.com'
});
```
