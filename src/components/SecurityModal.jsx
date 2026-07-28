import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { getAdminPIN } from '../services/authService';

export const SecurityModal = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  actionTitle = 'Edit Contact'
}) => {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasscodeInput('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    const adminPin = getAdminPIN();
    const typed = passcodeInput.trim();

    if (typed === adminPin) {
      onUnlockSuccess();
    } else {
      setErrorMsg('Incorrect Admin Passcode. Please check Settings for your 6-digit passcode.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content security-modal" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div className="modal-title-wrap text-warning">
            <Lock className="modal-icon text-warning" size={20} />
            <h2>App is Locked — Unlock Required</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose} aria-label="Close Security Modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleVerify} className="modal-body">
          <div className="lock-alert-box">
            <AlertCircle size={18} className="text-warning flex-shrink-0" />
            <div>
              <strong>🔒 Editing Controls are Locked</strong>
              <p className="mt-1" style={{ fontSize: '0.82rem', margin: 0, opacity: 0.9 }}>
                To <strong>{actionTitle}</strong>, please enter your 6-digit Security Passcode below to unlock editing.
              </p>
            </div>
          </div>

          <div className="form-group mt-3">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Enter 6-Digit Security Passcode
            </label>
            <input
              type="password"
              maxLength={6}
              autoFocus
              className="input-control code-input-lg"
              placeholder="XXXXXX"
              value={passcodeInput}
              onChange={(e) => {
                setPasscodeInput(e.target.value.replace(/[^0-9]/g, ''));
                setErrorMsg('');
              }}
              style={{
                letterSpacing: '0.3em',
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                padding: '0.75rem'
              }}
            />
            <p className="help-text mt-2" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Configured in Settings (Default: 050763).
            </p>
          </div>

          {errorMsg && (
            <div className="error-alert mt-2" style={{ fontSize: '0.82rem' }}>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: 160 }}>
              <ShieldCheck size={18} />
              <span>Verify &amp; Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
