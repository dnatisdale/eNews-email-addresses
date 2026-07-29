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
  Phone,
  Sparkles,
  FolderPlus,
  Pin,
  ShieldCheck,
  SlidersHorizontal,
  RotateCcw,
  RotateCw,
  X,
  Lock
} from 'lucide-react';
import { ColumnSelector, STANDARD_COLUMNS } from './ColumnSelector';
import { getContactAccuracy } from '../services/accuracyEvaluator';
import { BulkCategoryAssignModal } from './BulkCategoryAssignModal';

export const AccuracyBoxes = ({ accuracy }) => {
  if (!accuracy) return null;
  const count = typeof accuracy.count === 'number' ? accuracy.count : 0;

  let badgeColor = 'var(--text-muted)';
  let bgStyle = 'rgba(100, 116, 139, 0.15)';

  if (count === 4) {
    badgeColor = '#10b981'; // 4: Green (All 4 present: Name, Email, Address, Phone)
    bgStyle = 'rgba(16, 185, 129, 0.18)';
  } else if (count === 3) {
    badgeColor = '#3b82f6'; // 3: Blue
    bgStyle = 'rgba(59, 130, 246, 0.18)';
  } else if (count === 2) {
    badgeColor = '#f59e0b'; // 2: Amber
    bgStyle = 'rgba(245, 158, 11, 0.18)';
  } else {
    badgeColor = '#ef4444'; // 1 or 0: Red
    bgStyle = 'rgba(239, 68, 68, 0.18)';
  }

  return (
    <div 
      className="score-number-badge-wrap" 
      title={accuracy.tooltip || `Completeness: ${count}/4 items present (Name, Email, Address, Phone)`}
      aria-label={`Completeness Score: ${count} of 4`}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <span
        className="score-number-badge"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: badgeColor,
          backgroundColor: bgStyle,
          border: `1.5px solid ${badgeColor}`,
          lineHeight: 1,
          textAlign: 'center'
        }}
      >
        {count}
      </span>
    </div>
  );
};
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

export const getInitials = (firstName, lastName) => {
  const f = (firstName || '').trim()[0] || '';
  const l = (lastName || '').trim()[0] || '';
  const initials = (f + l).toUpperCase();
  return initials || '?';
};

