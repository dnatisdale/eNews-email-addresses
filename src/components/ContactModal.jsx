import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Tag, MapPin, FileText, CheckCircle } from 'lucide-react';

export const ContactModal = ({ isOpen, onClose, onSave, contactToEdit, groups = [] }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    group: 'Friends & Family',
    status: 'Active',
    address: '',
    notes: ''
  });

  const [customGroup, setCustomGroup] = useState('');
  const [showCustomGroup, setShowCustomGroup] = useState(false);

  useEffect(() => {
    if (contactToEdit) {
      setFormData({
        firstName: contactToEdit.firstName || '',
        lastName: contactToEdit.lastName || '',
        email: contactToEdit.email || '',
        secondaryEmail: contactToEdit.secondaryEmail || '',
        phone: contactToEdit.phone || '',
        group: contactToEdit.group || 'Friends & Family',
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
        group: 'Friends & Family',
        status: 'Active',
        address: '',
        notes: ''
      });
    }
    setShowCustomGroup(false);
  }, [contactToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalGroup = showCustomGroup && customGroup.trim() ? customGroup.trim() : formData.group;
    onSave({
      ...formData,
      group: finalGroup,
      id: contactToEdit ? contactToEdit.id : undefined
    });
    onClose();
  };

  const handleGroupSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__ADD_NEW__') {
      setShowCustomGroup(true);
    } else {
      setShowCustomGroup(false);
      setFormData({ ...formData, group: val });
    }
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
              <label>First Name *</label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="e.g. Eleanor"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Tisdale"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            {/* Primary Email */}
            <div className="form-group">
              <label>Primary Email *</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  className="input-control"
                  placeholder="eleanor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Secondary Email */}
            <div className="form-group">
              <label>Secondary Email</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="input-control"
                  placeholder="work.email@company.com"
                  value={formData.secondaryEmail}
                  onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  className="input-control"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Group / Category */}
            <div className="form-group">
              <label>Group / Tag</label>
              {!showCustomGroup ? (
                <select
                  className="input-control"
                  value={formData.group}
                  onChange={handleGroupSelectChange}
                >
                  <option value="Family">Family</option>
                  <option value="Friends & Family">Friends & Family</option>
                  <option value="Close Friends">Close Friends</option>
                  <option value="Newsletter">Newsletter List</option>
                  <option value="Holiday List">Holiday List</option>
                  {groups.filter(g => !['Family', 'Friends & Family', 'Close Friends', 'Newsletter', 'Holiday List'].includes(g)).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                  <option value="__ADD_NEW__">+ Create Custom Group...</option>
                </select>
              ) : (
                <input
                  type="text"
                  autoFocus
                  className="input-control"
                  placeholder="Type new group name..."
                  value={customGroup}
                  onChange={(e) => setCustomGroup(e.target.value)}
                />
              )}
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status</label>
              <select
                className="input-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active (Receives eNews)</option>
                <option value="Inactive">Inactive</option>
                <option value="Unsubscribed">Unsubscribed</option>
                <option value="Bounced">Bounced / Undeliverable</option>
              </select>
            </div>

            {/* Address */}
            <div className="form-group full-width">
              <label>Physical Address</label>
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
              <label>Notes</label>
              <textarea
                rows={3}
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
