import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, Check, FolderPlus, HelpCircle } from 'lucide-react';
import { parseCSV, downloadCSVFile } from '../services/csvParser';

// Helper to convert filename to a clean Collection / Group title
const formatFileNameToCollection = (fileName) => {
  if (!fileName) return 'Imported List';
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const cleanName = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Capitalize words
  return cleanName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ImportExportModal = ({ isOpen, onClose, onImportContacts, contacts }) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsedPreview, setParsedPreview] = useState([]);
  const [fileName, setFileName] = useState('');
  const [collectionName, setCollectionName] = useState('');

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

      onImportContacts(updatedPreview, finalCollection);
      onClose();
      setParsedPreview([]);
      setFileName('');
      setCollectionName('');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content import-modal">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <FileSpreadsheet className="modal-icon" />
            <h2>Import / Export eNews Contacts</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Export Quick Action */}
          <div className="export-banner">
            <div className="banner-text">
              <h4>Export Active List</h4>
              <p>Download your current list of {contacts.length} contacts as a standard CSV file.</p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const safeTitle = 'eNews Family & Friends Contact Directory'.replace(/[/\\?%*:|"<>]/g, '-');
                downloadCSVFile(contacts, `${safeTitle} - ${new Date().toISOString().slice(0, 10)}.csv`);
              }}
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="section-divider">
            <span>OR IMPORT FROM FILE</span>
          </div>

          {/* Import Instructions Box */}
          <div className="import-info-card">
            <HelpCircle size={18} className="info-icon" />
            <div className="info-content">
              <strong>Supported Formats:</strong>
              <p>• <b>Google Gmail Contacts:</b> Export CSV from contacts.google.com</p>
              <p>• <b>MS Outlook:</b> Export CSV from Outlook People/Contacts</p>
              <p>• <b>Custom Spreadsheet:</b> Any CSV file containing Name and Email headers</p>
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

              {/* Collection Name — auto-filled from filename, always editable */}
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
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {parsedPreview.length > 0 && (
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
