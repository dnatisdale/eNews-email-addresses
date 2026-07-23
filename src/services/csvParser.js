/**
 * RFC 4180 Compliant CSV Parser & Generator Service for eNews Address Book
 * Supports Google Contacts, Microsoft Outlook, and generic CSV formats.
 * Correctly handles multiline quoted strings, custom CSV headers,
 * and Smart Household/Couple & Nickname Parsing.
 */

import { parseSmartName } from './smartNameParser';

// Parse raw CSV text into a 2D array of rows, respecting quoted multiline strings
export const parseCSVToRows = (csvText) => {
  if (!csvText || !csvText.trim()) return [];

  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // Skip escaped double quote
      } else {
        inQuotes = !inQuotes; // Toggle quote state
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in \r\n
      }
      currentRow.push(currentCell.trim());
      // Only push non-empty rows
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  // Push final trailing row if present
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
};

// Main CSV Parsing Entry Point
export const parseCSV = (csvText) => {
  const rows = parseCSVToRows(csvText);
  if (rows.length < 2) return [];

  // First row is headers
  const headers = rows[0].map((h) => h.replace(/^["']|["']$/g, '').trim());

  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].map((v) => v.replace(/^["']|["']$/g, '').trim());
    
    // Skip rows that are empty or have fewer cells than header
    if (values.length === 0 || values.every((v) => !v)) continue;

    const rowObj = {};
    headers.forEach((header, index) => {
      if (header) {
        rowObj[header] = values[index] !== undefined ? values[index] : '';
      }
    });
    records.push(rowObj);
  }

  return normalizeImportedContacts(records);
};

// Known Standard Keys for matching
const STANDARD_KEYS = new Set([
  'first name', 'given name', 'first', 'forename', 
  'last name', 'family name', 'last', 'surname',
  'full name', 'name', 'display name', 'contact name', 'nickname',
  'e-mail 1 - value', 'e-mail address', 'email address', 'email 1', 'email', 'e-mail', 'primary email', 'e-mail 1',
  'e-mail 2 - value', 'e-mail 2 address', 'email 2', 'secondary email', 'e-mail 2',
  'phone 1 - value', 'mobile phone', 'home phone', 'business phone', 'phone', 'cell phone', 'telephone', 'phone 1',
  'group membership', 'categories', 'group', 'category', 'tag', 'tags',
  'address 1 - formatted', 'home street', 'business street', 'address', 'street address',
  'notes', 'comment', 'memo', 'description', 'status', 'state'
]);

// Normalize varied CSV records into standard eNews Contact shape
const normalizeImportedContacts = (records) => {
  return records
    .map((row, index) => {
      // Build lowercase key lookup map
      const rowLowerKeys = {};
      Object.keys(row).forEach((k) => {
        if (k) rowLowerKeys[k.toLowerCase().trim()] = row[k];
      });

      const getVal = (...possibleKeys) => {
        for (const k of possibleKeys) {
          if (rowLowerKeys[k.toLowerCase()]) {
            return rowLowerKeys[k.toLowerCase()].trim();
          }
        }
        return '';
      };

      // 1. Raw Name Extraction
      const rawFirstName = getVal('first name', 'given name', 'first', 'forename');
      const rawLastName = getVal('last name', 'family name', 'last', 'surname');
      const rawFullName = getVal('full name', 'name', 'display name', 'contact name');
      const csvNickname = getVal('nickname');

      // Smart Name Parsing for Couples ("Tom & Mary"), Nicknames, and Suffixes
      const smartName = parseSmartName(rawFirstName, rawLastName, rawFullName);

      // 2. Email Field Parsing
      const email = getVal('e-mail 1 - value', 'e-mail address', 'email address', 'email 1', 'email', 'e-mail', 'primary email', 'e-mail 1');
      const secondaryEmail = getVal('e-mail 2 - value', 'e-mail 2 address', 'email 2', 'secondary email', 'e-mail 2');

      // 3. Phone Field Parsing
      const phone = getVal('phone 1 - value', 'mobile phone', 'home phone', 'business phone', 'phone', 'cell phone', 'telephone', 'phone 1');

      // 4. Group / Tag Parsing
      let group = getVal('group membership', 'categories', 'group', 'category', 'tag', 'tags');
      if (group && group.includes(':::')) {
        const parts = group.split(':::');
        group = parts[parts.length - 1].replace(/\*/g, '').trim();
      }
      if (!group) {
        group = smartName.isHousehold ? 'Family & Household' : 'Friends & Family';
      }

      // 5. Address & Notes
      const address = getVal('address 1 - formatted', 'home street', 'business street', 'address', 'street address');
      let notes = getVal('notes', 'comment', 'memo', 'description');

      const foundNickname = csvNickname || smartName.nickname;
      if (foundNickname && !notes.toLowerCase().includes(foundNickname.toLowerCase())) {
        notes = notes ? `Nickname: "${foundNickname}" | ${notes}` : `Nickname: "${foundNickname}"`;
      }

      // 6. Status
      let status = 'Active';
      const customStatus = getVal('status', 'state');
      if (customStatus && ['Active', 'Inactive', 'Unsubscribed', 'Bounced'].includes(customStatus)) {
        status = customStatus;
      }

      // 7. Extract Custom Fields (Any CSV column not in standard set)
      const customFields = {};
      Object.keys(row).forEach((colHeader) => {
        if (colHeader && row[colHeader] && !STANDARD_KEYS.has(colHeader.toLowerCase().trim())) {
          customFields[colHeader.trim()] = row[colHeader].trim();
        }
      });

      // STRICT VALIDATION: Skip records that have NO email AND NO name AND NO phone
      const cleanEmail = email.trim();
      const cleanFirstName = smartName.firstName.trim();
      const cleanLastName = smartName.lastName.trim();
      const cleanPhone = phone.trim();

      if (!cleanEmail && (!cleanFirstName || cleanFirstName === 'Unnamed') && !cleanLastName && !cleanPhone) {
        return null; // Skip blank / trailing fragment rows completely
      }

      return {
        id: 'contact_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5),
        firstName: cleanFirstName || (cleanEmail ? cleanEmail.split('@')[0] : 'Unnamed'),
        lastName: cleanLastName,
        email: cleanEmail,
        secondaryEmail: secondaryEmail.trim(),
        phone: cleanPhone,
        group: group.trim(),
        status: status,
        address: address.trim(),
        notes: notes.trim(),
        customFields: customFields,
        createdAt: new Date().toISOString()
      };
    })
    .filter(Boolean);
};

// Generate CSV string from contacts array
export const exportToCSV = (contacts) => {
  // Collect all unique custom field headers across all contacts
  const customHeaders = new Set();
  contacts.forEach((c) => {
    if (c.customFields) {
      Object.keys(c.customFields).forEach((key) => customHeaders.add(key));
    }
  });

  const headers = [
    'First Name',
    'Last Name',
    'Email Address',
    'Secondary Email',
    'Phone',
    'Group / Category',
    'Status',
    'Address',
    'Notes',
    ...Array.from(customHeaders)
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = contacts.map((c) => {
    const baseCols = [
      escapeCSV(c.firstName),
      escapeCSV(c.lastName),
      escapeCSV(c.email),
      escapeCSV(c.secondaryEmail),
      escapeCSV(c.phone),
      escapeCSV(c.group),
      escapeCSV(c.status),
      escapeCSV(c.address),
      escapeCSV(c.notes)
    ];

    const extraCols = Array.from(customHeaders).map((h) => 
      escapeCSV(c.customFields ? c.customFields[h] : '')
    );

    return [...baseCols, ...extraCols];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

// Download CSV file directly in browser
export const downloadCSVFile = (contacts, filename = 'eNews_Email_List.csv') => {
  const csvContent = exportToCSV(contacts);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
