import React, { useState, useEffect } from 'react';
import { X, Settings, KeyRound, Save, Check, Lock, Unlock, Type, Mail, Phone, Tag } from 'lucide-react';
import { getAdminPIN, setAdminPIN, isSecurityLockEnabled, setSecurityLockEnabled } from '../services/authService';

export const SettingsModal = ({ isOpen, onClose, fontSize = 100, setFontSize }) => {
  const [lockEnabled, setLockEnabledState] = useState(true);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLockEnabledState(isSecurityLockEnabled());
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setSavedSuccess(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentScale = typeof fontSize === 'number' ? fontSize : 100;

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // If changing Admin Passcode
    if (newPin.trim()) {
      const activePin = getAdminPIN();
      if (currentPin.trim() !== activePin) {
        setErrorMsg('Current Admin Code is incorrect.');
        return;
      }
      if (newPin.trim().length !== 6 || !/^\d{6}$/.test(newPin.trim())) {
        setErrorMsg('New Admin Code must be exactly 6 numeric digits.');
        return;
      }
      if (newPin.trim() !== confirmPin.trim()) {
        setErrorMsg('New Admin Code and Confirmation do not match.');
        return;
      }
      setAdminPIN(newPin.trim());
    }

    setSecurityLockEnabled(lockEnabled);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content settings-modal">
        <div className="modal-header">
          <div className="modal-title-wrap text-primary">
            <Settings className="modal-icon text-primary" />
            <h2>Security &amp; Display Settings</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="modal-body">
          {savedSuccess && (
            <div className="success-alert">
              <Check size={16} />
              <span>Settings saved successfully!</span>
            </div>
          )}

          {errorMsg && <div className="error-alert">{errorMsg}</div>}

          {/* Font Size & Smartphone Range Slider Section */}
          <div className="settings-section">
            <h4 className="setting-title flex-align-gap">
              <Type size={16} className="text-primary" />
              <span>Font Size &amp; Smartphone Scaling</span>
            </h4>
            <p className="setting-desc mb-3">
              Drag the slider below to adjust text scaling across the app for smartphone or desktop viewing.
            </p>

            {/* Slider Control */}
            <div className="font-slider-container">
              <span className="slider-label-min">A-</span>
              <input
                type="range"
                min="80"
                max="140"
                step="5"
                className="font-range-slider"
                value={currentScale}
                onChange={(e) => setFontSize && setFontSize(Number(e.target.value))}
              />
              <span className="slider-label-max">A+</span>
              <span className="font-percentage-badge">{currentScale}%</span>
            </div>

            {/* Live Example Preview Box */}
            <div className="font-example-box">
              <div className="example-box-header">
                <span className="example-tag">LIVE PREVIEW ({currentScale}%)</span>
              </div>
              <div className="example-box-content" style={{ fontSize: `${(16 * currentScale) / 100}px` }}>
                <h3 className="example-name">Eleanor Tisdale</h3>
                <div className="example-detail-row">
                  <Mail size={14} className="text-primary" />
                  <span>eleanor.tisdale@example.com</span>
                </div>
                <div className="example-detail-row">
                  <Phone size={14} className="text-success" />
                  <span>(555) 234-5678</span>
                </div>
                <div className="example-detail-row">
                  <Tag size={14} className="text-warning" />
                  <span className="example-category-badge">*EXAMPLES*</span>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Security Lock */}
          <div className="settings-section">
            <div className="setting-row">
              <div>
                <h4 className="setting-title flex-align-gap">
                  {lockEnabled ? <Lock size={16} className="text-danger" /> : <Unlock size={16} className="text-success" />}
                  <span>Require Security Passcode for Editing &amp; Deleting</span>
                </h4>
                <p className="setting-desc">
                  When enabled, visitors must enter a 6-digit passcode to edit, add, delete, or import contacts.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={lockEnabled}
                  onChange={(e) => setLockEnabledState(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Change 6-Digit Admin Code Section */}
          <div className="settings-section">
            <h4 className="setting-title flex-align-gap">
              <KeyRound size={16} className="text-primary" />
              <span>Change 6-Digit Admin Security Code</span>
            </h4>
            <p className="setting-desc mb-2">Configure your private 6-digit Admin Code below.</p>

            <div className="form-group mt-2">
              <label>Current Admin Code</label>
              <input
                type="password"
                maxLength={6}
                className="input-control"
                placeholder="XXXXXX"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
              />
            </div>
            <div className="form-group mt-2">
              <label>New 6-Digit Admin Code</label>
              <input
                type="password"
                maxLength={6}
                className="input-control"
                placeholder="XXXXXX"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
              />
            </div>
            {newPin && (
              <div className="form-group mt-2">
                <label>Confirm New 6-Digit Admin Code</label>
                <input
                  type="password"
                  maxLength={6}
                  className="input-control"
                  placeholder="XXXXXX"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
