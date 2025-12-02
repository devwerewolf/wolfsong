/**
 * TypeScript Example - Parent Window
 * 
 * This demonstrates type-safe usage of the library in a parent window
 */

import { IframeStateSync } from '../src';
import type { AtomConfig } from '../src';

// Define your application state types
interface User {
  name: string;
  id: number;
}

type Theme = 'light' | 'dark';

// Initialize sync manager
const sync = new IframeStateSync({
  targetOrigin: 'https://trusted-domain.com',
  debug: process.env.NODE_ENV === 'development'
});

// Register atoms with type safety
const countAtom = sync.registerAtom<number>({
  key: 'count',
  initialValue: 0
});

const userAtom = sync.registerAtom<User | null>({
  key: 'user',
  initialValue: null
});

const themeAtom = sync.registerAtom<Theme>({
  key: 'theme',
  initialValue: 'light'
});

// Subscribe to changes with type-safe callbacks
countAtom.subscribe((count) => {
  console.log('Count changed:', count); // count is number
  document.getElementById('count-display')!.textContent = count.toString();
});

userAtom.subscribe((user) => {
  console.log('User changed:', user); // user is User | null
  if (user) {
    document.getElementById('user-name')!.textContent = user.name;
  }
});

themeAtom.subscribe((theme) => {
  console.log('Theme changed:', theme); // theme is 'light' | 'dark'
  document.body.className = theme;
});

// Register iframes
const iframe1 = document.getElementById('iframe1') as HTMLIFrameElement;
const iframe2 = document.getElementById('iframe2') as HTMLIFrameElement;

sync.registerIframe(iframe1);
sync.registerIframe(iframe2);

// Update state with type safety
countAtom.set(42); // ✓ OK
// countAtom.set('invalid'); // ✗ Type error

userAtom.set({ name: 'Alice', id: 123 }); // ✓ OK
// userAtom.set({ name: 'Bob' }); // ✗ Type error (missing id)

themeAtom.set('dark'); // ✓ OK
// themeAtom.set('blue'); // ✗ Type error (not 'light' | 'dark')

// Button handlers
document.getElementById('increment-btn')?.addEventListener('click', () => {
  countAtom.set(countAtom.get() + 1);
});

document.getElementById('toggle-theme-btn')?.addEventListener('click', () => {
  const current = themeAtom.get();
  themeAtom.set(current === 'light' ? 'dark' : 'light');
});

document.getElementById('login-btn')?.addEventListener('click', () => {
  userAtom.set({ name: 'Alice', id: 123 });
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  userAtom.set(null);
});
