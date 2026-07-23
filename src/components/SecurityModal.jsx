import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, KeyRound, Smartphone, Mail, Check, ShieldCheck, RefreshCw, Copy } from 'lucide-react';
import { getAdminPIN, generateVerificationCode } from '../services/authService';

export const SecurityModal = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  actionTitle = 'Perform Editing Action'
}) => {
  const [authMode, setAuthMode] = useState('otp');
  const [otpCode, setOtpCode] = useState('');
  const [userCodeInput, setUserCodeInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Store OTP in ref so verify handler always sees the current value
  const otpRef = useRef('');

  useEffect(() => {
    if (isOpen) {
      const code = generateVerificationCode();
      setOtpCode(code);
      otpRef.current = code;
      // Clear inputs — user must type the code
      setUserCodeInput('');
      setPinInput('');
      setErrorMsg('');
      setCopiedCode(false);
      setAuthMode('otp');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendCode = () => {
    const code = generateVerificationCode();
    setOtpCode(code);
    otpRef.current = code;
    setUserCodeInput('');
    setErrorMsg('');
    setCopiedCode(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(otpRef.current);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const adminPin = getAdminPIN();
    const typed = userCodeInput.trim();
    const currentOtp = otpRef.current.trim();

    if (typed === currentOtp || typed === adminPin) {
      onUnlockSuccess();
    } else {
      setErrorMsg(`Incorrect code. Enter the code shown above (${currentOtp}), or your Admin Passcode.`);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    const adminPin = getAdminPIN();
    const typed = pinInput.trim();
    const currentOtp = otpRef.current.trim();

    if (typed === adminPin || typed === currentOtp) {
      onUnlockSuccess();
    } else {
      setErrorMsg('Incorrect Admin Passcode. Check Settings ⚙️ for your saved code.');
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
            🔒 Verification required to <strong>{actionTitle}</strong>.
          </p>

          {/* Code Display Banner */}
          <div className="sms-banner">
            <div className="sms-banner-content">
              <Smartphone size={20} className="sms-icon text-primary" />
              <div className="sms-details">
                <span className="sms-title">Your Verification Code:</span>
                <div className="code-highlight">{otpCode}</div>
              </div>
              <button
                type="button"
                className="btn-copy-code"
                onClick={handleCopyCode}
                title="Copy Verification Code to Clipboard"
              >
                {copiedCode ? (
                  <><Check size={14} /><span>Copied!</span></>
                ) : (
                  <><Copy size={14} /><span>Copy Code</span></>
                )}
              </button>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === 'otp' ? 'auth-tab-active' : ''}`}
              onClick={() => { setAuthMode('otp'); setErrorMsg(''); }}
            >
              <Mail size={16} />
              <span>Enter Code Above</span>
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'pin' ? 'auth-tab-active' : ''}`}
              onClick={() => { setAuthMode('pin'); setErrorMsg(''); }}
            >
              <KeyRound size={16} />
              <span>Admin Passcode</span>
            </button>
          </div>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}

          {authMode === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group">
                <label>Type or paste the code shown above</label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  className="input-control otp-input"
                  placeholder="123456"
                  value={userCodeInput}
                  onChange={(e) => {
                    setUserCodeInput(e.target.value.replace(/[^0-9]/g, ''));
                    setErrorMsg('');
                  }}
                />
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
                <button type="submit" className="btn btn-primary" style={{ minWidth: 180 }}>
                  <ShieldCheck size={18} />
                  <span>Verify &amp; Unlock</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyPin} className="auth-form">
              <div className="form-group">
                <label>Enter 6-Digit Admin Passcode</label>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  className="input-control code-input-lg"
                  placeholder="Enter your Admin Code"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMsg('');
                  }}
                />
                <p className="help-text">Set your Admin Code in Settings ⚙️. Default: see Settings.</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: 180 }}>
                  <ShieldCheck size={18} />
                  <span>Verify &amp; Unlock</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
