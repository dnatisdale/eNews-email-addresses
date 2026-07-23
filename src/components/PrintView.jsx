import React from 'react';
import { X, Printer } from 'lucide-react';

export const PrintView = ({ isOpen, onClose, contacts = [] }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop print-modal-backdrop">
      <div className="print-toolbar no-print">
        <div className="toolbar-info">
          <h3>Printable eNews Directory</h3>
          <p>Formatted for physical paper printing or saving as PDF ({contacts.length} Contacts)</p>
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            <X size={16} />
            <span>Close Preview</span>
          </button>
        </div>
      </div>

      <div className="printable-page-container">
        <div className="print-header">
          <h1>eNews Family & Friends Contact Directory</h1>
          <p className="print-meta">Generated on {new Date().toLocaleDateString()} • Total Contacts: {contacts.length}</p>
        </div>

        <table className="printable-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Primary Email</th>
              <th>Secondary Email</th>
              <th>Phone</th>
              <th>Group</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, idx) => (
              <tr key={c.id || idx}>
                <td>{idx + 1}</td>
                <td><strong>{c.firstName} {c.lastName}</strong></td>
                <td><code>{c.email}</code></td>
                <td>{c.secondaryEmail || '-'}</td>
                <td>{c.phone || '-'}</td>
                <td>{c.group}</td>
                <td>{c.status}</td>
                <td className="print-notes">{c.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
