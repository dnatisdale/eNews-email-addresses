import React, { useState, useRef, useEffect } from 'react';
import {
  Mail, Sun, Moon, Download, Plus, Users, Sparkles, Printer, FileText,
  ShieldAlert, Lock, Unlock, Settings, Wand2, Archive, Share2,
  Menu, X, ChevronRight, Trash2, Tag, Type, RotateCcw, RotateCw, Smartphone
} from 'lucide-react';

export const Header = ({
  contactsCount,
  activeCount,
  selectedCount,
  blankCount,
  trashCount = 0,
  theme,
  toggleTheme,
  fontSize = 100,
  setFontSize,
  isEditingUnlocked,
  onToggleLock,
  onOpenSettings,
  onOpenCategoryManager,
  onOpenAddModal,
  onOpenImportModal,
  onOpenMagicImport,
  onLoadSampleData,
  onPrintDirectory,
  onExportCSV,
  onScanDuplicates,
  onPurgeBlanks,
  onOpenTrashModal,
  onCleanDatabase,
  duplicateCount,
  onClearSampleData,
  deferredPrompt,
  onInstallClick,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  undoCount = 0,
  redoCount = 0,
  isMenuOpen: propMenuOpen,
  setIsMenuOpen: propSetMenuOpen,
  nameSortOrder = 'last',
  onSetNameSortOrder
}) => {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const menuOpen = propMenuOpen !== undefined ? propMenuOpen : internalMenuOpen;
  const setMenuOpen = (val) => {
    const nextVal = typeof val === 'function' ? val(menuOpen) : val;
    setInternalMenuOpen(nextVal);
    if (propSetMenuOpen) propSetMenuOpen(nextVal);
  };

  const [fontPopoverOpen, setFontPopoverOpen] = useState(false);
  const menuRef = useRef(null);
  const fontRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (fontPopoverOpen && fontRef.current && !fontRef.current.contains(e.target)) {
        setFontPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, fontPopoverOpen]);

  const handleShareApp = async () => {
    setMenuOpen(false);
    const shareData = {
      title: 'eNews Address Book PWA',
      text: 'Family & Friends Email Directory',
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('PWA Link copied to clipboard!');
    }
  };

  const menuItem = (icon, label, onClick, badge, danger) => (
    <button
      type="button"
      className={`hmenu-item${danger ? ' hmenu-item-danger' : ''}`}
      onClick={() => { setMenuOpen(false); onClick(); }}
    >
      <span className="hmenu-icon">{icon}</span>
      <span className="hmenu-label">{label}</span>
      {badge != null && badge > 0 && <span className="hmenu-badge">{badge}</span>}
      <ChevronRight size={14} className="hmenu-chevron" />
    </button>
  );

  return (
    <header className="app-header">
      <div className="header-container">

        {/* ── Brand ────────────────────────────────────────── */}
        <div className="brand-section">
          <div className="logo-badge">
            <Mail className="logo-icon" size={20} />
          </div>
          <div>
            <h1 className="brand-title">eNews Address Book</h1>
            <p className="brand-subtitle">Family & Friends Directory</p>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────── */}
        <div className="stats-strip">
          <div className="stat-item">
            <Users size={14} className="stat-icon" />
            <span><strong>{contactsCount}</strong> Contacts</span>
          </div>
          <div className="stat-item active-stat">
            <span className="dot-indicator" />
            <span><strong>{activeCount}</strong> Active</span>
          </div>
          {selectedCount > 0 && (
            <div className="stat-item selected-stat">
              <strong>{selectedCount}</strong>&nbsp;Selected
            </div>
          )}
          {blankCount > 0 && (
            <button className="stat-item warning-stat" onClick={onPurgeBlanks} title="Move blank contacts to Trash">
              <ShieldAlert size={13} />
              <strong>{blankCount}</strong> Blank
            </button>
          )}
          {duplicateCount > 0 && (
            <button className="stat-item warning-stat" onClick={onScanDuplicates}>
              ⚠️ <strong>{duplicateCount}</strong> Dupes
            </button>
          )}
        </div>

        {/* ── Right Actions ────────────────────────────────── */}
        <div className="header-actions">

          {/* Undo & Redo 30-Step History Controls */}
          <div className="undo-redo-group">
            <button
              type="button"
              className="btn btn-secondary btn-sm undo-redo-btn"
              onClick={onUndo}
              disabled={!canUndo}
              title={canUndo ? `Undo last action (${undoCount} steps left) [Ctrl+Z]` : 'Nothing to undo'}
            >
              <RotateCcw size={15} />
              <span className="desktop-only">Undo</span>
              {canUndo && <span className="undo-badge">{undoCount}</span>}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm undo-redo-btn"
              onClick={onRedo}
              disabled={!canRedo}
              title={canRedo ? `Redo last undone action (${redoCount} steps left) [Ctrl+Y]` : 'Nothing to redo'}
            >
              <RotateCw size={15} />
              <span className="desktop-only">Redo</span>
              {canRedo && <span className="undo-badge">{redoCount}</span>}
            </button>
          </div>

          {/* Quick Font Size Control Popover */}
          <div className="font-popover-wrap" ref={fontRef}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setFontPopoverOpen(v => !v)}
              title="Adjust Font Size & Smartphone Text Scaling"
            >
              <Type size={15} />
              <span className="desktop-only">{fontSize || 100}%</span>
            </button>

            {fontPopoverOpen && (
              <div className="font-popover-menu">
                <div className="font-popover-header">
                  <span>Font Scale ({fontSize || 100}%)</span>
                  <button className="btn-link text-xs" onClick={() => setFontSize && setFontSize(100)}>Reset</button>
                </div>
                <div className="font-popover-body">
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => setFontSize && setFontSize(Math.max(80, (fontSize || 100) - 5))}
                    disabled={(fontSize || 100) <= 80}
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    step="5"
                    className="font-popover-slider"
                    value={fontSize || 100}
                    onChange={(e) => setFontSize && setFontSize(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => setFontSize && setFontSize(Math.min(140, (fontSize || 100) + 5))}
                    disabled={(fontSize || 100) >= 140}
                  >
                    A+
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lock / Unlock */}
          <button
            className={`btn btn-sm ${isEditingUnlocked ? 'btn-unlocked' : 'btn-locked'}`}
            onClick={onToggleLock}
            title={isEditingUnlocked ? 'Click to lock editing' : 'Click to unlock editing'}
          >
            {isEditingUnlocked ? <Unlock size={15} /> : <Lock size={15} />}
            <span className="desktop-only">{isEditingUnlocked ? 'Unlocked' : 'Locked'}</span>
          </button>

          {/* Add Contact — always prominent */}
          <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>Add Contact</span>
          </button>
        </div>

        {/* ── Top Right Actions ─────────────────────────────── */}
        <div className="top-right-actions">
          {/* ── Hamburger Menu ─────────────────────────────── */}
          <div className="hmenu-wrap" ref={menuRef}>
            <button
              className={`hmenu-trigger ${menuOpen ? 'hmenu-trigger-open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Open menu"
              title="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {menuOpen && (
              <div className="hmenu-dropdown">
                {/* ── Section 1: Data & Transfer ── */}
                <div className="hmenu-section-header">
                  <span className="hmenu-section-title">Data & Transfer</span>
                </div>
                {menuItem(<Wand2 size={16} className="text-primary" />, 'Smart Text Import', onOpenMagicImport)}
                {menuItem(<Download size={16} />, 'Import CSV File', onOpenImportModal)}
                {menuItem(<FileText size={16} />, 'Export CSV File', onExportCSV)}
                {menuItem(<Printer size={16} />, 'Print & Save PDF', onPrintDirectory)}

                <div className="hmenu-divider" />

                {/* ── Section 2: Directory Management ── */}
                <div className="hmenu-section-header">
                  <span className="hmenu-section-title">Directory Management</span>
                </div>
                {menuItem(<Tag size={16} />, 'Tag Manager', onOpenCategoryManager)}
                {contactsCount > 0 && menuItem(<Wand2 size={16} />, 'Clean & Repair DB', onCleanDatabase)}
                {menuItem(<Archive size={16} className={trashCount > 0 ? 'text-warning' : ''} />, '60-Day Trash Bin', onOpenTrashModal, trashCount)}

                <div className="hmenu-divider" />

                {/* ── Section 2b: Name Sort Order ── */}
                <div className="hmenu-section-header">
                  <span className="hmenu-section-title">Sort Names By</span>
                </div>
                <div style={{ padding: '4px 12px 8px 12px', display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${nameSortOrder === 'first' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.8rem', padding: '5px 8px' }}
                    onClick={() => {
                      if (onSetNameSortOrder) onSetNameSortOrder('first');
                    }}
                  >
                    First Name
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${nameSortOrder === 'last' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.8rem', padding: '5px 8px' }}
                    onClick={() => {
                      if (onSetNameSortOrder) onSetNameSortOrder('last');
                    }}
                  >
                    Last Name
                  </button>
                </div>

                <div className="hmenu-divider" />

                {/* ── Section 3: App & System ── */}
                <div className="hmenu-section-header">
                  <span className="hmenu-section-title">App & System</span>
                </div>
                {deferredPrompt && menuItem(<Smartphone size={16} className="text-primary" />, 'Install App (PWA)', onInstallClick)}
                {menuItem(<Share2 size={16} />, 'Share App Link', handleShareApp)}

              </div>
            )}
          </div>

          <button
            className="theme-toggle-btn"
            style={{ marginRight: '8px' }}
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings & Passcode"
          >
            <Settings size={18} />
          </button>

          {/* Theme Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
};
