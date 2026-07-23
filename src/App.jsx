import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ContactTable } from './components/ContactTable';
import { ContactModal } from './components/ContactModal';
import { ImportExportModal } from './components/ImportExportModal';
import { DuplicateResolverModal } from './components/DuplicateResolverModal';
import { PrintView } from './components/PrintView';
import { SecurityModal } from './components/SecurityModal';
import { SettingsModal } from './components/SettingsModal';
import { generateSampleContacts } from './services/sampleData';
import { findDuplicates } from './services/deduplicator';
import { cleanDatabase } from './services/dbCleaner';
import { STANDARD_COLUMNS } from './components/ColumnSelector';
import { isSecurityLockEnabled } from './services/authService';

const STORAGE_KEY = 'eNews_Contacts_List_v1';
const THEME_KEY = 'eNews_Theme_Preference';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  // Contacts state
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Lightweight auto-clean on initial load
        const { cleanedContacts } = cleanDatabase(parsed);
        return cleanedContacts;
      } catch (e) {
        console.error('Failed to load contacts from storage', e);
      }
    }
    return [];
  });

  // Security Lock & Authentication State
  const [isEditingUnlocked, setIsEditingUnlocked] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [securityActionTitle, setSecurityActionTitle] = useState('Edit Contacts');

  // Require Security Verification Helper
  const requireAuth = (callback, title = 'Modify Contacts') => {
    if (!isSecurityLockEnabled() || isEditingUnlocked) {
      callback();
    } else {
      setPendingAction(() => callback);
      setSecurityActionTitle(title);
      setIsSecurityModalOpen(true);
    }
  };

  const handleUnlockSuccess = () => {
    setIsEditingUnlocked(true);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
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

  const handleDeleteContact = (id) => {
    requireAuth(() => {
      if (window.confirm('Are you sure you want to remove this contact?')) {
        setContacts(prev => prev.filter(c => c.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
      }
    }, 'Delete Contact');
  };

  const handleBulkDelete = (idsToDelete) => {
    requireAuth(() => {
      if (window.confirm(`Delete ${idsToDelete.length} selected contacts?`)) {
        setContacts(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        setSelectedIds([]);
      }
    }, 'Bulk Delete Contacts');
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

  const handlePurgeBlanks = () => {
    requireAuth(() => {
      if (blankCount === 0) {
        alert('No blank or invalid contacts to purge!');
        return;
      }
      if (window.confirm(`Purge ${blankCount} blank/invalid contact records?`)) {
        setContacts(prev => prev.filter(c => c.email || (c.firstName && c.firstName !== 'Unnamed') || c.lastName || c.phone));
        alert(`Purged ${blankCount} blank records!`);
      }
    }, 'Purge Invalid Records');
  };

  const handleClearAllContacts = () => {
    requireAuth(() => {
      if (window.confirm(`Are you sure you want to clear all ${contacts.length} contacts? This allows you to re-import your CSV cleanly.`)) {
        setContacts([]);
        setSelectedIds([]);
        localStorage.removeItem(STORAGE_KEY);
      }
    }, 'Clear Entire Address Book');
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
  };

  // Duplicate Resolution Callback
  const handleResolveDuplicate = ({ action, merged, newContact, existingId, incomingId }) => {
    if (action === 'merge' && merged) {
      setContacts(prev => prev.map(c => c.id === existingId ? merged : c).filter(c => c.id !== incomingId));
    } else if (action === 'overwrite' && newContact) {
      setContacts(prev => prev.map(c => c.id === existingId ? { ...newContact, id: existingId } : c));
    } else if (action === 'keep_existing') {
      setContacts(prev => prev.filter(c => c.id !== incomingId));
    } else if (action === 'skip_all') {
      setIsDuplicateModalOpen(false);
      setDuplicates([]);
      return;
    }

    const nextDups = duplicates.slice(1);
    setDuplicates(nextDups);
    if (nextDups.length === 0) {
      setIsDuplicateModalOpen(false);
    }
  };

  // Manual Duplicate Scan
  const handleScanDuplicates = () => {
    const foundDups = findDuplicates(contacts);
    if (foundDups.length > 0) {
      setDuplicates(foundDups);
      setIsDuplicateModalOpen(true);
    } else {
      alert('No duplicate contacts found in your list!');
    }
  };

  // Load 50 Sample Contacts
  const handleLoadSampleData = () => {
    const samples = generateSampleContacts();
    setContacts(samples);
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header
        contactsCount={contacts.length}
        activeCount={activeCount}
        selectedCount={selectedIds.length}
        blankCount={blankCount}
        theme={theme}
        toggleTheme={toggleTheme}
        isEditingUnlocked={isEditingUnlocked}
        onToggleLock={handleToggleLock}
        onOpenSettings={() => requireAuth(() => setIsSettingsModalOpen(true), 'Access Settings')}
        onOpenAddModal={() => {
          requireAuth(() => {
            setContactToEdit(null);
            setIsAddEditModalOpen(true);
          }, 'Add New Contact');
        }}
        onOpenImportModal={() => {
          requireAuth(() => setIsImportModalOpen(true), 'Import CSV File');
        }}
        onLoadSampleData={handleLoadSampleData}
        onPrintDirectory={() => setIsPrintViewOpen(true)}
        onScanDuplicates={handleScanDuplicates}
        onPurgeBlanks={handlePurgeBlanks}
        onClearAllContacts={handleClearAllContacts}
        onCleanDatabase={handleCleanDatabase}
        duplicateCount={duplicates.length}
      />

      {/* Main Contact Management & Table Component */}
      <main>
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
          onOpenAddModal={() => {
            requireAuth(() => {
              setContactToEdit(null);
              setIsAddEditModalOpen(true);
            }, 'Add New Contact');
          }}
          onLoadSampleData={handleLoadSampleData}
        />
      </main>

      {/* Security Verification & Settings Modals */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onUnlockSuccess={handleUnlockSuccess}
        actionTitle={securityActionTitle}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Contact Modals */}
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
        onImportContacts={handleImportContacts}
        contacts={contacts}
      />

      <DuplicateResolverModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        duplicates={duplicates}
        onResolveDuplicate={handleResolveDuplicate}
      />

      <PrintView
        isOpen={isPrintViewOpen}
        onClose={() => setIsPrintViewOpen(false)}
        contacts={contacts}
      />
    </div>
  );
}
