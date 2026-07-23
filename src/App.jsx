import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ContactTable } from './components/ContactTable';
import { ContactModal } from './components/ContactModal';
import { ImportExportModal } from './components/ImportExportModal';
import { DuplicateResolverModal } from './components/DuplicateResolverModal';
import { PrintView } from './components/PrintView';
import { SecurityModal } from './components/SecurityModal';
import { SettingsModal } from './components/SettingsModal';
import { TrashModal } from './components/TrashModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { generateSampleContacts } from './services/sampleData';
import { findDuplicates } from './services/deduplicator';
import { cleanDatabase } from './services/dbCleaner';
import { STANDARD_COLUMNS } from './components/ColumnSelector';
import { isSecurityLockEnabled } from './services/authService';

const STORAGE_KEY = 'eNews_Contacts_List_v1';
const TRASH_STORAGE_KEY = 'eNews_Trash_Contacts_v1';
const THEME_KEY = 'eNews_Theme_Preference';

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

  // Security Lock & Authentication State
  const [isEditingUnlocked, setIsEditingUnlocked] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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

  const availableColumns = [
    ...STANDARD_COLUMNS,
    ...Array.from(customKeysSet).map((key) => ({
      id: key,
      label: key,
      default: true
    }))
  ];

  // Selected column visibility state
  const [visibleColumns, setVisibleColumns] = useState(() => 
    STANDARD_COLUMNS.filter(c => c.default).map(c => c.id)
  );

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

  // Derived counts & lists
  const activeCount = contacts.filter(c => c.status === 'Active').length;
  const groups = Array.from(new Set(contacts.map(c => c.group).filter(Boolean)));
  
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

  // Bulk Assign Selected Contacts to a Collection / Group
  const handleBulkAssignGroup = (idsToAssign, targetGroup) => {
    requireAuth(() => {
      setContacts((prev) =>
        prev.map((c) => (idsToAssign.includes(c.id) ? { ...c, group: targetGroup } : c))
      );
      alert(`Moved ${idsToAssign.length} contacts to collection: "${targetGroup}"`);
      setSelectedIds([]);
    }, 'Move Contacts to Collection');
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
        onOpenAddModal={() => requireAuth(() => {
          setContactToEdit(null);
          setIsAddEditModalOpen(true);
        }, 'Add New Contact')}
        onOpenImportModal={() => requireAuth(() => setIsImportModalOpen(true), 'Import CSV File')}
        onLoadSampleData={() => requireAuth(() => {
          const samples = generateSampleContacts();
          setContacts(samples);
        }, 'Load Sample Contacts')}
        onPrintDirectory={() => setIsPrintViewOpen(true)}
        onScanDuplicates={() => {
          const dups = findDuplicates(contacts, contacts);
          setDuplicates(dups);
          setIsDuplicateModalOpen(true);
        }}
        onPurgeBlanks={handlePurgeBlanks}
        onOpenTrashModal={() => setIsTrashModalOpen(true)}
        onCleanDatabase={handleCleanDatabase}
        duplicateCount={duplicates.length}
      />

      {/* Main Content View */}
      <main className="main-content">
        <ContactTable 
          contacts={contacts}
          groups={groups}
          availableColumns={availableColumns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContact}
          onBulkDelete={handleBulkDelete}
          onBulkCopyEmails={handleBulkCopyEmails}
          onBulkAssignGroup={handleBulkAssignGroup}
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
        groups={groups}
      />

      <ImportExportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
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
        visibleColumns={visibleColumns}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => {
          setIsSecurityModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleUnlockSuccess}
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
