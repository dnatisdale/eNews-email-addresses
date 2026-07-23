import React, { useState } from 'react';
import { X, Printer, Settings } from 'lucide-react';
import { getContactAccuracy } from '../services/accuracyEvaluator';

const DEFAULT_PRINT_WIDTHS = {
  checkbox: 45,
  index: 50,
  score: 60,
  name: 210,
  email: 260,
  secondaryEmail: 200,
  phone: 220,
  categories: 160,
  status: 120,
  address: 250,
  notes: 250,
  actions: 100
};

const getColWidth = (id, localWidths) => localWidths[id] || DEFAULT_PRINT_WIDTHS[id] || 150;

export const PrintView = ({ isOpen, onClose, contacts = [], availableColumns = [], visibleColumns = [], columnWidths = {} }) => {
  const [orientation, setOrientation] = useState('portrait');
  const [textScale, setTextScale] = useState(100);
  const [widthMode, setWidthMode] = useState('proportional');
  const [pageMargins, setPageMargins] = useState(8);
  const [printTitle, setPrintTitle] = useState('eNews Family & Friends Contact Directory');
  const [printSubtitle, setPrintSubtitle] = useState(`Generated on ${new Date().toLocaleDateString()} • Total Contacts: ${contacts.length}`);
  const [localColumnWidths, setLocalColumnWidths] = useState(columnWidths);
  const [showColumnAdjustments, setShowColumnAdjustments] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    // Temporarily change document title so "Save as PDF" uses it as the filename
    const originalTitle = document.title;
    const dateStamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Clean title for filename (remove illegal characters if any)
    const safeTitle = printTitle.replace(/[/\\?%*:|"<>]/g, '-');
    document.title = `${safeTitle} - ${dateStamp}`;
    
    window.print();
    
    // Restore original title immediately after print dialog opens
    document.title = originalTitle;
  };

  // Calculate proportional widths so table fits exactly 100% of the printed page
  const totalVisibleWidth = availableColumns
    .filter(c => visibleColumns.includes(c.id) && c.id !== 'actions' && c.id !== 'checkbox')
    .reduce((sum, col) => sum + getColWidth(col.id, localColumnWidths), 0);

  return (
    <div className="modal-backdrop print-modal-backdrop">
      <div className="print-toolbar no-print">
        <div className="toolbar-header" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <div className="toolbar-info">
            <h3 style={{ marginBottom: '0.5rem' }}>Printable eNews Directory</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Formatted for physical paper printing or saving as PDF ({contacts.length} Contacts)</p>
          </div>
          <div className="toolbar-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ borderRadius: '9999px', width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
            <button className="btn btn-secondary" onClick={onClose} style={{ borderRadius: '9999px', width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              <X size={16} />
              <span>Close Preview</span>
            </button>
          </div>
        </div>
        
        <div className="print-settings-menu" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem', width: '100%' }}>
          {/* Orientation */}
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Orientation</label>
            <select className="select-control" value={orientation} onChange={e => setOrientation(e.target.value)} style={{ width: 'auto', minWidth: '160px', borderRadius: '9999px', padding: '0.4rem 1rem' }}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          {/* Margins */}
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Page Margins ({pageMargins}%)</label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={pageMargins} 
              onChange={e => setPageMargins(e.target.value)} 
              style={{ width: '160px', cursor: 'pointer' }}
            />
          </div>

          {/* Columns */}
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Column Widths</label>
            <select className="select-control" value={widthMode} onChange={e => setWidthMode(e.target.value)} style={{ width: '160px', borderRadius: '9999px', padding: '0.4rem 1rem' }}>
              <option value="proportional">Match Screen Layout</option>
              <option value="auto">Auto-Fit Content (Wrap Text)</option>
            </select>
          </div>

          {/* Text Size */}
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Text Size ({textScale}%)</label>
            <input type="range" min="50" max="200" value={textScale} onChange={e => setTextScale(e.target.value)} style={{ width: '160px', cursor: 'pointer' }} />
          </div>
        </div>
        
        <div style={{ marginTop: '1.5rem', width: '100%' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowColumnAdjustments(!showColumnAdjustments)}
            style={{ fontSize: '0.85rem', padding: '0.75rem', borderRadius: '9999px', width: '100%', justifyContent: 'center' }}
          >
            {showColumnAdjustments ? 'Hide Column Adjustments' : 'Adjust Individual Column Widths'}
          </button>
        </div>
        
        {showColumnAdjustments && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem', padding: '1.25rem', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%' }}>
            {availableColumns.filter(c => visibleColumns.includes(c.id) && c.id !== 'actions' && c.id !== 'checkbox').map(col => (
              <div key={col.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {col.label} <span style={{ fontWeight: 'normal', opacity: 0.7 }}>({getColWidth(col.id, localColumnWidths)})</span>
                </label>
                <input 
                  type="range" 
                  min="20" 
                  max="500" 
                  value={getColWidth(col.id, localColumnWidths)} 
                  onChange={e => setLocalColumnWidths({...localColumnWidths, [col.id]: Number(e.target.value)})}
                  style={{ cursor: 'pointer', width: '160px' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @page {
          size: ${orientation === 'landscape' ? 'landscape' : 'portrait'};
          margin: ${(pageMargins / 100) * (orientation === 'landscape' ? 11 : 8.5)}in;
          @bottom-center {
            content: "Page " counter(page) " of " counter(pages);
            font-family: "Inter", system-ui, -apple-system, sans-serif;
            font-size: 0.85rem;
          }
          @top-center {
            font-family: "Inter", system-ui, -apple-system, sans-serif;
            font-size: 0.85rem;
          }
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button {  
           opacity: 1;
        }
        .print-title-input, .print-subtitle-input {
          width: 100%;
          border: 1px dashed transparent;
          background: transparent;
          text-align: left;
          outline: none;
          text-align: left;
        }
        .print-title-input {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        .print-subtitle-input {
          font-size: 1rem;
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        @media print {
          .print-title-input, .print-subtitle-input {
            border-color: transparent !important;
          }
          .rolodex-container {
            display: none !important;
          }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          .printable-table thead th { position: static; }
          html, body, #root, .app-layout, .modal-backdrop, .print-modal-backdrop, .printable-scroll-wrapper {
            background: transparent !important;
            background-color: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
          html, body, #root, .app-layout, .printable-scroll-wrapper, .print-modal-backdrop { 
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            position: static !important;
          }
          .printable-page-container {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
          }
        }
        .print-modal-backdrop {
          overflow: hidden !important;
          flex-direction: row !important;
        }
        .print-toolbar {
          width: 350px !important;
          height: 100vh;
          overflow-y: auto;
          border-right: 1px solid var(--border-color);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem !important;
        }
        .printable-scroll-wrapper {
          flex: 1;
          overflow-y: auto;
          width: 100%;
          height: 100vh;
        }
        .printable-table {
          font-size: ${0.85 * (textScale / 100)}rem !important;
          table-layout: ${widthMode === 'auto' ? 'auto' : 'fixed'} !important;
        }
        .printable-table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #f1f5f9;
        }
        .printable-page-container {
          max-width: ${orientation === 'landscape' ? '1400px' : '1000px'} !important;
          transition: padding 0.2s;
        }
        @media screen and (min-width: 768px) {
          .printable-page-container {
            padding: 2rem 4rem;
          }
        }
        @media screen and (max-width: 767px) {
          .printable-page-container {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="printable-scroll-wrapper">
        <div className="printable-page-container">
          <div className="print-header">
            <h1 
              className="print-title-input"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => setPrintTitle(e.currentTarget.textContent)}
              title="Click to edit title"
            >
              {printTitle}
            </h1>
            <p 
              className="print-subtitle-input"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => setPrintSubtitle(e.currentTarget.textContent)}
              title="Click to edit subtitle"
            >
              {printSubtitle}
            </p>
          </div>

        <table className="printable-table">
          <thead>
            <tr>
              {availableColumns.filter(c => visibleColumns.includes(c.id)).map(col => {
                if (col.id === 'actions' || col.id === 'checkbox') return null;
                const widthPercent = (getColWidth(col.id, localColumnWidths) / totalVisibleWidth) * 100;
                return (
                  <th key={col.id} style={{ 
                    width: widthMode === 'proportional' ? `${widthPercent}%` : 'auto',
                    textAlign: (col.id === 'index' || col.id === 'score') ? 'center' : 'left'
                  }}>
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
                  else if (col.id === 'score') {
                    const accuracy = getContactAccuracy(c);
                    val = <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: accuracy.color }}>{accuracy.grade}</span>;
                  }
                  else if (col.id === 'name') val = <strong>{c.firstName} {c.lastName}</strong>;
                  else if (col.id === 'email') val = <span style={{ color: '#0369a1' }}>{c.email}</span>;
                  else if (col.id === 'categories') val = c.categories ? c.categories.join(', ') : '';
                  else if (c.customFields && c.customFields[col.id]) val = c.customFields[col.id];
                  else val = c[col.id] || '-';
                  
                  return (
                    <td key={col.id} className={col.id === 'notes' ? 'print-notes' : ''} style={{ 
                      textAlign: (col.id === 'index' || col.id === 'score') ? 'center' : 'left',
                      whiteSpace: col.id === 'phone' ? 'nowrap' : undefined
                    }}>
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
    </div>
  );
};
