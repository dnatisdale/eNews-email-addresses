import React from 'react';
import { Mail, Sun, Moon, Download, Plus, Users, Sparkles, Printer, Trash2, ShieldAlert, Lock, Unlock, Settings } from 'lucide-react';

export const Header = ({
  contactsCount,
  activeCount,
  selectedCount,
  blankCount,
  theme,
  toggleTheme,
  isEditingUnlocked,
  onToggleLock,
  onOpenSettings,
  onOpenAddModal,
  onOpenImportModal,
  onLoadSampleData,
  onPrintDirectory,
  onScanDuplicates,
  onPurgeBlanks,
  onClearAllContacts,
  duplicateCount
}) => {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand & Logo */}
        <div className="brand-section">
          <div className="logo-badge">
            <Mail className="logo-icon" />
          </div>
          <div>
            <h1 className="brand-title">eNews Address Book</h1>
            <p className="brand-subtitle">Family & Friends Email Directory</p>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="stats-strip">
          <div className="stat-item">
            <Users className="stat-icon" />
            <span><strong>{contactsCount}</strong> Contacts</span>
          </div>
          <div className="stat-item active-stat">
            <span className="dot-indicator"></span>
            <span><strong>{activeCount}</strong> Active</span>
          </div>
          {selectedCount > 0 && (
            <div className="stat-item selected-stat">
              <span><strong>{selectedCount}</strong> Selected</span>
            </div>
          )}
          {blankCount > 0 && (
            <button className="stat-item warning-stat" onClick={onPurgeBlanks} title="Click to purge blank contacts">
              <ShieldAlert size={14} />
              <span><strong>{blankCount}</strong> Blank/Invalid</span>
            </button>
          )}
          {duplicateCount > 0 && (
            <button className="stat-item warning-stat" onClick={onScanDuplicates}>
              <span>⚠️ <strong>{duplicateCount}</strong> Duplicates</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="header-actions">
          {/* Security Lock Indicator Button */}
          <button 
            className={`btn btn-sm ${isEditingUnlocked ? 'btn-unlocked' : 'btn-locked'}`}
            onClick={onToggleLock}
            title={isEditingUnlocked ? 'Editing unlocked (Click to Lock)' : 'Editing protected (Click to unlock with Code/PIN)'}
          >
            {isEditingUnlocked ? <Unlock size={15} /> : <Lock size={15} />}
            <span>{isEditingUnlocked ? 'Unlocked' : 'Locked'}</span>
          </button>

          <button
            className="theme-toggle-btn"
            onClick={onOpenSettings}
            title="App & Security Settings"
          >
            <Settings size={18} />
          </button>

          {contactsCount === 0 ? (
            <button 
              className="btn btn-secondary btn-sm sample-btn" 
              onClick={onLoadSampleData}
              title="Populate 50 sample contacts for instant testing"
            >
              <Sparkles size={16} />
              <span>Load 50 Samples</span>
            </button>
          ) : (
            <button 
              className="btn btn-danger btn-sm"
              onClick={onClearAllContacts}
              title="Clear all contacts to re-import fresh"
            >
              <Trash2 size={15} />
              <span className="desktop-only">Clear All</span>
            </button>
          )}

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onPrintDirectory}
            title="Print clean contact list or save as PDF"
          >
            <Printer size={16} />
            <span className="desktop-only">Print List</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenImportModal}
          >
            <Download size={16} />
            <span>Import CSV</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenAddModal}
          >
            <Plus size={16} />
            <span>Add Contact</span>
          </button>

          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
