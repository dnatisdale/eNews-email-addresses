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
import { generateSampleContacts } from './services/sampleData';
import { findDuplicates } from './services/deduplicator';
import { cleanDatabase } from './services/dbCleaner';
import { STANDARD_COLUMNS } from './components/ColumnSelector';
import { isSecurityLockEnabled } from './services/authService';

const STORAGE_KEY = 'eNews_Contacts_List_v1';
const TRASH_STORAGE_KEY = 'eNews_Trash_Contacts_v1';
const THEME_KEY = 'eNews_Theme_Preference';
const MASTER_CATEGORIES_KEY = 'eNews_master_categories';
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  // Contacts state
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const { cleanedContacts } = cleanDatabase(parsed);
        return cleanedContacts;
      } catch (e) {
        console.error('Failed to load contacts from storage', e);
      }
    }
    return [];
  });

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

  // Master Categories State
  const [masterCategories, setMasterCategories] = useState(() => {
    const saved = localStorage.getItem(MASTER_CATEGORIES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load master categories', e);
      }
    }
    // Default categories if none exist
    return ['Family', 'Close Friends', 'Newsletter', 'Holiday List'];
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
    }
  };

  const handleUnlockSuccess = () => {
    setIsEditingUnlocked(true);
    setIsSecurityModalOpen(false);
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
      requireAuth(() => setIsEditingUnlocked(true), 'Unlock Editing Session');
    }
  };

  // Dynamically compute available columns (Standard + all custom headers from imported CSVs)
  const customKeysSet = new Set();
  contacts.forEach((c) => {
    if (c.customFields) {
      Object.keys(c.customFields).forEach((key) => customKeysSet.add(key));
    }
  });

  const [columnOrder, setColumnOrder] = useState(() => {
    try {
      const stored = localStorage.getItem('eNews_Column_Order_v2');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const baseAvailableColumns = [
    ...STANDARD_COLUMNS,
    ...Array.from(customKeysSet).map((key) => ({
      id: key,
      label: key,
      default: true
    }))
  ];

  const availableColumns = [...baseAvailableColumns].sort((a, b) => {
    const idxA = columnOrder.indexOf(a.id);
    const idxB = columnOrder.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const handleReorderColumns = (newColumns) => {
    const newOrder = newColumns.map(c => c.id);
    setColumnOrder(newOrder);
    localStorage.setItem('eNews_Column_Order_v2', JSON.stringify(newOrder));
  };

  // Selected column visibility state
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const stored = localStorage.getItem('eNews_Visible_Columns_v2');
      if (stored) return JSON.parse(stored);
    } catch {}
    return STANDARD_COLUMNS.filter(c => c.default).map(c => c.id);
  });

  // Save visible columns when they change
  useEffect(() => {
    localStorage.setItem('eNews_Visible_Columns_v2', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Track column widths
  const [columnWidths, setColumnWidths] = useState(() => {
    try {
      const stored = localStorage.getItem('eNews_Column_Widths_v1');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleExportCSV = () => {
    const activeCols = availableColumns.filter(c => visibleColumns.includes(c.id));
    const exportCols = activeCols.filter(c => !['checkbox', 'index', 'score', 'actions'].includes(c.id));
    
    let csv = exportCols.map(c => c.label).join(',') + '\n';
    
    contacts.forEach(contact => {
      const row = exportCols.map(col => {
        let val = contact[col.id] || '';
        if (col.id === 'categories' && Array.isArray(val)) val = val.join('; ');
        if (col.id === 'name') val = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
        if (contact.customFields && contact.customFields[col.id]) val = contact.customFields[col.id];
        
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `eNews Family & Friends Contact Directory - ${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-enable newly discovered custom columns when imported
  useEffect(() => {
    if (customKeysSet.size > 0) {
      const allIds = availableColumns.map(c => c.id);
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

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

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
          if (cat && !uniqueCategories.has(cat)) {
            uniqueCategories.add(cat);
            added = true;
          }
        });
      }
    });
    if (added) {
      setMasterCategories(Array.from(uniqueCategories));
    }
  }, [contacts, masterCategories]);

  // Derived counts & lists
  const activeCount = contacts.filter(c => c.status === 'Active').length;
  // groups replaced by masterCategories usage where applicable
  
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
      setContacts(prev => prev.map(c => c.id === formData.id ? { ...c, ...formData } : c));
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

      setContacts(prev => [newContact, ...prev]);
    }
  };

  const handleEditContact = (contact) => {
    requireAuth(() => {
      setContactToEdit(contact);
      setIsAddEditModalOpen(true);
    }, 'Edit Contact Details');
  };

  // Single Contact Deletion (Requires High Warning Delete Modal & Admin Code 050763)
  const handleDeleteContact = (id) => {
    const target = contacts.find((c) => c.id === id);
    if (!target) return;

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
        setContacts((prev) => prev.filter((c) => c.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      }
    });
  };

  // Bulk Contact Deletion (Requires High Warning Delete Modal & Admin Code 050763)
  const handleBulkDelete = (idsToDelete) => {
    if (idsToDelete.length === 0) return;

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
        setContacts((prev) => prev.filter((c) => !idsToDelete.includes(c.id)));
        setSelectedIds([]);
      }
    });
  };

  // Bulk Assign Selected Contacts to Categories
  const handleBulkAssignCategories = (idsToAssign, categoriesToAdd) => {
    requireAuth(() => {
      setContacts((prev) => prev.map((c) => {
        if (idsToAssign.includes(c.id)) {
          const newCategories = [...new Set([...(c.categories || []), ...categoriesToAdd])];
          return { ...c, categories: newCategories };
        }
        return c;
      }));
      setSelectedIds([]);
      alert(`Added ${idsToAssign.length} contacts to categories: ${categoriesToAdd.join(', ')}`);
    }, 'Assign Contacts to Categories');
  };

  // Thorough Database Cleanup
  const handleCleanDatabase = () => {
    requireAuth(() => {
      const { cleanedContacts, stats } = cleanDatabase(contacts);
      setContacts(cleanedContacts);
      alert(
        `🧹 Database Cleanup Complete!\n\n` +
        `• Removed ${stats.removedCount} blank/invalid records.\n` +
        `• Merged ${stats.mergedCount} duplicate email entries.\n` +
        `• Total clean contacts: ${stats.totalRemaining}`
      );
    }, 'Clean & Repair Database');
  };

  // Purge Blank Records (Requires Admin Code 050763)
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
        setTrashContacts((prev) => [...deletedRecords, ...prev]);
        setContacts((prev) => prev.filter((c) => c.email || (c.firstName && c.firstName !== 'Unnamed') || c.lastName || c.phone));
      }
    });
  };

  // Trash & Recovery Bin Action Handlers
  const handleRestoreContact = (id) => {
    const item = trashContacts.find((c) => c.id === id);
    if (!item) return;

    const { deletedAt, ...restoredContact } = item;

    setContacts((prev) => [restoredContact, ...prev]);
    setTrashContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRestoreAll = () => {
    if (trashContacts.length === 0) return;
    const restored = trashContacts.map(({ deletedAt, ...c }) => c);
    setContacts((prev) => [...restored, ...prev]);
    setTrashContacts([]);
    setIsTrashModalOpen(false);
    alert(`Restored all ${restored.length} contacts back to address book!`);
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

    setContacts(prev => [...importedList, ...prev]);

    if (collectionName) {
      alert(`Imported ${importedList.length} contacts into collection: "${collectionName}"!`);
    }
  };

  // Resolve duplicate merge
  const handleResolveDuplicates = (resolvedList) => {
    setContacts(resolvedList);
    setDuplicates([]);
    setIsDuplicateModalOpen(false);
  };

  const handleClearSampleData = () => {
    requireAuth(() => {
      const remaining = contacts.filter(c => !c.id.startsWith('sample_'));
      const removedCount = contacts.length - remaining.length;
      if (removedCount > 0) {
        setContacts(remaining);
        setSelectedIds(prev => prev.filter(id => !id.startsWith('sample_')));
        alert(`Cleared ${removedCount} sample contacts.`);
      } else {
        alert('No sample contacts found.');
      }
    }, 'Clear Sample Data');
  };

  return (
    <div className="app-layout">
      {/* Header Bar */}
      <Header 
        contactsCount={contacts.length}
        activeCount={activeCount}
        selectedCount={selectedIds.length}
        blankCount={blankCount}
        trashCount={trashContacts.length}
        theme={theme}
        toggleTheme={toggleTheme}
        isEditingUnlocked={isEditingUnlocked}
        onToggleLock={handleToggleLock}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCategoryManager={() => setIsCategoryManagerModalOpen(true)}
        onOpenAddModal={() => requireAuth(() => {
          setContactToEdit(null);
          setIsAddEditModalOpen(true);
        }, 'Add New Contact')}
        onOpenImportModal={() => requireAuth(() => setIsImportModalOpen(true), 'Import CSV File')}
        onOpenMagicImport={() => requireAuth(() => setIsMagicImportModalOpen(true), 'Magic AI Import')}
        onLoadSampleData={() => requireAuth(() => {
          const samples = generateSampleContacts();
          setContacts(samples);
        }, 'Load Sample Contacts')}
        onPrintDirectory={() => setIsPrintViewOpen(true)}
        onExportCSV={handleExportCSV}
        onScanDuplicates={() => {
          const dups = findDuplicates(contacts, contacts);
          setDuplicates(dups);
          setIsDuplicateModalOpen(true);
        }}
        onPurgeBlanks={handlePurgeBlanks}
        onOpenTrashModal={() => setIsTrashModalOpen(true)}
        onCleanDatabase={handleCleanDatabase}
        duplicateCount={duplicates.length}
        onClearSampleData={handleClearSampleData}
      />

      {/* Main Content View */}
      <main className="main-content">
        <ContactTable 
          contacts={contacts}
          masterCategories={masterCategories}
          availableColumns={availableColumns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          onReorderColumns={handleReorderColumns}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContact}
          onBulkDelete={handleBulkDelete}
          onBulkCopyEmails={handleBulkCopyEmails}
          onBulkAssignCategories={handleBulkAssignCategories}
          onOpenAddModal={() => requireAuth(() => {
            setContactToEdit(null);
            setIsAddEditModalOpen(true);
          }, 'Add New Contact')}
          onLoadSampleData={() => requireAuth(() => {
            const samples = generateSampleContacts();
            setContacts(samples);
          }, 'Load Sample Contacts')}
        />
      </main>

      {/* Modals & Dialogs */}
      <ContactModal 
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveContact}
        contactToEdit={contactToEdit}
        masterCategories={masterCategories}
      />

      <ImportExportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportContacts}
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
        allContacts={contacts}
        onResolve={handleResolveDuplicates}
      />

      <PrintView 
        isOpen={isPrintViewOpen}
        onClose={() => setIsPrintViewOpen(false)}
        contacts={contacts}
        availableColumns={availableColumns}
        visibleColumns={visibleColumns}
        columnWidths={columnWidths}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerModalOpen}
        onClose={() => setIsCategoryManagerModalOpen(false)}
        masterCategories={masterCategories}
        setMasterCategories={(newCategories) => {
          // Sync changes down to contacts if categories were deleted or renamed
          // Simple logic: if a category is missing, remove it from contacts. If renamed, we can't easily tell which was renamed from just the new array unless we do complex diffing. 
          // The CategoryManagerModal actually handles renaming and deleting. We can pass a callback to handle updates.
          setMasterCategories(newCategories);
        }}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => {
          setIsSecurityModalOpen(false);
          pendingActionRef.current = null;
        }}
        onUnlockSuccess={handleUnlockSuccess}
        actionTitle={securityActionTitle}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        trashContacts={trashContacts}
        onRestoreContact={handleRestoreContact}
        onRestoreAll={handleRestoreAll}
        onPermanentlyDelete={handlePermanentlyDelete}
        onEmptyTrash={handleEmptyTrash}
      />

      {/* High-Risk Delete Confirmation Modal requiring Admin Code 050763 */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirmDelete={() => {
          if (deleteModalState.onConfirm) {
            deleteModalState.onConfirm();
          }
        }}
        targetCount={deleteModalState.targetCount}
        targetNames={deleteModalState.targetNames}
      />
    </div>
  );
}
