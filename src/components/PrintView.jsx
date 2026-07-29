import React, { useState } from 'react';
import { X, Printer, LayoutGrid, FileText, Sliders, Eye, Check } from 'lucide-react';
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

/**
 * Smart physical address formatter for mailing labels & directory tables.
 * Ensures:
 * - Comma AFTER City before State (e.g., "Springfield, IL")
 * - NO comma before Zip Code (e.g., "IL 78960" NOT "IL, 78960")
 */
export const formatAddressWithCityComma = (addressRaw) => {
  if (!addressRaw || !addressRaw.trim()) return '';
  let str = addressRaw.trim();

  // Normalize newlines to comma separator
  str = str.replace(/[\r\n]+/g, ', ');

  // Fix comma before ZIP code (e.g., "IL, 78960" -> "IL 78960")
  str = str.replace(/([A-Z]{2}),\s*(\d{5}(?:-\d{4})?)\b/g, '$1 $2');

  // Fix missing comma after City before State (e.g., "Springfield IL" -> "Springfield, IL")
  str = str.replace(/([a-zA-Z.]+)\s+([A-Z]{2})\b/g, (match, city, state) => {
    if (city.endsWith(',')) return `${city} ${state}`;
    return `${city}, ${state}`;
  });

  // Clean double commas
  str = str.replace(/,\s*,/g, ',').trim();
  return str;
};

/**
 * Formats mailing label name strictly as First Name Last Name (e.g., "Dan Tisdale" / "Eleanor Tisdale")
 * regardless of table sorting mode.
 */
export const formatMailingLabelName = (c) => {
  const first = (c.firstName || '').trim();
  const last = (c.lastName || '').trim();
  if (first && last) return `${first} ${last}`;
  return first || last || 'Unnamed Contact';
};

/**
 * Splits formatted physical address into Street line and City, State Zip line for mailing labels.
 */
export const formatMailingLabelAddressLines = (addressRaw) => {
  if (!addressRaw) return { street: '', cityStateZip: '' };
  const cleaned = formatAddressWithCityComma(addressRaw);

  const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return { street: parts[0] || '', cityStateZip: '' };
  }

  // Last part or last 2 parts contain City, State Zip
  const lastPart = parts[parts.length - 1]; // e.g., "IL 78960" or "IL"
  const secondLastPart = parts[parts.length - 2]; // e.g., "Springfield"

  if (/^[A-Z]{2}(?:\s+\d{5}(?:-\d{4})?)?$/i.test(lastPart)) {
    const street = parts.slice(0, parts.length - 2).join(', ');
    const cityStateZip = `${secondLastPart}, ${lastPart}`;
    return {
      street: street || parts[0],
      cityStateZip
    };
  }

  return {
    street: parts.slice(0, -1).join(', '),
    cityStateZip: parts.slice(-1)[0] || ''
  };
};

