import React from 'react';
import { X, Printer } from 'lucide-react';

export const PrintView = ({ isOpen, onClose, contacts = [], availableColumns = [], visibleColumns = [], columnWidths = {} }) => {
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
              {availableColumns.filter(c => visibleColumns.includes(c.id)).map(col => {
                if (col.id === 'actions' || col.id === 'checkbox') return null;
                return (
                  <th key={col.id} style={{ width: columnWidths[col.id] }}>
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, idx) => (
              <tr key={c.id || idx}>
                {availableColumns.filter(c => visibleColumns.includes(c.id)).map(col => {
                  if (col.id === 'actions' || col.id === 'checkbox') return null;
                  
                  let val;
                  if (col.id === 'index') val = idx + 1;
                  else if (col.id === 'name') val = <strong>{c.firstName} {c.lastName}</strong>;
                  else if (col.id === 'email') val = <code>{c.email}</code>;
                  else if (col.id === 'categories') val = c.categories ? c.categories.join(', ') : '';
                  else if (c.customFields && c.customFields[col.id]) val = c.customFields[col.id];
                  else val = c[col.id] || '-';
                  
                  return (
                    <td key={col.id} className={col.id === 'notes' ? 'print-notes' : ''}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
