import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  FolderPlus,
  Pin
} from 'lucide-react';
import { ColumnSelector, STANDARD_COLUMNS } from './ColumnSelector';

const WIDTHS_STORAGE_KEY = 'eNews_Column_Widths_v1';
const STICKY_STORAGE_KEY = 'eNews_Sticky_Header_v1';

const DEFAULT_WIDTHS = {
  name: 210,
  email: 230,
  secondaryEmail: 180,
  phone: 150,
  group: 140,
  status: 120,
  address: 200,
  notes: 220,
  actions: 100
};

export const ContactTable = ({
  contacts = [],
  groups = [],
  availableColumns = STANDARD_COLUMNS,
  visibleColumns = [],
  setVisibleColumns,
  selectedIds = [],
  setSelectedIds,
  onEditContact,
  onDeleteContact,
  onBulkDelete,
  onBulkCopyEmails,
  onBulkAssignGroup,
  onOpenAddModal,
  onLoadSampleData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortField, setSortField] = useState('firstName');
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Range Selection (Shift+Click) State
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // Sticky Header Toggle State
  const [isStickyHeader, setIsStickyHeader] = useState(() => {
    const saved = localStorage.getItem(STICKY_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  });

  // Column Widths State (Resizable Columns)
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem(WIDTHS_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_WIDTHS;
  });

  // Save sticky header preference
  useEffect(() => {
    localStorage.setItem(STICKY_STORAGE_KEY, isStickyHeader ? 'true' : 'false');
  }, [isStickyHeader]);

  // Save column widths preference
  useEffect(() => {
    localStorage.setItem(WIDTHS_STORAGE_KEY, JSON.stringify(columnWidths));
  }, [columnWidths]);

  // Column resizing drag handler
  const resizingRef = useRef(null);

  const startResizing = (colId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[colId] || 150;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(70, startWidth + deltaX);
      setColumnWidths((prev) => ({
        ...prev,
        [colId]: newWidth
      }));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Identify custom columns (columns not in standard list)
  const customColumnList = availableColumns.filter(
    (col) => !STANDARD_COLUMNS.some((std) => std.id === col.id)
  );

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
    const email = (contact.email || '').toLowerCase();
    const secondaryEmail = (contact.secondaryEmail || '').toLowerCase();
    const group = (contact.group || '').toLowerCase();
    const notes = (contact.notes || '').toLowerCase();
    const customVals = contact.customFields ? Object.values(contact.customFields).join(' ').toLowerCase() : '';
    const query = searchTerm.toLowerCase();

    const matchesSearch = 
      !query ||
      fullName.includes(query) ||
      email.includes(query) ||
      secondaryEmail.includes(query) ||
      group.includes(query) ||
      notes.includes(query) ||
      customVals.includes(query);

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

  // Selection toggle with Shift+Click Range Selection
  const isAllSelected = sortedContacts.length > 0 && sortedContacts.every((c) => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedContacts.map((c) => c.id));
    }
  };

  const handleRowSelect = (contactId, index, e) => {
    if (e.shiftKey && lastSelectedIndex !== null) {
      // Range selection between lastSelectedIndex and current index
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = sortedContacts.slice(start, end + 1).map((c) => c.id);

      // Merge range with existing selection
      const newSelection = Array.from(new Set([...selectedIds, ...rangeIds]));
      setSelectedIds(newSelection);
    } else {
      // Single toggle
      if (selectedIds.includes(contactId)) {
        setSelectedIds(selectedIds.filter((id) => id !== contactId));
      } else {
        setSelectedIds([...selectedIds, contactId]);
      }
    }
    setLastSelectedIndex(index);
  };

  // Move Selected Contacts to Collection / Group
  const handleMoveToCollection = () => {
    if (selectedIds.length === 0) return;
    const targetGroup = window.prompt(
      `Enter Collection / Group name for the ${selectedIds.length} selected contacts:`,
      'Family & Friends'
    );
    if (targetGroup && targetGroup.trim()) {
      onBulkAssignGroup(selectedIds, targetGroup.trim());
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
      {/* Control Bar: Search, Group Filters, Column Selector & Sticky Header Toggle */}
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
            All Collections ({contacts.length})
          </button>
          {groups.map((grp) => {
            const grpCount = contacts.filter((c) => c.group === grp).length;
            return (
              <button 
                key={grp}
                className={`pill ${selectedGroup === grp ? 'pill-active' : ''}`}
                onClick={() => setSelectedGroup(grp)}
              >
                {grp} ({grpCount})
              </button>
            );
          })}
        </div>

        {/* Status Filter, Sticky Header Toggle, and Column Selector */}
        <div className="toolbar-controls">
          {/* Sticky Header Toggle */}
          <button
            className={`btn btn-sm ${isStickyHeader ? 'btn-outline' : 'btn-secondary'}`}
            onClick={() => setIsStickyHeader(!isStickyHeader)}
            title={`Toggle Sticky Column Headings (${isStickyHeader ? 'Enabled' : 'Disabled'})`}
          >
            <Pin size={14} className={isStickyHeader ? 'text-primary' : ''} />
            <span className="desktop-only">Sticky Header: {isStickyHeader ? 'ON' : 'OFF'}</span>
          </button>

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
            availableColumns={availableColumns}
            visibleColumns={visibleColumns} 
            setVisibleColumns={setVisibleColumns} 
          />
        </div>
      </div>

      {/* Bulk Action Strip (When items selected) */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-strip">
          <span className="bulk-count">
            <strong>{selectedIds.length}</strong> contacts highlighted (Hold <code>Shift</code> + Click to range-select)
          </span>
          <div className="bulk-btn-group">
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleMoveToCollection}
              title="Add or move selected contacts to a Collection / Group"
            >
              <FolderPlus size={14} />
              <span>Add to Collection</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onBulkCopyEmails(',', selectedIds)}
              title="Copy emails as comma-separated list for Gmail"
            >
              <Copy size={14} />
              <span>Copy Gmail (,)</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onBulkCopyEmails(';', selectedIds)}
              title="Copy emails as semicolon-separated list for Outlook"
            >
              <Copy size={14} />
              <span>Copy Outlook (;)</span>
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => onBulkDelete(selectedIds)}
            >
              <Trash2 size={14} />
              <span>Delete</span>
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
            <table className={`contact-table ${isStickyHeader ? 'sticky-header' : ''}`}>
              <thead>
                <tr>
                  <th className="th-checkbox" style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {visibleColumns.includes('name') && (
                    <th 
                      style={{ width: columnWidths.name || 210 }}
                      className="sortable resizable-th"
                    >
                      <div className="th-content" onClick={() => handleSort('name')}>
                        <span>Name</span>
                        <ArrowUpDown size={12} className="sort-icon" />
                      </div>
                      <div className="col-resizer" onMouseDown={(e) => startResizing('name', e)} />
                    </th>
                  )}
                  {visibleColumns.includes('email') && (
                    <th 
                      style={{ width: columnWidths.email || 230 }}
                      className="sortable resizable-th"
                    >
                      <div className="th-content" onClick={() => handleSort('email')}>
                        <span>Primary Email</span>
                        <ArrowUpDown size={12} className="sort-icon" />
                      </div>
                      <div className="col-resizer" onMouseDown={(e) => startResizing('email', e)} />
                    </th>
                  )}
                  {visibleColumns.includes('secondaryEmail') && (
                    <th 
                      style={{ width: columnWidths.secondaryEmail || 180 }}
                      className="resizable-th"
                    >
                      <div className="th-content">
                        <span>Secondary Email</span>
                      </div>
                      <div className="col-resizer" onMouseDown={(e) => startResizing('secondaryEmail', e)} />
                    </th>
                  )}
                  {visibleColumns.includes('phone') && (
                    <th 
                      style={{ width: columnWidths.phone || 150 }}
                      className="resizable-th"
                    >
                      <div className="th-content">
                        <span>Phone</span>
                      </div>
                      <div className="col-resizer" onMouseDown={(e) => startResizing('phone', e)} />
                    </th>
                  )}
                  {visibleColumns.includes('group') && (
                    <th 
                      style={{ width: columnWidths.group || 140 }}
                      className="sortable resizable-th"
                    >
                      <div className="th-content" onClick={() => handleSort('group')}>
                        <span>Collection / Group</span>
                        <ArrowUpDown size={12} className="sort-icon" />
                      </div>
                      <div className="col-resizer" onMouseDown={(e) => startResizing('group', e)} />
                    </th>
                  )}
                  {visibleColumns.includes('status') && (
                    <th 
                      style={{ width: columnWidths.status || 120 }}
                      className="sortable resizable-th"
                    >
                      <div className="th-content" onClick={() => handleSort('status')}>
                        <span>Status</span>
                        <ArrowUpDown size={12} className="sort-icon" />
                      </div>
                      <div className="col-resizer" onMouseDown={(e) => startResizing('status', e)} />
                    </th>
                  )}
                  {visibleColumns.includes('address') && (
                    <th 
                      style={{ width: columnWidths.address || 200 }}
                      className="resizable-th"
                    >
                      <div className="th-content">
                        <span>Address</span>
                      </div>
                      <div className="col-resizer" onMouseDown={(e) => startResizing('address', e)} />
                    </th>
                  )}
                  {visibleColumns.includes('notes') && (
                    <th 
                      style={{ width: columnWidths.notes || 220 }}
                      className="resizable-th"
                    >
                      <div className="th-content">
                        <span>Notes</span>
                      </div>
                      <div className="col-resizer" onMouseDown={(e) => startResizing('notes', e)} />
                    </th>
                  )}
                  
                  {/* Custom CSV Columns Header */}
                  {customColumnList.map((customCol) => (
                    visibleColumns.includes(customCol.id) && (
                      <th 
                        key={customCol.id}
                        style={{ width: columnWidths[customCol.id] || 160 }}
                        className="resizable-th"
                      >
                        <div className="th-content">
                          <span>{customCol.label}</span>
                        </div>
                        <div className="col-resizer" onMouseDown={(e) => startResizing(customCol.id, e)} />
                      </th>
                    )
                  ))}

                  {visibleColumns.includes('actions') && (
                    <th className="th-actions" style={{ width: columnWidths.actions || 100 }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedContacts.map((contact, idx) => {
                  const isSelected = selectedIds.includes(contact.id);
                  return (
                    <tr 
                      key={contact.id} 
                      className={isSelected ? 'row-selected' : ''}
                      onClick={(e) => handleRowSelect(contact.id, idx, e)}
                    >
                      <td className="td-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(contact.id, idx, e)}
                          onClick={(e) => e.stopPropagation()}
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
                            <a href={`mailto:${contact.email}`} className="email-link" onClick={(e) => e.stopPropagation()}>
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
                            <a href={`mailto:${contact.secondaryEmail}`} className="email-sublink" onClick={(e) => e.stopPropagation()}>
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

                      {/* Custom CSV Column Cells */}
                      {customColumnList.map((customCol) => (
                        visibleColumns.includes(customCol.id) && (
                          <td key={customCol.id}>
                            {contact.customFields && contact.customFields[customCol.id] 
                              ? contact.customFields[customCol.id] 
                              : <span className="text-muted">-</span>}
                          </td>
                        )
                      ))}

                      {visibleColumns.includes('actions') && (
                        <td className="td-actions" onClick={(e) => e.stopPropagation()}>
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
            {sortedContacts.map((contact, idx) => {
              const isSelected = selectedIds.includes(contact.id);
              return (
                <div 
                  key={contact.id} 
                  className={`contact-card ${isSelected ? 'card-selected' : ''}`}
                  onClick={(e) => handleRowSelect(contact.id, idx, e)}
                >
                  <div className="card-top">
                    <div className="card-user">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelect(contact.id, idx, e)}
                        onClick={(e) => e.stopPropagation()}
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
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
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
                        <a href={`mailto:${contact.email}`} className="email-link" onClick={(e) => e.stopPropagation()}>
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
                        <a href={`tel:${contact.phone}`} onClick={(e) => e.stopPropagation()}>{contact.phone}</a>
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
