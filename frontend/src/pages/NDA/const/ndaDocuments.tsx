const ndaDocuments = [
  {
    id: 'doc-nda-001',
    title: 'Standard NDA',
    uploadedBy: 'John Doe',
    uploadedAt: '2025-03-01',
    status: 'Reviewed',
    fileType: 'PDF',
    location: "https://csit321bucket.s3.ap-southeast-2.amazonaws.com/Standard+NDA.pdf"
  },
  {
    id: 'doc-nda-002',
    title: 'Non-Disclosure Agreement for Contractors',
    uploadedBy: 'Jane Smith',
    uploadedAt: '2025-03-03',
    status: 'Pending',
    fileType: 'PDF',
    location: 'https://csit321bucket.s3.ap-southeast-2.amazonaws.com/Non-Disclosure+Agreement+for+Contractors.pdf',
  },
  {
    id: 'doc-nda-003',
    title: 'Non-Disclosure Agreement for Employees',
    uploadedBy: 'Emily Chan',
    uploadedAt: '2025-03-05',
    status: 'Signed',
    fileType: 'PDF',
    location: 'https://csit321bucket.s3.ap-southeast-2.amazonaws.com/Non-Disclosure+Agreement+for+Employees.pdf',
  },
];

export default ndaDocuments;
