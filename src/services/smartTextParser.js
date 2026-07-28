/**
 * 100% Client-Side Smart Text & Signature Contact Extractor
 * Parses emails, phone numbers, names, addresses, and notes from pasted text.
 * Works 100% offline with zero external API calls or keys required.
 */

export const parseContactsFromText = (rawText) => {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();
  const contacts = [];

  // Email regex matcher
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  // Phone regex matcher (matches (555) 123-4567, 555-123-4567, +1 555 123 4567, 555.123.4567)
  const phoneRegex = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

  // Split raw text into blocks (separated by blank lines) or lines
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim().length > 0);

  blocks.forEach((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const emailsFound = [...block.matchAll(emailRegex)].map((m) => m[0]);
    const phonesFound = [...block.matchAll(phoneRegex)].map((m) => m[0]);

    if (emailsFound.length === 0 && phonesFound.length === 0 && lines.length < 2) {
      return;
    }

    let firstName = '';
    let lastName = '';
    let email = emailsFound[0] || '';
    let secondaryEmail = emailsFound[1] || '';
    let phone = phonesFound[0] || '';
    let address = '';
    let notes = '';

    // Separate contact lines (emails & phones) from description/name lines
    const nonContactLines = [];
    lines.forEach((line) => {
      const lineHasEmail = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(line);
      const lineHasPhone = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(line);

      if (!lineHasEmail && !lineHasPhone) {
        nonContactLines.push(line);
      }
    });

    if (nonContactLines.length > 0) {
      // First non-contact line is usually the person's name
      const possibleName = nonContactLines[0].replace(/^(Name|Contact|From):\s*/i, '').trim();
      const nameParts = possibleName.split(/\s+/);
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1 && nameParts[0].length > 1) {
        firstName = nameParts[0];
        lastName = '';
      }

      // Subsequent non-contact lines form notes/address
      if (nonContactLines.length > 1) {
        const remaining = nonContactLines.slice(1);
        const addressCandidates = remaining.filter((l) =>
          /\b(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Suite|Ste|Way|Court|Ct|CA|NY|TX|FL|IL|Zip)\b/i.test(l)
        );
        if (addressCandidates.length > 0) {
          address = addressCandidates.join(', ');
        }
        notes = remaining.filter((l) => !addressCandidates.includes(l)).join(' | ');
      }
    }

    // Fallback: if no name found, derive name from email address
    if (!firstName && email) {
      const emailUser = email.split('@')[0];
      const emailParts = emailUser.split(/[._-]/);
      if (emailParts.length >= 2) {
        firstName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
        lastName = emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1);
      } else {
        firstName = emailUser.charAt(0).toUpperCase() + emailUser.slice(1);
      }
    }

    if (firstName || email || phone) {
      contacts.push({
        firstName: firstName || 'Unnamed',
        lastName: lastName || '',
        email,
        secondaryEmail,
        phone,
        address,
        notes
      });
    }
  });

  // Fallback for text containing email list without blank lines
  if (contacts.length === 0) {
    const allEmails = [...text.matchAll(emailRegex)].map((m) => m[0]);
    const allPhones = [...text.matchAll(phoneRegex)].map((m) => m[0]);

    allEmails.forEach((em, idx) => {
      const emailUser = em.split('@')[0];
      const parts = emailUser.split(/[._-]/);
      const fn = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Contact';
      const ln = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : '';
      contacts.push({
        firstName: fn,
        lastName: ln,
        email: em,
        secondaryEmail: '',
        phone: allPhones[idx] || '',
        address: '',
        notes: 'Extracted from text'
      });
    });
  }

  return contacts;
};
