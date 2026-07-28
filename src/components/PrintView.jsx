import React, { useState } from 'react';
import { X, Printer, Grid, LayoutList } from 'lucide-react';
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
  const [printLayoutMode, setPrintLayoutMode] = useState('table'); // 'table', 'labels2', 'labels3'
  const [pageMargins, setPageMargins] = useState(8);
  const [printTitle, setPrintTitle] = useState('eNews Family & Friends Contact Directory');
  const [printSubtitle, setPrintSubtitle] = useState(`Generated on ${new Date().toLocaleDateString()} • Total Contacts: ${contacts.length}`);
  const [localColumnWidths, setLocalColumnWidths] = useState(columnWidths);
  const [showColumnAdjustments, setShowColumnAdjustments] = useState(false);

  if (!isOpen) return null;

  const scaleRatio = textScale / 100;

  const handlePrint = () => {
    const originalTitle = document.title;
    const dateStamp = new Date().toISOString().split('T')[0];
    const safeTitle = printTitle.replace(/[/\\?%*:|"<>]/g, '-');
    document.title = `${safeTitle} - ${dateStamp}`;
    
    window.print();
    
    document.title = originalTitle;
  };

  const totalVisibleWidth = availableColumns
    .filter(c => visibleColumns.includes(c.id) && c.id !== 'actions' && c.id !== 'checkbox')
    .reduce((sum, col) => sum + getColWidth(col.id, localColumnWidths), 0);

  // Dynamic box sizes for accuracy boxes scaling
  const boxWidth = Math.max(4, Math.round(10 * scaleRatio));
  const boxHeight = Math.max(6, Math.round(14 * scaleRatio));
  const boxGap = Math.max(1, Math.round(3 * scaleRatio));

  return (
    <div className="modal-backdrop print-modal-backdrop">
      <div className="print-toolbar no-print">
        <div className="toolbar-header" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <div className="toolbar-info">
            <h3 style={{ marginBottom: '0.5rem' }}>Print & PDF Options</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Format for physical paper printing, directory lists, or address label sheets ({contacts.length} Contacts)</p>
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
          {/* Print Layout Mode */}
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Print Layout</label>
            <select className="select-control" value={printLayoutMode} onChange={e => setPrintLayoutMode(e.target.value)} style={{ width: 'auto', minWidth: '160px', borderRadius: '9999px', padding: '0.4rem 1rem' }}>
              <option value="table">📋 Directory Table</option>
              <option value="labels2">🏷️ 2-Column Address Labels</option>
              <option value="labels3">🏷️ 3-Column Address Labels</option>
            </select>
          </div>

          {/* Orientation */}
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Orientation</label>
            <select className="select-control" value={orientation} onChange={e => setOrientation(e.target.value)} style={{ width: 'auto', minWidth: '160px', borderRadius: '9999px', padding: '0.4rem 1rem' }}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          {/* Page Margins */}
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Page Margins ({pageMargins}%)</label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={pageMargins} 
              onChange={e => setPageMargins(Number(e.target.value))} 
              style={{ width: '160px', cursor: 'pointer' }}
            />
          </div>

          {/* Text Size Scale */}
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Text & Box Scale ({textScale}%)</label>
            <input type="range" min="40" max="200" value={textScale} onChange={e => setTextScale(Number(e.target.value))} style={{ width: '160px', cursor: 'pointer' }} />
          </div>

          {/* Table Column Width Mode (Only in Table view) */}
          {printLayoutMode === 'table' && (
            <div className="setting-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Column Layout</label>
              <select className="select-control" value={widthMode} onChange={e => setWidthMode(e.target.value)} style={{ width: '160px', borderRadius: '9999px', padding: '0.4rem 1rem' }}>
                <option value="proportional">Match Screen Layout</option>
                <option value="auto">Auto-Fit (Wrap Text)</option>
              </select>
            </div>
          )}
        </div>
        
        {printLayoutMode === 'table' && (
          <div style={{ marginTop: '1.5rem', width: '100%' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowColumnAdjustments(!showColumnAdjustments)}
              style={{ fontSize: '0.85rem', padding: '0.75rem', borderRadius: '9999px', width: '100%', justifyContent: 'center' }}
            >
              {showColumnAdjustments ? 'Hide Column Adjustments' : 'Adjust Individual Column Widths'}
            </button>
          </div>
        )}
        
        {printLayoutMode === 'table' && showColumnAdjustments && (
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
            font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
            font-size: 0.8rem;
          }
        }
        .print-title-input, .print-subtitle-input {
          width: 100%;
          border: 1px dashed transparent;
          background: transparent;
          text-align: left;
          outline: none;
        }
        .print-title-input {
          font-size: ${2.0 * scaleRatio}rem !important;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 0.3rem;
          color: #0f172a;
          line-height: 1.2;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .print-subtitle-input {
          font-size: ${1.0 * scaleRatio}rem !important;
          color: #64748b;
          margin-bottom: 1.25rem;
          line-height: 1.3;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        @media print {
          .print-title-input, .print-subtitle-input {
            border-color: transparent !important;
          }
          .rolodex-container, .mobile-bottom-nav {
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
          .address-label-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
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
          width: 100%;
          border-collapse: collapse;
          font-size: ${0.85 * scaleRatio}rem !important;
          table-layout: ${widthMode === 'auto' ? 'auto' : 'fixed'} !important;
        }
        .printable-table th, .printable-table td {
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
          white-space: normal !important;
          padding: calc(0.45rem * ${scaleRatio}) calc(0.6rem * ${scaleRatio});
          font-size: ${0.85 * scaleRatio}rem !important;
        }
        .printable-table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #f1f5f9;
          font-size: ${0.85 * scaleRatio}rem !important;
        }
        .printable-page-container {
          max-width: ${orientation === 'landscape' ? '1400px' : '1000px'} !important;
          transition: padding 0.2s;
        }
        @media screen and (min-width: 768px) {
          .printable-page-container {
            padding: 2rem 3rem;
          }
        }
        @media screen and (max-width: 767px) {
          .printable-page-container {
            padding: 1rem;
          }
        }

        /* ── Address Labels Styles (2 & 3 Column Grids) ── */
        .address-labels-container {
          display: grid;
          gap: calc(0.85rem * ${scaleRatio});
          width: 100%;
          margin-top: 1rem;
        }
        .labels-grid-2 {
          grid-template-columns: repeat(2, 1fr);
        }
        .labels-grid-3 {
          grid-template-columns: repeat(3, 1fr);
        }
        .address-label-card {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: calc(0.75rem * ${scaleRatio});
          background: #ffffff;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          gap: calc(0.3rem * ${scaleRatio});
          font-size: calc(0.85rem * ${scaleRatio});
          word-break: break-word;
          overflow-wrap: anywhere;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .label-card-name {
          font-size: calc(1.05rem * ${scaleRatio});
          font-weight: 700;
          color: #0f172a;
          line-height: 1.25;
        }
        .label-card-address {
          font-size: calc(0.9rem * ${scaleRatio});
          color: #334155;
          font-weight: 500;
          line-height: 1.35;
        }
        .label-no-address {
          color: #94a3b8;
          font-style: italic;
          font-size: calc(0.82rem * ${scaleRatio});
        }
        .label-card-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: calc(0.82rem * ${scaleRatio});
          color: #475569;
        }
        .label-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-top: 0.2rem;
        }
        .label-tag-pill {
          font-size: calc(0.68rem * ${scaleRatio});
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          background: #f1f5f9;
          color: #2563eb;
          border: 1px solid #e2e8f0;
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

          {/* Mode 1: Directory Table */}
          {printLayoutMode === 'table' && (
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
                        val = (
                          <div className="accuracy-boxes-grid" title={accuracy.tooltip} style={{ display: 'inline-flex', verticalAlign: 'middle', gap: `${boxGap}px`, padding: `${Math.max(1, Math.round(2 * scaleRatio))}px` }}>
                            {(accuracy.boxes || []).map((b) => (
                              <div 
                                key={b.key} 
                                className={`accuracy-box ${b.present ? 'filled' : 'empty'}`}
                                style={{ width: `${boxWidth}px`, height: `${boxHeight}px` }}
                              />
                            ))}
                          </div>
                        );
                      }
                      else if (col.id === 'name') val = <strong>{c.firstName} {c.lastName}</strong>;
                      else if (col.id === 'categories') {
                        const cats = Array.isArray(c.categories) ? [...c.categories] : [];
                        if (c.status && c.status !== 'Active' && !cats.includes(c.status)) {
                          cats.push(`[${c.status.toUpperCase()}]`);
                        }
                        val = cats.join(', ') || '-';
                      }
                      else if (c.customFields && c.customFields[col.id]) val = c.customFields[col.id];
                      else val = c[col.id] || '-';
                      
                      return (
                        <td key={col.id} className={col.id === 'notes' ? 'print-notes' : ''} style={{ 
                          textAlign: (col.id === 'index' || col.id === 'score') ? 'center' : 'left'
                        }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Mode 2 & 3: Address Labels (2-Column or 3-Column Grid) */}
          {(printLayoutMode === 'labels2' || printLayoutMode === 'labels3') && (
            <div className={`address-labels-container labels-grid-${printLayoutMode === 'labels2' ? '2' : '3'}`}>
              {contacts.map((c, idx) => (
                <div key={c.id || idx} className="address-label-card">
                  <div className="label-card-header">
                    <strong className="label-card-name">{c.firstName} {c.lastName}</strong>
                  </div>
                  <div className="label-card-address">
                    {c.address ? c.address : <span className="label-no-address">No Address Listed</span>}
                  </div>
                  <div className="label-card-details">
                    {c.email && <div className="label-detail-item">📧 {c.email}</div>}
                    {c.phone && <div className="label-detail-item">📞 {c.phone}</div>}
                  </div>
                  {Array.isArray(c.categories) && c.categories.length > 0 && (
                    <div className="label-card-tags">
                      {c.categories.map((cat, i) => (
                        <span key={i} className="label-tag-pill">{cat}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
