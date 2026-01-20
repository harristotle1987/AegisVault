
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
  window.addEventListener('load', () => {
    // Determine the absolute path based on the current environment's origin.
    // This prevents origin mismatch errors in proxied previews.
    try {
      const swPath = new URL('./sw.js', window.location.href).href;
      
      navigator.serviceWorker.register(swPath)
        .then(reg => console.log('AegisVault Service Worker: Operational', reg))
        .catch(err => {
          // Silent fail or warning for environmental restrictions (common in dev previews)
          if (err.name === 'SecurityError' || err.message.includes('origin')) {
            console.warn('AegisVault: Service Worker registration restricted by environment security policy or origin mismatch.');
          } else {
            console.error('AegisVault Service Worker: Failed', err);
          }
        });
    } catch (e) {
      console.warn('AegisVault: Could not determine Service Worker path.', e);
    }
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
