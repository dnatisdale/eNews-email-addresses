/**
 * Sample eNews Email Address Dataset (50 contacts) for 1-click testing
 */

export const generateSampleContacts = () => {
  const sampleNames = [
    { first: 'Eleanor', last: 'Tisdale', group: 'Family', email: 'eleanor.tisdale@example.com', phone: '(555) 234-5678', status: 'Active' },
    { first: 'Robert', last: 'Tisdale', group: 'Family', email: 'rob.tisdale@gmail.com', phone: '(555) 345-6789', status: 'Active' },
    { first: 'Sarah', last: 'Jenkins', group: 'Family', email: 'sarah.j.tisdale@outlook.com', phone: '(555) 456-7890', status: 'Active' },
    { first: 'Michael', last: 'Tisdale', group: 'Family', email: 'mike.tisdale88@yahoo.com', phone: '(555) 567-8901', status: 'Active' },
    { first: 'David', last: 'Miller', group: 'Close Friends', email: 'dave.miller@techcorp.org', phone: '(555) 678-9012', status: 'Active' },
    { first: 'Jessica', last: 'Alvarez', group: 'Close Friends', email: 'jess.alvarez@gmail.com', phone: '(555) 789-0123', status: 'Active' },
    { first: 'William', last: 'Smith', group: 'Newsletter', email: 'wsmith.family@gmail.com', phone: '(555) 890-1234', status: 'Active' },
    { first: 'Amanda', last: 'Johnson', group: 'Holiday List', email: 'amanda.johnson@outlook.com', phone: '(555) 901-2345', status: 'Active' },
    { first: 'James', last: 'Williams', group: 'Family', email: 'jimmy.williams@icloud.com', phone: '(555) 012-3456', status: 'Active' },
    { first: 'Emily', last: 'Brown', group: 'Close Friends', email: 'emily.brown@gmail.com', phone: '(555) 123-4567', status: 'Active' },
    { first: 'Daniel', last: 'Jones', group: 'Newsletter', email: 'dan.jones@live.com', phone: '(555) 234-5670', status: 'Active' },
    { first: 'Sophia', last: 'Garcia', group: 'Holiday List', email: 'sophia.garcia@gmail.com', phone: '(555) 345-6701', status: 'Active' },
    { first: 'Matthew', last: 'Rodriguez', group: 'Family', email: 'matt.rodriguez@yahoo.com', phone: '(555) 456-7012', status: 'Active' },
    { first: 'Olivia', last: 'Martinez', group: 'Close Friends', email: 'liv.martinez@gmail.com', phone: '(555) 567-8023', status: 'Active' },
    { first: 'Christopher', last: 'Hernandez', group: 'Newsletter', email: 'chris.h@outlook.com', phone: '(555) 678-9134', status: 'Unsubscribed' },
    { first: 'Isabella', last: 'Lopez', group: 'Holiday List', email: 'isabella.lopez@icloud.com', phone: '(555) 789-0245', status: 'Active' },
    { first: 'Andrew', last: 'Gonzalez', group: 'Family', email: 'andy.gonzalez@gmail.com', phone: '(555) 890-1356', status: 'Active' },
    { first: 'Mia', last: 'Wilson', group: 'Close Friends', email: 'mia.wilson@yahoo.com', phone: '(555) 901-2467', status: 'Active' },
    { first: 'Joshua', last: 'Anderson', group: 'Newsletter', email: 'josh.anderson@gmail.com', phone: '(555) 012-3578', status: 'Active' },
    { first: 'Charlotte', last: 'Thomas', group: 'Holiday List', email: 'charlotte.t@outlook.com', phone: '(555) 123-4689', status: 'Active' },
    { first: 'Ethan', last: 'Taylor', group: 'Family', email: 'ethan.taylor@gmail.com', phone: '(555) 234-5790', status: 'Active' },
    { first: 'Amelia', last: 'Moore', group: 'Close Friends', email: 'amelia.moore@gmail.com', phone: '(555) 345-6801', status: 'Active' },
    { first: 'Alexander', last: 'Jackson', group: 'Newsletter', email: 'alex.jackson@live.com', phone: '(555) 456-7912', status: 'Inactive' },
    { first: 'Harper', last: 'Martin', group: 'Holiday List', email: 'harper.martin@yahoo.com', phone: '(555) 567-8023', status: 'Active' },
    { first: 'Benjamin', last: 'Lee', group: 'Family', email: 'ben.lee.family@gmail.com', phone: '(555) 678-9134', status: 'Active' }
  ];

  return sampleNames.map((item, idx) => ({
    id: `sample_${idx}_${Date.now()}`,
    firstName: item.first,
    lastName: item.last,
    email: item.email,
    secondaryEmail: idx % 4 === 0 ? `${item.first.toLowerCase()}.${item.last.toLowerCase()}@work.com` : '',
    phone: item.phone,
    categories: [item.group],
    status: item.status,
    address: `${100 + idx} Elm Street, Suite ${idx + 1}, Springfield, IL`,
    notes: idx % 3 === 0 ? 'Sends annual holiday card & eNews' : 'Regular eNews recipient',
    createdAt: new Date().toISOString()
  }));
};
