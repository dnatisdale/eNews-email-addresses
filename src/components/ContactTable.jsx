import React, { useState, useEffect } from 'react';
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
  Sparkles,
  FolderPlus,
  Pin,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';
import { ColumnSelector, STANDARD_COLUMNS } from './ColumnSelector';
import { getContactAccuracy } from '../services/accuracyEvaluator';
import { cleanAndFormatPhone } from '../services/phoneService';
import { CallModal } from './CallModal';
import { AZIndexBar } from './AZIndexBar';

const WIDTHS_STORAGE_KEY = 'eNews_Column_Widths_v1';
const STICKY_STORAGE_KEY = 'eNews_Sticky_Header_v1';

const DEFAULT_WIDTHS = {
  accuracy: 60,
  name: 210,
  email: 230,
  secondaryEmail: 180,
  phone: 150,
  categories: 160,
  status: 120,
  address: 200,
  notes: 220,
  actions: 100
};

export const ContactTable = ({
  contacts = [],
  masterCategories = [],
  availableColumns = STANDARD_COLUMNS,
  visibleColumns = [],
  setVisibleColumns,
  columnWidths,
  setColumnWidths,
  onReorderColumns,
  selectedIds = [],
  setSelectedIds,
  onEditContact,
  onDeleteContact,
  onBulkDelete,
  onBulkCopyEmails,
  onBulkAssignCategories,
  onOpenAddModal,
  onLoadSampleData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [accuracyFilter, setAccuracyFilter] = useState('All');
  const [activeLetter, setActiveLetter] = useState('All');
  const [sortField, setSortField] = useState('score'); // Default sort by Score!
  const [showFilters, setShowFilters] = useState(false);
  const [sortAsc, setSortAsc] = useState(false); // Default Green -> Yellow -> Red
  const [copiedId, setCopiedId] = useState(null);

  // Call Modal State
  const [callModalContact, setCallModalContact] = useState(null);

  // Range Selection (Shift+Click) State
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);



  // Column Widths State (Resizable Columns)
  // columnWidths and setColumnWidths are now props

  // Column resizing drag handler
  const startResizing = (colId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[colId] || 80;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(20, startWidth + deltaX);
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
    const categoriesStr = (Array.isArray(contact.categories) ? contact.categories.join(' ') : '').toLowerCase();
    const notes = (contact.notes || '').toLowerCase();
    const customVals = contact.customFields ? Object.values(contact.customFields).join(' ').toLowerCase() : '';
    const query = searchTerm.toLowerCase();

    const matchesSearch = 
      !query ||
      fullName.includes(query) ||
      email.includes(query) ||
      secondaryEmail.includes(query) ||
      categoriesStr.includes(query) ||
      notes.includes(query) ||
      customVals.includes(query);

    // Category filter
    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      matchesCategory = Array.isArray(contact.categories) && contact.categories.includes(selectedCategory);
    }
    const matchesStatus = selectedStatus === 'All' || contact.status === selectedStatus;

    // Accuracy Rating Filter
    let matchesAccuracy = true;
    if (accuracyFilter !== 'All') {
      const acc = getContactAccuracy(contact);
      matchesAccuracy = acc.level === accuracyFilter;
    }

    // A-Z Quick Jump Filter
    let matchesLetter = true;
    if (activeLetter !== 'All') {
      const firstChar = (contact.firstName[0] || contact.lastName[0] || '').toUpperCase();
      if (activeLetter === '#') {
        matchesLetter = !('A' <= firstChar && firstChar <= 'Z');
      } else {
        matchesLetter = firstChar === activeLetter;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesAccuracy && matchesLetter;
  });

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortField === 'score') {
      const rankA = getContactAccuracy(a).scoreRank;
      const rankB = getContactAccuracy(b).scoreRank;
      if (rankA < rankB) return sortAsc ? -1 : 1;
      if (rankA > rankB) return sortAsc ? 1 : -1;
      return 0;
    }

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
      setSortAsc(field === 'score' ? false : true);
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
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = sortedContacts.slice(start, end + 1).map((c) => c.id);

      const newSelection = Array.from(new Set([...selectedIds, ...rangeIds]));
      setSelectedIds(newSelection);
    } else {
      if (selectedIds.includes(contactId)) {
        setSelectedIds(selectedIds.filter((id) => id !== contactId));
      } else {
        setSelectedIds([...selectedIds, contactId]);
      }
    }
    setLastSelectedIndex(index);
  };

  // Assign Selected Contacts to Categories
  const handleAssignCategories = () => {
    if (selectedIds.length === 0) return;
    const targetCategoriesRaw = window.prompt(
      `Enter Categories for the ${selectedIds.length} selected contacts (comma separated):`,
      'Friends & Family'
    );
    if (targetCategoriesRaw && targetCategoriesRaw.trim()) {
      const categoriesToAdd = targetCategoriesRaw.split(',').map(c => c.trim()).filter(Boolean);
      onBulkAssignCategories(selectedIds, categoriesToAdd);
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

  // Open Call Confirmation Modal
  const handlePhoneClick = (contact, e) => {
    e.stopPropagation();
    e.preventDefault();
    setCallModalContact(contact);
  };

  return (
    <div className="contact-manager-wrap">
      {/* Collapsible Right-Side A-Z Rolodex Index */}
      <AZIndexBar 
        activeLetter={activeLetter}
        onSelectLetter={setActiveLetter}
        contacts={contacts}
      />

      {/* Control Bar: Search, Category Filters, Accuracy Filters, Column Selector & Sticky Header Toggle */}
      <div className="control-bar">
        {/* Search Box */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search contacts by name, email, phone, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="toolbar-controls">
          <button 
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle Filters"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {(selectedCategory !== 'All' || accuracyFilter !== 'All' || selectedStatus !== 'All') && (
              <span className="badge-pill bg-danger" style={{ marginLeft: '4px', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>!</span>
            )}
          </button>

          <ColumnSelector 
            availableColumns={availableColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            onReorderColumns={onReorderColumns} 
          />
        </div>
      </div>

      {/* Expandable Filters Panel */}
      {showFilters && (
        <div className="active-filters-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Filters:</div>
          
          <div className="filter-group-pills" style={{ margin: 0 }}>
            <button 
              className={`pill ${selectedCategory === 'All' ? 'pill-active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All Categories ({contacts.length})
            </button>
            {masterCategories.map((cat) => {
              const catCount = contacts.filter((c) => Array.isArray(c.categories) && c.categories.includes(cat)).length;
              return (
                <button 
                  key={cat}
                  className={`pill ${selectedCategory === cat ? 'pill-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat} ({catCount})
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
            <div className="status-filter-wrap" style={{ margin: 0 }}>
              <ShieldCheck size={14} className="filter-icon text-primary" />
              <select
                className="select-control-sm"
                value={accuracyFilter}
                onChange={(e) => setAccuracyFilter(e.target.value)}
                title="Filter by Score Light Rating"
              >
                <option value="All">All Score Lights</option>
                <option value="green">🟢 Green Lights Only</option>
                <option value="yellow">🟡 Yellow Lights Only</option>
                <option value="red">🔴 Red Lights Only</option>
              </select>
            </div>

            <div className="status-filter-wrap" style={{ margin: 0 }}>
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
          </div>
        </div>
      )}

      {/* Bulk Action Strip (When items selected) */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-strip">
          <span className="bulk-count">
            <strong>{selectedIds.length}</strong> contacts highlighted (Hold <code>Shift</code> + Click to range-select)
          </span>
          <div className="bulk-btn-group">
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleAssignCategories}
              title="Add selected contacts to Categories"
            >
              <FolderPlus size={14} />
              <span>Assign Categories</span>
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
          <p>{searchTerm || activeLetter !== 'All' ? 'Try adjusting your search query, letter filter, or score filters.' : 'Your eNews address book is currently empty.'}</p>
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
                  {/* Dynamic Reorderable Columns */}
                  {availableColumns.filter(c => visibleColumns.includes(c.id)).map(col => {
                    switch (col.id) {
                      case 'checkbox':
                        return (
                          <th key="checkbox" className="th-checkbox" style={{ width: columnWidths.checkbox || 45 }}>
                            <div className="th-content">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                              />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('checkbox', e)} />
                          </th>
                        );
                      case 'index':
                        return (
                          <th key="index" className="th-index" style={{ width: columnWidths.index || 50 }}>
                            <div className="th-content">
                              <span>#</span>
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('index', e)} />
                          </th>
                        );
                      case 'score':
                        return (
                          <th key="score" style={{ width: columnWidths.score || 60 }} className="sortable resizable-th th-score">
                            <div className="th-content" onClick={() => handleSort('score')} title="Click to sort by Score Ranking (Green -> Yellow -> Red)">
                              <span>Score</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('score', e)} />
                          </th>
                        );
                      case 'name':
                        return (
                          <th key="name" style={{ width: columnWidths.name || 210 }} className="sortable resizable-th">
                            <div className="th-content" onClick={() => handleSort('name')}>
                              <span>Name</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('name', e)} />
                          </th>
                        );
                      case 'email':
                        return (
                          <th key="email" style={{ width: columnWidths.email || 260 }} className="sortable resizable-th">
                            <div className="th-content" onClick={() => handleSort('email')}>
                              <span>Email</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('email', e)} />
                          </th>
                        );
                      case 'secondaryEmail':
                        return (
                          <th key="secondaryEmail" style={{ width: columnWidths.secondaryEmail || 200 }} className="resizable-th">
                            <div className="th-content"><span>Secondary Email</span></div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('secondaryEmail', e)} />
                          </th>
                        );
                      case 'phone':
                        return (
                          <th key="phone" style={{ width: columnWidths.phone || 220 }} className="resizable-th">
                            <div className="th-content"><span>Phone</span></div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('phone', e)} />
                          </th>
                        );
                      case 'categories':
                        return (
                          <th key="categories" style={{ width: columnWidths.categories || 160 }} className="resizable-th">
                            <div className="th-content"><span>Categories</span></div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('categories', e)} />
                          </th>
                        );
                      case 'status':
                        return (
                          <th key="status" style={{ width: columnWidths.status || 120 }} className="sortable resizable-th">
                            <div className="th-content" onClick={() => handleSort('status')}>
                              <span>Status</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('status', e)} />
                          </th>
                        );
                      case 'address':
                        return (
                          <th key="address" style={{ width: columnWidths.address || 250 }} className="resizable-th">
                            <div className="th-content"><span>Address</span></div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('address', e)} />
                          </th>
                        );
                      case 'notes':
                        return (
                          <th key="notes" style={{ width: columnWidths.notes || 250 }} className="resizable-th">
                            <div className="th-content"><span>Notes</span></div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('notes', e)} />
                          </th>
                        );
                      case 'actions':
                        return (
                          <th key="actions" className="th-actions" style={{ width: columnWidths.actions || 100 }}>Actions</th>
                        );
                      default:
                        return (
                          <th key={col.id} style={{ width: columnWidths[col.id] || 160 }} className="resizable-th">
                            <div className="th-content"><span>{col.label}</span></div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing(col.id, e)} />
                          </th>
                        );
                    }
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedContacts.map((contact, idx) => {
                  const isSelected = selectedIds.includes(contact.id);
                  const accuracy = getContactAccuracy(contact);
                  const formattedPhone = cleanAndFormatPhone(contact.phone);

                  return (
                    <tr 
                      key={contact.id} 
                      className={isSelected ? 'row-selected' : ''}
                      onClick={(e) => handleRowSelect(contact.id, idx, e)}
                    >
                      {/* Dynamic Reorderable Body Cells */}
                      {availableColumns.filter(c => visibleColumns.includes(c.id)).map(col => {
                        switch(col.id) {
                          case 'checkbox':
                            return (
                              <td key="checkbox" className="td-checkbox">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleRowSelect(contact.id, idx, e)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                            );
                          case 'index':
                            return (
                              <td key="index" className="td-index" style={{ color: 'var(--text-muted)' }}>
                                {idx + 1}
                              </td>
                            );
                          case 'score':
                            return (
                              <td key="score" className="td-accuracy" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                                <div 
                                  className={`score-grade grade-${accuracy.grade}`}
                                  title={accuracy.tooltip}
                                  style={{ fontWeight: 'bold', fontSize: '1.1rem', color: accuracy.color }}
                                >
                                  {accuracy.grade}
                                </div>
                              </td>
                            );
                          case 'name':
                            return (
                              <td key="name" className="td-name">
                                <strong className="contact-name">{contact.firstName} {contact.lastName}</strong>
                              </td>
                            );
                          case 'email':
                            return (
                              <td key="email" className="td-email">
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
                            );
                          case 'secondaryEmail':
                            return (
                              <td key="secondaryEmail" className="td-secondary-email">
                                {contact.secondaryEmail ? (
                                  <a href={`mailto:${contact.secondaryEmail}`} className="email-link" onClick={(e) => e.stopPropagation()}>
                                    {contact.secondaryEmail}
                                  </a>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            );
                          case 'phone':
                            return (
                              <td key="phone" className="td-phone">
                                {contact.phone ? (
                                  <button
                                    className="btn-phone-call"
                                    onClick={(e) => handlePhoneClick(contact, e)}
                                    title={`Click to call ${contact.firstName} via Phone, WhatsApp, Skype, or FaceTime`}
                                  >
                                    <span>{formattedPhone}</span>
                                  </button>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            );
                          case 'categories':
                            return (
                              <td key="categories" className="td-categories">
                                {Array.isArray(contact.categories) && contact.categories.length > 0 ? (
                                  <div className="category-pill-group">
                                    {contact.categories.map((cat, i) => (
                                      <span key={i} className={`tag-badge tag-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                                        {cat}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            );
                          case 'status':
                            return (
                              <td key="status">
                                <span className={`status-badge status-${contact.status.toLowerCase()}`}>
                                  {contact.status}
                                </span>
                              </td>
                            );
                          case 'address':
                            return <td key="address" className="td-address">{contact.address || <span className="text-muted">-</span>}</td>;
                          case 'notes':
                            return <td key="notes" className="td-notes">{contact.notes || <span className="text-muted">-</span>}</td>;
                          case 'actions':
                            return (
                              <td key="actions" className="td-actions" onClick={(e) => e.stopPropagation()}>
                                <div className="action-row">
                                  <button
                                    className="icon-action-btn"
                                    onClick={() => onEditContact(contact)}
                                    title="Edit Contact"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                </div>
                              </td>
                            );
                          default:
                            return (
                              <td key={col.id}>
                                {contact.customFields && contact.customFields[col.id] 
                                  ? contact.customFields[col.id] 
                                  : <span className="text-muted">-</span>}
                              </td>
                            );
                        }
                      })}
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
              const accuracy = getContactAccuracy(contact);
              const formattedPhone = cleanAndFormatPhone(contact.phone);

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
                      <div>
                        <h4 className="card-name">{contact.firstName} {contact.lastName}</h4>
                        <div className="card-badges-wrap">
                          <span className={`status-badge status-${contact.status.toLowerCase()}`}>
                            {contact.status}
                          </span>
                          <div 
                            className={`score-grade grade-${accuracy.grade}`}
                            title={accuracy.tooltip}
                            style={{ fontWeight: 'bold', fontSize: '1.1rem', color: accuracy.color, textAlign: 'center' }}
                          >
                            {accuracy.grade}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="icon-action-btn"
                        onClick={() => onEditContact(contact)}
                      >
                        <Edit2 size={16} />
                      </button>
                      {/* Delete button removed as requested */}
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
                        <button 
                          className="btn-phone-call"
                          onClick={(e) => handlePhoneClick(contact, e)}
                        >
                          <span>{formattedPhone}</span>
                        </button>
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

      {/* Call Confirmation & App Launcher Modal */}
      <CallModal
        isOpen={Boolean(callModalContact)}
        onClose={() => setCallModalContact(null)}
        contact={callModalContact}
      />
    </div>
  );
};
