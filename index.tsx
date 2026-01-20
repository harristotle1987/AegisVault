
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Attempt registration using relative path to support subfolder deployments
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('🛡️ AegisVault: Secured', reg.scope))
      .catch(err => {
        // Suppress 404 errors to avoid alarming user
        if (err.message && !err.message.includes('404')) {
           console.warn('Vault Offline Mode:', err);
        }
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
