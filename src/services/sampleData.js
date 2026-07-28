/**
 * Sample eNews Email Address Dataset (4 example contacts) for quick preview
 */

export const generateSampleContacts = () => {
  const sampleNames = [
    {
      first: 'Eleanor',
      last: 'Tisdale',
      email: 'eleanor.tisdale@example.com',
      secondaryEmail: 'eleanor.tisdale@work.com',
      phone: '(555) 234-5678',
      status: 'Active',
      address: '101 Elm Street, Suite 1, Springfield, IL',
      notes: 'Sends annual holiday card & eNews'
    },
    {
      first: 'Robert',
      last: 'Tisdale',
      email: 'rob.tisdale@example.com',
      secondaryEmail: '',
      phone: '(555) 345-6789',
      status: 'Active',
      address: '202 Oak Avenue, Chicago, IL',
      notes: 'Family newsletter recipient'
    },
    {
      first: 'Sarah',
      last: 'Jenkins',
      email: 'sarah.jenkins@example.com',
      secondaryEmail: '',
      phone: '(555) 456-7890',
      status: 'Active',
      address: '303 Maple Drive, Naperville, IL',
      notes: 'Prefers eNews via personal email'
    },
    {
      first: 'David',
      last: 'Miller',
      email: 'dave.miller@example.com',
      secondaryEmail: 'dave.m@work.com',
      phone: '(555) 678-9012',
      status: 'Active',
      address: '404 Pine Street, Suite 500, Chicago, IL',
      notes: 'Quarterly newsletter subscriber'
    }
  ];

  return sampleNames.map((item, idx) => ({
    id: `sample_${idx}_${Date.now()}`,
    firstName: item.first,
    lastName: item.last,
    email: item.email,
    secondaryEmail: item.secondaryEmail || '',
    phone: item.phone,
    categories: ['*EXAMPLES*'],
    status: item.status,
    address: item.address,
    notes: item.notes,
    createdAt: new Date().toISOString()
  }));
};

