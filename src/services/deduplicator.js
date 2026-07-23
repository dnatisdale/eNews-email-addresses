/**
 * Deduplication & Merge Service for eNews Address Book
 */

export const findDuplicates = (existingContacts, incomingContacts = []) => {
  const duplicates = [];
  
  // Combine or inspect
  const pool = incomingContacts.length > 0 ? incomingContacts : existingContacts;
  const targetMap = incomingContacts.length > 0 ? existingContacts : [];

  const emailMap = new Map();
  const nameMap = new Map();

  // Index existing contacts
  targetMap.forEach((contact) => {
    if (contact.email) {
      emailMap.set(contact.email.toLowerCase().trim(), contact);
    }
    if (contact.secondaryEmail) {
      emailMap.set(contact.secondaryEmail.toLowerCase().trim(), contact);
    }
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase().trim();
    if (fullName.length > 2) {
      nameMap.set(fullName, contact);
    }
  });

  // Find matches in pool
  pool.forEach((incoming) => {
    const primaryEmail = incoming.email ? incoming.email.toLowerCase().trim() : '';
    const fullName = `${incoming.firstName || ''} ${incoming.lastName || ''}`.toLowerCase().trim();

    let match = null;
    let matchType = '';

    if (primaryEmail && emailMap.has(primaryEmail)) {
      match = emailMap.get(primaryEmail);
      matchType = 'Exact Email Match';
    } else if (fullName && nameMap.has(fullName)) {
      match = nameMap.get(fullName);
      matchType = 'Matching Name';
    }

    if (match && match.id !== incoming.id) {
      duplicates.push({
        incoming,
        existing: match,
        matchType,
        reason: matchType === 'Exact Email Match' 
          ? `Duplicate email: ${primaryEmail}`
          : `Duplicate contact name: ${incoming.firstName} ${incoming.lastName}`
      });
    }
  });

  return duplicates;
};

// Scan entire contact list for internal duplicates
export const scanInternalDuplicates = (contacts) => {
  const duplicates = [];
  const seenEmails = new Map();
  const seenNames = new Map();

  contacts.forEach((c) => {
    const email = (c.email || '').toLowerCase().trim();
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase().trim();

    if (email && seenEmails.has(email)) {
      const existing = seenEmails.get(email);
      duplicates.push({
        existing,
        incoming: c,
        matchType: 'Exact Email Match',
        reason: `Duplicate email (${email})`
      });
    } else if (email) {
      seenEmails.set(email, c);
    }

    if (fullName && fullName.length > 3 && seenNames.has(fullName) && !seenEmails.has(email)) {
      const existing = seenNames.get(fullName);
      duplicates.push({
        existing,
        incoming: c,
        matchType: 'Matching Name',
        reason: `Duplicate name (${c.firstName} ${c.lastName})`
      });
    } else if (fullName && fullName.length > 3) {
      seenNames.set(fullName, c);
    }
  });

  return duplicates;
};

// Smart merge two contacts (prefer non-empty values from incoming)
export const mergeContacts = (existing, incoming) => {
  return {
    ...existing,
    firstName: incoming.firstName || existing.firstName,
    lastName: incoming.lastName || existing.lastName,
    email: existing.email || incoming.email,
    secondaryEmail: incoming.secondaryEmail || existing.secondaryEmail,
    phone: incoming.phone || existing.phone,
    group: incoming.group !== 'General' ? incoming.group : existing.group,
    status: existing.status || incoming.status,
    address: incoming.address || existing.address,
    notes: [existing.notes, incoming.notes].filter(Boolean).join(' | '),
    updatedAt: new Date().toISOString()
  };
};
