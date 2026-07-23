/**
 * International Phone Number Parser, Cleaner, & Formatter Service
 * Supports Thai numbers (+66 / 08x / 09x / 06x / 02x), US/Canada (+1), UK (+44), EU, Australia, etc.
 * Cleans raw phone text and generates app-specific dialer URIs (tel, WhatsApp, Skype, FaceTime).
 */

// International phone matching regex
// Matches +66 81 234 5678, 081-234-5678, (555) 123-4567, +44 20 7946 0958, etc.
const INT_PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g;

export const extractInternationalPhone = (rawText = '') => {
  if (!rawText || typeof rawText !== 'string') return '';

  const matches = rawText.match(INT_PHONE_REGEX);
  if (matches && matches.length > 0) {
    // Find first valid match with 7 to 15 digits
    for (const match of matches) {
      const digits = match.replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 15) {
        return cleanAndFormatPhone(match);
      }
    }
  }
  return '';
};

// Clean and format phone numbers nicely for display
export const cleanAndFormatPhone = (phoneStr = '') => {
  if (!phoneStr) return '';
  const trimmed = phoneStr.trim();
  const digits = trimmed.replace(/\D/g, '');

  // 1. Thai Mobile (starts with 08, 09, 06 and has 10 digits e.g. 0812345678 -> 081-234-5678 or +66 81 234 5678)
  if (digits.length === 10 && (digits.startsWith('08') || digits.startsWith('09') || digits.startsWith('06'))) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // 2. Thai Landline (starts with 02, 03, 04, 05, 07 e.g. 021234567 -> 02-123-4567)
  if (digits.length === 9 && digits.startsWith('0')) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  // 3. Thai with Country Code +66 (e.g. 66812345678 -> +66 81 234 5678)
  if (digits.length === 11 && digits.startsWith('66')) {
    return `+66 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // 4. US / Canada 10 Digits (e.g. 5551234567 -> (555) 123-4567)
  if (digits.length === 10 && !digits.startsWith('0')) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // 5. General International with leading +
  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  return trimmed;
};

// Generate pure digits with country code prefix for dialer links (E.164 compliant)
export const getDialableDigits = (phoneStr = '') => {
  if (!phoneStr) return '';
  let digits = phoneStr.replace(/\D/g, '');

  // If Thai local number starting with 0 (e.g., 0812345678), convert to +66812345678
  if (digits.length === 10 && (digits.startsWith('08') || digits.startsWith('09') || digits.startsWith('06'))) {
    return `66${digits.slice(1)}`;
  }
  if (digits.length === 9 && digits.startsWith('0')) {
    return `66${digits.slice(1)}`;
  }

  // US 10-digit default to 1
  if (digits.length === 10 && !digits.startsWith('1')) {
    return `1${digits}`;
  }

  return digits;
};

// Helper link generators for calling apps
export const getCallLinks = (phoneStr = '') => {
  const dialable = getDialableDigits(phoneStr);
  const rawClean = cleanAndFormatPhone(phoneStr);

  return {
    formatted: rawClean,
    dialable,
    telUri: `tel:${phoneStr.startsWith('+') ? phoneStr : '+' + dialable}`,
    whatsAppUri: `https://wa.me/${dialable}`,
    skypeUri: `skype:+${dialable}?call`,
    facetimeUri: `facetime-audio:+${dialable}`
  };
};
