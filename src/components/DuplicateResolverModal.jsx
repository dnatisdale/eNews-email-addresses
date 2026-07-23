import React from 'react';
import { X, GitMerge, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { mergeContacts } from '../services/deduplicator';

export const DuplicateResolverModal = ({
  isOpen,
  onClose,
  duplicates = [],
  onResolveDuplicate
}) => {
  if (!isOpen || duplicates.length === 0) return null;

  const currentDup = duplicates[0];
  const remainingCount = duplicates.length;

  const handleMerge = () => {
    const merged = mergeContacts(currentDup.existing, currentDup.incoming);
    onResolveDuplicate({ action: 'merge', merged, existingId: currentDup.existing.id, incomingId: currentDup.incoming.id });
  };

  const handleKeepExisting = () => {
    onResolveDuplicate({ action: 'keep_existing', existingId: currentDup.existing.id, incomingId: currentDup.incoming.id });
  };

  const handleOverwrite = () => {
    onResolveDuplicate({ action: 'overwrite', newContact: currentDup.incoming, existingId: currentDup.existing.id });
  };

  const handleSkipAll = () => {
    onResolveDuplicate({ action: 'skip_all' });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content duplicate-modal">
        <div className="modal-header">
          <div className="modal-title-wrap text-warning">
            <AlertTriangle className="modal-icon text-warning" />
            <h2>Duplicate Contact Detected ({remainingCount} Left)</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="dup-reason-badge">
            <strong>Reason:</strong> {currentDup.reason} ({currentDup.matchType})
          </p>

          <div className="dup-comparison-grid">
            {/* Existing Contact Card */}
            <div className="dup-card existing-card">
              <span className="card-tag">EXISTING CONTACT</span>
              <h3>{currentDup.existing.firstName} {currentDup.existing.lastName}</h3>
              <p className="email-text">✉️ {currentDup.existing.email || 'No email'}</p>
              {currentDup.existing.secondaryEmail && <p className="sub-text">Work: {currentDup.existing.secondaryEmail}</p>}
              <p className="sub-text">📞 {currentDup.existing.phone || 'No phone'}</p>
              <p className="sub-text">🏷️ {currentDup.existing.categories ? currentDup.existing.categories.join(', ') : ''}</p>
              {currentDup.existing.notes && <p className="notes-text">📝 {currentDup.existing.notes}</p>}
            </div>

            <div className="dup-vs-divider">
              <ArrowRight size={24} />
            </div>

            {/* Incoming / New Contact Card */}
            <div className="dup-card incoming-card">
              <span className="card-tag tag-new">NEW / INCOMING</span>
              <h3>{currentDup.incoming.firstName} {currentDup.incoming.lastName}</h3>
              <p className="email-text">✉️ {currentDup.incoming.email || 'No email'}</p>
              {currentDup.incoming.secondaryEmail && <p className="sub-text">Work: {currentDup.incoming.secondaryEmail}</p>}
              <p className="sub-text">📞 {currentDup.incoming.phone || 'No phone'}</p>
              <p className="sub-text">🏷️ {currentDup.incoming.categories ? currentDup.incoming.categories.join(', ') : ''}</p>
              {currentDup.incoming.notes && <p className="notes-text">📝 {currentDup.incoming.notes}</p>}
            </div>
          </div>
        </div>

        <div className="modal-footer dup-footer">
          <button className="btn btn-secondary btn-sm" onClick={handleSkipAll}>
            Skip All Duplicates
          </button>

          <div className="action-buttons-group">
            <button className="btn btn-secondary" onClick={handleKeepExisting}>
              Keep Existing Only
            </button>
            <button className="btn btn-outline" onClick={handleOverwrite}>
              Overwrite Existing
            </button>
            <button className="btn btn-primary" onClick={handleMerge}>
              <GitMerge size={16} />
              <span>Smart Merge Both</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
