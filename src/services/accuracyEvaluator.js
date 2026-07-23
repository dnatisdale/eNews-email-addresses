/**
 * Accuracy & Completeness Evaluation Service for eNews Address Book
 * Categorizes contacts into Green (Complete - Rank 3), Yellow (Partial - Rank 2), or Red (Needs Info - Rank 1)
 */

export const getContactAccuracy = (contact) => {
  if (!contact) {
    return {
      level: 'red',
      scoreRank: 1,
      scorePercent: '0%',
      label: 'Needs Info',
      color: '#ef4444',
      tooltip: '🔴 Incomplete: Missing critical contact details',
      checks: { email: false, firstName: false, lastName: false, address: false, phone: false },
      missingList: ['Email', 'Name', 'Address', 'Phone']
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

  const fieldCount = [hasEmail, hasFirstName, hasLastName, hasAddress, hasPhone].filter(Boolean).length;
  const scorePercent = `${Math.round((fieldCount / 5) * 100)}%`;

  // Green: Has Valid Email + First Name + Last Name + (Mailing Address OR Phone)
  if (hasEmail && hasFirstName && hasLastName && (hasAddress || hasPhone)) {
    return {
      level: 'green',
      scoreRank: 3,
      scorePercent,
      label: 'Complete',
      color: '#10b981',
      tooltip: `🟢 Complete Score (${scorePercent})\n✓ Email: ${email}\n✓ Name: ${firstName} ${lastName}\n${hasPhone ? '✓ Phone: ' + phone : '✗ Address: Missing'}`,
      checks,
      missingList
    };
  }

  // Yellow: Has Email + Name (either first or last), but missing Address or Phone
  if (hasEmail && (hasFirstName || hasLastName)) {
    return {
      level: 'yellow',
      scoreRank: 2,
      scorePercent,
      label: 'Partial',
      color: '#f59e0b',
      tooltip: `🟡 Partial Score (${scorePercent})\n✓ Email: ${email}\nMissing: ${missingList.join(', ')}`,
      checks,
      missingList
    };
  }

  // Red: Missing Email OR missing Name completely
  return {
    level: 'red',
    scoreRank: 1,
    scorePercent,
    label: 'Needs Info',
    color: '#ef4444',
    tooltip: `🔴 Incomplete Score (${scorePercent})\nMissing: ${missingList.join(', ')}`,
    checks,
    missingList
  };
};
