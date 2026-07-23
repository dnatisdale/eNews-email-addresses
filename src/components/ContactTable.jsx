import React, { useState } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Filter, 
  ArrowUpDown, 
  UserCheck, 
  Mail, 
  Phone, 
  MoreVertical,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { ColumnSelector } from './ColumnSelector';

export const ContactTable = ({
  contacts = [],
  groups = [],
  visibleColumns = [],
  setVisibleColumns,
  selectedIds = [],
  setSelectedIds,
  onEditContact,
  onDeleteContact,
  onBulkDelete,
  onBulkCopyEmails,
  onOpenAddModal,
  onLoadSampleData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortField, setSortField] = useState('firstName');
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
    const email = (contact.email || '').toLowerCase();
    const secondaryEmail = (contact.secondaryEmail || '').toLowerCase();
    const group = (contact.group || '').toLowerCase();
    const notes = (contact.notes || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = 
      !query ||
      fullName.includes(query) ||
      email.includes(query) ||
      secondaryEmail.includes(query) ||
      group.includes(query) ||
      notes.includes(query);

    const matchesGroup = selectedGroup === 'All' || contact.group === selectedGroup;
    const matchesStatus = selectedStatus === 'All' || contact.status === selectedStatus;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let valA = (a[sortField] || '').toString().toLowerCase();
    let valB = (b[sortField] || '').toString().toLowerCase();

    if (sortField === 'name') {
      valA = `${a.firstName} ${a.lastName}`.toLowerCase();
      valB = `${b.firstName} ${b.lastName}`.toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Selection toggle
  const isAllSelected = sortedContacts.length > 0 && sortedContacts.every((c) => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedContacts.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Copy single email to clipboard
  const handleCopyEmail = (contact, e) => {
    e.stopPropagation();
    const formatted = `"${contact.firstName} ${contact.lastName}" <${contact.email}>`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(contact.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="contact-manager-wrap">
      {/* Control Bar: Search, Group Filters, Column Selector */}
      <div className="control-bar">
        {/* Search Box */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search contacts by name, email, group, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        {/* Group Filter Pills */}
        <div className="filter-group-pills">
          <button 
            className={`pill ${selectedGroup === 'All' ? 'pill-active' : ''}`}
            onClick={() => setSelectedGroup('All')}
          >
            All Groups
          </button>
          {groups.map((grp) => (
            <button 
              key={grp}
              className={`pill ${selectedGroup === grp ? 'pill-active' : ''}`}
              onClick={() => setSelectedGroup(grp)}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Status Filter Dropdown & Column Selector */}
        <div className="toolbar-controls">
          <div className="status-filter-wrap">
            <Filter size={14} className="filter-icon" />
            <select 
              className="select-control-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive</option>
              <option value="Unsubscribed">Unsubscribed</option>
            </select>
          </div>

          <ColumnSelector 
            visibleColumns={visibleColumns} 
            setVisibleColumns={setVisibleColumns} 
          />
        </div>
      </div>

      {/* Bulk Action Strip (When items selected) */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-strip">
          <span className="bulk-count"><strong>{selectedIds.length}</strong> contacts selected</span>
          <div className="bulk-btn-group">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onBulkCopyEmails(',', selectedIds)}
              title="Copy emails as comma-separated list for Gmail"
            >
              <Copy size={14} />
              <span>Copy for Gmail (,)</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onBulkCopyEmails(';', selectedIds)}
              title="Copy emails as semicolon-separated list for Outlook"
            >
              <Copy size={14} />
              <span>Copy for Outlook (;)</span>
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => onBulkDelete(selectedIds)}
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {sortedContacts.length === 0 ? (
        <div className="empty-state">
          <UserCheck size={48} className="empty-icon" />
          <h3>No contacts found</h3>
          <p>{searchTerm ? 'Try adjusting your search query or filters.' : 'Your eNews address book is currently empty.'}</p>
          <div className="empty-actions">
            {contacts.length === 0 && (
              <button className="btn btn-secondary" onClick={onLoadSampleData}>
                <Sparkles size={16} />
                <span>Load 50 Sample Contacts</span>
              </button>
            )}
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <Mail size={16} />
              <span>Add Your First Contact</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-responsive desktop-view">
            <table className="contact-table">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {visibleColumns.includes('name') && (
                    <th onClick={() => handleSort('name')} className="sortable">
                      <span>Name</span>
                      <ArrowUpDown size={12} className="sort-icon" />
                    </th>
                  )}
                  {visibleColumns.includes('email') && (
                    <th onClick={() => handleSort('email')} className="sortable">
                      <span>Primary Email</span>
                      <ArrowUpDown size={12} className="sort-icon" />
                    </th>
                  )}
                  {visibleColumns.includes('secondaryEmail') && <th>Secondary Email</th>}
                  {visibleColumns.includes('phone') && <th>Phone</th>}
                  {visibleColumns.includes('group') && (
                    <th onClick={() => handleSort('group')} className="sortable">
                      <span>Group</span>
                      <ArrowUpDown size={12} className="sort-icon" />
                    </th>
                  )}
                  {visibleColumns.includes('status') && (
                    <th onClick={() => handleSort('status')} className="sortable">
                      <span>Status</span>
                      <ArrowUpDown size={12} className="sort-icon" />
                    </th>
                  )}
                  {visibleColumns.includes('address') && <th>Address</th>}
                  {visibleColumns.includes('notes') && <th>Notes</th>}
                  {visibleColumns.includes('actions') && <th className="th-actions">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sortedContacts.map((contact) => {
                  const isSelected = selectedIds.includes(contact.id);
                  return (
                    <tr key={contact.id} className={isSelected ? 'row-selected' : ''}>
                      <td className="td-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(contact.id)}
                        />
                      </td>

                      {visibleColumns.includes('name') && (
                        <td className="td-name">
                          <div className="name-wrap">
                            <span className="avatar-circle">
                              {(contact.firstName[0] || 'U').toUpperCase()}
                            </span>
                            <div>
                              <strong className="contact-name">{contact.firstName} {contact.lastName}</strong>
                            </div>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('email') && (
                        <td className="td-email">
                          <div className="email-copy-wrap">
                            <a href={`mailto:${contact.email}`} className="email-link">
                              {contact.email}
                            </a>
                            <button
                              className="copy-badge-btn"
                              onClick={(e) => handleCopyEmail(contact, e)}
                              title="Copy name & email to clipboard"
                            >
                              {copiedId === contact.id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('secondaryEmail') && (
                        <td className="td-secondary-email">
                          {contact.secondaryEmail ? (
                            <a href={`mailto:${contact.secondaryEmail}`} className="email-sublink">
                              {contact.secondaryEmail}
                            </a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      )}

                      {visibleColumns.includes('phone') && (
                        <td>{contact.phone || <span className="text-muted">-</span>}</td>
                      )}

                      {visibleColumns.includes('group') && (
                        <td>
                          <span className={`tag-badge tag-${contact.group.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                            {contact.group}
                          </span>
                        </td>
                      )}

                      {visibleColumns.includes('status') && (
                        <td>
                          <span className={`status-badge status-${contact.status.toLowerCase()}`}>
                            {contact.status}
                          </span>
                        </td>
                      )}

                      {visibleColumns.includes('address') && (
                        <td className="td-address">{contact.address || <span className="text-muted">-</span>}</td>
                      )}

                      {visibleColumns.includes('notes') && (
                        <td className="td-notes">{contact.notes || <span className="text-muted">-</span>}</td>
                      )}

                      {visibleColumns.includes('actions') && (
                        <td className="td-actions">
                          <div className="action-row">
                            <button
                              className="icon-action-btn"
                              onClick={() => onEditContact(contact)}
                              title="Edit Contact"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="icon-action-btn text-danger"
                              onClick={() => onDeleteContact(contact.id)}
                              title="Delete Contact"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-cards-view">
            {sortedContacts.map((contact) => {
              const isSelected = selectedIds.includes(contact.id);
              return (
                <div key={contact.id} className={`contact-card ${isSelected ? 'card-selected' : ''}`}>
                  <div className="card-top">
                    <div className="card-user">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(contact.id)}
                      />
                      <span className="avatar-circle-sm">
                        {(contact.firstName[0] || 'U').toUpperCase()}
                      </span>
                      <div>
                        <h4 className="card-name">{contact.firstName} {contact.lastName}</h4>
                        <span className={`status-badge status-${contact.status.toLowerCase()}`}>
                          {contact.status}
                        </span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        className="icon-action-btn"
                        onClick={() => onEditContact(contact)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-action-btn text-danger"
                        onClick={() => onDeleteContact(contact.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    {visibleColumns.includes('email') && (
                      <div className="card-field">
                        <Mail size={14} className="field-icon" />
                        <a href={`mailto:${contact.email}`} className="email-link">
                          {contact.email}
                        </a>
                        <button
                          className="copy-badge-btn"
                          onClick={(e) => handleCopyEmail(contact, e)}
                        >
                          {copiedId === contact.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}

                    {visibleColumns.includes('phone') && contact.phone && (
                      <div className="card-field">
                        <Phone size={14} className="field-icon" />
                        <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                      </div>
                    )}

                    {visibleColumns.includes('group') && (
                      <div className="card-field">
                        <span className={`tag-badge tag-${contact.group.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                          {contact.group}
                        </span>
                      </div>
                    )}

                    {visibleColumns.includes('notes') && contact.notes && (
                      <p className="card-notes">📝 {contact.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
