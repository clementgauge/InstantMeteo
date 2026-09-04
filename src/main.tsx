import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { initAppUpdateChecker } from './services/appUpdateCheckerService';

// Initialize background update checker for real-time code deployments
initAppUpdateChecker();

// Intercept benign third-party script errors (e.g. translation widgets in sandboxed iframes)
window.addEventListener('error', (event) => {
  if (
    event.message === 'Script error.' ||
    (event.filename && event.filename.includes('translate.google.com')) ||
    (event.message && (event.message.includes('Da`prod') || event.message.includes('Ea')))
  ) {
    event.preventDefault();
    return true;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for static asset caching
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.log('Instant Météo ServiceWorker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.warn('Instant Météo ServiceWorker registration failed:', err);
      });
  });
}

