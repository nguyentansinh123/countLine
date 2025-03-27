import React, { useState, useEffect } from 'react';
import { Spin, Alert, Card, Input } from 'antd';
import { useParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import ndaDocuments from '../../pages/NDA/const/ndaDocuments';
import legalDocuments from '../../pages/NDA/const/legalDocuments';
import executiveDocumentTemplates from '../../pages/NDA/const/executiveDocuments';
import ipAgreements from '../../pages/NDA/const/ipDocuments';
import GeneralLayout from '../General_Layout/GeneralLayout';

// Set the worker to use the imported worker
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

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

  // Function to extract text from PDF using pdfjs-dist
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(fileArrayBuffer).promise;

      let textContent = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        // Group the text items by their vertical position (y-coordinate)
        const lines: string[] = [];
        let currentLine = '';
        let lastYPosition = -1;

        content.items.forEach((item: any) => {
          // Check if the current item is on the same line as the previous one
          if (Math.abs(item.transform[5] - lastYPosition) < 10) {
            // Same line, append the item text
            currentLine += item.str + ' ';
          } else {
            // New line, push the previous line to the lines array
            if (currentLine.trim() !== '') {
              lines.push(currentLine.trim());
            }
            currentLine = item.str + ' '; // Start a new line
          }
          lastYPosition = item.transform[5]; // Update the last Y position
        });

        // Add the last line (if any)
        if (currentLine.trim() !== '') {
          lines.push(currentLine.trim());
        }

        // Combine all lines for this page
        textContent += lines.join('\n') + '\n\n';
      }

      return textContent;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  // Fetch PDF and extract text
  const fetchPdfFile = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);

      const blob = await response.blob();
      const file = new File([blob], 'file.pdf', { type: 'application/pdf' });

      // Extract text from the PDF
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

  // Handle fetching PDF file on mount or file change
  useEffect(() => {
    if (!file) {
      setError('File not found.');
      setLoading(false);
      return;
    }

    const fetchPdfFileWrapper = async () => {
      const fileUrl = file.location;
      try {
        setLoading(true); // Start loading
        await fetchPdfFile(fileUrl);
      } catch (err) {
        setError('Failed to load PDF file');
        setLoading(false); // Stop loading if there's an error
      }
    };

    fetchPdfFileWrapper();
  }, [file]);

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <div style={{ padding: '20px' }}>
      {file && (
        <>
         <GeneralLayout title='View Document'>
            <div style={{display:'flex'}}>
              <div style={{display:'flex', width:'100%', padding:10}}>
              <p style={{width:100}}>File Name</p>
            <Input value={file.title} contentEditable='false' />
            </div>
            <div style={{display:'flex', width:'100%', padding:10}}>
              <p style={{width:100}}>File Type</p>
            <Input value={decodedCategory}  contentEditable='false' />
            </div>
            </div>
            {loading ? (
              <Spin size="large" />
            ) : txtContent ? (
              <div
                style={{
                  height: '65vh',
                  overflowY: 'auto',
                  padding: '10px',
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #ccc',
                  whiteSpace: 'pre-wrap',  // Preserve line breaks and wrap text
                }}
              >
                <pre>{txtContent}</pre> {/* Display extracted text content */}
              </div>
            ) : (
              <Alert message={error || 'File not found'} type="error" />
            )}
          </GeneralLayout>
        </>
      )}
    </div>
  );
};

export default ViewDocument;
