import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { parseContactsWithGemini } from '../services/geminiService';

export const MagicImportModal = ({ isOpen, onClose, onImport }) => {
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedContacts, setParsedContacts] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!rawText.trim()) {
      setErrorMsg("Please paste some text first.");
      return;
    }
    
    setIsParsing(true);
    setErrorMsg('');
    setParsedContacts(null);

    try {
      const contacts = await parseContactsWithGemini(rawText);
      if (contacts && contacts.length > 0) {
        setParsedContacts(contacts);
      } else {
        setErrorMsg("Gemini couldn't find any contacts in that text. Try pasting something else.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while parsing.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveAll = () => {
    if (parsedContacts && parsedContacts.length > 0) {
      // Clean up array and generate IDs
      const importedList = parsedContacts.map(c => ({
        ...c,
        id: 'gemini_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        status: 'Active',
        categories: ['Imported by AI'],
        createdAt: new Date().toISOString()
      }));
      
      onImport(importedList, 'Imported by AI');
      handleClose();
    }
  };

  const handleClose = () => {
    setRawText('');
    setParsedContacts(null);
    setErrorMsg('');
    setIsParsing(false);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content magic-modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Sparkles className="modal-icon text-primary" />
            <h2>Magic AI Import</h2>
          </div>
          <button className="icon-close-btn" onClick={handleClose} aria-label="Close Modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!parsedContacts ? (
            <>
              <p className="security-notice mb-3">
                Paste an email signature, a block of meeting notes, or any messy text. Gemini AI will automatically extract the contact details for you!
              </p>
              
              <div className="form-group full-width">
                <textarea
                  rows={8}
                  className="input-control textarea-control"
                  placeholder="e.g. John Smith&#10;Acme Corp CEO&#10;Phone: (555) 123-4567&#10;john.smith@acmecorp.com&#10;123 Business Rd, Tech City, CA 90210"
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    setErrorMsg('');
                  }}
                  disabled={isParsing}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {errorMsg && (
                <div className="error-alert mt-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isParsing}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleParse} 
                  disabled={isParsing || !rawText.trim()}
                >
                  <Sparkles size={16} />
                  <span>{isParsing ? 'Analyzing Text...' : 'Extract Contacts'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="success-alert mb-3">
                <CheckCircle size={16} />
                <span>Gemini successfully extracted {parsedContacts.length} contact(s)!</span>
              </div>
              
              <div className="extracted-preview" style={{ maxHeight: '300px', overflowY: 'auto', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {parsedContacts.map((contact, i) => (
                  <div key={i} style={{ paddingBottom: i < parsedContacts.length - 1 ? '1rem' : '0', marginBottom: i < parsedContacts.length - 1 ? '1rem' : '0', borderBottom: i < parsedContacts.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                      {contact.firstName} {contact.lastName}
                    </h4>
                    {contact.email && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>✉️ {contact.email}</div>}
                    {contact.phone && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📞 {contact.phone}</div>}
                    {contact.address && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {contact.address}</div>}
                    {contact.notes && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📝 {contact.notes}</div>}
                  </div>
                ))}
              </div>

              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setParsedContacts(null)}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveAll}>
                  <Save size={16} />
                  <span>Save All to Address Book</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
