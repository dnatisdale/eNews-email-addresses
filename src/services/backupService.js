const BACKUPS_STORAGE_KEY = 'eNews_Rolling_Backups_v1';
const MAX_BACKUPS = 5;

/**
 * Retrieves the list of rolling backups from localStorage.
 * @returns {Array} Array of backup snapshot objects ordered newest first.
 */
export const getRollingBackups = () => {
  try {
    const raw = localStorage.getItem(BACKUPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse rolling backups from localStorage', e);
    return [];
  }
};

/**
 * Creates a new timestamped backup snapshot and maintains a maximum 5-version history.
 * @param {Array} contacts - Current contacts list
 * @param {Array} masterCategories - Current master categories
 * @param {string} note - Descriptive reason for backup (e.g. 'Manual System Backup', 'Pre-Clean Snapshot')
 * @returns {Object} The newly created backup snapshot
 */
export const createRollingBackup = (contacts = [], masterCategories = [], note = 'Automatic System Backup') => {
  try {
    const existing = getRollingBackups();
    const newSnapshot = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString(),
      contactCount: (contacts || []).length,
      note,
      data: {
        contacts: JSON.parse(JSON.stringify(contacts || [])),
        masterCategories: JSON.parse(JSON.stringify(masterCategories || []))
      }
    };

    // Prepend new backup, keep at most MAX_BACKUPS (5)
    const updated = [newSnapshot, ...existing].slice(0, MAX_BACKUPS);
    localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(updated));
    return newSnapshot;
  } catch (e) {
    console.error('Failed to create rolling backup', e);
    return null;
  }
};

/**
 * Downloads a backup snapshot as a formatted JSON file.
 * @param {Object} backup - Backup snapshot object
 */
export const downloadBackupFile = (backup) => {
  if (!backup || !backup.data) return;
  const dateStr = new Date(backup.timestamp || Date.now()).toISOString().split('T')[0];
  const filename = `eNews_Backup_${dateStr}_${backup.contactCount}contacts.json`;
  
  const payload = {
    app: 'eNews Email Address Book PWA',
    version: '1.0.0',
    exportedAt: backup.timestamp || new Date().toISOString(),
    contactCount: backup.contactCount,
    note: backup.note || 'Manual Backup',
    data: backup.data
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Triggers an email or Web Share API for the backup file / summary.
 * @param {Object} backup - Backup snapshot object
 */
export const emailBackup = async (backup) => {
  if (!backup || !backup.data) return;
  const count = backup.contactCount || 0;
  const dateStr = backup.formattedDate || new Date().toLocaleString();
  const title = `eNews Address Book Backup (${count} Contacts) - ${dateStr}`;

  const jsonStr = JSON.stringify({
    app: 'eNews Email Address Book PWA',
    exportedAt: backup.timestamp,
    contactCount: count,
    data: backup.data
  }, null, 2);

  // Try Web Share API with file attachment if supported (Mobile Chrome/Safari/Edge)
  if (navigator.canShare && navigator.share) {
    try {
      const file = new File([jsonStr], `eNews_Backup_${count}_contacts.json`, { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: `Here is your eNews Address Book Database backup containing ${count} contacts saved on ${dateStr}.`,
          files: [file]
        });
        return;
      }
    } catch (e) {
      console.log('Web share with file attachment unsupported or cancelled, falling back to mailto link', e);
    }
  }

  // Fallback: Mailto link prefilled with subject & summary
  const subject = encodeURIComponent(title);
  const bodyText = `eNews Address Book Database Backup Snapshot\n` +
    `==========================================\n` +
    `Date Saved: ${dateStr}\n` +
    `Total Contacts: ${count}\n` +
    `Note: ${backup.note || 'Automatic Backup'}\n\n` +
    `Instructions:\n` +
    `You can copy and save this JSON backup or import it back into your eNews Hub app under Settings -> Import & Export.\n\n` +
    `--- BACKUP DATA SNAPSHOT ---\n` +
    jsonStr.substring(0, 3500) + (jsonStr.length > 3500 ? '\n\n...[Truncated for mailto length limit. Use Download JSON for full file]' : '');

  window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(bodyText)}`, '_blank');
};

/**
 * Deletes a single snapshot by ID from the rolling backup queue.
 * @param {string} backupId 
 */
export const deleteRollingBackup = (backupId) => {
  try {
    const existing = getRollingBackups();
    const updated = existing.filter(b => b.id !== backupId);
    localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete backup snapshot', e);
    return [];
  }
};
