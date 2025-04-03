// src/components/ViewDocument.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ndaDocuments from '../../pages/NDA/const/ndaDocuments';
import legalDocuments from '../../pages/NDA/const/legalDocuments';
import executiveDocumentTemplates from '../../pages/NDA/const/executiveDocuments';
import ipAgreements from '../../pages/NDA/const/ipDocuments';
import GeneralLayout from '../General_Layout/GeneralLayout';
import PdfViewer from '../Editor/PdfViewer';
import { Input, Select } from 'antd';

const ViewDocument: React.FC = () => {
  const { category, file_id } = useParams<{ category: string; file_id: string }>();

  const decodedCategory = decodeURIComponent(category || '');
  let fileData: any[] = [];

  if (decodedCategory === 'NDA Documents') {
    fileData = ndaDocuments;
  } else if (decodedCategory === 'IP Agreements') {
    fileData = ipAgreements;
  } else if (decodedCategory === 'Executive Documents') {
    fileData = executiveDocumentTemplates;
  } else if (decodedCategory === 'Legal Documents') {
    fileData = legalDocuments;
  }

  const file = fileData.find(f => f.id === file_id);


  return (
    
    <div style={{ padding: '20px' }}>
    
      {file && (
        <>
          <GeneralLayout title='View Document'>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <Input
              value={file?.title || ''}
              style={{ marginRight: '10px' }}
              placeholder="Enter file content"
            />
            <Select value={decodedCategory} style={{ width: '150px' }}/>
             
          </div>
          <PdfViewer fileUrl={file.location}/>
          </GeneralLayout>
        </>
      )}
      
      
      
    </div>
    
  );
};

export default ViewDocument;
