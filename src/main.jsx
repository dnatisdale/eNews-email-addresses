import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with automatic cache updating
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  }
});

// Auto-recovery for stale PWA cache errors: unregister broken SW and reload fresh build
window.addEventListener('error', (event) => {
  if (event.message && (event.message.includes('ReferenceError') || event.message.includes('Loading chunk') || event.message.includes('isNotDefined'))) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
        window.location.reload();
      });
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