export const PrintView = ({
  isOpen,
  onClose,
  contacts = [],
  availableColumns = [],
  visibleColumns = [],
  columnWidths = {},
  nameSortOrder = 'last'
}) => {
  const [orientation, setOrientation] = useState('portrait');
  const [textScale, setTextScale] = useState(100);
  const [widthMode, setWidthMode] = useState('proportional');
  const [printLayoutMode, setPrintLayoutMode] = useState('labels2'); // 'table', 'labels2', 'labels3', 'cards'
  const [includeLabelDetails, setIncludeLabelDetails] = useState(false); // Clean address-only vs details
  const [pageMargins, setPageMargins] = useState(8);
  const [printTitle, setPrintTitle] = useState('eNews Address Book & Mailing Labels');
  const [printSubtitle, setPrintSubtitle] = useState(`Generated on ${new Date().toLocaleDateString()} • Total Contacts: ${contacts.length}`);
  const [localColumnWidths, setLocalColumnWidths] = useState(columnWidths);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const visibleColsList = availableColumns.filter(
    c => visibleColumns.includes(c.id) && c.id !== 'actions' && c.id !== 'checkbox'
  );

  const totalVisibleWidth = visibleColsList.reduce(
    (sum, col) => sum + getColWidth(col.id, localColumnWidths), 0
  );

  // Dynamic box sizes for accuracy boxes scaling
  const boxWidth = Math.max(4, Math.round(10 * scaleRatio));
  const boxHeight = Math.max(6, Math.round(14 * scaleRatio));
  const boxGap = Math.max(1, Math.round(3 * scaleRatio));

  // Table View name formatting (follows table preference or First Last)
  const formatTableContactName = (c) => {
    const first = (c.firstName || '').trim();
    const last = (c.lastName || '').trim();
    if (nameSortOrder === 'last') {
      if (last && first) return `${last}, ${first}`;
      return last || first || 'Unnamed Contact';
    }
    if (first && last) return `${first} ${last}`;
    return first || last || 'Unnamed Contact';
  };

  return (
    <div className="modal-backdrop print-modal-backdrop">
      {/* ── Control Sidebar / Mobile Top Bar ── */}
      <div className="print-toolbar no-print">
        {/* Top Action Header */}
        <div className="print-toolbar-header">
          <div className="print-toolbar-title">
            <Printer className="text-primary" size={22} />
            <div>
              <h3>Print & Mailing Labels</h3>
              <p>{contacts.length} contacts ready for printing</p>
            </div>
          </div>
          <button className="icon-close-btn" onClick={onClose} aria-label="Close Print Preview">
            <X size={20} />
          </button>
        </div>

        {/* Primary Action Button */}
        <button className="btn btn-primary btn-print-main" onClick={handlePrint}>
          <Printer size={18} />
          <span>Print / Export PDF</span>
          <span className="shortcut-badge">Ctrl+P</span>
        </button>

        {/* Preset Layout Selector Tabs */}
        <div className="print-setting-section">
          <label className="setting-label">Print Format / Layout Style</label>
          <div className="layout-preset-grid">
            <button
              type="button"
              className={`preset-btn ${printLayoutMode === 'labels2' ? 'active' : ''}`}
              onClick={() => setPrintLayoutMode('labels2')}
            >
              <LayoutGrid size={16} />
              <span>🏷️ 2-Col Labels</span>
            </button>
            <button
              type="button"
              className={`preset-btn ${printLayoutMode === 'labels3' ? 'active' : ''}`}
              onClick={() => setPrintLayoutMode('labels3')}
            >
              <LayoutGrid size={16} />
              <span>🏷️ 3-Col Labels</span>
            </button>
            <button
              type="button"
              className={`preset-btn ${printLayoutMode === 'table' ? 'active' : ''}`}
              onClick={() => setPrintLayoutMode('table')}
            >
              <FileText size={16} />
              <span>📋 Table</span>
            </button>
            <button
              type="button"
              className={`preset-btn ${printLayoutMode === 'cards' ? 'active' : ''}`}
              onClick={() => setPrintLayoutMode('cards')}
            >
              <Eye size={16} />
              <span>📇 Mini Cards</span>
            </button>
          </div>
        </div>

        {/* Label Content Option (Only in Label & Card modes) */}
        {printLayoutMode !== 'table' && (
          <div className="print-setting-section">
            <label className="setting-label">Mailing Label Content</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                className={`btn btn-xs ${!includeLabelDetails ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setIncludeLabelDetails(false)}
              >
                Mailing Address Only
              </button>
              <button
                type="button"
                className={`btn btn-xs ${includeLabelDetails ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setIncludeLabelDetails(true)}
              >
                Include Email/Phone
              </button>
            </div>
          </div>
        )}

        {/* Paper Orientation & Text Scale */}
        <div className="print-setting-section">
          <div className="setting-row-flex">
            <label className="setting-label">Page Orientation</label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-btn ${orientation === 'portrait' ? 'active' : ''}`}
                onClick={() => setOrientation('portrait')}
              >
                Portrait
              </button>
              <button
                type="button"
                className={`segmented-btn ${orientation === 'landscape' ? 'active' : ''}`}
                onClick={() => setOrientation('landscape')}
              >
                Landscape
              </button>
            </div>
          </div>

          <div className="setting-row-flex mt-3">
            <label className="setting-label">Text & Box Scale ({textScale}%)</label>
            <div className="scale-preset-buttons">
              {[80, 100, 120].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`scale-btn ${textScale === s ? 'active' : ''}`}
                  onClick={() => setTextScale(s)}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>

          <input
            type="range"
            min="50"
            max="180"
            step="5"
            value={textScale}
            onChange={e => setTextScale(Number(e.target.value))}
            className="print-range-slider mt-2"
          />
        </div>

        {/* Toggle Advanced Adjustments */}
        <button
          type="button"
          className="btn btn-secondary btn-sm btn-block mt-2"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Sliders size={14} />
          <span>{showAdvanced ? 'Hide Advanced Settings' : 'Advanced Margins & Columns'}</span>
        </button>

        {showAdvanced && (
          <div className="advanced-settings-box mt-3">
            <div className="setting-row-flex mb-3">
              <label className="setting-label">Page Margins ({pageMargins}%)</label>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={pageMargins} 
                onChange={e => setPageMargins(Number(e.target.value))}
                className="print-range-slider"
                style={{ width: '120px' }}
              />
            </div>

            {printLayoutMode === 'table' && (
              <div className="setting-row-flex mb-3">
                <label className="setting-label">Column Layout Mode</label>
                <select 
                  className="select-control select-control-sm" 
                  value={widthMode} 
                  onChange={e => setWidthMode(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="proportional">Match Screen Widths</option>
                  <option value="auto">Auto-Fit (Wrap Text)</option>
                </select>
              </div>
            )}

            {printLayoutMode === 'table' && (
              <div className="column-sliders-list">
                <label className="setting-label mb-2" style={{ display: 'block' }}>Custom Column Widths:</label>
                {visibleColsList.map(col => (
                  <div key={col.id} className="column-slider-item">
                    <span>{col.label}</span>
                    <input 
                      type="range" 
                      min="30" 
                      max="400" 
                      value={getColWidth(col.id, localColumnWidths)} 
                      onChange={e => setLocalColumnWidths({...localColumnWidths, [col.id]: Number(e.target.value)})}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CSS Styles ── */}
      <style>{`
        @page {
          size: ${orientation === 'landscape' ? 'landscape' : 'portrait'};
          margin: ${(pageMargins / 100) * (orientation === 'landscape' ? 11 : 8.5)}in;
        }

        .print-modal-backdrop {
          display: flex;
          flex-direction: row;
          background: rgba(15, 23, 42, 0.92) !important;
          overflow: hidden !important;
          position: fixed;
          inset: 0;
          z-index: 1000;
        }

        /* ── Control Toolbar Styles ── */
        .print-toolbar {
          width: 360px;
          height: 100vh;
          overflow-y: auto;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex-shrink: 0;
        }

        .print-toolbar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .print-toolbar-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .print-toolbar-title h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .print-toolbar-title p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }

        .btn-print-main {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          font-weight: 700;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }

        .shortcut-badge {
          font-size: 0.7rem;
          background: rgba(255, 255, 255, 0.25);
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: auto;
        }

        .print-setting-section {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem;
        }

        .setting-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .layout-preset-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          margin-top: 0.5rem;
        }

        .preset-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 0.6rem;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preset-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-muted);
        }

        .preset-btn.active {
          background: var(--accent-primary);
          color: #fff;
          border-color: var(--accent-primary);
        }

        .setting-row-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .segmented-control {
          display: flex;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 2px;
        }

        .segmented-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
        }

        .segmented-btn.active {
          background: var(--accent-primary);
          color: #fff;
        }

        .scale-preset-buttons {
          display: flex;
          gap: 4px;
        }

        .scale-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          cursor: pointer;
        }

        .scale-btn.active {
          background: var(--accent-primary);
          color: #fff;
          border-color: var(--accent-primary);
        }

        .print-range-slider {
          width: 100%;
          cursor: pointer;
          accent-color: var(--accent-primary);
        }

        .advanced-settings-box {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem;
        }

        .column-sliders-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 180px;
          overflow-y: auto;
        }

        .column-slider-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .column-slider-item input {
          width: 100px;
        }

        /* ── Live Paper Preview Viewport ── */
        .printable-scroll-wrapper {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          justify-content: center;
          background: #334155;
          -webkit-overflow-scrolling: touch;
        }

        .printable-page-container {
          background: #ffffff !important;
          color: #0f172a !important;
          width: 100%;
          max-width: ${orientation === 'landscape' ? '1250px' : '900px'};
          min-height: 1050px;
          padding: 2.5rem;
          border-radius: 4px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          transition: all 0.2s ease;
        }

        .print-header {
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.75rem;
        }

        .print-title-input {
          font-size: calc(1.8rem * ${scaleRatio}) !important;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.25rem;
          outline: none;
          border: 1px dashed transparent;
        }

        .print-title-input:hover {
          border-color: #cbd5e1;
        }

        .print-subtitle-input {
          font-size: calc(0.9rem * ${scaleRatio}) !important;
          color: #64748b;
          margin: 0;
          outline: none;
          border: 1px dashed transparent;
        }

        .print-subtitle-input:hover {
          border-color: #cbd5e1;
        }

        /* ── Mode 1: Table View ── */
        .printable-table {
          width: 100%;
          border-collapse: collapse;
          font-size: calc(0.85rem * ${scaleRatio}) !important;
          table-layout: ${widthMode === 'auto' ? 'auto' : 'fixed'} !important;
        }

        .printable-table th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 700;
          border-bottom: 2px solid #cbd5e1;
          padding: calc(0.5rem * ${scaleRatio}) calc(0.6rem * ${scaleRatio});
          font-size: calc(0.82rem * ${scaleRatio}) !important;
        }

        .printable-table td {
          border-bottom: 1px solid #e2e8f0;
          padding: calc(0.5rem * ${scaleRatio}) calc(0.6rem * ${scaleRatio});
          font-size: calc(0.85rem * ${scaleRatio}) !important;
          word-break: break-word;
          overflow-wrap: anywhere;
          color: #1e293b;
        }

        .printable-table tr:nth-child(even) td {
          background: #f8fafc;
        }

        /* ── Modes 2, 3 & 4: Address Labels & Cards ── */
        .address-labels-grid {
          display: grid;
          gap: calc(0.75rem * ${scaleRatio});
          width: 100%;
        }

        .labels-grid-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .labels-grid-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .labels-grid-cards {
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }

        .printable-card-item {
          border: 1px dashed #cbd5e1;
          border-radius: 6px;
          padding: calc(0.75rem * ${scaleRatio});
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: calc(0.3rem * ${scaleRatio});
          min-height: calc(1.1in * ${scaleRatio});
          justify-content: center;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .printable-card-name {
          font-size: calc(1.05rem * ${scaleRatio});
          font-weight: 700;
          color: #0f172a;
          line-height: 1.25;
        }

        .printable-card-address {
          font-size: calc(0.9rem * ${scaleRatio});
          color: #334155;
          font-weight: 500;
          line-height: 1.35;
        }

        .label-street-line {
          font-size: calc(0.88rem * ${scaleRatio});
          color: #1e293b;
        }

        .label-city-line {
          font-size: calc(0.88rem * ${scaleRatio});
          color: #334155;
          font-weight: 600;
        }

        .printable-card-detail {
          font-size: calc(0.82rem * ${scaleRatio});
          color: #475569;
          margin-top: 2px;
        }

        .printable-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }

        .printable-tag-pill {
          font-size: calc(0.68rem * ${scaleRatio});
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        /* ── Mobile Smartphone Responsive Layout ── */
        @media screen and (max-width: 900px) {
          .print-modal-backdrop {
            flex-direction: column !important;
          }

          .print-toolbar {
            width: 100% !important;
            height: auto !important;
            max-height: 50vh;
            border-right: none !important;
            border-bottom: 1px solid var(--border-color);
            padding: 1rem !important;
          }

          .printable-scroll-wrapper {
            padding: 1rem !important;
          }

          .printable-page-container {
            padding: 1.25rem !important;
          }
        }

        /* ── Hardcopy Browser Printing CSS ── */
        @media print {
          .no-print, .print-toolbar {
            display: none !important;
          }

          html, body, #root, .app-layout, .print-modal-backdrop, .printable-scroll-wrapper {
            background: transparent !important;
            background-color: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
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

          .print-title-input, .print-subtitle-input {
            border: none !important;
          }

          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }

          .printable-card-item {
            border-color: #cbd5e1 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ── Printable Paper Canvas ── */}
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
                  {visibleColsList.map(col => {
                    const widthPercent = (getColWidth(col.id, localColumnWidths) / totalVisibleWidth) * 100;
                    return (
                      <th
                        key={col.id}
                        style={{
                          width: widthMode === 'proportional' ? `${widthPercent}%` : 'auto',
                          textAlign: (col.id === 'index' || col.id === 'score') ? 'center' : 'left'
                        }}
                      >
                        {col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, idx) => (
                  <tr key={c.id || idx}>
                    {visibleColsList.map(col => {
                      let val;
                      if (col.id === 'index') val = idx + 1;
                      else if (col.id === 'score') {
                        const accuracy = getContactAccuracy(c);
                        const count = typeof accuracy.count === 'number' ? accuracy.count : 0;
                        const badgeColor = count === 4 ? '#10b981' : count === 3 ? '#2563eb' : count === 2 ? '#d97706' : '#dc2626';
                        const badgeBg = count === 4 ? '#ecfdf5' : count === 3 ? '#eff6ff' : count === 2 ? '#fffbeb' : '#fef2f2';
                        val = (
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            width: `${Math.max(16, Math.round(20 * scaleRatio))}px`, 
                            height: `${Math.max(16, Math.round(20 * scaleRatio))}px`, 
                            borderRadius: '50%', 
                            fontSize: `${Math.max(0.7, 0.8 * scaleRatio)}rem`, 
                            fontWeight: 700, 
                            color: badgeColor, 
                            backgroundColor: badgeBg,
                            border: `1.5px solid ${badgeColor}`,
                            lineHeight: 1 
                          }} title={accuracy.tooltip}>
                            {count}
                          </span>
                        );
                      }
                      else if (col.id === 'name') val = <strong>{formatTableContactName(c)}</strong>;
                      else if (col.id === 'address') val = formatAddressWithCityComma(c.address) || '-';
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
                        <td
                          key={col.id}
                          style={{
                            textAlign: (col.id === 'index' || col.id === 'score') ? 'center' : 'left'
                          }}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Mode 2, 3 & 4: Address Labels & Cards */}
          {printLayoutMode !== 'table' && (
            <div className={`address-labels-grid ${
              printLayoutMode === 'labels2' ? 'labels-grid-2' :
              printLayoutMode === 'labels3' ? 'labels-grid-3' : 'labels-grid-cards'
            }`}>
              {contacts.map((c, idx) => {
                const addrBlock = formatMailingLabelAddressLines(c.address);
                return (
                  <div key={c.id || idx} className="printable-card-item">
                    <div className="printable-card-name">
                      {formatMailingLabelName(c)}
                    </div>
                    {c.address ? (
                      <div className="printable-card-address">
                        {addrBlock.street && <div className="label-street-line">{addrBlock.street}</div>}
                        {addrBlock.cityStateZip && <div className="label-city-line">{addrBlock.cityStateZip}</div>}
                      </div>
                    ) : (
                      <div className="printable-card-address">
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No Address Listed</span>
                      </div>
                    )}
                    {includeLabelDetails && (
                      <div className="printable-card-detail">
                        {c.email && <div>📧 {c.email}</div>}
                        {c.phone && <div>📞 {c.phone}</div>}
                      </div>
                    )}
                    {includeLabelDetails && Array.isArray(c.categories) && c.categories.length > 0 && (
                      <div className="printable-card-tags">
                        {c.categories.map((cat, i) => (
                          <span key={i} className="printable-tag-pill">{cat}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
