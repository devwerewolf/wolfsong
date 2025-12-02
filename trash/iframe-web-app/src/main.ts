import './style.css';
import { createAtom } from '@xstate/store';

// Set custom window property on parent
declare global {
  interface Window {
    isRootAncestor?: boolean;
  }
}

window.isRootAncestor = true;
console.log('Parent window.isRootAncestor:', window.isRootAncestor);

// Create count atom
const countAtom = createAtom(0);

// Get root count display element
const rootCountDisplay = document.getElementById('root-count-display') as HTMLElement;

// Subscribe to count changes and broadcast to all iframes
countAtom.subscribe((count) => {
  console.log('Count changed:', count);
  
  // Update root display
  if (rootCountDisplay) {
    rootCountDisplay.textContent = count.toString();
  }
  
  // Broadcast count to all iframes
  const message = { type: 'count-update', count };
  iframe1.contentWindow?.postMessage(message, '*');
  iframe2.contentWindow?.postMessage(message, '*');
  iframe3.contentWindow?.postMessage(message, '*');
  iframe4.contentWindow?.postMessage(message, '*');
  
  const nestedFrame = iframe2.contentWindow?.document.getElementById('nested-frame') as HTMLIFrameElement;
  if (nestedFrame && nestedFrame.contentWindow) {
    nestedFrame.contentWindow.postMessage(message, '*');
  }
});

console.log('Initial count:', countAtom.get());

const iframe1 = document.getElementById('content-frame') as HTMLIFrameElement;
const iframe2 = document.getElementById('content-frame-2') as HTMLIFrameElement;
const iframe3 = document.getElementById('content-frame-3') as HTMLIFrameElement;
const iframe4 = document.getElementById('content-frame-4') as HTMLIFrameElement;

// Load iframe content from templates
const iframe1Template = document.getElementById('iframe1-template') as HTMLTemplateElement;
const iframe2Template = document.getElementById('iframe2-template') as HTMLTemplateElement;
const iframe3Template = document.getElementById('iframe3-template') as HTMLTemplateElement;
const iframe4Template = document.getElementById('iframe4-template') as HTMLTemplateElement;
const nestedTemplate = document.getElementById('nested-template') as HTMLTemplateElement;

iframe1.srcdoc = iframe1Template.innerHTML;
iframe2.srcdoc = iframe2Template.innerHTML;
iframe3.srcdoc = iframe3Template.innerHTML;
iframe4.srcdoc = iframe4Template.innerHTML;

// Listen for messages from all iframes
window.addEventListener('message', (event) => {
  console.log('Parent received:', event.data);
  
  // Handle count operations from iframes
  if (event.data.type === 'increment') {
    countAtom.set(countAtom.get() + 1);
  } else if (event.data.type === 'decrement') {
    countAtom.set(countAtom.get() - 1);
  } else if (event.data.type === 'reset') {
    countAtom.set(0);
  }
});

// Send message to each iframe after it loads
iframe1.addEventListener('load', () => {
  iframe1.contentWindow?.postMessage({ type: 'init', text: 'Hello from parent to iframe 1!' }, '*');
});

iframe2.addEventListener('load', () => {
  iframe2.contentWindow?.postMessage({ type: 'init', text: 'Hello from parent to iframe 2!' }, '*');
  
  // Load nested iframe after iframe2 loads
  setTimeout(() => {
    const nestedFrame = iframe2.contentWindow?.document.getElementById('nested-frame') as HTMLIFrameElement;
    if (nestedFrame) {
      nestedFrame.srcdoc = nestedTemplate.innerHTML;
    }
  }, 100);
});

iframe3.addEventListener('load', () => {
  iframe3.contentWindow?.postMessage({ type: 'init', text: 'Hello from parent to iframe 3!' }, '*');
});

iframe4.addEventListener('load', () => {
  iframe4.contentWindow?.postMessage({ type: 'init', text: 'Hello from parent to iframe 4!' }, '*');
});

// Add button handlers for parent to send messages
document.getElementById('send-to-iframe1')?.addEventListener('click', () => {
  iframe1.contentWindow?.postMessage({ type: 'message', text: 'Message from parent to iframe 1!' }, '*');
});

document.getElementById('send-to-iframe2')?.addEventListener('click', () => {
  iframe2.contentWindow?.postMessage({ type: 'message', text: 'Message from parent to iframe 2!' }, '*');
});

document.getElementById('send-to-iframe3')?.addEventListener('click', () => {
  iframe3.contentWindow?.postMessage({ type: 'message', text: 'Message from parent to iframe 3!' }, '*');
});

document.getElementById('send-to-all')?.addEventListener('click', () => {
  const message = { type: 'broadcast', text: 'Broadcast message to all iframes!' };
  iframe1.contentWindow?.postMessage(message, '*');
  iframe2.contentWindow?.postMessage(message, '*');
  iframe3.contentWindow?.postMessage(message, '*');
  
  // Also send to nested iframe
  const nestedFrame = iframe2.contentWindow?.document.getElementById('nested-frame') as HTMLIFrameElement;
  if (nestedFrame && nestedFrame.contentWindow) {
    nestedFrame.contentWindow.postMessage(message, '*');
  }
});

// Add button handlers for root count controls
document.getElementById('root-increment-btn')?.addEventListener('click', () => {
  countAtom.set(countAtom.get() + 1);
});

document.getElementById('root-decrement-btn')?.addEventListener('click', () => {
  countAtom.set(countAtom.get() - 1);
});

document.getElementById('root-reset-btn')?.addEventListener('click', () => {
  countAtom.set(0);
});
