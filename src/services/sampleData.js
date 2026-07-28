/**
 * Sample eNews Email Address Dataset (1 sample contact) for quick preview
 */

export const generateSampleContacts = () => {
  const sample = {
    first: 'Eleanor',
    last: 'Tisdale',
    email: 'eleanor.tisdale@example.com',
    secondaryEmail: 'eleanor.tisdale@work.com',
    phone: '(555) 234-5678',
    status: 'Active',
    address: '101 Elm Street, Suite 1, Springfield, IL',
    notes: 'Sends annual holiday card & eNews'
  };

  return [{
    id: `sample_0_${Date.now()}`,
    firstName: sample.first,
    lastName: sample.last,
    email: sample.email,
    secondaryEmail: sample.secondaryEmail,
    phone: sample.phone,
    categories: ['*SAMPLE*'],
    status: sample.status,
    address: sample.address,
    notes: sample.notes,
    createdAt: new Date().toISOString()
  }];
};
