/**
 * TypeScript Example - Child Iframe
 * 
 * This demonstrates type-safe usage of the library in a child iframe
 */

import { createChildClient } from '../src';
import type { ChildAtomConfig } from '../src';

// Define your application state types (should match parent)
interface User {
  name: string;
  id: number;
}

type Theme = 'light' | 'dark';

// Define atom configurations with types
const atomConfigs: ChildAtomConfig[] = [
  { key: 'count' },  // Will receive from parent
  { key: 'user' },   // Will receive from parent
  { key: 'theme' }   // Will receive from parent
];

// Initialize client
const client = createChildClient(atomConfigs, {
  targetOrigin: 'https://parent-domain.com',
  debug: process.env.NODE_ENV === 'development'
});

// Subscribe to changes with type-safe callbacks
client.subscribeToAtom<number>('count', (count) => {
  console.log('Count:', count); // count is number
  document.getElementById('count-display')!.textContent = count.toString();
});

client.subscribeToAtom<User | null>('user', (user) => {
  console.log('User:', user); // user is User | null
  const userDisplay = document.getElementById('user-display')!;
  userDisplay.textContent = user ? `Hello, ${user.name}!` : 'Not logged in';
});

client.subscribeToAtom<Theme>('theme', (theme) => {
  console.log('Theme:', theme); // theme is 'light' | 'dark'
  document.body.className = theme;
});

// Update state with type safety
document.getElementById('increment-btn')?.addEventListener('click', () => {
  const current = client.getAtomValue<number>('count');
  client.updateAtom('count', current + 1);
});

document.getElementById('decrement-btn')?.addEventListener('click', () => {
  const current = client.getAtomValue<number>('count');
  client.updateAtom('count', current - 1);
});

document.getElementById('toggle-theme-btn')?.addEventListener('click', () => {
  const current = client.getAtomValue<Theme>('theme');
  client.updateAtom('theme', current === 'light' ? 'dark' : 'light');
});

// Advanced: Type-safe helper function
function updateCount(delta: number) {
  const current = client.getAtomValue<number>('count');
  client.updateAtom('count', current + delta);
}

// Usage
document.getElementById('add-10-btn')?.addEventListener('click', () => {
  updateCount(10);
});

// Advanced: React-style hook pattern
function useAtom<T>(key: string): [T, (value: T) => void] {
  const value = client.getAtomValue<T>(key);
  const setValue = (newValue: T) => client.updateAtom(key, newValue);
  return [value, setValue];
}

// Usage (in a framework context)
// const [count, setCount] = useAtom<number>('count');
// setCount(count + 1);
