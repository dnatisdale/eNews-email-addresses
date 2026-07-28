import React from 'react';
import { ShieldCheck, Download, Mail, X, Check } from 'lucide-react';
import { downloadBackupFile, emailBackup } from '../services/backupService';

export const BackupPromptModal = ({ isOpen, onClose, backup }) => {
  if (!isOpen || !backup) return null;

  const handleDownload = () => {
    downloadBackupFile(backup);
  };

  const handleEmail = async () => {
    await emailBackup(backup);
  };

  return (
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 1100 }}>
      <div className="glass-card modal-container" style={{ maxWidth: '480px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                Database Backup Created
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {backup.formattedDate || new Date().toLocaleString()}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
            🛡️ {backup.note || 'Automatic System Snapshot'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            <strong>{backup.contactCount || 0} contacts</strong> safely recorded in your 5-version rolling history. Would you like to download or email a copy of this backup to yourself now?
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownload}
            style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '10px 16px' }}
          >
            <Download size={16} />
            <span>Download Backup (.json)</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleEmail}
            style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '10px 16px' }}
          >
            <Mail size={16} />
            <span>Email / Share Backup</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ width: '100%', justifyContent: 'center', color: 'var(--text-muted)', marginTop: '4px' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
