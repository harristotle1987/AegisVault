import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * Service Worker Registration logic hardened for sandboxed environments.
 * We resolve the path relative to window.location.href to ensure the origin matches.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Points to root /sw.js in the public folder logic
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('🛡️ AegisVault: Service Worker Active', registration.scope);
    } catch (error) {
      console.error('❌ AegisVault: Service Worker Offline', error);
    }
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);