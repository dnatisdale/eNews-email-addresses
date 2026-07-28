import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Tag, MapPin, FileText, CheckCircle, Info } from 'lucide-react';

export const ContactModal = ({ isOpen, onClose, onSave, contactToEdit, masterCategories = [] }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    categories: ['Family'],
    status: 'Active',
    address: '',
    notes: ''
  });

  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (contactToEdit) {
      setFormData({
        firstName: contactToEdit.firstName || '',
        lastName: contactToEdit.lastName || '',
        email: contactToEdit.email || '',
        secondaryEmail: contactToEdit.secondaryEmail || '',
        phone: contactToEdit.phone || '',
        categories: contactToEdit.categories && contactToEdit.categories.length > 0 ? contactToEdit.categories : ['Family'],
        status: contactToEdit.status || 'Active',
        address: contactToEdit.address || '',
        notes: contactToEdit.notes || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        secondaryEmail: '',
        phone: '',
        categories: ['Family'],
        status: 'Active',
        address: '',
        notes: ''
      });
    }
    setShowCustomCategory(false);
    setCustomCategory('');
  }, [contactToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalCategories = [...formData.categories];
    if (showCustomCategory && customCategory.trim()) {
      if (!finalCategories.includes(customCategory.trim())) {
        finalCategories.push(customCategory.trim());
      }
    }
    onSave({
      ...formData,
      categories: finalCategories,
      id: contactToEdit ? contactToEdit.id : undefined
    });
    onClose();
  };

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const current = prev.categories || [];
      if (current.includes(cat)) {
        return { ...prev, categories: current.filter((c) => c !== cat) };
      } else {
        return { ...prev, categories: [...current, cat] };
      }
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content contact-modal">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <User className="modal-icon" />
            <h2>{contactToEdit ? 'Edit Contact' : 'Add New eNews Contact'}</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            {/* First Name */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span style={{ color: '#ef4444', fontWeight: 700, marginRight: '3px' }}>*</span>First Name
              </label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span style={{ color: '#ef4444', fontWeight: 700, marginRight: '3px' }}>*</span>Last Name
              </label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span style={{ color: '#ef4444', fontWeight: 700, marginRight: '3px' }}>*</span>Email
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  className="input-control"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Secondary Email */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Secondary Email
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="input-control"
                  placeholder="Secondary Email"
                  value={formData.secondaryEmail}
                  onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  className="input-control"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Side-by-Side: Categories & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 170px', gap: '0.75rem', alignItems: 'start' }} className="full-width">
              {/* Categories — Dropdown Multi-Select */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tags
                </label>
                
                {/* Selected pills */}
                {(formData.categories || []).filter(c => c !== '*SAMPLE*' && c !== '*EXAMPLES*').length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                    {(formData.categories || []).filter(c => c !== '*SAMPLE*' && c !== '*EXAMPLES*').map(cat => (
                      <span key={cat} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 500,
                        backgroundColor: 'var(--accent-primary)', color: '#fff'
                      }}>
                        {cat}
                        <button type="button" onClick={() => toggleCategory(cat)} style={{
                          background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                          padding: 0, fontSize: '0.9rem', lineHeight: 1, fontWeight: 700
                        }}>×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown select */}
                <select
                  className="input-control"
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && val !== '__add_new__') {
                      toggleCategory(val);
                    } else if (val === '__add_new__') {
                      setShowCustomCategory(true);
                    }
                    e.target.value = '';
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" disabled>Add Tags…</option>
                  {masterCategories.filter(cat => cat !== '*SAMPLE*' && cat !== '*EXAMPLES*').map(cat => {
                    const isSelected = (formData.categories || []).includes(cat);
                    return (
                      <option key={cat} value={cat}>
                        {isSelected ? '✓ ' : '   '}{cat}
                      </option>
                    );
                  })}
                  <option value="__add_new__">+ Add New Tag…</option>
                </select>

                {/* Inline add new category input */}
                {showCustomCategory && (
                  <div className="input-with-button" style={{ marginTop: '6px' }}>
                    <input
                      type="text"
                      autoFocus
                      className="input-control"
                      placeholder="Type new tag..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Status
                </label>
                <select
                  className="input-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  title="Non-active status automatically displays as an exception warning tag"
                >
                  <option value="Active">🟢 Active</option>
                  <option value="Inactive">💤 Inactive</option>
                  <option value="Unsubscribed">🚫 Unsubscribed</option>
                  <option value="Bounced">⚠️ Bounced</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="form-group full-width">
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Physical Address
              </label>
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  className="input-control"
                  placeholder="Street, City, State Zip"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group full-width">
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Notes
              </label>
              <textarea
                rows={2}
                className="input-control textarea-control"
                placeholder="Holiday card notes, relationship details, preferred greeting..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{contactToEdit ? 'Update Contact' : 'Save Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
