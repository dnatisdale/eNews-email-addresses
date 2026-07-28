import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, Trash2, X, ShieldAlert } from 'lucide-react';
import { getAdminPIN } from '../services/authService';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirmDelete,
  onConfirm,
  targetCount = 1,
  targetNames = []
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      setAdminCodeInput('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = confirmationInput.trim().toLowerCase() === 'sey';
  const handleActionConfirm = onConfirmDelete || onConfirm;

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!isConfirmed) {
      setErrorMsg('Please type "sey" ("yes" backwards) to confirm deletion.');
      return;
    }

    const correctPin = getAdminPIN();
    if (adminCodeInput.trim() && adminCodeInput.trim() !== correctPin) {
      setErrorMsg('Incorrect Admin Passcode!');
      return;
    }

    setErrorMsg('');
    if (handleActionConfirm) handleActionConfirm();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-md" style={{ maxWidth: '460px' }}>
        <div className="modal-header bg-danger-solid text-white" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
          <div className="flex-align-gap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={24} className="text-warning-glow" />
            <div>
              <h3 className="modal-title text-white" style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                ⚠️ CONFIRM DELETION
              </h3>
              <p className="modal-subtitle text-white-80" style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>
                Moving {targetCount} contact(s) to 60-Day Trash
              </p>
            </div>
          </div>
          <button className="icon-close-btn text-white" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirm}>
          <div className="modal-body">
            <div className="alert-card alert-danger-card" style={{
              display: 'flex',
              gap: '10px',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={22} className="alert-icon text-danger flex-shrink-0" />
              <div>
                <strong style={{ color: '#ef4444' }}>Are you sure you want to delete {targetCount} contact(s)?</strong>
                <p className="alert-subtext" style={{ fontSize: '0.82rem', margin: '4px 0 0 0', opacity: 0.9 }}>
                  Deleted contacts will be moved to the 60-Day Trash & Recovery Bin.
                </p>
              </div>
            </div>

            {targetNames.length > 0 && (
              <div className="delete-names-preview" style={{ marginBottom: '1rem' }}>
                <label className="input-label font-bold" style={{ fontSize: '0.82rem', display: 'block', marginBottom: '4px' }}>
                  Contacts Selected for Deletion:
                </label>
                <ul className="delete-names-list" style={{
                  fontSize: '0.82rem',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  padding: '6px 12px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  margin: 0,
                  listStyle: 'none'
                }}>
                  {targetNames.slice(0, 5).map((name, i) => (
                    <li key={i}>• {name}</li>
                  ))}
                  {targetNames.length > 5 && (
                    <li className="text-muted font-italic">• ...and {targetNames.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            {/* Backwards YES Verification Challenge */}
            <div className="admin-code-verify-box" style={{ marginTop: '1rem' }}>
              <label className="input-label font-bold" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                To confirm deletion, type <strong>sey</strong> (&quot;yes&quot; backwards) below:
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="Type 'sey' to confirm"
                value={confirmationInput}
                onChange={(e) => {
                  setConfirmationInput(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
                required
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: '0.15em',
                  borderColor: isConfirmed ? '#10b981' : undefined
                }}
              />
              <small className="help-text mt-1" style={{ fontSize: '0.78rem', color: isConfirmed ? '#10b981' : 'var(--text-muted)', display: 'block', fontWeight: isConfirmed ? 600 : 400 }}>
                {isConfirmed ? '✓ Confirmation word accepted!' : 'Required: Type "sey" ("yes" typed backwards)'}
              </small>
            </div>

            {errorMsg && <p className="error-text mt-2" style={{ color: '#ef4444', fontSize: '0.82rem' }}>{errorMsg}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel &amp; Keep Contacts
            </button>
            <button 
              type="submit" 
              className="btn btn-danger"
              disabled={!isConfirmed}
              style={{ opacity: isConfirmed ? 1 : 0.5, cursor: isConfirmed ? 'pointer' : 'not-allowed' }}
            >
              <Trash2 size={16} />
              <span>Confirm Delete ({targetCount})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
