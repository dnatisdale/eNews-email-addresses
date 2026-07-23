import React, { useState, useEffect } from 'react';
import { Lock, X, KeyRound, Smartphone, Mail, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState('');
  const [simulatedNotification, setSimulatedNotification] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setUserCodeInput('');
      setPinInput('');
      // Auto-send verification code on modal open
      handleSendCode();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendCode = () => {
    const code = generateVerificationCode();
    setOtpCode(code);
    setCodeSent(true);
    setErrorMsg('');

    // Simulate instant Email/SMS notification toast on screen
    setSimulatedNotification(`📱 SMS / 📧 Email Code Sent: ${code}`);
    setTimeout(() => {
      setSimulatedNotification(null);
    }, 10000);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (userCodeInput.trim() === otpCode) {
      onUnlockSuccess();
      onClose();
    } else {
      setErrorMsg('Incorrect verification code. Please check the code sent or request a new one.');
    }
  };

  const handleVerifyPIN = (e) => {
    e.preventDefault();
    const adminPin = getAdminPIN();
    if (pinInput.trim() === adminPin) {
      onUnlockSuccess();
      onClose();
    } else {
      setErrorMsg('Incorrect Master Security PIN.');
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
            🔒 Verification is required to <strong>{actionTitle}</strong>.
          </p>

          {/* Simulated SMS/Email Notification Banner */}
          {simulatedNotification && (
            <div className="sms-banner">
              <div className="sms-banner-content">
                <Smartphone size={18} className="sms-icon" />
                <div>
                  <strong>Verification Code Message:</strong>
                  <div className="code-highlight">{otpCode}</div>
                </div>
              </div>
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${authMode === 'otp' ? 'auth-tab-active' : ''}`}
              onClick={() => { setAuthMode('otp'); setErrorMsg(''); }}
            >
              <Mail size={16} />
              <span>Email / Text Code</span>
            </button>
            <button
              className={`auth-tab ${authMode === 'pin' ? 'auth-tab-active' : ''}`}
              onClick={() => { setAuthMode('pin'); setErrorMsg(''); }}
            >
              <KeyRound size={16} />
              <span>Master Admin PIN</span>
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
                    placeholder="123456"
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
                <label>Enter Master Admin PIN</label>
                <input
                  type="password"
                  maxLength={10}
                  autoFocus
                  className="input-control"
                  placeholder="Default: 1234"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                />
                <p className="help-text">Default PIN is <code>1234</code> (Can be customized in Settings).</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <ShieldCheck size={16} />
                  <span>Verify PIN</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
