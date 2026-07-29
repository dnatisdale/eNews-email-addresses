import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin } from 'lucide-react';

export const parseAddressToFields = (fullAddressStr = '') => {
  if (!fullAddressStr) return { street: '', city: '', state: '', zip: '' };
  const str = fullAddressStr.trim();

  const zipMatch = str.match(/\b(\d{5}(?:-\d{4})?)\b/);
  const zip = zipMatch ? zipMatch[1] : '';

  let remainder = str.replace(zip, '').trim().replace(/,\s*$/, '');

  const stateMatch = remainder.match(/\b([A-Z]{2})\b$/i);
  const state = stateMatch ? stateMatch[1].toUpperCase() : '';
  if (state) {
    remainder = remainder.replace(new RegExp(`\\b${state}\\b$`, 'i'), '').trim().replace(/,\s*$/, '');
  }

  const parts = remainder.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const city = parts[parts.length - 1];
    const street = parts.slice(0, parts.length - 1).join(', ');
    return { street, city, state, zip };
  }

  return { street: remainder, city: '', state, zip };
};

export const joinAddressFields = (street, city, state, zip) => {
  const s = (street || '').trim();
  const c = (city || '').trim();
  const st = (state || '').trim().toUpperCase();
  const z = (zip || '').trim();

  let cityStateZip = '';
  if (c && st && z) cityStateZip = `${c}, ${st} ${z}`;
  else if (c && st) cityStateZip = `${c}, ${st}`;
  else if (c && z) cityStateZip = `${c} ${z}`;
  else if (st && z) cityStateZip = `${st} ${z}`;
  else cityStateZip = c || st || z;

  if (s && cityStateZip) return `${s}, ${cityStateZip}`;
  return s || cityStateZip;
};

export const ContactModal = ({ isOpen, onClose, onSave, contactToEdit, masterCategories = [] }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    categories: ['Family'],
    status: 'Active',
    notes: ''
  });

  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (contactToEdit) {
      const addrFields = parseAddressToFields(contactToEdit.address || '');
      setFormData({
        firstName: contactToEdit.firstName || '',
        lastName: contactToEdit.lastName || '',
        email: contactToEdit.email || '',
        secondaryEmail: contactToEdit.secondaryEmail || '',
        phone: contactToEdit.phone || '',
        street: addrFields.street,
        city: addrFields.city,
        state: addrFields.state,
        zip: addrFields.zip,
        categories: contactToEdit.categories && contactToEdit.categories.length > 0 ? contactToEdit.categories : ['Family'],
        status: contactToEdit.status || 'Active',
        notes: contactToEdit.notes || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        secondaryEmail: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        categories: ['Family'],
        status: 'Active',
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
    const fullAddress = joinAddressFields(formData.street, formData.city, formData.state, formData.zip);

    onSave({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      secondaryEmail: formData.secondaryEmail,
      phone: formData.phone,
      address: fullAddress,
      notes: formData.notes,
      categories: finalCategories,
      status: formData.status,
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
            {/* First Name & Last Name (No external labels) */}
            <div className="form-group">
              <input
                type="text"
                required
                className="input-control"
                placeholder="* First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                required
                className="input-control"
                placeholder="* Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            {/* Email & Secondary Email (No external labels) */}
            <div className="form-group">
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="input-control"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
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

            {/* Phone Number (No external label) */}
            <div className="form-group full-width">
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

            {/* Separate Physical Address Fields (Street, City, State, Zip) */}
            <div className="form-group full-width">
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  className="input-control"
                  placeholder="Street Address (e.g. 101 Elm St, Suite 1)"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group full-width" style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-control"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <input
                type="text"
                className="input-control"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <input
                type="text"
                className="input-control"
                placeholder="Zip Code"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              />
            </div>

            {/* Notes (No external label) */}
            <div className="form-group full-width">
              <textarea
                rows={2}
                className="input-control textarea-control"
                placeholder="Notes, relationship details, preferred greeting..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Tags & Status — Under Notes (Labels Kept!) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 170px', gap: '0.75rem', alignItems: 'start' }} className="full-width mt-2">
              {/* Tags — Multi-Select */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tags
                </label>

                {/* Selected pills */}
                {(formData.categories || []).filter(c => c !== '*EXAMPLES*').length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                    {(formData.categories || []).filter(c => c !== '*EXAMPLES*').map(cat => (
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
                  {masterCategories.filter(cat => cat !== '*EXAMPLES*').map(cat => {
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
