import React from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';

export default function PWAPrompt({ installPrompt, onInstall, onClose }) {
  if (!installPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '99',
      maxWidth: '380px',
      width: 'calc(100% - 40px)'
    }} className="animate-fade-in">
      <div className="glass-card" style={{
        padding: '16px 20px',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <div style={{
          padding: '10px',
          borderRadius: '12px',
          background: 'var(--primary-light)',
          color: '#818cf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Smartphone size={24} />
        </div>
        
        <div style={{ flex: '1' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>
            Install Zenith Hub App
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Add to home screen for full offline support and instant loading.
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button className="btn btn-primary" onClick={onInstall} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Download size={14} />
              <span>Install</span>
            </button>
            <button className="btn btn-secondary" onClick={onClose} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
              Dismiss
            </button>
          </div>
        </div>

        <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-dim)', alignSelf: 'flex-start' }}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
