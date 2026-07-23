import React, { useState, useRef, useEffect } from 'react';
import { Columns, CheckSquare, Square, Check } from 'lucide-react';

export const COLUMN_DEFINITIONS = [
  { id: 'name', label: 'Contact Name', default: true },
  { id: 'email', label: 'Primary Email', default: true },
  { id: 'secondaryEmail', label: 'Secondary Email', default: false },
  { id: 'phone', label: 'Phone Number', default: true },
  { id: 'group', label: 'Group / Tag', default: true },
  { id: 'status', label: 'Status', default: true },
  { id: 'address', label: 'Physical Address', default: false },
  { id: 'notes', label: 'Notes', default: false },
  { id: 'actions', label: 'Actions', default: true }
];

export const ColumnSelector = ({ visibleColumns, setVisibleColumns }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
      // Don't allow clearing all columns completely
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter((col) => col !== id));
      }
    } else {
      setVisibleColumns([...visibleColumns, id]);
    }
  };

  const handleSelectAll = () => {
    setVisibleColumns(COLUMN_DEFINITIONS.map((c) => c.id));
  };

  const handleClearAll = () => {
    // Keep at least 'name' and 'email' for usability
    setVisibleColumns(['name', 'email']);
  };

  const activeCount = visibleColumns.length;
  const totalCount = COLUMN_DEFINITIONS.length;

  return (
    <div className="column-selector-container" ref={dropdownRef}>
      <button 
        className="btn btn-outline btn-sm column-toggle-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title="Customize visible table columns"
      >
        <Columns size={16} />
        <span>Columns ({activeCount}/{totalCount})</span>
      </button>

      {isOpen && (
        <div className="column-dropdown-menu">
          <div className="column-dropdown-header">
            <span className="dropdown-title">Display Columns</span>
            <div className="dropdown-quick-actions">
              <button 
                type="button" 
                className="btn-link text-xs" 
                onClick={handleSelectAll}
              >
                Select All
              </button>
              <span className="divider">•</span>
              <button 
                type="button" 
                className="btn-link text-xs" 
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="column-options-list">
            {COLUMN_DEFINITIONS.map((col) => {
              const isChecked = visibleColumns.includes(col.id);
              return (
                <label key={col.id} className="column-checkbox-item">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColumn(col.id)}
                    className="checkbox-input"
                  />
                  <span className="custom-checkbox">
                    {isChecked && <Check size={12} />}
                  </span>
                  <span className="column-label-text">{col.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
