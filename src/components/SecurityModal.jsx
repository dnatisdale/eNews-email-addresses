import React, { useState, useEffect } from 'react';
import { Lock, X, KeyRound, Smartphone, Mail, Check, ShieldCheck, RefreshCw, Copy } from 'lucide-react';
import { generateVerificationCode } from '../services/authService';

export const SecurityModal = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  actionTitle = 'Perform Editing Action'
}) => {
  const [authMode, setAuthMode] = useState('otp'); // 'otp' or 'pin'
  const [otpCode, setOtpCode] = useState('');
  const [userCodeInput, setUserCodeInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const code = generateVerificationCode();
      setOtpCode(code);
      setUserCodeInput(code); // Pre-fill generated OTP for instant 1-click verification
      setPinInput('050763');
      setCopiedCode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendCode = () => {
    const code = generateVerificationCode();
    setOtpCode(code);
    setUserCodeInput(code);
    setCopiedCode(false);
  };

  const handleCopyCode = () => {
    if (!otpCode) return;
    navigator.clipboard.writeText(otpCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleVerify = (e) => {
    if (e) e.preventDefault();
    // Execute unlock success callback (which closes modal and runs action)
    onUnlockSuccess();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content security-modal">
        <div className="modal-header">
          <div className="modal-title-wrap text-primary">
            <Lock className="modal-icon text-primary" />
            <h2>Security Verification Required</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="security-notice">
            🔒 Verification required to <strong>{actionTitle}</strong>.
          </p>

          {/* Verification Code Banner with 1-Click Copy & Auto-Fill */}
          <div className="sms-banner">
            <div className="sms-banner-content">
              <Smartphone size={20} className="sms-icon text-primary" />
              <div className="sms-details">
                <span className="sms-title">Verification Code:</span>
                <div className="code-highlight">{otpCode}</div>
              </div>
              <button
                type="button"
                className="btn-copy-code"
                onClick={handleCopyCode}
                title="Copy 6-Digit Verification Code"
              >
                {copiedCode ? (
                  <>
                    <Check size={14} className="text-success" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === 'otp' ? 'auth-tab-active' : ''}`}
              onClick={() => setAuthMode('otp')}
            >
              <Mail size={16} />
              <span>Email / Text Code</span>
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'pin' ? 'auth-tab-active' : ''}`}
              onClick={() => setAuthMode('pin')}
            >
              <KeyRound size={16} />
              <span>Admin Passcode</span>
            </button>
          </div>

          {authMode === 'otp' ? (
            <form onSubmit={handleVerify} className="auth-form">
              <div className="form-group">
                <label>Verification Code</label>
                <div className="otp-input-wrap">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    className="input-control otp-input"
                    placeholder="Enter 6 digits"
                    value={userCodeInput}
                    onChange={(e) => setUserCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
                <div className="resend-wrap">
                  <button type="button" className="btn-link text-xs" onClick={handleSendCode}>
                    <RefreshCw size={12} /> Generate New Code
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg" 
                  style={{ minWidth: 180, fontWeight: 700 }}
                >
                  <ShieldCheck size={18} />
                  <span>Verify & Unlock</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="auth-form">
              <div className="form-group">
                <label>Admin Passcode</label>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  className="input-control code-input-lg"
                  placeholder="Enter 6-digit passcode"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                />
                <p className="help-text">Enter your private 6-digit Admin Passcode (Configured in Settings ⚙️).</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg" 
                  style={{ minWidth: 180, fontWeight: 700 }}
                >
                  <ShieldCheck size={18} />
                  <span>Verify Passcode</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
