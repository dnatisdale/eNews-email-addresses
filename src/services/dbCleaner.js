/**
 * Database Cleaning & Sanitization Service for eNews Address Book
 * Cleans corrupted entries, trims whitespace, standardizes group names,
 * eliminates empty/blank records, and merges duplicate entries.
 */

export const cleanDatabase = (contacts = []) => {
  if (!Array.isArray(contacts)) return { cleanedContacts: [], stats: { removedCount: 0, mergedCount: 0 } };

  let removedCount = 0;
  let mergedCount = 0;

  const validRecords = [];
  const emailMap = new Map();

  contacts.forEach((contact) => {
    if (!contact) {
      removedCount++;
      return;
    }

    // Trim all text fields
    const firstName = (contact.firstName || '').trim();
    const lastName = (contact.lastName || '').trim();
    const email = (contact.email || '').trim().toLowerCase();
    const secondaryEmail = (contact.secondaryEmail || '').trim().toLowerCase();
    const phone = (contact.phone || '').trim();
    let categories = contact.categories;
    if (!categories || !Array.isArray(categories)) {
      const legacyGroup = (contact.group || '').trim();
      categories = legacyGroup ? [legacyGroup] : ['Friends & Family'];
    }
    categories = [...new Set(categories.map(c => c.trim()).filter(Boolean))];
    const status = (contact.status || '').trim() || 'Active';
    const address = (contact.address || '').trim();
    const notes = (contact.notes || '').trim();

    // Skip invalid / completely blank contacts (no email, no real name, no phone)
    if (!email && (!firstName || firstName.toLowerCase() === 'unnamed') && !lastName && !phone) {
      removedCount++;
      return;
    }

    const cleanRecord = {
      ...contact,
      firstName: firstName || (email ? email.split('@')[0] : 'Unnamed'),
      lastName,
      email,
      secondaryEmail,
      phone,
      categories,
      status,
      address,
      notes,
      customFields: contact.customFields || {}
    };

    // Auto-merge duplicates with matching primary email
    if (email && emailMap.has(email)) {
      const existing = emailMap.get(email);
      // Merge records
      // Merge categories
      existing.categories = [...new Set([...existing.categories, ...cleanRecord.categories])];
      delete existing.group; // Ensure legacy group is removed
      existing.firstName = existing.firstName !== 'Unnamed' ? existing.firstName : cleanRecord.firstName;
      existing.lastName = existing.lastName || cleanRecord.lastName;
      existing.secondaryEmail = existing.secondaryEmail || cleanRecord.secondaryEmail;
      existing.phone = existing.phone || cleanRecord.phone;
      existing.address = existing.address || cleanRecord.address;
      if (cleanRecord.notes && !existing.notes.includes(cleanRecord.notes)) {
        existing.notes = existing.notes ? `${existing.notes} | ${cleanRecord.notes}` : cleanRecord.notes;
      }
      existing.customFields = { ...existing.customFields, ...cleanRecord.customFields };
      mergedCount++;
    } else {
      if (email) emailMap.set(email, cleanRecord);
      validRecords.push(cleanRecord);
    }
  });

  return {
    cleanedContacts: validRecords,
    stats: {
      removedCount,
      mergedCount,
      totalRemaining: validRecords.length
    }
  };
};
