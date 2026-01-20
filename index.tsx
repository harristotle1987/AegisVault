
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Relative path for PWA asset reliability across dev environments
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => console.log('🛡️ AegisVault: Secured', reg.scope))
      .catch(err => {
        if (err.message.includes('404')) return; 
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
