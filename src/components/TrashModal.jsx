import React from 'react';
import { X, RotateCcw, Trash2, AlertTriangle, ShieldCheck, Archive } from 'lucide-react';

export const TrashModal = ({
  isOpen,
  onClose,
  trashContacts = [],
  onRestoreContact,
  onRestoreAll,
  onPermanentlyDelete,
  onEmptyTrash
}) => {
  if (!isOpen) return null;

  const getDaysRemaining = (deletedAt) => {
    if (!deletedAt) return 60;
    const deletedTime = new Date(deletedAt).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - deletedTime) / (1000 * 60 * 60 * 24));
    return Math.max(0, 60 - diffDays);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-md">
        <div className="modal-header bg-danger-light">
          <div className="flex-align-gap">
            <Archive size={20} className="text-danger" />
            <div>
              <h3 className="modal-title">Trash & Recovery Bin (60-Day Hold)</h3>
              <p className="modal-subtitle">Contacts remain here for 60 days before automatic deletion.</p>
            </div>
          </div>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {trashContacts.length === 0 ? (
            <div className="empty-trash-state">
              <ShieldCheck size={48} className="text-success" />
              <h4>Trash Bin is Empty</h4>
              <p className="text-muted">Deleted contacts will be stored here safely for 60 days so you can restore them anytime.</p>
            </div>
          ) : (
            <>
              <div className="trash-summary-strip">
                <span>
                  <strong>{trashContacts.length}</strong> deleted contacts in recovery
                </span>
                <div className="trash-header-actions">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={onRestoreAll}
                    title="Restore all items back to address book"
                  >
                    <RotateCcw size={14} />
                    <span>Restore All ({trashContacts.length})</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={onEmptyTrash}
                    title="Permanently empty trash now"
                  >
                    <Trash2 size={14} />
                    <span>Empty Trash</span>
                  </button>
                </div>
              </div>

              <div className="trash-list-scroll">
                <table className="contact-table trash-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Deleted Date</th>
                      <th>Hold Days</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashContacts.map((contact) => {
                      const daysLeft = getDaysRemaining(contact.deletedAt);
                      return (
                        <tr key={contact.id}>
                          <td>
                            <strong>{contact.firstName} {contact.lastName}</strong>
                          </td>
                          <td>
                            <span className="text-muted">{contact.email || '-'}</span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {contact.deletedAt ? new Date(contact.deletedAt).toLocaleDateString() : 'Recently'}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${daysLeft <= 10 ? 'badge-danger' : 'badge-warning'}`}>
                              {daysLeft} days left
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="action-row justify-end">
                              <button
                                className="btn btn-xs btn-primary"
                                onClick={() => onRestoreContact(contact.id)}
                                title="Restore to address book"
                              >
                                <RotateCcw size={13} />
                                <span>Restore</span>
                              </button>
                              <button
                                className="icon-action-btn text-danger"
                                onClick={() => onPermanentlyDelete(contact.id)}
                                title="Delete Permanently"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Recovery Bin
          </button>
        </div>
      </div>
    </div>
  );
};
