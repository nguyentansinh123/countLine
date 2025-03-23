import React, { useEffect, useState } from 'react';
import { Input, Select, Button, Card, Alert } from 'antd';
import { useParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import ndaDocuments from '../const/ndaDocuments';
import legalDocuments from '../const/legalDocuments';
import executiveDocumentTemplates from '../const/executiveDocuments';
import ipAgreements from '../const/ipDocuments';

const { Option } = Select;
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const EditDocument: React.FC = () => {
  const {category, file_id } = useParams<{ category: string; file_id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [txtContent, setTxtContent] = useState<string | null>(null);

  
  const decodedCategory = decodeURIComponent(category || '');
  console.log('Decoded Category:', decodedCategory); // Log decoded category
  console.log('File ID from URL:', file_id);

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

  console.log('File Data Array:', fileData); // Log the file data array based on category selection

  const file = fileData.find(f => f.id === file_id);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const fileArrayBuffer = await file.arrayBuffer();
      console.log('File ArrayBuffer:', fileArrayBuffer); // Log the file array buffer

      const pdf = await pdfjsLib.getDocument(fileArrayBuffer).promise;
      console.log('PDF Loaded:', pdf); // Log the loaded PDF document

      let textContent = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        console.log(`Page ${pageNum} content:`, content); // Log content of each page

        const lines: string[] = [];
        let currentLine = '';
        let lastYPosition = -1;

        content.items.forEach((item: any) => {
          if (Math.abs(item.transform[5] - lastYPosition) < 10) {
            currentLine += item.str + ' ';
          } else {
            if (currentLine.trim() !== '') {
              lines.push(currentLine.trim());
            }
            currentLine = item.str + ' ';
          }
          lastYPosition = item.transform[5];
        });

        if (currentLine.trim() !== '') {
          lines.push(currentLine.trim());
        }

        textContent += lines.join('\n') + '\n\n';
      }

      console.log('Extracted Text:', textContent); // Log the extracted text content
      return textContent;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const fetchPdfFile = async (url: string) => {
    try {
      console.log(`Fetching PDF from URL: ${url}`); // Log the file URL to be fetched

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);

      const blob = await response.blob();
      const file = new File([blob], 'file.pdf', { type: 'application/pdf' });

      const text = await extractTextFromPDF(file);
      setTxtContent(text);
      setLoading(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Effect triggered'); // Log when the effect is triggered

    if (!file) {
      setError('File not found.');
      setLoading(false);
      return;
    }

    const fetchPdfFileWrapper = async () => {
      const fileUrl = file.location;
      console.log('Fetching file from location:', fileUrl); // Log the file URL from file data

      try {
        setLoading(true);
        await fetchPdfFile(fileUrl);
      } catch (err) {
        console.error('Error fetching the PDF:', err);
        setError('Failed to load PDF file');
        setLoading(false);
      }
    };

    fetchPdfFileWrapper();
  }, [file]);

  if (error) {
    return <Alert message={error} type="error" />;
  }


  console.log('File ID from URL:', file_id);

  return (
    <Card title="Edit File" style={{ border: '1px solid #151349', margin: '2%' }}>
      <div style={{ display: 'flex' }}>


        {/* Edit popup */}
        <div style={{ flexGrow: 1, paddingLeft: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <Input
              value={file.title || ''}
              onChange={(e) => setTxtContent(e.target.value)}
              style={{ marginRight: '10px' }}
              placeholder="Enter file content"
            />
            <Select
              value={decodedCategory}
              style={{ width: '150px' }}
            >
              <Option value="NDA Documents">NDA Documents</Option>
              <Option value="IP Agreements">IP Agreements</Option>
              <Option value="Executive Documents">Executive Documents</Option>
              <Option value="Legal Documents">Legal Documents</Option>
            </Select>
          </div>

          <div
  contentEditable
  suppressContentEditableWarning={true}
  style={{
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '24px',
    height: '500px',
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: '16px',
    lineHeight: '1.8',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    outline: 'none',
  }}
  dangerouslySetInnerHTML={{ __html: txtContent || "" }}
></div>

        

          <div style={{ marginTop: '20px' }}>
            <Button type="primary" onClick={() => alert('Document Saved')}>
              Save Document
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EditDocument;
