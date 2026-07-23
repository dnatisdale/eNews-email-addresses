import React, { useState, useEffect } from 'react';
import { X, Settings, Shield, KeyRound, Save, Check } from 'lucide-react';
import { getAdminPIN, setAdminPIN, isSecurityLockEnabled, setSecurityLockEnabled } from '../services/authService';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [lockEnabled, setLockEnabledState] = useState(true);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLockEnabledState(isSecurityLockEnabled());
      setCurrentPin('');
      setNewPin('');
      setSavedSuccess(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // If changing PIN, verify current PIN
    if (newPin.trim()) {
      const activePin = getAdminPIN();
      if (currentPin.trim() !== activePin) {
        setErrorMsg('Current Master PIN is incorrect.');
        return;
      }
      if (newPin.trim().length < 4) {
        setErrorMsg('New PIN must be at least 4 characters/digits.');
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
          <div className="modal-title-wrap">
            <Settings className="modal-icon" />
            <h2>Security & App Settings</h2>
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

          {/* Toggle Security Lock */}
          <div className="settings-section">
            <div className="setting-row">
              <div>
                <h4 className="setting-title">Require Verification Code for Editing</h4>
                <p className="setting-desc">
                  When enabled, visitors must enter a 6-digit text/email code or Master PIN to add, edit, delete, or import contacts.
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

          {/* Change Master PIN Section */}
          <div className="settings-section">
            <h4 className="setting-title"><KeyRound size={16} /> Change Master Admin PIN</h4>
            <div className="form-group mt-2">
              <label>Current PIN</label>
              <input
                type="password"
                className="input-control"
                placeholder="Current PIN (Default: 1234)"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
              />
            </div>
            <div className="form-group mt-2">
              <label>New PIN</label>
              <input
                type="password"
                className="input-control"
                placeholder="Enter new PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
              />
            </div>
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
