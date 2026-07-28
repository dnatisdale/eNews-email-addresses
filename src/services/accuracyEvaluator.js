/**
 * Accuracy & Completeness Evaluation Service for eNews Address Book
 * Evaluates completeness based on 4 Core Items:
 * 1. Name (First or Last name)
 * 2. Email Address
 * 3. Phone Number
 * 4. Physical Address
 *
 * Renders as a 1 x 4 table / box grid with solid filled blocks for present items.
 */

export const getContactAccuracy = (contact) => {
  if (!contact) {
    const defaultBoxes = [
      { key: 'name', label: 'Name', present: false },
      { key: 'email', label: 'Email', present: false },
      { key: 'phone', label: 'Phone', present: false },
      { key: 'address', label: 'Address', present: false }
    ];
    return {
      level: 'red',
      scoreRank: 0,
      displayScore: '0/4',
      label: 'Needs Info (0/4)',
      color: '#ef4444',
      tooltip: '🔴 Incomplete (0/4 Items Present)\nMissing: Name, Email, Phone, Address',
      checks: { name: false, email: false, phone: false, address: false },
      count: 0,
      boxes: defaultBoxes,
      missingList: ['Name', 'Email', 'Phone', 'Address']
    };
  }

  const email = (contact.email || '').trim();
  const firstName = (contact.firstName || '').trim();
  const lastName = (contact.lastName || '').trim();
  const address = (contact.address || '').trim();
  const phone = (contact.phone || '').trim();

  const hasName = Boolean((firstName && firstName !== 'Unnamed') || lastName);
  const hasEmail = Boolean(email && email.includes('@') && email.length > 4);
  const hasPhone = Boolean(phone && phone.length > 5);
  const hasAddress = Boolean(address && address.length > 3);

  const checks = {
    name: hasName,
    email: hasEmail,
    phone: hasPhone,
    address: hasAddress
  };

  const boxes = [
    { key: 'name', label: 'Name', present: hasName },
    { key: 'email', label: 'Email', present: hasEmail },
    { key: 'phone', label: 'Phone', present: hasPhone },
    { key: 'address', label: 'Address', present: hasAddress }
  ];

  const count = [hasName, hasEmail, hasPhone, hasAddress].filter(Boolean).length;

  const missingList = [];
  if (!hasName) missingList.push('Name');
  if (!hasEmail) missingList.push('Email');
  if (!hasPhone) missingList.push('Phone');
  if (!hasAddress) missingList.push('Address');

  let level = 'red';
  let color = '#ef4444';
  if (count === 4) {
    level = 'green';
    color = '#15803d'; // Medium Dark Green
  } else if (count >= 2) {
    level = 'yellow';
    color = '#ca8a04'; // Medium Dark Gold/Yellow
  }

  const tooltipLines = [
    `Completeness: ${count}/4 Items Present`,
    `• Name: ${hasName ? '✓ Present' : '✗ Missing'}`,
    `• Email: ${hasEmail ? '✓ Present' : '✗ Missing'}`,
    `• Phone: ${hasPhone ? '✓ Present' : '✗ Missing'}`,
    `• Address: ${hasAddress ? '✓ Present' : '✗ Missing'}`
  ];

  return {
    level,
    scoreRank: count,
    displayScore: `${count}/4`,
    label: `${count}/4 Items`,
    color,
    tooltip: tooltipLines.join('\n'),
    checks,
    count,
    boxes,
    missingList
  };
};
