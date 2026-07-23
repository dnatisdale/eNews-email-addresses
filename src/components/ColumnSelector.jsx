import React, { useState, useRef, useEffect } from 'react';
import { Columns, Check, GripHorizontal } from 'lucide-react';

export const STANDARD_COLUMNS = [
  { id: 'checkbox', label: 'Selection Box', default: true },
  { id: 'index', label: '#', default: true },
  { id: 'score', label: 'Score', default: true },
  { id: 'name', label: 'Contact Name', default: true },
  { id: 'email', label: 'Email', default: true },
  { id: 'secondaryEmail', label: 'Secondary Email', default: false },
  { id: 'phone', label: 'Phone Number', default: true },
  { id: 'categories', label: 'Categories', default: true },
  { id: 'status', label: 'Status', default: true },
  { id: 'address', label: 'Physical Address', default: false },
  { id: 'notes', label: 'Notes', default: false },
  { id: 'actions', label: 'Actions', default: true }
];

export const ColumnSelector = ({ availableColumns = STANDARD_COLUMNS, visibleColumns, setVisibleColumns, onReorderColumns }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const dropdownRef = useRef(null);

  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedItemId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;

    const sourceIndex = availableColumns.findIndex(c => c.id === draggedItemId);
    const targetIndex = availableColumns.findIndex(c => c.id === targetId);

    if (sourceIndex > -1 && targetIndex > -1) {
      const newColumns = [...availableColumns];
      const [removed] = newColumns.splice(sourceIndex, 1);
      newColumns.splice(targetIndex, 0, removed);
      
      if (onReorderColumns) {
        onReorderColumns(newColumns);
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (id) => {
    if (visibleColumns.includes(id)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter((col) => col !== id));
      }
    } else {
      setVisibleColumns([...visibleColumns, id]);
    }
  };

  const handleSelectAll = () => {
    setVisibleColumns(availableColumns.map((c) => c.id));
  };

  const handleClearAll = () => {
    // Keep at least name and email for usability
    setVisibleColumns(['name', 'email']);
  };

  const activeCount = visibleColumns.length;
  const totalCount = availableColumns.length;

  return (
    <div className="column-selector-container" ref={dropdownRef}>
      <button 
        className="btn btn-outline btn-sm column-toggle-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title="Customize visible table columns"
      >
        <span>Display</span>
      </button>

      {isOpen && (
        <div className="column-dropdown-menu">
          <div className="column-dropdown-header">
            <span className="dropdown-title">Display</span>
            <div className="dropdown-quick-actions" style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="btn-link text-xs" 
                onClick={handleSelectAll}
              >
                Show All
              </button>
              {/* Dot removed as requested */}
              <button 
                type="button" 
                className="btn-link text-xs" 
                onClick={handleClearAll}
              >
                Hide All
              </button>
            </div>
          </div>

          <div className="column-options-list">
            {availableColumns.map((col) => {
              const isChecked = visibleColumns.includes(col.id);
              return (
                <div 
                  key={col.id} 
                  className={`column-checkbox-item ${draggedItemId === col.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="drag-handle" title="Drag to reorder">
                    <GripHorizontal size={14} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColumn(col.id)}
                      className="checkbox-input"
                    />
                    <span className="column-label-text">{col.label}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
