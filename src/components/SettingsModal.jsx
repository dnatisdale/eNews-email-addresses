import React from 'react';
import { X, Cloud, Key, HardDrive, Github, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { isFirebaseConfigured } from '../services/firebase';

export default function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleClearLocal = () => {
    if (window.confirm("Are you sure you want to clear local cache? (Saved notes/habits will reset to initial demo state)")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={20} color="var(--primary)" />
            <span>Firebase & Workspace Settings</span>
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Status Alert */}
          <div style={{
            padding: '14px',
            borderRadius: '10px',
            background: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${isFirebaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            {isFirebaseConfigured ? (
              <CheckCircle2 size={20} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: isFirebaseConfigured ? '#34d399' : '#fbbf24', marginBottom: '2px' }}>
                {isFirebaseConfigured ? 'Firebase Cloud Connected' : 'Running in Local Storage Mode (Offline Ready)'}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isFirebaseConfigured 
                  ? 'Your app is actively syncing data to Google Firebase Firestore in real-time.'
                  : 'All your habits, notes, and tasks are saved locally on your browser. To enable live cloud sync, add your free Firebase project credentials to `.env.local`.'}
              </p>
            </div>
          </div>

          {/* Step-by-step setup guide */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
              How to connect free Firebase Cloud:
            </h4>
            <ol style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Create a free project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>console.firebase.google.com</a></li>
              <li>Enable <strong>Firestore Database</strong> & <strong>Authentication</strong> (Google & Anonymous)</li>
              <li>Copy your Web App credentials into <code>.env.local</code> in the root directory:</li>
            </ol>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#34d399',
              marginTop: '10px',
              overflowX: 'auto'
            }}>
{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`}
            </pre>
          </div>

          {/* Local Storage Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '600' }}>Reset Demo Storage</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Restore default sample habits and notes</div>
            </div>
            <button className="btn btn-danger" onClick={handleClearLocal} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <HardDrive size={14} />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
