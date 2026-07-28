import React, { useState, useEffect } from 'react';
import { FolderPlus, X, Plus, Check, Tag, Info } from 'lucide-react';

export const BulkCategoryAssignModal = ({
  isOpen,
  onClose,
  selectedCount = 0,
  masterCategories = [],
  onSave,
  onAddNewMasterCategory
}) => {
  const [selectedCats, setSelectedCats] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [assignMode, setAssignMode] = useState('add'); // 'add' or 'replace'

  useEffect(() => {
    if (isOpen) {
      setSelectedCats([]);
      setShowCustomInput(false);
      setNewCatInput('');
      setAssignMode('add');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (cat) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleCreateNewCategory = (e) => {
    if (e) e.preventDefault();
    const clean = newCatInput.trim();
    if (!clean) return;

    if (!masterCategories.includes(clean)) {
      if (onAddNewMasterCategory) onAddNewMasterCategory(clean);
    }
    if (!selectedCats.includes(clean)) {
      setSelectedCats(prev => [...prev, clean]);
    }
    setNewCatInput('');
    setShowCustomInput(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCats.length === 0) {
      alert('Please select at least one category to assign.');
      return;
    }
    onSave(selectedCats, assignMode);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <FolderPlus className="modal-icon text-primary" size={20} />
            <h2>Assign Tags ({selectedCount} Contacts)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              type="button" 
              className="icon-btn-info" 
              title={`Select categories from your official list below, or add a new category to assign to ${selectedCount} selected contacts.`}
              aria-label="Information"
              onClick={() => alert(`Select categories from your official list below, or add a new category to assign to ${selectedCount} selected contacts.`)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Master Tag List
            </label>
            <div className="categories-checkbox-list" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '0.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)'
            }}>
              {masterCategories.filter(cat => cat !== '*SAMPLE*' && cat !== '*EXAMPLES*').map((cat) => {
                const isChecked = selectedCats.includes(cat);
                return (
                  <label 
                    key={cat} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: isChecked ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat)}
                      className="checkbox-input"
                    />
                    <Tag size={13} className="text-muted" />
                    <span style={{ fontSize: '0.9rem', fontWeight: isChecked ? 600 : 400 }}>{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Add New Master Category inline */}
          <div className="mt-3">
            {!showCustomInput ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCustomInput(true)}
              >
                <Plus size={14} />
                <span>+ Create New Category</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  autoFocus
                  className="input-control"
                  placeholder="Type new category name..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNewCategory();
                    }
                  }}
                  style={{ fontSize: '0.88rem' }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleCreateNewCategory}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCustomInput(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Assignment Mode Radio */}
          <div className="form-group mt-3" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Assignment Mode:</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
              <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="assignMode"
                  value="add"
                  checked={assignMode === 'add'}
                  onChange={() => setAssignMode('add')}
                />
                <span>Add to existing categories</span>
              </label>
              <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="assignMode"
                  value="replace"
                  checked={assignMode === 'replace'}
                  onChange={() => setAssignMode('replace')}
                />
                <span>Replace existing categories</span>
              </label>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: 140 }}>
              <Check size={16} />
              <span>Apply Categories</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
