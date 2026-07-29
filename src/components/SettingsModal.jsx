import React, { useState, useEffect } from 'react';
import { X, Settings, KeyRound, Save, Check, Lock, Unlock, Type, Mail, Phone, Tag, ShieldCheck, RotateCcw, Download, Trash2, Plus } from 'lucide-react';
import { getAdminPIN, setAdminPIN, isSecurityLockEnabled, setSecurityLockEnabled } from '../services/authService';
import { getRollingBackups, downloadBackupFile, emailBackup, deleteRollingBackup, createRollingBackup } from '../services/backupService';

export const SettingsModal = ({ isOpen, onClose, fontSize = 100, setFontSize, contacts = [], masterCategories = [], nameSortOrder = 'last', onSetNameSortOrder, onRestoreBackup, onFactoryReset }) => {
  const [lockEnabled, setLockEnabledState] = useState(true);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [backups, setBackups] = useState([]);

  const loadBackups = () => {
    setBackups(getRollingBackups());
  };

  useEffect(() => {
    if (isOpen) {
      setLockEnabledState(isSecurityLockEnabled());
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setSavedSuccess(false);
      setErrorMsg('');
      loadBackups();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentScale = typeof fontSize === 'number' ? fontSize : 100;

  const handleCreateManualBackup = () => {
    createRollingBackup(contacts, masterCategories, 'Manual User Backup');
    loadBackups();
  };

  const handleDeleteBackupItem = (id) => {
    deleteRollingBackup(id);
    loadBackups();
  };

  const handleRestoreItem = (backup) => {
    if (!backup || !backup.data) return;
    if (window.confirm(`Are you sure you want to restore snapshot from ${backup.formattedDate} containing ${backup.contactCount} contacts? This will replace your current active list.`)) {
      if (onRestoreBackup) {
        onRestoreBackup(backup.data.contacts, backup.data.masterCategories);
      }
      onClose();
    }
  };

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
            <h2>Security & Display Settings</h2>
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

          {/* 5-Version Rolling Backups Section */}
          <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 className="setting-title flex-align-gap" style={{ margin: 0 }}>
                <ShieldCheck size={18} className="text-success" />
                <span>5-Version Rolling Backups</span>
              </h4>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={handleCreateManualBackup}
                title="Create a new backup snapshot right now"
              >
                <Plus size={13} />
                <span>Create Backup Now</span>
              </button>
            </div>
            <p className="setting-desc mb-3">
              The app automatically keeps your 5 most recent database snapshots. You can download, email, or restore any snapshot at any time.
            </p>

            {backups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
                No backup snapshots stored yet. Click "Create Backup Now" above to save your first snapshot.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {backups.map((b, idx) => (
                  <div
                    key={b.id || idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-main)' }}>
                        #{idx + 1} — {b.formattedDate || new Date(b.timestamp).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <strong>{b.contactCount} contacts</strong> • {b.note || 'Automatic Backup'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => handleRestoreItem(b)}
                        title="Restore active directory to this snapshot"
                        style={{ color: '#60a5fa' }}
                      >
                        <RotateCcw size={12} />
                        <span>Restore</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => downloadBackupFile(b)}
                        title="Download JSON backup file"
                      >
                        <Download size={12} />
                        <span>JSON</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => emailBackup(b)}
                        title="Email or share backup"
                      >
                        <Mail size={12} />
                        <span>Email</span>
                      </button>

                      <button
                        type="button"
                        className="btn-icon btn-xs text-danger"
                        onClick={() => handleDeleteBackupItem(b.id)}
                        title="Delete snapshot from rolling history"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Font Size & Smartphone Range Slider Section */}
          <div className="settings-section">
            <h4 className="setting-title flex-align-gap">
              <Type size={16} className="text-primary" />
              <span>Font Size & Smartphone Scaling</span>
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
                  <span className="example-category-badge">Family</span>
                </div>
              </div>
            </div>
          </div>

          {/* Name Sorting Preference */}
          <div className="settings-section">
            <h4 className="setting-title flex-align-gap">
              <Type size={16} className="text-primary" />
              <span>Name Sorting Preference</span>
            </h4>
            <p className="setting-desc mb-3">
              Choose whether contact names in your list should be arranged and sorted by First Name or Last Name.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="radio"
                  name="nameSortOrderModal"
                  value="first"
                  checked={nameSortOrder === 'first'}
                  onChange={() => onSetNameSortOrder && onSetNameSortOrder('first')}
                />
                <span><strong>First Name</strong> (e.g. Eleanor Tisdale)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="radio"
                  name="nameSortOrderModal"
                  value="last"
                  checked={nameSortOrder === 'last'}
                  onChange={() => onSetNameSortOrder && onSetNameSortOrder('last')}
                />
                <span><strong>Last Name</strong> (e.g. Tisdale, Eleanor)</span>
              </label>
            </div>
          </div>

          {/* Toggle Security Lock */}
          <div className="settings-section">
            <div className="setting-row">
              <div>
                <h4 className="setting-title flex-align-gap">
                  {lockEnabled ? <Lock size={16} className="text-danger" /> : <Unlock size={16} className="text-success" />}
                  <span>Require Security Passcode for Editing & Deleting</span>
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

          {/* Danger Zone */}
          <div className="settings-section" style={{ border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <h4 className="setting-title flex-align-gap text-danger">
              <ShieldAlert size={16} />
              <span>Danger Zone</span>
            </h4>
            <p className="setting-desc mb-3 text-danger" style={{ opacity: 0.9 }}>
              Irreversible actions. Please be certain before proceeding.
            </p>
            <button
              type="button"
              className="btn btn-outline-danger btn-block"
              onClick={() => {
                if (window.confirm('⚠️ WARNING: This will permanently delete ALL contacts and tags from your cloud database across all devices. This cannot be undone. Are you absolutely sure?')) {
                  if (window.confirm('Are you REALLY sure? Type "YES" to proceed... well, just click OK.')) {
                    if (onFactoryReset) {
                      onFactoryReset();
                      onClose();
                    } else {
                      alert('Please use the "Clean & Repair DB" button in the menu, or select all contacts and delete them.');
                    }
                  }
                }
              }}
            >
              <Trash2 size={16} />
              <span>Factory Reset Database</span>
            </button>
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
