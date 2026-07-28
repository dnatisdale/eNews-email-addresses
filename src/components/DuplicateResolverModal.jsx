import React from 'react';
import { X, GitMerge, AlertTriangle, ArrowRight, ArrowDown, SkipForward, Ban, CheckCircle, RefreshCw, Mail, Briefcase, Phone, Tag, FileText } from 'lucide-react';

export const DuplicateResolverModal = ({
  isOpen,
  onClose,
  duplicates = [],
  onResolve
}) => {
  if (!isOpen || duplicates.length === 0) return null;

  const currentDup = duplicates[0];
  const remainingCount = duplicates.length;

  const handleMerge = () => {
    onResolve({
      action: 'merge',
      existingId: currentDup.existing.id,
      incomingId: currentDup.incoming?.id
    });
  };

  const handleKeepExisting = () => {
    onResolve({
      action: 'keep_existing',
      existingId: currentDup.existing.id,
      incomingId: currentDup.incoming?.id
    });
  };

  const handleOverwrite = () => {
    onResolve({
      action: 'overwrite',
      existingId: currentDup.existing.id,
      incomingId: currentDup.incoming?.id,
      incoming: currentDup.incoming
    });
  };

  const handleSkipOne = () => {
    onResolve({ action: 'skip_one' });
  };

  const handleSkipAll = () => {
    onResolve({ action: 'skip_all' });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content duplicate-modal">
        <div className="modal-header">
          <div className="modal-title-wrap text-warning">
            <AlertTriangle className="modal-icon text-warning" size={22} />
            <div>
              <h2>Duplicate Contact Detected</h2>
              <span className="dup-count-subtitle">
                {remainingCount} duplicate{remainingCount > 1 ? 's' : ''} remaining to resolve
              </span>
            </div>
          </div>
          <button className="icon-close-btn" onClick={handleSkipAll} title="Skip remaining duplicates and close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="dup-reason-badge">
            <span className="reason-label">Reason:</span>
            <span className="reason-text">{currentDup.reason}</span>
            {currentDup.matchType && <span className="match-type-pill">{currentDup.matchType}</span>}
          </div>

          <div className="dup-comparison-grid">
            {/* Existing Contact Card */}
            <div className="dup-card existing-card">
              <div className="dup-card-header">
                <span className="card-tag tag-existing">EXISTING CONTACT</span>
              </div>
              <h3 className="dup-contact-name">
                {currentDup.existing.firstName || ''} {currentDup.existing.lastName || ''}
              </h3>
              <div className="dup-contact-details">
                <p className="detail-row">
                  <Mail size={14} className="detail-icon text-primary" />
                  <span className="detail-val">{currentDup.existing.email || 'No email'}</span>
                </p>
                {currentDup.existing.secondaryEmail && (
                  <p className="detail-row">
                    <Briefcase size={14} className="detail-icon text-secondary" />
                    <span className="detail-val">{currentDup.existing.secondaryEmail}</span>
                  </p>
                )}
                <p className="detail-row">
                  <Phone size={14} className="detail-icon text-success" />
                  <span className="detail-val">{currentDup.existing.phone || 'No phone'}</span>
                </p>
                {currentDup.existing.categories && currentDup.existing.categories.length > 0 && (
                  <p className="detail-row">
                    <Tag size={14} className="detail-icon text-warning" />
                    <span className="detail-val">{currentDup.existing.categories.join(', ')}</span>
                  </p>
                )}
                {currentDup.existing.notes && (
                  <p className="detail-row notes-row">
                    <FileText size={14} className="detail-icon text-muted" />
                    <span className="detail-val">{currentDup.existing.notes}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Visual Direction Arrow / Divider */}
            <div className="dup-vs-divider" title="Comparing existing with incoming">
              <span className="divider-desktop"><ArrowRight size={22} /></span>
              <span className="divider-mobile"><ArrowDown size={22} /></span>
            </div>

            {/* Incoming / New Contact Card */}
            <div className="dup-card incoming-card">
              <div className="dup-card-header">
                <span className="card-tag tag-new">NEW / INCOMING</span>
              </div>
              <h3 className="dup-contact-name">
                {currentDup.incoming.firstName || ''} {currentDup.incoming.lastName || ''}
              </h3>
              <div className="dup-contact-details">
                <p className="detail-row">
                  <Mail size={14} className="detail-icon text-primary" />
                  <span className="detail-val">{currentDup.incoming.email || 'No email'}</span>
                </p>
                {currentDup.incoming.secondaryEmail && (
                  <p className="detail-row">
                    <Briefcase size={14} className="detail-icon text-secondary" />
                    <span className="detail-val">{currentDup.incoming.secondaryEmail}</span>
                  </p>
                )}
                <p className="detail-row">
                  <Phone size={14} className="detail-icon text-success" />
                  <span className="detail-val">{currentDup.incoming.phone || 'No phone'}</span>
                </p>
                {currentDup.incoming.categories && currentDup.incoming.categories.length > 0 && (
                  <p className="detail-row">
                    <Tag size={14} className="detail-icon text-warning" />
                    <span className="detail-val">{currentDup.incoming.categories.join(', ')}</span>
                  </p>
                )}
                {currentDup.incoming.notes && (
                  <p className="detail-row notes-row">
                    <FileText size={14} className="detail-icon text-muted" />
                    <span className="detail-val">{currentDup.incoming.notes}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="modal-footer dup-footer">
          <div className="dup-primary-actions">
            <button className="btn btn-secondary btn-dup-action" onClick={handleKeepExisting} title="Keep existing contact unchanged">
              <CheckCircle size={16} />
              <span>Keep Existing Only</span>
            </button>
            <button className="btn btn-outline btn-dup-action" onClick={handleOverwrite} title="Replace existing with new incoming contact">
              <RefreshCw size={16} />
              <span>Overwrite Existing</span>
            </button>
            <button className="btn btn-primary btn-dup-action" onClick={handleMerge} title="Merge information from both contacts">
              <GitMerge size={16} />
              <span>Smart Merge Both</span>
            </button>
          </div>

          <div className="dup-secondary-actions">
            <button className="btn btn-ghost btn-sm" onClick={handleSkipOne}>
              <SkipForward size={14} />
              <span>Skip This One</span>
            </button>
            <button className="btn btn-danger-outline btn-sm" onClick={handleSkipAll}>
              <Ban size={14} />
              <span>Skip All Duplicates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
