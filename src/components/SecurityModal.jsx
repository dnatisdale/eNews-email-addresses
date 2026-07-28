import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck, AlertCircle, Delete, Info } from 'lucide-react';
import { getAdminPIN } from '../services/authService';

export const SecurityModal = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  actionTitle = 'Edit Contact'
}) => {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const adminPin = getAdminPIN();

  useEffect(() => {
    if (isOpen) {
      setPasscodeInput('');
      setErrorMsg('');
      setShowInfo(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const attemptVerify = (typedPin) => {
    const cleanPin = typedPin.trim();
    if (cleanPin === adminPin) {
      onUnlockSuccess();
      return true;
    } else {
      setErrorMsg('Incorrect passcode. Please try again.');
      return false;
    }
  };

  const handleVerify = (e) => {
    if (e) e.preventDefault();
    attemptVerify(passcodeInput);
  };

  const handleInputChange = (val) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 6);
    setPasscodeInput(clean);
    setErrorMsg('');
    if (clean.length === 6) {
      attemptVerify(clean);
    }
  };

  const handleKeypadPress = (digit) => {
    if (passcodeInput.length < 6) {
      const next = passcodeInput + digit;
      handleInputChange(next);
    }
  };

  const handleKeypadBackspace = () => {
    if (passcodeInput.length > 0) {
      handleInputChange(passcodeInput.slice(0, -1));
    }
  };

  const handleClearInput = () => {
    setPasscodeInput('');
    setErrorMsg('');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content security-modal" style={{ maxWidth: '420px', overflowY: 'auto' }}>
        <div className="modal-header">
          <div className="modal-title-wrap text-warning" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock className="modal-icon text-warning" size={20} />
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>App is Locked — Unlock Required</h2>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setShowInfo(prev => !prev)}
              title={showInfo ? 'Hide explanation' : 'Show explanation'}
              aria-label="Toggle explanation"
              style={{
                color: showInfo ? 'var(--accent-primary)' : 'var(--text-muted)',
                padding: '4px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px'
              }}
            >
              <Info size={18} />
            </button>
          </div>
          <button className="icon-close-btn" onClick={onClose} aria-label="Close Security Modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleVerify} className="modal-body">
          {showInfo && (
            <div className="lock-alert-box" style={{ marginBottom: '12px', padding: '10px 14px' }}>
              <AlertCircle size={18} className="text-warning flex-shrink-0" />
              <div>
                <strong style={{ fontSize: '0.88rem' }}>🔒 Editing Controls are Locked</strong>
                <p style={{ fontSize: '0.82rem', margin: '2px 0 0', opacity: 0.9 }}>
                  To <strong>{actionTitle}</strong>, enter your 6-digit Security Passcode below.
                </p>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: showInfo ? '0' : '4px' }}>
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
              onChange={(e) => handleInputChange(e.target.value)}
              style={{
                letterSpacing: '0.3em',
                textAlign: 'center',
                fontSize: '1.35rem',
                fontWeight: 700,
                padding: '0.5rem'
              }}
            />
          </div>

          {/* On-Screen Touch Keypad */}
          <div className="pin-keypad-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginTop: '10px',
            marginBottom: '6px'
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                className="btn btn-secondary btn-keypad"
                onClick={() => handleKeypadPress(num)}
                style={{ fontSize: '1.2rem', fontWeight: 600, padding: '0.5rem 0' }}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-keypad"
              onClick={handleClearInput}
              title="Clear input"
              style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem 0' }}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-keypad"
              onClick={() => handleKeypadPress('0')}
              style={{ fontSize: '1.2rem', fontWeight: 600, padding: '0.5rem 0' }}
            >
              0
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-keypad"
              onClick={handleKeypadBackspace}
              title="Backspace"
              style={{ fontSize: '1rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Delete size={18} />
            </button>
          </div>

          {errorMsg && (
            <div className="error-alert mt-2" style={{ fontSize: '0.82rem' }}>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '0.8rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: 160 }}>
              <ShieldCheck size={18} />
              <span>Verify & Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
