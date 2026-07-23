import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, Trash2, X, ShieldAlert } from 'lucide-react';
import { getAdminPIN } from '../services/authService';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirmDelete,
  targetCount = 1,
  targetNames = []
}) => {
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAdminCodeInput('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    const correctPin = getAdminPIN();

    if (adminCodeInput.trim() !== correctPin) {
      setErrorMsg('Incorrect Admin Code. Deletion blocked for security!');
      return;
    }

    setErrorMsg('');
    onConfirmDelete();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-md">
        <div className="modal-header bg-danger-solid text-white">
          <div className="flex-align-gap">
            <ShieldAlert size={24} className="text-warning-glow" />
            <div>
              <h3 className="modal-title text-white">⚠️ HIGH-RISK ACTION: DELETE CONFIRMATION</h3>
              <p className="modal-subtitle text-white-80">Admin Code Verification Required</p>
            </div>
          </div>
          <button className="icon-close-btn text-white" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirm}>
          <div className="modal-body">
            <div className="alert-card alert-danger-card">
              <AlertTriangle size={22} className="alert-icon text-danger" />
              <div>
                <strong>Warning! You are about to delete {targetCount} contact record(s).</strong>
                <p className="alert-subtext">
                  They will be removed from your main address book and moved to the 60-Day Trash & Recovery Bin.
                </p>
              </div>
            </div>

            {targetNames.length > 0 && (
              <div className="delete-names-preview">
                <label className="input-label font-bold">Contacts Selected for Deletion:</label>
                <ul className="delete-names-list">
                  {targetNames.slice(0, 5).map((name, i) => (
                    <li key={i}>• {name}</li>
                  ))}
                  {targetNames.length > 5 && (
                    <li className="text-muted font-italic">• ...and {targetNames.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            <div className="admin-code-verify-box">
              <label className="input-label font-bold flex-align-gap">
                <Lock size={15} className="text-danger" />
                <span>Enter 6-Digit Admin Security Code to Authorize Deletion:</span>
              </label>
              <input
                type="password"
                maxLength={6}
                className="input-control code-input-lg"
                placeholder="Enter 6-digit Admin Code"
                value={adminCodeInput}
                onChange={(e) => {
                  setAdminCodeInput(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
                required
              />
              {errorMsg && <p className="error-text mt-1">{errorMsg}</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel & Keep Contacts
            </button>
            <button type="submit" className="btn btn-danger btn-pulse">
              <Trash2 size={16} />
              <span>Authorize & Delete ({targetCount})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
