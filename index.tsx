
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('🛡️ AegisVault: Secured', reg.scope))
      .catch(err => {
        // Silently handle 404s/offline dev environments to prevent console noise
        if (process.env.NODE_ENV === 'development' || err.message.includes('404') || err.message.includes('script')) {
           return; 
        }
        console.warn('Vault Offline Mode:', err);
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
