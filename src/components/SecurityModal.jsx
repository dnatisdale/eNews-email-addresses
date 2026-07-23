import React, { useState, useEffect } from 'react';
import { Lock, X, KeyRound, Smartphone, Mail, Check, ShieldCheck, RefreshCw, Copy } from 'lucide-react';
import { getAdminPIN, generateVerificationCode } from '../services/authService';

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
  const [codeSent, setCodeSent] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [simulatedNotification, setSimulatedNotification] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setUserCodeInput('');
      setPinInput('');
      setCopiedCode(false);
      handleSendCode();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendCode = () => {
    const code = generateVerificationCode();
    setOtpCode(code);
    setCodeSent(true);
    setErrorMsg('');
    setCopiedCode(false);

    setSimulatedNotification(`📱 SMS / 📧 Email Verification Code: ${code}`);
  };

  const handleCopyCode = () => {
    if (!otpCode) return;
    navigator.clipboard.writeText(otpCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    const adminPin = getAdminPIN();
    const inputClean = userCodeInput.trim();

    // Verify if input matches either OTP code OR 6-Digit Admin Code
    if (inputClean === otpCode.trim() || inputClean === adminPin.trim()) {
      onUnlockSuccess();
      onClose();
    } else {
      setErrorMsg('Incorrect 6-digit verification code. Please check the code sent or enter your 6-digit Admin Code.');
    }
  };

  const handleVerifyPIN = (e) => {
    e.preventDefault();
    const adminPin = getAdminPIN();
    const inputClean = pinInput.trim();

    if (inputClean === adminPin.trim() || inputClean === otpCode.trim()) {
      onUnlockSuccess();
      onClose();
    } else {
      setErrorMsg('Incorrect 6-Digit Admin Passcode.');
    }
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
            🔒 Security code is required to <strong>{actionTitle}</strong>.
          </p>

          {/* Verification Code Banner with 1-Click Copy Button */}
          {simulatedNotification && (
            <div className="sms-banner">
              <div className="sms-banner-content">
                <Smartphone size={20} className="sms-icon" />
                <div className="sms-details">
                  <span className="sms-title">Verification Code Message:</span>
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
          )}

          {/* Mode Switch Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === 'otp' ? 'auth-tab-active' : ''}`}
              onClick={() => { setAuthMode('otp'); setErrorMsg(''); }}
            >
              <Mail size={16} />
              <span>Email / Text Code</span>
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'pin' ? 'auth-tab-active' : ''}`}
              onClick={() => { setAuthMode('pin'); setErrorMsg(''); }}
            >
              <KeyRound size={16} />
              <span>6-Digit Admin Code</span>
            </button>
          </div>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}

          {authMode === 'otp' ? (
            <form onSubmit={handleVerifyCode} className="auth-form">
              <div className="form-group">
                <label>Enter 6-Digit Verification Code</label>
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
                    <RefreshCw size={12} /> Resend New Code
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <ShieldCheck size={16} />
                  <span>Verify & Unlock</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyPIN} className="auth-form">
              <div className="form-group">
                <label>Enter 6-Digit Admin Passcode</label>
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
                <button type="submit" className="btn btn-primary">
                  <ShieldCheck size={16} />
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