export const getAvatarGradient = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
  ];
  return gradients[Math.abs(hash) % gradients.length];
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
  onAddNewMasterCategory,
  onOpenAddModal,
  onLoadSampleData,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  undoCount = 0,
  redoCount = 0,
  showFilters: propShowFilters,
  setShowFilters: propSetShowFilters,
  onResetFilters: propResetFilters,
  nameSortOrder = 'last'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [accuracyFilter, setAccuracyFilter] = useState('All');
  const [activeLetter, setActiveLetter] = useState('All');
  const [sortField, setSortField] = useState('score'); // Default sort by Score!
  const [internalShowFilters, setInternalShowFilters] = useState(false);

  const showFilters = propShowFilters !== undefined ? propShowFilters : internalShowFilters;
  const setShowFilters = propSetShowFilters || setInternalShowFilters;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setAccuracyFilter('All');
    setActiveLetter('All');
    if (propResetFilters) propResetFilters();
  };
  const [sortAsc, setSortAsc] = useState(false); // Default Green -> Yellow -> Red
  const [copiedId, setCopiedId] = useState(null);

  // Call Modal State
  const [callModalContact, setCallModalContact] = useState(null);

  // Range Selection (Shift+Click) State
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // Bulk Category Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);



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

    // Category & Tag filter
    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      const isInCategory = Array.isArray(contact.categories) && contact.categories.includes(selectedCategory);
      const isStatusMatch = contact.status && contact.status.toLowerCase().includes(selectedCategory.toLowerCase());
      matchesCategory = isInCategory || isStatusMatch;
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

    let valA = '';
    let valB = '';

    if (sortField === 'name') {
      if (nameSortOrder === 'last') {
        const lastA = (a.lastName || a.firstName || '').trim().toLowerCase();
        const lastB = (b.lastName || b.firstName || '').trim().toLowerCase();
        const firstA = (a.firstName || '').trim().toLowerCase();
        const firstB = (b.firstName || '').trim().toLowerCase();
        valA = `${lastA} ${firstA}`;
        valB = `${lastB} ${firstB}`;
      } else {
        const firstA = (a.firstName || a.lastName || '').trim().toLowerCase();
        const firstB = (b.firstName || b.lastName || '').trim().toLowerCase();
        const lastA = (a.lastName || '').trim().toLowerCase();
        const lastB = (b.lastName || '').trim().toLowerCase();
        valA = `${firstA} ${lastA}`;
        valB = `${firstB} ${lastB}`;
      }
    } else if (sortField === 'categories') {
      valA = Array.isArray(a.categories) ? [...a.categories].sort().join(', ').toLowerCase() : (a.categories || '').toString().toLowerCase();
      valB = Array.isArray(b.categories) ? [...b.categories].sort().join(', ').toLowerCase() : (b.categories || '').toString().toLowerCase();
    } else {
      valA = (a[sortField] || '').toString().toLowerCase();
      valB = (b[sortField] || '').toString().toLowerCase();
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
    setIsAssignModalOpen(true);
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
              All Tags ({contacts.length})
            </button>
            {masterCategories.filter(cat => cat !== '*EXAMPLES*').map((cat) => {
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
            {['Unsubscribed', 'Bounced', 'Inactive'].map((tag) => {
              const tagCount = contacts.filter((c) => c.status && c.status.toLowerCase().includes(tag.toLowerCase())).length;
              if (tagCount === 0) return null;
              const badgeIcon = tag === 'Unsubscribed' ? '🚫' : tag === 'Bounced' ? '⚠️' : '💤';
              return (
                <button 
                  key={tag}
                  className={`pill pill-exception ${selectedCategory === tag ? 'pill-active' : ''}`}
                  onClick={() => setSelectedCategory(tag)}
                >
                  {badgeIcon} {tag} ({tagCount})
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
                title="Filter by 4-Item Completeness (Name, Email, Phone, Address)"
              >
                <option value="All">All Completeness Scores</option>
                <option value="green">🟢 4/4 Complete (All Items)</option>
                <option value="yellow">🟡 2-3 Items Present</option>
                <option value="red">🔴 0-1 Items Present</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Strip (When items selected) */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-strip">
          <div className="bulk-count-wrap">
            <span className="bulk-count">
              <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'contact' : 'contacts'} selected
            </span>
          </div>

          <div className="bulk-btn-group">
            <button 
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAssignCategories}
              title="Add selected contacts to Categories"
            >
              <FolderPlus size={14} />
              <span>Assign Categories</span>
            </button>
            <button 
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onBulkDelete(selectedIds)}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm deselect-btn"
              onClick={() => setSelectedIds([])}
              title="Deselect all and hide selection toolbar"
            >
              <X size={14} />
              <span>Deselect</span>
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
                <span>Load Sample Contacts</span>
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
                            <div className="th-content" onClick={() => handleSort('score')} title="Click to sort by Completeness Score (1 to 4 items: Name, Email, Address, Phone)">
                              <span>Score</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('score', e)} />
                          </th>
                        );
                      case 'name':
                        return (
                          <th key="name" style={{ width: columnWidths.name || 210 }} className="sortable resizable-th">
                            <div className="th-content" onClick={() => handleSort('name')} title={`Click to sort by Name (${nameSortOrder === 'last' ? 'Last Name' : 'First Name'})`}>
                              <span>Name ({nameSortOrder === 'last' ? 'Last' : 'First'})</span>
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
                          <th key="secondaryEmail" style={{ width: columnWidths.secondaryEmail || 200 }} className="sortable resizable-th">
                            <div className="th-content" onClick={() => handleSort('secondaryEmail')} title="Click to sort by Secondary Email">
                              <span>Secondary Email</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('secondaryEmail', e)} />
                          </th>
                        );
                      case 'phone':
                        return (
                          <th key="phone" style={{ width: columnWidths.phone || 220 }} className="sortable resizable-th">
                            <div className="th-content" onClick={() => handleSort('phone')} title="Click to sort by Phone">
                              <span>Phone</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('phone', e)} />
                          </th>
                        );
                      case 'categories':
                        return (
                          <th key="categories" style={{ width: columnWidths.categories || 180 }} className="sortable resizable-th">
                            <div className="th-content" onClick={() => handleSort('categories')} title="Click to sort by Tag(s)">
                              <span>Tags</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('categories', e)} />
                          </th>
                        );
                      case 'address':
                        return (
                          <th key="address" style={{ width: columnWidths.address || 250 }} className="sortable resizable-th">
                            <div className="th-content" onClick={() => handleSort('address')} title="Click to sort by Address">
                              <span>Address</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
                            <div className="col-resizer" onMouseDown={(e) => startResizing('address', e)} />
                          </th>
                        );
                      case 'notes':
                        return (
                          <th key="notes" style={{ width: columnWidths.notes || 250 }} className="sortable resizable-th">
                            <div className="th-content" onClick={() => handleSort('notes')} title="Click to sort by Notes">
                              <span>Notes</span>
                              <ArrowUpDown size={12} className="sort-icon" />
                            </div>
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
                      onDoubleClick={(e) => { 
                        e.stopPropagation(); 
                        const isSample = Boolean(contact && ((contact.categories || []).includes('*SAMPLE*') || (contact.id && String(contact.id).startsWith('sample_'))));
                        if (isSample) {
                          alert('🔒 The *SAMPLE* contact is sealed and protected from alterations.');
                          return;
                        }
                        onEditContact(contact); 
                      }}
                      title="Double-click to edit contact"
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
                                <AccuracyBoxes accuracy={accuracy} />
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
                          case 'categories': {
                            const isExceptionStatus = contact.status && contact.status !== 'Active';
                            const hasCategories = Array.isArray(contact.categories) && contact.categories.length > 0;
                            return (
                              <td key="categories" className="td-categories">
                                {(hasCategories || isExceptionStatus) ? (
                                  <div className="category-pill-group">
                                    {hasCategories && contact.categories.map((cat, i) => (
                                      <span key={i} className={`tag-badge tag-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                                        {cat}
                                      </span>
                                    ))}
                                    {isExceptionStatus && (
                                      <span className={`tag-badge tag-exception tag-${contact.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                                        {contact.status.includes('Bounced') ? '⚠️ Bounced' : contact.status.includes('Unsubscribed') ? '🚫 Unsubscribed' : `💤 ${contact.status}`}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            );
                          }
                          case 'address':
                            return <td key="address" className="td-address">{contact.address || <span className="text-muted">-</span>}</td>;
                          case 'notes':
                            return <td key="notes" className="td-notes">{contact.notes || <span className="text-muted">-</span>}</td>;
                          case 'actions': {
                            const isSample = Boolean(contact && ((contact.categories || []).includes('*SAMPLE*') || (contact.id && String(contact.id).startsWith('sample_'))));
                            return (
                              <td key="actions" className="td-actions" onClick={(e) => e.stopPropagation()}>
                                <div className="action-row">
                                  {isSample ? (
                                    <span className="sealed-badge" title="🔒 Sealed Sample Contact (Protected from alterations)" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(100, 116, 139, 0.2)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                                      <Lock size={12} /> Sealed
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="icon-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditContact(contact);
                                      }}
                                      title="Edit Contact"
                                    >
                                      <Edit2 size={15} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          }
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

          {/* Mobile Cards View — Optimized for Smartphone Portrait Layout */}
          <div className="mobile-cards-view">
            {sortedContacts.map((contact, idx) => {
              const isSelected = selectedIds.includes(contact.id);
              const accuracy = getContactAccuracy(contact);
              const formattedPhone = cleanAndFormatPhone(contact.phone);
              const initials = getInitials(contact.firstName, contact.lastName);
              const avatarStyle = { background: getAvatarGradient(`${contact.firstName} ${contact.lastName}`) };

              return (
                <div 
                  key={contact.id} 
                  className={`contact-card ${isSelected ? 'card-selected' : ''}`}
                  onClick={(e) => handleRowSelect(contact.id, idx, e)}
                >
                  {/* Top Header Row of Card */}
                  <div className="card-top">
                    <div className="card-user">
                      {visibleColumns.includes('checkbox') && (
                        <div className="card-checkbox-wrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="card-checkbox"
                            checked={isSelected}
                            onChange={(e) => handleRowSelect(contact.id, idx, e)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                      <div className="card-avatar-circle" style={avatarStyle}>
                        {initials}
                      </div>
                      <div className="card-user-info">
                        <h4 className="card-name">{contact.firstName} {contact.lastName}</h4>
                        {visibleColumns.includes('score') && (
                          <div className="card-badges-wrap">
                            <AccuracyBoxes accuracy={accuracy} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Quick Actions on Card */}
                    <div className="card-quick-actions" onClick={(e) => e.stopPropagation()}>
                      {visibleColumns.includes('actions') && (
                        <button
                          type="button"
                          className="icon-action-btn action-btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditContact(contact);
                          }}
                          title="Edit Contact"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body & Fields */}
                  <div className="card-body">
                    {/* Email Row */}
                    {visibleColumns.includes('email') && contact.email && (
                      <div className="card-field card-field-email">
                        <Mail size={15} className="field-icon text-primary" />
                        <a 
                          href={`mailto:${contact.email}`} 
                          className="email-link card-email-link" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.email}
                        </a>
                        <button
                          type="button"
                          className="copy-badge-btn"
                          onClick={(e) => handleCopyEmail(contact, e)}
                          title="Copy Name & Email"
                        >
                          {copiedId === contact.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                        </button>
                      </div>
                    )}

                    {/* Secondary Email Row */}
                    {visibleColumns.includes('secondaryEmail') && contact.secondaryEmail && (
                      <div className="card-field card-field-email">
                        <Mail size={15} className="field-icon text-muted" />
                        <a 
                          href={`mailto:${contact.secondaryEmail}`} 
                          className="email-link card-email-link text-muted" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.secondaryEmail}
                        </a>
                      </div>
                    )}

                    {/* Phone & Quick Call Row */}
                    {visibleColumns.includes('phone') && contact.phone && (
                      <div className="card-field card-field-phone">
                        <Phone size={15} className="field-icon text-success" />
                        <button 
                          type="button"
                          className="btn-phone-call card-phone-btn"
                          onClick={(e) => handlePhoneClick(contact, e)}
                          title="Call via Phone, WhatsApp, Skype, or FaceTime"
                        >
                          <span>{formattedPhone}</span>
                        </button>
                      </div>
                    )}

                    {/* Address Row */}
                    {visibleColumns.includes('address') && contact.address && (
                      <div className="card-field card-field-address">
                        <span className="field-icon">📍</span>
                        <span className="card-address-text">{contact.address}</span>
                      </div>
                    )}

                    {/* Categories & Tags */}
                    {visibleColumns.includes('categories') && ((Array.isArray(contact.categories) && contact.categories.length > 0) || (contact.status && contact.status !== 'Active')) && (
                      <div className="card-field card-field-tags">
                        <div className="category-pill-group">
                          {Array.isArray(contact.categories) && contact.categories.map((cat, i) => (
                            <span key={i} className={`tag-badge tag-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                              {cat}
                            </span>
                          ))}
                          {contact.status && contact.status !== 'Active' && (
                            <span className={`tag-badge tag-exception tag-${contact.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                              {contact.status.includes('Bounced') ? '⚠️ Bounced' : contact.status.includes('Unsubscribed') ? '🚫 Unsubscribed' : `💤 ${contact.status}`}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes Preview */}
                    {visibleColumns.includes('notes') && contact.notes && (
                      <div className="card-notes-wrap">
                        <p className="card-notes">📝 {contact.notes}</p>
                      </div>
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

      {/* Bulk Category Assignment Modal */}
      <BulkCategoryAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        selectedCount={selectedIds.length}
        masterCategories={masterCategories}
        onSave={(cats, mode) => onBulkAssignCategories(selectedIds, cats, mode)}
        onAddNewMasterCategory={onAddNewMasterCategory}
      />
    </div>
  );
};
