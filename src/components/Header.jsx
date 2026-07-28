import React, { useState, useRef, useEffect } from 'react';
import {
  Mail, Sun, Moon, Download, Plus, Users, Sparkles, Printer, FileText,
  ShieldAlert, Lock, Unlock, Settings, Wand2, Archive, Share2,
  Menu, X, ChevronRight, Trash2, Tag, Type
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
  onInstallClick
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
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
            <p className="brand-subtitle">Family &amp; Friends Directory</p>
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

          {/* Quick Font Size Control Popover (Outside Hamburger Dropdown) */}
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
                <div className="hmenu-section-label">Import &amp; Export</div>
                {menuItem(<Wand2 size={16} className="text-primary" />, 'Smart Text Import', onOpenMagicImport)}
                {menuItem(<Download size={16} />, 'Import CSV', onOpenImportModal)}
                {menuItem(<Printer size={16} />, 'Print / Save PDF', onPrintDirectory)}
                {menuItem(<FileText size={16} />, 'Export CSV', onExportCSV)}
                {menuItem(<Share2 size={16} />, 'Share', handleShareApp)}

                <div className="hmenu-divider" />
                <div className="hmenu-section-label">Maintenance</div>
                {contactsCount > 0 && menuItem(<Wand2 size={16} />, 'Clean & Repair DB', onCleanDatabase)}
                {contactsCount === 0 && menuItem(<Sparkles size={16} />, 'Load 50 Sample Contacts', onLoadSampleData)}
                {menuItem(<Trash2 size={16} />, 'Clear Sample Data', onClearSampleData)}

                <div className="hmenu-divider" />
                <div className="hmenu-section-label">Trash &amp; Recovery</div>
                {menuItem(
                  <Archive size={16} className={trashCount > 0 ? 'text-warning' : ''} />,
                  '60-Day Trash Bin',
                  onOpenTrashModal,
                  trashCount
                )}

                <div className="hmenu-divider" />
                <div className="hmenu-section-label">System &amp; Settings</div>
                {menuItem(<Tag size={16} />, 'Category Manager', onOpenCategoryManager)}
                {menuItem(<Settings size={16} />, 'Settings', onOpenSettings)}
              </div>
            )}
          </div>

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
