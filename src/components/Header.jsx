import React from 'react';
import { Mail, Sun, Moon, Download, Plus, Users, Sparkles, Printer, ShieldAlert, Lock, Unlock, Settings, Wand2, Archive } from 'lucide-react';

export const Header = ({
  contactsCount,
  activeCount,
  selectedCount,
  blankCount,
  trashCount = 0,
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
  onOpenTrashModal,
  onCleanDatabase,
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
            <button className="stat-item warning-stat" onClick={onPurgeBlanks} title="Click to move blank contacts to Trash">
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
          {/* Trash & 60-Day Recovery Bin Button */}
          <button
            className={`btn btn-sm ${trashCount > 0 ? 'btn-outline-warning' : 'btn-secondary'}`}
            onClick={onOpenTrashModal}
            title="View 60-Day Trash & Recovery Bin"
          >
            <Archive size={15} />
            <span>Trash ({trashCount})</span>
          </button>

          {/* Security Lock Indicator Button */}
          <button 
            className={`btn btn-sm ${isEditingUnlocked ? 'btn-unlocked' : 'btn-locked'}`}
            onClick={onToggleLock}
            title={isEditingUnlocked ? 'Editing unlocked (Click to Lock)' : 'Editing protected (Click to unlock with Code/PIN)'}
          >
            {isEditingUnlocked ? <Unlock size={15} /> : <Lock size={15} />}
            <span>{isEditingUnlocked ? 'Unlocked' : 'Locked'}</span>
          </button>

          {/* Prominent Admin & Security Settings Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenSettings}
            title="App & Admin Security Settings (Configure 050763 Admin Code)"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>

          {contactsCount > 0 && (
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onCleanDatabase}
              title="Clean & Repair Database: Trim spaces, fix invalid fields, & merge duplicates"
            >
              <Wand2 size={16} />
              <span className="desktop-only">Clean DB</span>
            </button>
          )}

          {contactsCount === 0 && (
            <button 
              className="btn btn-secondary btn-sm sample-btn" 
              onClick={onLoadSampleData}
              title="Populate 50 sample contacts for instant testing"
            >
              <Sparkles size={16} />
              <span>Load 50 Samples</span>
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
