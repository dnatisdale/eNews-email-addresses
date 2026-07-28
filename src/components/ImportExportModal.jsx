import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, FolderPlus, HelpCircle, Download, Copy, Mail } from 'lucide-react';
import { parseCSV } from '../services/csvParser';

// Helper to convert filename to a clean Collection / Group title
const formatFileNameToCollection = (fileName) => {
  if (!fileName) return 'Imported List';
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const cleanName = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleanName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ImportExportModal = ({
  isOpen,
  onClose,
  onImportContacts,
  onImport,
  onExportCSV,
  onBulkCopyEmails,
  contacts = []
}) => {
  const [activeTab, setActiveTab] = useState('import'); // 'import' or 'export'
  const [dragActive, setDragActive] = useState(false);
  const [parsedPreview, setParsedPreview] = useState([]);
  const [fileName, setFileName] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [copiedMsg, setCopiedMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    setFileName(file.name);
    const defaultCollName = formatFileNameToCollection(file.name);
    setCollectionName(defaultCollName);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      const results = parseCSV(csvText);
      setParsedPreview(results);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length > 0) {
      const finalCollection = collectionName.trim() || 'Imported List';

      const updatedPreview = parsedPreview.map((contact) => {
        const existingCats = contact.categories || [];
        const mergedCategories = [...new Set([...existingCats, finalCollection])];
        return {
          ...contact,
          categories: mergedCategories
        };
      });

      const doImport = onImportContacts || onImport;
      if (doImport) {
        doImport(updatedPreview, finalCollection);
      }
      onClose();
      setParsedPreview([]);
      setFileName('');
      setCollectionName('');
    }
  };

  const handleCopyFormattedEmails = (separator, label) => {
    const validContacts = contacts.filter(c => c.email && c.email.trim());
    if (validContacts.length === 0) {
      alert('No contact email addresses available to copy.');
      return;
    }

    const formatted = validContacts
      .map(c => `"${c.firstName || ''} ${c.lastName || ''}".trim() <${c.email.trim()}>`)
      .join(separator + ' ');

    navigator.clipboard.writeText(formatted);
    setCopiedMsg(`Copied ${validContacts.length} emails for ${label}!`);
    setTimeout(() => setCopiedMsg(''), 3000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content import-modal" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <FileSpreadsheet className="modal-icon text-primary" size={20} />
            <h2>Import &amp; Export Center</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-panel)',
          padding: '0 1rem'
        }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'import' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('import')}
            style={{
              padding: '0.65rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderBottom: activeTab === 'import' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'import' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            📥 Import CSV
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'export' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('export')}
            style={{
              padding: '0.65rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderBottom: activeTab === 'export' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'export' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            📤 Export CSV &amp; Copy Lists
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'import' ? (
            <>
              {/* Import Instructions Box */}
              <div className="import-info-card" style={{ marginBottom: '1rem' }}>
                <HelpCircle size={18} className="info-icon" />
                <div className="info-content">
                  <strong>Supported Import Formats:</strong>
                  <p>• <b>Google Gmail Contacts:</b> Export CSV from contacts.google.com</p>
                  <p>• <b>MS Outlook:</b> Export CSV from Outlook People/Contacts</p>
                  <p>• <b>Custom Spreadsheet:</b> CSV file containing Name and Email headers</p>
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              {parsedPreview.length === 0 ? (
                <div 
                  className={`dropzone ${dragActive ? 'dropzone-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload size={36} className="upload-icon" />
                  <h3>Drop your CSV file here</h3>
                  <p>or click to browse from your computer</p>
                  <input 
                    type="file" 
                    accept=".csv, text/csv, application/vnd.ms-excel" 
                    className="file-input-hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="preview-container">
                  <div className="preview-header">
                    <div>
                      <h4>Loaded: <code>{fileName}</code></h4>
                      <span className="badge badge-success">{parsedPreview.length} Contacts Found</span>
                    </div>
                    <button className="btn-link text-xs" onClick={() => setParsedPreview([])}>
                      Choose Different File
                    </button>
                  </div>

                  {/* Collection Name */}
                  <div className="collection-assign-box">
                    <label className="form-group" style={{ marginBottom: 0 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                        Collection / Group Name
                      </span>
                      <div className="input-with-icon">
                        <FolderPlus size={16} className="input-icon" />
                        <input
                          type="text"
                          className="input-control"
                          placeholder="Collection Name..."
                          value={collectionName}
                          onChange={(e) => setCollectionName(e.target.value)}
                        />
                      </div>
                    </label>
                  </div>

                  {/* CSV Preview Table */}
                  <div className="preview-table-wrap">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Categories</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedPreview.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{row.firstName}</td>
                            <td>{row.lastName}</td>
                            <td><code>{row.email}</code></td>
                            <td>{row.phone}</td>
                            <td>
                              <span className="group-badge">
                                {collectionName || (row.categories ? row.categories.join(', ') : '')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedPreview.length > 5 && (
                      <p className="more-preview-text">...and {parsedPreview.length - 5} more records ready to import.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Export & Copy Section */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card)'
              }}>
                <h4 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={18} className="text-primary" />
                  <span>Export Full Address Book CSV</span>
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
                  Download all <strong>{contacts.length}</strong> contacts as a standard CSV spreadsheet compatible with Excel, Google Sheets, or Apple Contacts.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => { if (onExportCSV) onExportCSV(); }}
                >
                  <Download size={14} />
                  <span>Download CSV File</span>
                </button>
              </div>

              <div style={{
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card)'
              }}>
                <h4 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} className="text-primary" />
                  <span>Copy Formatted Email Lists</span>
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
                  Copy all contact email addresses formatted for instant pasting into Gmail or Outlook email composers.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopyFormattedEmails(',', 'Gmail')}
                  >
                    <Copy size={14} />
                    <span>Copy Gmail List (,)</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopyFormattedEmails(';', 'Outlook')}
                  >
                    <Copy size={14} />
                    <span>Copy Outlook List (;)</span>
                  </button>
                </div>

                {copiedMsg && (
                  <p style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600, marginTop: '8px', margin: '8px 0 0 0' }}>
                    ✓ {copiedMsg}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {activeTab === 'import' && parsedPreview.length > 0 && (
            <button className="btn btn-primary" onClick={handleConfirmImport}>
              <Check size={16} />
              <span>Import {parsedPreview.length} Contacts</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
