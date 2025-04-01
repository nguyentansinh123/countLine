// src/components/ViewDocument.tsx
import React, { useState, useEffect } from 'react';
import { Spin, Alert, Card, Input } from 'antd';
import { useParams } from 'react-router-dom';
import { fetchPdfFile } from '../../utils/fetchFile'
import { extractTextFromPDF } from '../../utils/extracttextFromPdf';
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

  useEffect(() => {
    if (!file) {
      setError('File not found.');
      setLoading(false);
      return;
    }

    const fetchAndExtractText = async () => {
      try {
        setLoading(true); // Start loading
        const fileUrl = file.location;
        
        const fetchedFile = await fetchPdfFile(fileUrl); // Fetch file
        if (!fetchedFile) {
          setError('File not found.');
          setLoading(false);
          return;
        }

        const text = await extractTextFromPDF(fetchedFile); // Extract text
        setTxtContent(text);
        setLoading(false);
      } catch (err) {
        setError('Failed to load PDF file');
        setLoading(false); // Stop loading if there's an error
      }
    };

    fetchAndExtractText();
  }, [file]);

  if (error) {
    return <Alert message={error} type="error" />;
  }

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
