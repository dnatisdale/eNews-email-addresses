/**
 * Accuracy & Completeness Evaluation Service for eNews Address Book
 * Evaluates completeness based on 3 Core Communication Channels:
 * 1. Physical Address (mail a letter)
 * 2. Email Address (send an email)
 * 3. Phone Number (call them)
 *
 * - IF all 3 channels exist: Displays a Green "99" (no % symbol needed).
 * - IF incomplete (missing 1, 2, or 3 channels): Displays percentage from 1% to 98% (with % symbol).
 */

export const getContactAccuracy = (contact) => {
  if (!contact) {
    return {
      level: 'red',
      scoreRank: 1,
      displayScore: '1%',
      label: 'Needs Info',
      color: '#ef4444',
      tooltip: '🔴 Incomplete: Missing mail address, email, and phone number',
      checks: { email: false, address: false, phone: false },
      missingList: ['Mail Address', 'Email', 'Phone']
    };
  }

  const email = (contact.email || '').trim();
  const firstName = (contact.firstName || '').trim();
  const lastName = (contact.lastName || '').trim();
  const address = (contact.address || '').trim();
  const phone = (contact.phone || '').trim();

  const hasEmail = Boolean(email && email.includes('@') && email.includes('.') && email.length > 4);
  const hasAddress = Boolean(address && address.length > 3);
  const hasPhone = Boolean(phone && phone.length > 5);
  const hasName = Boolean((firstName && firstName !== 'Unnamed') || lastName);

  const checks = {
    email: hasEmail,
    address: hasAddress,
    phone: hasPhone
  };

  const missingList = [];
  if (!hasAddress) missingList.push('Mail Address');
  if (!hasEmail) missingList.push('Email');
  if (!hasPhone) missingList.push('Phone');

  // Count core communication channels (3 max)
  const coreChannelsCount = [hasAddress, hasEmail, hasPhone].filter(Boolean).length;

  // Complete Contact: All 3 channels present (Mail + Email + Call)
  if (coreChannelsCount === 3) {
    return {
      level: 'green',
      scoreRank: 99,
      displayScore: '99', // Solid Green "99" without % symbol
      label: 'Complete Contact (Mail + Email + Call)',
      grade: '99',
      color: '#10b981',
      tooltip: `🟢 Complete Contact (99)\n✓ Mail Address: ${address}\n✓ Email: ${email}\n✓ Phone: ${phone}`,
      checks,
      missingList: []
    };
  }

  // Incomplete percentage score (1% to 98%)
  // Base: 32 points per core channel present (max 96)
  // Bonus: +2 points for name present (max 98)
  let percentVal = (coreChannelsCount * 32) + (hasName ? 2 : 0);
  if (percentVal === 0) percentVal = 1; // Minimum 1%

  const displayScore = `${percentVal}%`;

  if (coreChannelsCount === 2) {
    return {
      level: 'yellow',
      scoreRank: percentVal,
      displayScore,
      label: 'Partial Contact',
      grade: displayScore,
      color: '#f59e0b',
      tooltip: `🟡 Partial Contact (${displayScore})\nMissing: ${missingList.join(', ')}`,
      checks,
      missingList
    };
  }

  return {
    level: 'red',
    scoreRank: percentVal,
    displayScore,
    label: 'Needs Info',
    grade: displayScore,
    color: '#ef4444',
    tooltip: `🔴 Incomplete Contact (${displayScore})\nMissing: ${missingList.join(', ')}`,
    checks,
    missingList
  };
};
