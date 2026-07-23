/**
 * CSV Parser & Generator Service for eNews Address Book
 * Supports Google Contacts, Microsoft Outlook, and generic CSV formats.
 */

// Helper to split a CSV line properly respecting quoted values
export const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

// Parse full CSV text into array of objects
export const parseCSV = (csvText) => {
  if (!csvText || !csvText.trim()) return [];

  // Standardize line endings and split
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());

  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map((v) => v.replace(/^["']|["']$/g, '').trim());
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index] : '';
    });
    records.push(rowObj);
  }

  return normalizeImportedContacts(records, headers);
};

// Normalize varied CSV records into standard eNews Contact shape
const normalizeImportedContacts = (records, headers) => {
  return records
    .map((row, index) => {
      let firstName = '';
      let lastName = '';
      let email = '';
      let secondaryEmail = '';
      let phone = '';
      let group = 'General';
      let status = 'Active';
      let address = '';
      let notes = '';

      // Direct Header Matching (Case-Insensitive map)
      const rowLowerKeys = {};
      Object.keys(row).forEach((k) => {
        rowLowerKeys[k.toLowerCase()] = row[k];
      });

      const getVal = (...possibleKeys) => {
        for (const k of possibleKeys) {
          if (rowLowerKeys[k.toLowerCase()]) {
            return rowLowerKeys[k.toLowerCase()].trim();
          }
        }
        return '';
      };

      // 1. Google Contacts / Gmail Patterns
      firstName = getVal('First Name', 'Given Name', 'Name', 'First');
      lastName = getVal('Last Name', 'Family Name', 'Surname', 'Last');
      
      // If name is a single full name column
      if (!firstName && !lastName) {
        const fullName = getVal('Full Name', 'Name', 'Display Name', 'Contact Name');
        if (fullName) {
          const parts = fullName.split(' ');
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        }
      }

      // Email field detection
      email = getVal('E-mail 1 - Value', 'E-mail Address', 'Email Address', 'Email 1', 'Email', 'E-mail', 'Primary Email');
      secondaryEmail = getVal('E-mail 2 - Value', 'E-mail 2 Address', 'Email 2', 'Secondary Email');

      // Phone field detection
      phone = getVal('Phone 1 - Value', 'Mobile Phone', 'Home Phone', 'Business Phone', 'Phone', 'Cell Phone', 'Telephone');

      // Group / Tag detection
      group = getVal('Group Membership', 'Categories', 'Group', 'Category', 'Tag', 'Tags') || 'Friends & Family';
      
      // Clean up Google group membership strings like "* myContacts ::: Family"
      if (group.includes(':::')) {
        const parts = group.split(':::');
        group = parts[parts.length - 1].replace(/\*/g, '').trim();
      }

      // Address & Notes
      address = getVal('Address 1 - Formatted', 'Home Street', 'Business Street', 'Address', 'Street Address');
      notes = getVal('Notes', 'Comment', 'Memo', 'Description');

      // Status override if specified in CSV
      const customStatus = getVal('Status', 'State');
      if (customStatus && ['Active', 'Inactive', 'Unsubscribed', 'Bounced'].includes(customStatus)) {
        status = customStatus;
      }

      // Skip records with no email and no name
      if (!email && !firstName && !lastName) {
        return null;
      }

      return {
        id: 'contact_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5),
        firstName: firstName || 'Unnamed',
        lastName: lastName || '',
        email: email || '',
        secondaryEmail: secondaryEmail || '',
        phone: phone || '',
        group: group || 'General',
        status: status,
        address: address || '',
        notes: notes || '',
        createdAt: new Date().toISOString()
      };
    })
    .filter(Boolean);
};

// Generate CSV string from contacts array
export const exportToCSV = (contacts) => {
  const headers = [
    'First Name',
    'Last Name',
    'Email Address',
    'Secondary Email',
    'Phone',
    'Group / Category',
    'Status',
    'Address',
    'Notes'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = contacts.map((c) => [
    escapeCSV(c.firstName),
    escapeCSV(c.lastName),
    escapeCSV(c.email),
    escapeCSV(c.secondaryEmail),
    escapeCSV(c.phone),
    escapeCSV(c.group),
    escapeCSV(c.status),
    escapeCSV(c.address),
    escapeCSV(c.notes)
  ]);

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
