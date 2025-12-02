# API Reference

## IframeStateSync (Parent)

Main class for parent windows to manage state synchronization.

### Constructor

```typescript
new IframeStateSync(options?: IframeSyncOptions)
```

**Parameters:**
- `options.targetOrigin?: string` - Target origin for postMessage (default: `'*'`)
- `options.debug?: boolean` - Enable debug logging (default: `false`)

**Example:**
```javascript
const sync = new IframeStateSync({
  targetOrigin: 'https://trusted-domain.com',
  debug: true
});
```

### Methods

#### `registerAtom<T>(config: AtomConfig<T>)`

Register a new atom with the sync manager.

**Parameters:**
- `config.key: string` - Unique identifier for the atom
- `config.initialValue: T` - Initial value

**Returns:** Atom object with `get()`, `set()`, and `subscribe()` methods

**Example:**
```javascript
const countAtom = sync.registerAtom({
  key: 'count',
  initialValue: 0
});
```

**Throws:** Error if atom with same key already registered

---

#### `getAtom<T>(key: string)`

Get a previously registered atom by key.

**Parameters:**
- `key: string` - Atom key

**Returns:** Atom object

**Example:**
```javascript
const countAtom = sync.getAtom('count');
const currentValue = countAtom.get();
```

**Throws:** Error if atom not found

---

#### `registerIframe(iframe: HTMLIFrameElement)`

Register an iframe for state synchronization.

**Parameters:**
- `iframe: HTMLIFrameElement` - Iframe element to register

**Example:**
```javascript
const iframe = document.getElementById('my-iframe');
sync.registerIframe(iframe);
```

**Note:** Automatically syncs current state when iframe loads

---

#### `unregisterIframe(iframe: HTMLIFrameElement)`

Unregister an iframe from state synchronization.

**Parameters:**
- `iframe: HTMLIFrameElement` - Iframe element to unregister

**Example:**
```javascript
sync.unregisterIframe(iframe);
```

---

## Atom Object

Returned by `registerAtom()` and `getAtom()`.

### Methods

#### `get()`

Get the current value of the atom.

**Returns:** Current value

**Example:**
```javascript
const value = countAtom.get();
```

---

#### `set(value: T)`

Set a new value for the atom. Triggers all subscribers and broadcasts to iframes.

**Parameters:**
- `value: T` - New value

**Example:**
```javascript
countAtom.set(42);
```

---

#### `subscribe(callback: (value: T) => void)`

Subscribe to atom changes.

**Parameters:**
- `callback: (value: T) => void` - Function called when value changes

**Returns:** Unsubscribe function

**Example:**
```javascript
const unsubscribe = countAtom.subscribe((value) => {
  console.log('Count:', value);
});

// Later, to unsubscribe:
unsubscribe();
```

**Note:** Callback is called immediately with current value

---

## createChildClient (Child Iframes)

Helper function to create a sync client for child iframes.

### Function Signature

```typescript
createChildClient(
  atomConfigs: AtomConfig[],
  options?: IframeSyncOptions
)
```

**Parameters:**
- `atomConfigs: AtomConfig[]` - Array of atom configurations
- `options.targetOrigin?: string` - Target origin for postMessage (default: `'*'`)
- `options.debug?: boolean` - Enable debug logging (default: `false`)

**Returns:** Client object with helper methods

**Example:**
```javascript
const client = createChildClient([
  { key: 'count', initialValue: 0 },
  { key: 'user', initialValue: null }
], { debug: true });
```

**Note:** Automatically requests initial state from parent on creation

---

## Client Object

Returned by `createChildClient()`.

### Properties

#### `sync: IframeStateSync`

Access to underlying sync instance.

**Example:**
```javascript
console.log(client.sync.isRoot); // false
```

---

#### `atoms: Record<string, Atom>`

Map of registered atoms.

**Example:**
```javascript
const countAtom = client.atoms.count;
```

---

### Methods

#### `updateAtom(key: string, value: AtomValue)`

Update an atom value and send to parent.

**Parameters:**
- `key: string` - Atom key
- `value: AtomValue` - New value

**Example:**
```javascript
client.updateAtom('count', 42);
```

**Throws:** Error if atom not found

---

#### `getAtomValue(key: string)`

Get current atom value.

**Parameters:**
- `key: string` - Atom key

**Returns:** Current value

**Example:**
```javascript
const count = client.getAtomValue('count');
```

**Throws:** Error if atom not found

---

#### `subscribeToAtom(key: string, callback: (value: AtomValue) => void)`

Subscribe to atom changes.

**Parameters:**
- `key: string` - Atom key
- `callback: (value: AtomValue) => void` - Function called when value changes

**Returns:** Unsubscribe function

**Example:**
```javascript
const unsubscribe = client.subscribeToAtom('count', (value) => {
  console.log('Count:', value);
});

// Later:
unsubscribe();
```

**Throws:** Error if atom not found

---

## Types

### AtomValue

```typescript
type AtomValue = string | number | boolean | object | null | undefined;
```

Any serializable value that can be sent via postMessage.

---

### AtomConfig

```typescript
interface AtomConfig<T extends AtomValue> {
  key: string;
  initialValue: T;
}
```

Configuration for registering an atom.

---

### SyncMessage

```typescript
interface SyncMessage<T extends AtomValue = AtomValue> {
  type: 'atom-sync';
  key: string;
  value: T;
  timestamp: number;
}
```

Message format for state synchronization.

---

### SyncRequestMessage

```typescript
interface SyncRequestMessage {
  type: 'atom-sync-request';
  timestamp: number;
}
```

Message format for requesting initial state from parent.

---

### IframeSyncOptions

```typescript
interface IframeSyncOptions {
  targetOrigin?: string;
  debug?: boolean;
}
```

Options for configuring sync behavior.

---

## Error Handling

### Common Errors

**Atom already registered:**
```javascript
// Throws: Error: Atom with key "count" already registered
sync.registerAtom({ key: 'count', initialValue: 0 });
sync.registerAtom({ key: 'count', initialValue: 1 }); // Error!
```

**Atom not found:**
```javascript
// Throws: Error: Atom with key "missing" not found
const atom = sync.getAtom('missing');
```

**Invalid update from root:**
```javascript
// In parent window
client.sendToParent('count', 42); // Logs warning, no-op
```

### Best Practices

1. Always check if atoms exist before accessing
2. Use try-catch for dynamic atom access
3. Enable debug mode during development
4. Validate values before updating atoms
5. Clean up subscriptions when components unmount
