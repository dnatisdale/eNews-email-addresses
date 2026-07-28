import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck } from 'lucide-react';
import { getAdminPIN, generateVerificationCode } from '../services/authService';

export const SecurityModal = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  actionTitle = 'Modify Contacts'
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
          <div className="modal-title-wrap text-primary">
            <Lock className="modal-icon text-primary" size={20} />
            <h2>Security Verification Required</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose} aria-label="Close Security Modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleVerify} className="modal-body">
          <p className="security-notice">
            Passcode required to <strong>{actionTitle}</strong>.
          </p>

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
              Enter your 6-digit passcode to authorize this action (configured in Settings).
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
