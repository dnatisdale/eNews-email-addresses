/**
 * Accuracy & Completeness Evaluation Service for eNews Address Book
 * Categorizes contacts into Green (High/Complete), Yellow (Partial), or Red (Needs Info/Incomplete)
 * based on Email, First Name, Last Name, and Mailing Address / Phone presence.
 */

export const getContactAccuracy = (contact) => {
  if (!contact) {
    return {
      level: 'red',
      label: 'Needs Info',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      tooltip: 'Empty or invalid record',
      checks: { email: false, firstName: false, lastName: false, address: false, phone: false }
    };
  }

  const email = (contact.email || '').trim();
  const firstName = (contact.firstName || '').trim();
  const lastName = (contact.lastName || '').trim();
  const address = (contact.address || '').trim();
  const phone = (contact.phone || '').trim();

  const hasEmail = Boolean(email && email.includes('@') && email.includes('.') && email.length > 5);
  const hasFirstName = Boolean(firstName && firstName !== 'Unnamed' && firstName.length > 0);
  const hasLastName = Boolean(lastName && lastName.length > 0);
  const hasAddress = Boolean(address && address.length > 3);
  const hasPhone = Boolean(phone && phone.length > 6);

  const checks = {
    email: hasEmail,
    firstName: hasFirstName,
    lastName: hasLastName,
    address: hasAddress,
    phone: hasPhone
  };

  const missingList = [];
  if (!hasEmail) missingList.push('Email');
  if (!hasFirstName) missingList.push('First Name');
  if (!hasLastName) missingList.push('Last Name');
  if (!hasAddress) missingList.push('Address');
  if (!hasPhone) missingList.push('Phone');

  // Green: Has Valid Email + First Name + Last Name + (Mailing Address OR Phone)
  if (hasEmail && hasFirstName && hasLastName && (hasAddress || hasPhone)) {
    return {
      level: 'green',
      label: 'Complete',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
      tooltip: '🟢 Complete: Valid Email, First Name, Last Name & Address/Phone',
      checks,
      missingList
    };
  }

  // Yellow: Has Email + Name (either first or last), but missing Address or Phone
  if (hasEmail && (hasFirstName || hasLastName)) {
    return {
      level: 'yellow',
      label: 'Partial',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      tooltip: `🟡 Partial: Missing ${missingList.join(', ')}`,
      checks,
      missingList
    };
  }

  // Red: Missing Email OR missing Name completely
  return {
    level: 'red',
    label: 'Needs Info',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
    tooltip: `🔴 Incomplete: Missing ${missingList.join(', ')}`,
    checks,
    missingList
  };
};
