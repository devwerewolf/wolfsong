<script lang="ts">
  import { IframeStateSync } from './lib/iframe-state-sync';
  
  let syncManager = new IframeStateSync({ debug: true });
  
  // Parent state
  let counter = $state(0);
  let color = $state('#ff3e00');
  let message = $state('Hello from parent!');
  let isActive = $state(true);
  
  // Register atoms
  syncManager.registerAtom({ key: 'counter', initialValue: 0 });
  syncManager.registerAtom({ key: 'color', initialValue: '#ff3e00' });
  syncManager.registerAtom({ key: 'message', initialValue: 'Hello from parent!' });
  syncManager.registerAtom({ key: 'isActive', initialValue: true });
  
  // Subscribe to changes from iframes
  syncManager.subscribe('counter', (value: number) => {
    counter = value;
  });
  
  syncManager.subscribe('color', (value: string) => {
    color = value;
  });
  
  syncManager.subscribe('message', (value: string) => {
    message = value;
  });
  
  syncManager.subscribe('isActive', (value: boolean) => {
    isActive = value;
  });
  
  function registerIframe(iframe: HTMLIFrameElement) {
    syncManager.registerIframe(iframe);
    
    iframe.addEventListener('load', () => {
      // Iframe is ready, sync will happen automatically
    });
    
    return {
      destroy() {
        syncManager.unregisterIframe(iframe);
      }
    };
  }
  
  function updateCounter(delta: number) {
    syncManager.setValue('counter', counter + delta);
  }
  
  function updateColor(newColor: string) {
    syncManager.setValue('color', newColor);
  }
  
  function updateMessage(newMessage: string) {
    syncManager.setValue('message', newMessage);
  }
  
  function toggleActive() {
    syncManager.setValue('isActive', !isActive);
  }
</script>

<main>
  <div class="header">
    <h1>🎯 Svelte Iframe State Sync Demo</h1>
    <p>State synchronized across parent and multiple iframes using iframe-state-sync</p>
  </div>

  <div class="parent-controls" style="border-color: {color}">
    <h2>Parent Controls</h2>
    
    <div class="control-group">
      <div class="label-text">Counter: <strong>{counter}</strong></div>
      <div class="button-group">
        <button onclick={() => updateCounter(-1)}>-1</button>
        <button onclick={() => updateCounter(1)}>+1</button>
        <button onclick={() => updateCounter(10)}>+10</button>
      </div>
    </div>
    
    <div class="control-group">
      <div class="label-text">Color: <span class="color-preview" style="background: {color}"></span></div>
      <div class="button-group">
        <button onclick={() => updateColor('#ff3e00')}>Svelte Orange</button>
        <button onclick={() => updateColor('#4CAF50')}>Green</button>
        <button onclick={() => updateColor('#2196F3')}>Blue</button>
        <button onclick={() => updateColor('#9C27B0')}>Purple</button>
      </div>
    </div>
    
    <div class="control-group">
      <label for="message-input">Message:</label>
      <input 
        id="message-input"
        type="text" 
        value={message}
        oninput={(e) => updateMessage(e.currentTarget.value)}
      />
    </div>
    
    <div class="control-group">
      <label>
        <input 
          type="checkbox" 
          checked={isActive}
          onchange={toggleActive}
        />
        Active State: <strong>{isActive ? 'ON' : 'OFF'}</strong>
      </label>
    </div>
  </div>

  <div class="iframes-container">
    <div class="iframe-wrapper">
      <h3>Iframe 1 - Counter Focus</h3>
      <iframe 
        use:registerIframe
        src="/iframe1.html"
        title="Iframe 1"
      ></iframe>
    </div>
    
    <div class="iframe-wrapper">
      <h3>Iframe 2 - Color Focus</h3>
      <iframe 
        use:registerIframe
        src="/iframe2.html"
        title="Iframe 2"
      ></iframe>
    </div>
    
    <div class="iframe-wrapper">
      <h3>Iframe 3 - Message Focus</h3>
      <iframe 
        use:registerIframe
        src="/iframe3.html"
        title="Iframe 3"
      ></iframe>
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #f5f5f5;
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  .header p {
    color: #666;
    margin: 0;
  }

  .parent-controls {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
    border-left: 4px solid;
    transition: border-color 0.3s;
  }

  .parent-controls h2 {
    margin-top: 0;
    color: #333;
  }

  .control-group {
    margin-bottom: 1.5rem;
  }

  .control-group:last-child {
    margin-bottom: 0;
  }

  label, .label-text {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 500;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    background: #ff3e00;
    color: white;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  button:hover {
    background: #cc3200;
    transform: translateY(-1px);
  }

  button:active {
    transform: translateY(0);
  }

  input[type="text"] {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #ff3e00;
  }

  input[type="checkbox"] {
    margin-right: 0.5rem;
  }

  .color-preview {
    display: inline-block;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    vertical-align: middle;
    border: 2px solid #ddd;
  }

  .iframes-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .iframe-wrapper {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .iframe-wrapper h3 {
    margin: 0;
    padding: 1rem;
    background: #f8f8f8;
    border-bottom: 1px solid #eee;
    color: #333;
    font-size: 1rem;
  }

  iframe {
    width: 100%;
    height: 400px;
    border: none;
    display: block;
  }
</style>
