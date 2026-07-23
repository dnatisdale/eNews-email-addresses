import React, { useState } from 'react';
import { X, Tag, Plus, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';

export const CategoryManagerModal = ({ isOpen, onClose, masterCategories, setMasterCategories }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (masterCategories.includes(trimmed)) {
      alert('Category already exists!');
      return;
    }
    setMasterCategories([...masterCategories, trimmed]);
    setNewCategory('');
  };

  const handleDeleteCategory = (categoryToRemove) => {
    if (window.confirm(`Are you sure you want to delete "${categoryToRemove}"? This will also remove it from any contacts that currently have it assigned.`)) {
      setMasterCategories(masterCategories.filter(c => c !== categoryToRemove));
    }
  };

  const startEditing = (cat) => {
    setEditingCategory(cat);
    setEditValue(cat);
  };

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === editingCategory) {
      setEditingCategory(null);
      return;
    }
    if (masterCategories.includes(trimmed)) {
      alert('A category with this name already exists.');
      return;
    }

    setMasterCategories(masterCategories.map(c => c === editingCategory ? trimmed : c));
    setEditingCategory(null);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content settings-modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="modal-title-wrap text-primary">
            <Tag className="modal-icon text-primary" />
            <h2>Category Manager</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="info-alert" style={{ marginBottom: '1rem', backgroundColor: 'var(--bg-accent)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>
            <AlertCircle size={16} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Categories let you tag and organize your contacts. Add new categories here, or delete ones you no longer need.
          </div>

          <form onSubmit={handleAddCategory} className="add-category-form" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              className="input-control" 
              placeholder="New category name..." 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={!newCategory.trim()}>
              <Plus size={16} /> Add
            </button>
          </form>

          <div className="category-list" style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
            {masterCategories.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No categories found.</div>
            ) : (
              masterCategories.map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                  {editingCategory === cat ? (
                    <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '1rem' }}>
                      <input 
                        type="text"
                        autoFocus
                        className="input-control"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        style={{ padding: '4px 8px', minHeight: 'auto' }}
                      />
                      <button className="btn btn-success btn-sm" onClick={saveEdit}><Check size={14} /></button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingCategory(null)}><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontWeight: 500 }}>{cat}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          className="icon-btn-subtle" 
                          onClick={() => startEditing(cat)}
                          title="Rename Category"
                          style={{ padding: '4px' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="icon-btn-subtle text-danger" 
                          onClick={() => handleDeleteCategory(cat)}
                          title="Delete Category"
                          style={{ padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
