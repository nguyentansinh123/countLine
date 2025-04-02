// src/components/ViewDocument.tsx
import React, { useState, useEffect } from 'react';
import { Spin, Alert, Card, Input } from 'antd';
import { useParams } from 'react-router-dom';
import { fetchPdfFile } from '../../utils/fetchFile'
import  extractTextFromPDF  from '../../utils/extracttextFromPdf';
import ndaDocuments from '../../pages/NDA/const/ndaDocuments';
import legalDocuments from '../../pages/NDA/const/legalDocuments';
import executiveDocumentTemplates from '../../pages/NDA/const/executiveDocuments';
import ipAgreements from '../../pages/NDA/const/ipDocuments';
import GeneralLayout from '../General_Layout/GeneralLayout';
import PdfViewer from '../Editor/PdfViewer';

const ViewDocument: React.FC = () => {
  const { category, file_id } = useParams<{ category: string; file_id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [txtContent, setTxtContent] = useState<string | null>(null);

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
          <PdfViewer fileUrl={file.location}/>
          </GeneralLayout>
        </>
      )}
      
      
      
    </div>
    
  );
};

export default ViewDocument;
