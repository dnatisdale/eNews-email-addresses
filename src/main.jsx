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
  },
  onRegisterError(error) {
    console.warn('PWA Service Worker registration error:', error);
  }
});

// Guarded recovery for stale chunk load errors (prevents infinite reload loops)
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Loading chunk')) {
    const hasReloaded = sessionStorage.getItem('pwa_sw_reloaded_once');
    if (!hasReloaded) {
      sessionStorage.setItem('pwa_sw_reloaded_once', 'true');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
          }
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
