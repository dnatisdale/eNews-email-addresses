import React from 'react';
import { 
  Users, 
  Plus, 
  SlidersHorizontal, 
  FolderPlus, 
  Trash2, 
  Menu,
  X
} from 'lucide-react';

export const MobileBottomNav = ({
  selectedCount = 0,
  onOpenAddModal,
  onToggleFilters,
  showFilters,
  onOpenMenu,
  onAssignCategories,
  onBulkDelete,
  onDeselectAll,
  selectedIds = [],
  onResetFilters,
  activeFilterCount = 0
}) => {
  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-container">

        {/* 1. Home / Contacts Reset */}
        <button
          type="button"
          className="mobile-nav-item"
          onClick={onResetFilters}
          title="All Contacts"
        >
          <Users size={20} />
          <span className="mobile-nav-label">Contacts</span>
        </button>

        {/* 2. Search & Filters Toggle */}
        <button
          type="button"
          className={`mobile-nav-item ${showFilters ? 'active' : ''}`}
          onClick={onToggleFilters}
          title="Search & Filters"
        >
          <div className="mobile-nav-icon-wrap">
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && <span className="mobile-nav-badge">{activeFilterCount}</span>}
          </div>
          <span className="mobile-nav-label">Filters</span>
        </button>

        {/* 3. Center Floating Action Button (FAB) — Add Contact */}
        <button
          type="button"
          className="mobile-fab-center"
          onClick={onOpenAddModal}
          title="Add New Contact"
          aria-label="Add New Contact"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        {/* 4. Selection Actions or Category Manager */}
        {selectedCount > 0 ? (
          <button
            type="button"
            className="mobile-nav-item text-primary"
            onClick={onAssignCategories}
            title="Assign Categories to Selected"
          >
            <div className="mobile-nav-icon-wrap">
              <FolderPlus size={20} />
              <span className="mobile-nav-badge bg-primary">{selectedCount}</span>
            </div>
            <span className="mobile-nav-label">Assign</span>
          </button>
        ) : (
          <button
            type="button"
            className="mobile-nav-item"
            onClick={onOpenMenu}
            title="Open Menu"
          >
            <Menu size={20} />
            <span className="mobile-nav-label">Menu</span>
          </button>
        )}

        {/* 5. Delete Selected or Deselect */}
        {selectedCount > 0 && (
          <button
            type="button"
            className="mobile-nav-item text-danger"
            onClick={() => onBulkDelete(selectedIds)}
            title="Delete Selected Contacts"
          >
            <Trash2 size={20} />
            <span className="mobile-nav-label">Delete ({selectedCount})</span>
          </button>
        )}

        {/* 6. Deselect All Button */}
        {selectedCount > 0 && (
          <button
            type="button"
            className="mobile-nav-item"
            onClick={onDeselectAll}
            title="Clear Selection & Hide Toolbar"
          >
            <X size={20} />
            <span className="mobile-nav-label">Deselect</span>
          </button>
        )}

      </div>
    </nav>
  );
};
