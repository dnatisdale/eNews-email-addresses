import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Info, Sparkles } from 'lucide-react';

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

export const US_STATES = [
  { code: '—', label: '— Skip / Int\'l' },
  { code: 'AL', label: 'AL' }, { code: 'AK', label: 'AK' }, { code: 'AZ', label: 'AZ' }, { code: 'AR', label: 'AR' },
  { code: 'CA', label: 'CA' }, { code: 'CO', label: 'CO' }, { code: 'CT', label: 'CT' }, { code: 'DE', label: 'DE' },
  { code: 'FL', label: 'FL' }, { code: 'GA', label: 'GA' }, { code: 'HI', label: 'HI' }, { code: 'ID', label: 'ID' },
  { code: 'IL', label: 'IL' }, { code: 'IN', label: 'IN' }, { code: 'IA', label: 'IA' }, { code: 'KS', label: 'KS' },
  { code: 'KY', label: 'KY' }, { code: 'LA', label: 'LA' }, { code: 'ME', label: 'ME' }, { code: 'MD', label: 'MD' },
  { code: 'MA', label: 'MA' }, { code: 'MI', label: 'MI' }, { code: 'MN', label: 'MN' }, { code: 'MS', label: 'MS' },
  { code: 'MO', label: 'MO' }, { code: 'MT', label: 'MT' }, { code: 'NE', label: 'NE' }, { code: 'NV', label: 'NV' },
  { code: 'NH', label: 'NH' }, { code: 'NJ', label: 'NJ' }, { code: 'NM', label: 'NM' }, { code: 'NY', label: 'NY' },
  { code: 'NC', label: 'NC' }, { code: 'ND', label: 'ND' }, { code: 'OH', label: 'OH' }, { code: 'OK', label: 'OK' },
  { code: 'OR', label: 'OR' }, { code: 'PA', label: 'PA' }, { code: 'RI', label: 'RI' }, { code: 'SC', label: 'SC' },
  { code: 'SD', label: 'SD' }, { code: 'TN', label: 'TN' }, { code: 'TX', label: 'TX' }, { code: 'UT', label: 'UT' },
  { code: 'VT', label: 'VT' }, { code: 'VA', label: 'VA' }, { code: 'WA', label: 'WA' }, { code: 'WV', label: 'WV' },
  { code: 'WI', label: 'WI' }, { code: 'WY', label: 'WY' }, { code: 'DC', label: 'DC' }, { code: 'PR', label: 'PR' },
  { code: 'VI', label: 'VI' }, { code: 'GU', label: 'GU' }, { code: 'MP', label: 'MP' }, { code: 'AS', label: 'AS' }
];

