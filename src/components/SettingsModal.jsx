import React, { useState, useEffect } from 'react';
import { X, Settings, KeyRound, Save, Check, Lock, Unlock } from 'lucide-react';
import { getAdminPIN, setAdminPIN, isSecurityLockEnabled, setSecurityLockEnabled } from '../services/authService';

export const SettingsModal = ({ isOpen, onClose }) => {
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
                <h4 className="setting-title flex-align-gap">
                  {lockEnabled ? <Lock size={16} className="text-danger" /> : <Unlock size={16} className="text-success" />}
                  <span>Require Security Passcode for Editing & Deleting</span>
                </h4>
                <p className="setting-desc">
                  When enabled, visitors must enter a 6-digit text/email code or 6-digit Admin Passcode to edit, add, delete, or import contacts.
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
                placeholder="Enter current 6-digit code"
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
                placeholder="Enter new 6 digits"
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
                  placeholder="Re-enter new 6-digit code"
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
