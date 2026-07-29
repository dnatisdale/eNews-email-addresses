import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ContactTable } from './components/ContactTable';
import { ContactModal } from './components/ContactModal';
import { ImportExportModal } from './components/ImportExportModal';
import { MagicImportModal } from './components/MagicImportModal';
import { DuplicateResolverModal } from './components/DuplicateResolverModal';
import { PrintView } from './components/PrintView';
import { SecurityModal } from './components/SecurityModal';
import { SettingsModal } from './components/SettingsModal';
import { TrashModal } from './components/TrashModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { BackupPromptModal } from './components/BackupPromptModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import PWAPrompt from './components/PWAPrompt';
import { generateSampleContacts } from './services/sampleData';
import { findDuplicates, mergeContacts } from './services/deduplicator';
import { cleanDatabase } from './services/dbCleaner';
import { createRollingBackup } from './services/backupService';
import { STANDARD_COLUMNS } from './components/ColumnSelector';
import { isSecurityLockEnabled } from './services/authService';

const STORAGE_KEY = 'eNews_Contacts_List_v1';
const TRASH_STORAGE_KEY = 'eNews_Trash_Contacts_v1';
const THEME_KEY = 'eNews_Theme_Preference';
const FONT_SIZE_KEY = 'eNews_Font_Size_Preference';
const MASTER_CATEGORIES_KEY = 'eNews_master_categories';
const NAME_SORT_ORDER_KEY = 'eNews_Name_Sort_Order';
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export const sortCategoriesAlphabetically = (cats = []) => {
  const cleaned = (cats || []).filter(c => c && c !== '*EXAMPLES*');
  cleaned.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return cleaned;
};

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  // Font Scale state (Numeric percentage 80% to 140%)
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    if (saved && !isNaN(saved)) return Number(saved);
    if (saved === 'small') return 85;
    if (saved === 'large') return 115;
    if (saved === 'xlarge') return 125;
    return 100;
  });

  // Name Sorting Preference state ('first' or 'last')
  const [nameSortOrder, setNameSortOrder] = useState(() => {
    return localStorage.getItem(NAME_SORT_ORDER_KEY) || 'last';
  });

  const handleSetNameSortOrder = (newOrder) => {
    setNameSortOrder(newOrder);
    localStorage.setItem(NAME_SORT_ORDER_KEY, newOrder);
    showToast(`Sorting names by ${newOrder === 'last' ? 'Last Name' : 'First Name'}`);
  };

  // Contacts state
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const { cleanedContacts } = cleanDatabase(parsed);
        if (cleanedContacts.length > 0) {
          const hasSample = cleanedContacts.some(c => Array.isArray(c.categories) && c.categories.includes('*SAMPLE*'));
          if (!hasSample) {
            const samples = generateSampleContacts();
            return [...samples, ...cleanedContacts];
          }
          return cleanedContacts;
        }
      } catch (e) {
        console.error('Failed to load contacts from storage', e);
      }
    }
    return generateSampleContacts();
  });

  // Undo / Redo 30-Step History Stacks
  const [pastHistory, setPastHistory] = useState([]);
  const [futureHistory, setFutureHistory] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Helper to update contacts while recording state snapshot in pastHistory (max 30 steps)
  const updateContactsState = (newContacts) => {
    setPastHistory((prev) => {
      const next = [...prev, contacts];
      if (next.length > 30) return next.slice(next.length - 30);
      return next;
    });
    setFutureHistory([]);
    setContacts(newContacts);
  };

  const handleUndo = () => {
    if (pastHistory.length === 0) return;
    const previousState = pastHistory[pastHistory.length - 1];
    const newPast = pastHistory.slice(0, pastHistory.length - 1);

    setFutureHistory((prev) => [contacts, ...prev].slice(0, 30));
    setPastHistory(newPast);
    setContacts(previousState);
    showToast(`Undid last action (${newPast.length} steps left)`);
  };

  const handleRedo = () => {
    if (futureHistory.length === 0) return;
    const nextState = futureHistory[0];
    const newFuture = futureHistory.slice(1);

    setPastHistory((prev) => [...prev, contacts].slice(-30));
    setFutureHistory(newFuture);
    setContacts(nextState);
    showToast('Redid action');
  };

  // Global Keyboard Shortcuts (Ctrl+Z / Cmd+Z for Undo, Ctrl+Y / Cmd+Y for Redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pastHistory, futureHistory, contacts]);

  // Trash Contacts State (60-Day Recovery Bin)
  const [trashContacts, setTrashContacts] = useState(() => {
    const saved = localStorage.getItem(TRASH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        return parsed.filter((c) => {
          const deletedTime = c.deletedAt ? new Date(c.deletedAt).getTime() : now;
          return now - deletedTime < SIXTY_DAYS_MS;
        });
      } catch (e) {
        console.error('Failed to load trash contacts', e);
      }
    }
    return [];
  });

  const OFFICIAL_BUILTIN = ['Christmas', 'eNewsletter', 'Family', 'Friends'];

  // Master Categories State
  const [masterCategories, setMasterCategories] = useState(() => {
    const saved = localStorage.getItem(MASTER_CATEGORIES_KEY);
    let cats = OFFICIAL_BUILTIN;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.map(c => {
          if (c === 'Friends & Family' || c === 'Family & Household') return 'Family';
          if (c === 'Close Friends') return 'Friends';
          if (c === 'Holiday List') return 'Christmas';
          if (c === 'Newsletter') return 'eNewsletter';
          return c;
        }).filter(c => {
          if (!c || c === '*EXAMPLES*' || c === 'Family & Household' || c === 'Friends & Family') return false;
          const lower = c.toLowerCase();
          if (lower.includes('this is the new') || lower.includes('sheet1') || lower.endsWith('.csv') || lower.endsWith('.xlsx')) return false;
          return true;
        });
        cats = Array.from(new Set([...OFFICIAL_BUILTIN, ...cleaned]));
      } catch (e) {
        console.error('Failed to load master categories', e);
      }
    }
    return sortCategoriesAlphabetically(cats);
  });

  // Security Lock & Authentication State
  const [isEditingUnlocked, setIsEditingUnlocked] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCategoryManagerModalOpen, setIsCategoryManagerModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const pendingActionRef = useRef(null);
  const [securityActionTitle, setSecurityActionTitle] = useState('Edit Contacts');

  // Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    targetCount: 0,
    targetNames: [],
    onConfirm: null
  });

  // Require Security Verification Helper
  const requireAuth = (callback, title = 'Modify Contacts') => {
    if (!isSecurityLockEnabled() || isEditingUnlocked) {
      if (callback) callback();
    } else {
      pendingActionRef.current = callback;
      setSecurityActionTitle(title);
      setIsSecurityModalOpen(true);
      showToast('🔒 App is Locked — Enter passcode to edit');
    }
  };

  const handleUnlockSuccess = () => {
    setIsEditingUnlocked(true);
    setIsSecurityModalOpen(false);
    showToast('🔓 Editing Unlocked!');
    if (pendingActionRef.current) {
      const actionToRun = pendingActionRef.current;
      pendingActionRef.current = null;
      actionToRun();
    }
  };

  const handleToggleLock = () => {
    if (isEditingUnlocked) {
      setIsEditingUnlocked(false);
    } else {
      requireAuth(() => setIsEditingUnlocked(true), 'Unlock Editing Controls');
    }
  };

  // Custom Columns visibility state
  const [availableColumns, setAvailableColumns] = useState(STANDARD_COLUMNS);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    return STANDARD_COLUMNS.filter(c => c.default).map(c => c.id);
  });

  // Dynamic Column Widths State
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('eNews_Column_Widths_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      accuracy: 60, name: 210, email: 230, secondaryEmail: 180, phone: 150,
      categories: 160, status: 120, address: 200, notes: 220, actions: 100
    };
  });

  useEffect(() => {
    localStorage.setItem('eNews_Column_Widths_v1', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // Sync missing columns into visibleColumns
  useEffect(() => {
    const currentIds = availableColumns.map(c => c.id);
    const missing = currentIds.filter(id => !visibleColumns.includes(id));
    if (missing.length > 0 && visibleColumns.length < currentIds.length) {
      const allIds = availableColumns.filter(c => c.default).map(c => c.id);
      const newVisible = Array.from(new Set([...visibleColumns, ...allIds]));
      setVisibleColumns(newVisible);
    }
  }, [contacts.length]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMagicImportModalOpen, setIsMagicImportModalOpen] = useState(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  
  // Duplicates state
  const [duplicates, setDuplicates] = useState([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync theme attribute to HTML tag & theme-color meta tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
    }
  }, [theme]);

  useEffect(() => {
    const numScale = typeof fontSize === 'number' ? fontSize : 100;
    const pxSize = (16 * numScale) / 100;
    document.documentElement.style.fontSize = `${pxSize}px`;
    document.documentElement.setAttribute('data-font-scale', numScale.toString());
    localStorage.setItem(FONT_SIZE_KEY, numScale.toString());
  }, [fontSize]);

  // PWA Install Prompt State & Listener
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(true);
  const [activeBackupPrompt, setActiveBackupPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('eNews App installed successfully!');
      }
    } catch (e) {
      console.error('Install prompt error:', e);
    }
    setDeferredPrompt(null);
    setShowPwaBanner(false);
  };

  // Sync contacts to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  // Sync trashContacts to LocalStorage
  useEffect(() => {
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trashContacts));
  }, [trashContacts]);

  // Sync masterCategories to LocalStorage
  useEffect(() => {
    localStorage.setItem(MASTER_CATEGORIES_KEY, JSON.stringify(masterCategories));
  }, [masterCategories]);

  // Auto-discover categories from imported or legacy contacts
  useEffect(() => {
    const uniqueCategories = new Set(masterCategories);
    let added = false;

    contacts.forEach(c => {
      if (Array.isArray(c.categories)) {
        c.categories.forEach(cat => {
          // Never auto-add *EXAMPLES* to master list
          if (cat && cat !== '*EXAMPLES*' && !uniqueCategories.has(cat)) {
            uniqueCategories.add(cat);
            added = true;
          }
        });
      }
    });

    if (added) {
      setMasterCategories(sortCategoriesAlphabetically(Array.from(uniqueCategories)));
    }
  }, [contacts, masterCategories]);

  // Derived counts & lists
  const activeCount = contacts.filter(c => c.status === 'Active').length;
  
  // Identify blank / invalid contacts
  const blankContacts = contacts.filter(
    (c) => !c.email && (!c.firstName || c.firstName === 'Unnamed') && !c.lastName && !c.phone
  );
  const blankCount = blankContacts.length;

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Add / Edit contact with Security Check
  const handleSaveContact = (formData) => {
    if (formData.id) {
      updateContactsState(contacts.map(c => c.id === formData.id ? { ...c, ...formData } : c));
      showToast('Updated contact details');
    } else {
      const newContact = {
        ...formData,
        id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        createdAt: new Date().toISOString()
      };

      const foundDups = findDuplicates(contacts, [newContact]);
      if (foundDups.length > 0) {
        setDuplicates(foundDups);
        setIsDuplicateModalOpen(true);
      }

      updateContactsState([newContact, ...contacts]);
      showToast(`Added contact: ${newContact.firstName} ${newContact.lastName}`);
    }
  };

  const isSampleRecord = (c) => Boolean(c && ((c.categories || []).includes('*SAMPLE*') || (c.id && String(c.id).startsWith('sample_'))));

  const handleEditContact = (contact) => {
    if (isSampleRecord(contact)) {
      showToast('🔒 The *SAMPLE* contact is sealed and protected');
      return;
    }
    requireAuth(() => {
      setContactToEdit(contact);
      setIsAddEditModalOpen(true);
    }, 'Edit Contact Details');
  };

  // Single Contact Deletion
  const handleDeleteContact = (id) => {
    requireAuth(() => {
      const target = contacts.find((c) => c.id === id);
      if (!target) return;
      if (isSampleRecord(target)) {
        alert('🔒 The *SAMPLE* contact is sealed and protected from deletion.');
        return;
      }

      setDeleteModalState({
        isOpen: true,
        targetCount: 1,
        targetNames: [`${target.firstName} ${target.lastName}`],
        onConfirm: () => {
          const deletedRecord = {
            ...target,
            deletedAt: new Date().toISOString()
          };
          setTrashContacts((prev) => [deletedRecord, ...prev]);
          updateContactsState(contacts.filter((c) => c.id !== id));
          setSelectedIds((prev) => prev.filter((item) => item !== id));
          showToast(`Moved ${target.firstName} ${target.lastName} to Trash`);
        }
      });
    }, 'Delete Contact');
  };

  // Bulk Contact Deletion
  const handleBulkDelete = (idsToDelete) => {
    if (idsToDelete.length === 0) return;

    requireAuth(() => {
      const targetNames = contacts
        .filter((c) => idsToDelete.includes(c.id))
        .map((c) => `${c.firstName} ${c.lastName}`);

      setDeleteModalState({
        isOpen: true,
        targetCount: idsToDelete.length,
        targetNames,
        onConfirm: () => {
          const timestamp = new Date().toISOString();
          const deletedRecords = contacts
            .filter((c) => idsToDelete.includes(c.id))
            .map((c) => ({ ...c, deletedAt: timestamp }));

          setTrashContacts((prev) => [...deletedRecords, ...prev]);
          updateContactsState(contacts.filter((c) => !idsToDelete.includes(c.id)));
          setSelectedIds([]);
          showToast(`Moved ${idsToDelete.length} contacts to Trash`);
        }
      });
    }, 'Bulk Delete Contacts');
  };

  // Bulk Assign Selected Contacts to Categories
  const handleBulkAssignCategories = (idsToAssign, categoriesToAdd, mode = 'add') => {
    requireAuth(() => {
      const updated = contacts.map((c) => {
        if (idsToAssign.includes(c.id)) {
          let newCategories = [];
          if (mode === 'replace') {
            newCategories = [...categoriesToAdd];
          } else {
            newCategories = [...new Set([...(c.categories || []), ...categoriesToAdd])];
          }
          return { ...c, categories: newCategories };
        }
        return c;
      });
      updateContactsState(updated);
      setSelectedIds([]);
      showToast(`Assigned categories to ${idsToAssign.length} contacts`);
    }, 'Assign Contacts to Categories');
  };

  const handleAddNewMasterCategory = (newCat) => {
    if (newCat && newCat !== '*EXAMPLES*') {
      setMasterCategories(prev => sortCategoriesAlphabetically([...prev, newCat]));
    }
  };

  // Database Cleanup
  const handleCleanDatabase = () => {
    requireAuth(() => {
      const { cleanedContacts, stats } = cleanDatabase(contacts);
      updateContactsState(cleanedContacts);
      showToast('Cleaned & Repaired database records');
      const snapshot = createRollingBackup(cleanedContacts, masterCategories, `Clean & Repair DB (${stats.removedCount} removed)`);
      if (snapshot) setActiveBackupPrompt(snapshot);
      alert(
        `🧹 Database Cleanup Complete!\n\n` +
        `• Removed ${stats.removedCount} blank/invalid records.\n` +
        `• Merged ${stats.mergedCount} duplicate email entries.\n` +
        `• Total clean contacts: ${stats.totalRemaining}`
      );
    }, 'Clean & Repair Database');
  };

  // Purge Blank Records
  const handlePurgeBlanks = () => {
    if (blankCount === 0) {
      alert('No blank or invalid contacts to purge!');
      return;
    }

    const blankNames = blankContacts.map((c) => `${c.firstName} ${c.lastName}`);

    setDeleteModalState({
      isOpen: true,
      targetCount: blankCount,
      targetNames: blankNames,
      onConfirm: () => {
        const timestamp = new Date().toISOString();
        const deletedRecords = blankContacts.map((c) => ({ ...c, deletedAt: timestamp }));
        const remaining = contacts.filter((c) => c.email || (c.firstName && c.firstName !== 'Unnamed') || c.lastName || c.phone);
        setTrashContacts((prev) => [...deletedRecords, ...prev]);
        updateContactsState(remaining);
        showToast(`Purged ${blankCount} blank records`);
        const snapshot = createRollingBackup(remaining, masterCategories, `Purged ${blankCount} Blank Contacts`);
        if (snapshot) setActiveBackupPrompt(snapshot);
      }
    });
  };

  // Trash & Recovery Bin Action Handlers
  const handleRestoreContact = (id) => {
    const item = trashContacts.find((c) => c.id === id);
    if (!item) return;

    const { deletedAt, ...restoredContact } = item;

    updateContactsState([restoredContact, ...contacts]);
    setTrashContacts((prev) => prev.filter((c) => c.id !== id));
    showToast(`Restored ${restoredContact.firstName} ${restoredContact.lastName}`);
  };

  const handleRestoreAll = () => {
    if (trashContacts.length === 0) return;
    const restored = trashContacts.map(({ deletedAt, ...c }) => c);
    updateContactsState([...restored, ...contacts]);
    setTrashContacts([]);
    setIsTrashModalOpen(false);
    showToast(`Restored all ${restored.length} contacts from Trash`);
  };

  const handlePermanentlyDelete = (id) => {
    if (window.confirm('Permanently delete this contact? This action CANNOT be undone.')) {
      setTrashContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm(`Permanently empty all ${trashContacts.length} items from Trash? This action CANNOT be undone.`)) {
      setTrashContacts([]);
    }
  };

  const handleBulkCopyEmails = (separator = ',', idsToCopy) => {
    const targetContacts = contacts.filter(c => idsToCopy.includes(c.id));
    const formattedEmails = targetContacts
      .map(c => `"${c.firstName} ${c.lastName}" <${c.email}>`)
      .join(separator + ' ');

    navigator.clipboard.writeText(formattedEmails);
    alert(`Copied ${targetContacts.length} formatted email addresses to clipboard!`);
  };

  // Import contacts from CSV
  const handleImportContacts = (importedList, collectionName) => {
    const foundDups = findDuplicates(contacts, importedList);

    if (foundDups.length > 0) {
      setDuplicates(foundDups);
      setIsDuplicateModalOpen(true);
    }

    const updatedList = [...importedList, ...contacts];
    updateContactsState(updatedList);
    showToast(`Imported ${importedList.length} contacts`);

    const snapshot = createRollingBackup(updatedList, masterCategories, `Imported ${importedList.length} Contacts`);
    if (snapshot) setActiveBackupPrompt(snapshot);

    if (collectionName) {
      alert(`Imported ${importedList.length} contacts into collection: "${collectionName}"!`);
    }
  };

  // Resolve duplicate actions
  const handleResolveDuplicates = (resolution) => {
    if (!resolution) return;
    const { action, existingId, incomingId, incoming } = resolution;

    if (action === 'skip_all') {
      setDuplicates([]);
      setIsDuplicateModalOpen(false);
      return;
    }

    if (action === 'skip_one') {
      setDuplicates((prev) => {
        const next = prev.slice(1);
        if (next.length === 0) setIsDuplicateModalOpen(false);
        return next;
      });
      return;
    }

    const currentDup = duplicates[0];
    if (!currentDup) return;

    if (action === 'merge') {
      const merged = mergeContacts(currentDup.existing, currentDup.incoming);
      const updated = contacts.map((c) => (c.id === existingId ? merged : c));
      const finalContacts = incomingId ? updated.filter((c) => c.id !== incomingId || c.id === existingId) : updated;
      updateContactsState(finalContacts);
      showToast('Merged duplicate contact');
    } else if (action === 'overwrite') {
      const overwritten = { ...(incoming || currentDup.incoming), id: existingId };
      const updated = contacts.map((c) => (c.id === existingId ? overwritten : c));
      const finalContacts = incomingId ? updated.filter((c) => c.id !== incomingId || c.id === existingId) : updated;
      updateContactsState(finalContacts);
      showToast('Overwrote contact record');
    } else if (action === 'keep_existing') {
      if (incomingId) {
        updateContactsState(contacts.filter((c) => c.id !== incomingId || c.id === existingId));
        showToast('Kept existing contact record');
      }
    }

    setDuplicates((prev) => {
      const next = prev.slice(1);
      if (next.length === 0) {
        setIsDuplicateModalOpen(false);
      }
      return next;
    });
  };

  const handleClearSampleData = () => {
    requireAuth(() => {
      const remaining = contacts.filter(c => !c.id.startsWith('sample_'));
      const removedCount = contacts.length - remaining.length;
      if (removedCount > 0) {
        updateContactsState(remaining);
        setSelectedIds(prev => prev.filter(id => !id.startsWith('sample_')));
        showToast(`Cleared ${removedCount} sample contacts`);
      } else {
        alert('No sample contacts found.');
      }
    }, 'Clear Sample Data');
  };

  const handleExportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Categories', 'Notes'];
    const rows = contacts.map(c => [
      `"${c.firstName || ''}"`,
      `"${c.lastName || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.address || ''}"`,
      `"${(c.categories || []).join(';')}"`,
      `"${c.notes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eNews_Contacts_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-layout">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="toast-alert-banner">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header 
        contactsCount={contacts.length}
        activeCount={activeCount}
        selectedCount={selectedIds.length}
        blankCount={blankCount}
        trashCount={trashContacts.length}
        theme={theme}
        toggleTheme={toggleTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isEditingUnlocked={isEditingUnlocked}
        onToggleLock={handleToggleLock}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCategoryManager={() => setIsCategoryManagerModalOpen(true)}
        onOpenAddModal={() => requireAuth(() => {
          setContactToEdit(null);
          setIsAddEditModalOpen(true);
        }, 'Add New Contact')}
        onOpenImportModal={() => requireAuth(() => setIsImportModalOpen(true), 'Import CSV File')}
        onOpenMagicImport={() => requireAuth(() => setIsMagicImportModalOpen(true), 'Smart Text Import')}
        onLoadSampleData={() => requireAuth(() => {
          const samples = generateSampleContacts();
          updateContactsState(samples);
          showToast('Loaded sample contacts');
        }, 'Load Sample Contacts')}
        onPrintDirectory={() => setIsPrintViewOpen(true)}
        onExportCSV={handleExportCSV}
        onScanDuplicates={() => {
          const dups = findDuplicates(contacts, contacts);
          if (dups.length > 0) {
            setDuplicates(dups);
            setIsDuplicateModalOpen(true);
          } else {
            alert('No duplicate contacts detected.');
          }
        }}
        onPurgeBlanks={() => requireAuth(handlePurgeBlanks, 'Purge Blank Contacts')}
        onOpenTrashModal={() => setIsTrashModalOpen(true)}
        onCleanDatabase={handleCleanDatabase}
        duplicateCount={findDuplicates(contacts, contacts).length}
        onClearSampleData={handleClearSampleData}
        deferredPrompt={deferredPrompt}
        onInstallClick={handleInstallClick}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={pastHistory.length > 0}
        canRedo={futureHistory.length > 0}
        undoCount={pastHistory.length}
        redoCount={futureHistory.length}
        isMenuOpen={isMobileMenuOpen}
        setIsMenuOpen={setIsMobileMenuOpen}
        nameSortOrder={nameSortOrder}
        onSetNameSortOrder={handleSetNameSortOrder}
      />

      {/* Main Address Book Table & Mobile Card View */}
      <main className="app-main-content">
        <ContactTable
          contacts={contacts}
          masterCategories={masterCategories}
          availableColumns={availableColumns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          onReorderColumns={(cols) => setAvailableColumns(cols)}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onEditContact={handleEditContact}
          onDeleteContact={(id) => requireAuth(() => handleDeleteContact(id), 'Delete Contact')}
          onBulkDelete={(ids) => requireAuth(() => handleBulkDelete(ids), 'Delete Selected Contacts')}
          onBulkCopyEmails={handleBulkCopyEmails}
          onBulkAssignCategories={handleBulkAssignCategories}
          onAddNewMasterCategory={handleAddNewMasterCategory}
          onOpenAddModal={() => requireAuth(() => {
            setContactToEdit(null);
            setIsAddEditModalOpen(true);
          }, 'Add New Contact')}
          onLoadSampleData={() => requireAuth(() => {
            const samples = generateSampleContacts();
            updateContactsState(samples);
            showToast('Loaded sample contacts');
          }, 'Load Sample Contacts')}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={pastHistory.length > 0}
          canRedo={futureHistory.length > 0}
          undoCount={pastHistory.length}
          redoCount={futureHistory.length}
          showFilters={showMobileFilters}
          setShowFilters={setShowMobileFilters}
          nameSortOrder={nameSortOrder}
        />
      </main>

      {/* Mobile Bottom Action Bar (Thumb Navigation for Smartphones) */}
      <MobileBottomNav
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        showFilters={showMobileFilters}
        onToggleFilters={() => setShowMobileFilters(!showMobileFilters)}
        onOpenAddModal={() => requireAuth(() => {
          setContactToEdit(null);
          setIsAddEditModalOpen(true);
        }, 'Add New Contact')}
        onOpenMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onAssignCategories={() => {
          if (selectedIds.length > 0) {
            requireAuth(() => {
              handleBulkAssignCategories(selectedIds, []);
            }, 'Assign Categories');
          }
        }}
        onBulkDelete={(ids) => requireAuth(() => handleBulkDelete(ids), 'Delete Selected Contacts')}
        onDeselectAll={() => setSelectedIds([])}
        onResetFilters={() => {
          setShowMobileFilters(false);
        }}
      />

      {/* Modals & Popups */}
      <ContactModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveContact}
        contactToEdit={contactToEdit}
        masterCategories={masterCategories}
        availableColumns={availableColumns}
      />

      <ImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportContacts}
        onExportCSV={handleExportCSV}
        contacts={contacts}
        masterCategories={masterCategories}
      />

      <MagicImportModal
        isOpen={isMagicImportModalOpen}
        onClose={() => setIsMagicImportModalOpen(false)}
        onImport={handleImportContacts}
      />

      <DuplicateResolverModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        duplicates={duplicates}
        onResolveDuplicate={handleResolveDuplicates}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerModalOpen}
        onClose={() => setIsCategoryManagerModalOpen(false)}
        masterCategories={masterCategories}
        setMasterCategories={setMasterCategories}
      />

      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        trashContacts={trashContacts}
        onRestore={handleRestoreContact}
        onRestoreAll={handleRestoreAll}
        onPermanentlyDelete={handlePermanentlyDelete}
        onEmptyTrash={handleEmptyTrash}
      />

      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
        targetCount={deleteModalState.targetCount}
        targetNames={deleteModalState.targetNames}
        onConfirm={deleteModalState.onConfirm}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onUnlockSuccess={handleUnlockSuccess}
        actionTitle={securityActionTitle}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        contacts={contacts}
        masterCategories={masterCategories}
        nameSortOrder={nameSortOrder}
        onSetNameSortOrder={handleSetNameSortOrder}
        onRestoreBackup={(restoredContacts, restoredCategories) => {
          updateContactsState(restoredContacts);
          if (restoredCategories && restoredCategories.length > 0) setMasterCategories(restoredCategories);
          showToast('Restored database snapshot');
        }}
      />

      <BackupPromptModal
        isOpen={!!activeBackupPrompt}
        onClose={() => setActiveBackupPrompt(null)}
        backup={activeBackupPrompt}
      />

      {isPrintViewOpen && (
        <PrintView
          isOpen={isPrintViewOpen}
          onClose={() => setIsPrintViewOpen(false)}
          contacts={contacts}
          availableColumns={availableColumns}
          visibleColumns={visibleColumns}
          columnWidths={columnWidths}
          nameSortOrder={nameSortOrder}
        />
      )}

      <PWAPrompt
        installPrompt={showPwaBanner ? deferredPrompt : null}
        onInstall={handleInstallClick}
        onClose={() => setShowPwaBanner(false)}
      />
    </div>
  );
}