export const joinAddressFields = (street, city, state, zip) => {
  const s = (street || '').trim();
  const c = (city || '').trim();
  const st = (state || '').trim();
  const validState = (st && st !== '—') ? st.toUpperCase() : '';
  const z = (zip || '').trim();

  let cityStateZip = '';
  if (c && validState && z) cityStateZip = `${c}, ${validState} ${z}`;
  else if (c && validState) cityStateZip = `${c}, ${validState}`;
  else if (c && z) cityStateZip = `${c} ${z}`;
  else if (validState && z) cityStateZip = `${validState} ${z}`;
  else cityStateZip = c || validState || z;

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

  const [showSampleGuide, setShowSampleGuide] = useState(false);

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
    setShowSampleGuide(false);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="icon-info-btn"
              onClick={() => setShowSampleGuide(!showSampleGuide)}
              title="View Filled Sample Contact Layout Guide"
              style={{
                background: showSampleGuide ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                color: showSampleGuide ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Info size={18} />
            </button>
            <button className="icon-close-btn" onClick={onClose} aria-label="Close Modal">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Sample Contact Field Guide (Toggled via (i) Info icon in header) */}
          {showSampleGuide && (
            <div className="sample-guide-overlay">
              <div className="sample-guide-header">
                <h3>
                  <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span>Sample Contact Field Guide (Hover for Details)</span>
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="icon-close-btn"
                    onClick={() => setShowSampleGuide(false)}
                    title="Close Sample Guide"
                    style={{ width: '26px', height: '26px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                💡 Hover over any sample field below to inspect formatting rules:
              </p>

              <div className="form-grid sample-guide-grid">
                {/* First & Last Name */}
                <div className="sample-field-wrap">
                  <span className="sample-hover-label">First Name (Required)</span>
                  <div className="sample-input-preview">
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span> Eleanor
                  </div>
                </div>

                <div className="sample-field-wrap">
                  <span className="sample-hover-label">Last Name (Required)</span>
                  <div className="sample-input-preview">
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span> Tisdale
                  </div>
                </div>

                {/* Email & Secondary Email */}
                <div className="sample-field-wrap">
                  <span className="sample-hover-label">Primary Email (Optional)</span>
                  <div className="sample-input-preview">
                    <Mail size={14} className="text-muted" /> eleanor.tisdale@example.com
                  </div>
                </div>

                <div className="sample-field-wrap">
                  <span className="sample-hover-label">Secondary / Work Email</span>
                  <div className="sample-input-preview">
                    <Mail size={14} className="text-muted" /> eleanor.tisdale@work.com
                  </div>
                </div>

                {/* Phone */}
                <div className="sample-field-wrap full-width">
                  <span className="sample-hover-label">Formatted Phone Number</span>
                  <div className="sample-input-preview">
                    <Phone size={14} className="text-muted" /> (555) 234-5678
                  </div>
                </div>

                {/* Physical Address */}
                <div className="sample-field-wrap full-width">
                  <span className="sample-hover-label">Street Address Line 1</span>
                  <div className="sample-input-preview">
                    <MapPin size={14} className="text-muted" /> 101 Elm Street, Suite 1
                  </div>
                </div>

                <div className="full-width" style={{ display: 'grid', gridTemplateColumns: '1fr 125px 150px', gap: '0.5rem' }}>
                  <div className="sample-field-wrap">
                    <span className="sample-hover-label">City Name</span>
                    <div className="sample-input-preview">Springfield</div>
                  </div>
                  <div className="sample-field-wrap">
                    <span className="sample-hover-label">State (Dropdown / Long Dash)</span>
                    <div className="sample-input-preview">IL</div>
                  </div>
                  <div className="sample-field-wrap">
                    <span className="sample-hover-label">Zip Code (5-Digit or ZIP+4)</span>
                    <div className="sample-input-preview">62701-1234</div>
                  </div>
                </div>

                {/* Notes */}
                <div className="sample-field-wrap full-width">
                  <span className="sample-hover-label">Personal Notes & Greetings</span>
                  <div className="sample-input-preview">Sends annual holiday card & eNews</div>
                </div>

                {/* Tags & Status */}
                <div className="sample-field-wrap">
                  <span className="sample-hover-label">Category Tags</span>
                  <div className="sample-input-preview" style={{ gap: '4px', flexWrap: 'wrap' }}>
                    <span className="tag-badge" style={{ background: 'var(--accent-primary)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>Christmas</span>
                    <span className="tag-badge" style={{ background: 'var(--accent-primary)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>eNewsletter</span>
                  </div>
                </div>

                <div className="sample-field-wrap">
                  <span className="sample-hover-label">Activity Status</span>
                  <div className="sample-input-preview">🟢 Active</div>
                </div>
              </div>
            </div>
          )}
          <div className="form-grid">
            {/* First Name & Last Name (No external labels, Bright RED * required indicator) */}
            <div className="form-group">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '1rem', position: 'absolute', left: '12px', zIndex: 2, pointerEvents: 'none' }}>*</span>
                <input
                  type="text"
                  required
                  className="input-control"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  style={{ paddingLeft: '26px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '1rem', position: 'absolute', left: '12px', zIndex: 2, pointerEvents: 'none' }}>*</span>
                <input
                  type="text"
                  required
                  className="input-control"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  style={{ paddingLeft: '26px' }}
                />
              </div>
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

            <div className="form-group full-width" style={{ display: 'grid', gridTemplateColumns: '1fr 125px 150px', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-control"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <select
                className="input-control"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                style={{ cursor: 'pointer' }}
                title="Select State or long dash (—) for International"
              >
                <option value="" disabled>State</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.label}
                  </option>
                ))}
              </select>
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
