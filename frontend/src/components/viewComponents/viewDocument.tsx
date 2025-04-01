import React from 'react';
import { useParams } from 'react-router-dom';
import ndaDocuments from '../../pages/NDA/const/ndaDocuments';
import legalDocuments from '../../pages/NDA/const/legalDocuments';
import executiveDocumentTemplates from '../../pages/NDA/const/executiveDocuments';
import ipAgreements from '../../pages/NDA/const/ipDocuments';
import GeneralLayout from '../General_Layout/GeneralLayout';
import PdfViewer from '../Editor/PdfViewer';

const ViewDocument: React.FC = () => {
  const { category, file_id } = useParams<{ category: string; file_id: string }>();

  const decodedCategory = decodeURIComponent(category || '');
  let fileData: any[] = [];

  // Determine the category and select the appropriate documents array
  if (decodedCategory === 'NDA Documents') {
    fileData = ndaDocuments;
  } else if (decodedCategory === 'IP Agreements') {
    fileData = ipAgreements;
  } else if (decodedCategory === 'Executive Documents') {
    fileData = executiveDocumentTemplates;
  } else if (decodedCategory === 'Legal Documents') {
    fileData = legalDocuments;
  }

  // Find the file based on the file_id
  const file = fileData.find(f => f.id === file_id);

  // Log the file URL to the console
  if (file) {
    console.log('File URL:', file.url);
  }

  if (!file) {
    return (
      <div style={{ padding: '20px' }}>
        <h3>Document not found</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <GeneralLayout title="View Document">
        <PdfViewer fileUrl={file.location} />
      </GeneralLayout>
    </div>
  );
};

export default ViewDocument;
