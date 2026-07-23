/**
 * Deduplication & Merge Service for eNews Address Book
 * Uses Smart Name Matching for Nicknames (Bob <-> Robert) and Households (Tom <-> Tom & Mary)
 */

import { areNamesSmartMatch } from './smartNameParser';

export const findDuplicates = (existingContacts, incomingContacts = []) => {
  const duplicates = [];
  
  const pool = incomingContacts.length > 0 ? incomingContacts : existingContacts;
  const targetMap = incomingContacts.length > 0 ? existingContacts : [];

  const emailMap = new Map();

  // Index existing contacts by email
  targetMap.forEach((contact) => {
    if (contact.email) {
      emailMap.set(contact.email.toLowerCase().trim(), contact);
    }
    if (contact.secondaryEmail) {
      emailMap.set(contact.secondaryEmail.toLowerCase().trim(), contact);
    }
  });

  // Find matches in pool
  pool.forEach((incoming) => {
    const primaryEmail = incoming.email ? incoming.email.toLowerCase().trim() : '';
    const incomingFullName = `${incoming.firstName || ''} ${incoming.lastName || ''}`.trim();

    let match = null;
    let matchType = '';
    let reason = '';

    // 1. Exact Email Match
    if (primaryEmail && emailMap.has(primaryEmail)) {
      match = emailMap.get(primaryEmail);
      matchType = 'Exact Email Match';
      reason = `Duplicate email: ${primaryEmail}`;
    } else {
      // 2. Smart Name & Nickname Match
      for (const existing of targetMap) {
        if (existing.id === incoming.id) continue;
        const existingFullName = `${existing.firstName || ''} ${existing.lastName || ''}`.trim();

        if (areNamesSmartMatch(incomingFullName, existingFullName)) {
          match = existing;
          const isHousehold = incomingFullName.includes('&') || existingFullName.includes('&');
          matchType = isHousehold ? 'Household / Couple Match' : 'Smart Nickname / Name Match';
          reason = isHousehold 
            ? `Couple / Household match: "${incomingFullName}" <-> "${existingFullName}"`
            : `Nickname / Name match: "${incomingFullName}" <-> "${existingFullName}"`;
          break;
        }
      }
    }

    if (match && match.id !== incoming.id) {
      duplicates.push({
        incoming,
        existing: match,
        matchType,
        reason
      });
    }
  });

  return duplicates;
};

// Scan entire contact list for internal duplicates
export const scanInternalDuplicates = (contacts) => {
  return findDuplicates(contacts);
};

// Smart merge two contacts (prefer non-empty values from incoming)
export const mergeContacts = (existing, incoming) => {
  return {
    ...existing,
    firstName: incoming.firstName !== 'Unnamed' ? incoming.firstName : existing.firstName,
    lastName: incoming.lastName || existing.lastName,
    email: existing.email || incoming.email,
    secondaryEmail: incoming.secondaryEmail || existing.secondaryEmail,
    phone: incoming.phone || existing.phone,
    categories: [...new Set([...(existing.categories || []), ...(incoming.categories || [])])],
    status: existing.status || incoming.status,
    address: incoming.address || existing.address,
    notes: [existing.notes, incoming.notes].filter(Boolean).join(' | '),
    customFields: { ...existing.customFields, ...incoming.customFields },
    updatedAt: new Date().toISOString()
  };
};
