import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wifi, 
  WifiOff, 
  Download, 
  Cloud, 
  CloudOff, 
  User, 
  LogOut, 
  Settings, 
  ShieldCheck 
} from 'lucide-react';
import { isFirebaseConfigured, loginWithGoogle, loginAsGuest, logoutUser } from '../services/firebase';

export default function Header({ user, installPrompt, onInstall, onOpenSettings }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 0',
      borderBottom: '1px solid var(--border-glass)',
      marginBottom: '16px'
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>
            Zenith <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--primary-light)', color: '#818cf8', fontWeight: '600' }}>PWA</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Personal Cloud & Offline Workspace</p>
        </div>
      </div>

      {/* Action Controls & Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Network Status Badge */}
        <div className={`badge ${isOnline ? 'badge-success' : 'badge-warning'}`} title={isOnline ? 'Online' : 'Offline (Cached PWA)'}>
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
        </div>

        {/* Cloud Sync Status Badge */}
        <div className={`badge ${isFirebaseConfigured ? 'badge-primary' : 'badge-warning'}`} title={isFirebaseConfigured ? 'Firebase Cloud Connected' : 'Local Storage Mode'}>
          {isFirebaseConfigured ? <Cloud size={13} /> : <CloudOff size={13} />}
          <span>{isFirebaseConfigured ? 'Cloud Sync' : 'Local Mode'}</span>
        </div>

        {/* PWA Install Button */}
        {installPrompt && (
          <button className="btn btn-primary" onClick={onInstall} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            <Download size={15} />
            <span>Install App</span>
          </button>
        )}

        {/* Settings Modal Button */}
        <button 
          className="btn btn-secondary" 
          onClick={onOpenSettings}
          title="Firebase & App Settings"
          style={{ padding: '8px', borderRadius: '8px' }}
        >
          <Settings size={18} />
        </button>

        {/* Auth Profile / Login */}
        {isFirebaseConfigured ? (
          user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500' }}>
                {user.displayName || user.email || 'Guest User'}
              </span>
              <button className="btn btn-secondary" onClick={logoutUser} title="Sign Out" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={loginWithGoogle} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              <User size={15} />
              <span>Sign In</span>
            </button>
          )
        ) : null}
      </div>
    </header>
  );
}
