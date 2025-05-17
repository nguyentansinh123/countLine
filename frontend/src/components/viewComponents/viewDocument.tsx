// src/components/ViewDocument.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GeneralLayout from '../General_Layout/GeneralLayout';
import PdfViewer from '../Editor/PdfViewer';
import { Input, Select } from 'antd';

const ViewDocument: React.FC = () => {
  const { category, file_id } = useParams<{
    category: string;
    file_id: string;
  }>();

  const decodedCategory = decodeURIComponent(category || '');
  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/document/document/${file_id}`,
          {
            credentials: 'include',
          }
        );
        const result = await response.json();
        if (response.ok && result.success) {
          setFile(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch document:', error);
      }
    };

    fetchDocument();
  }, [file_id]);

  return (
    <>
      {file && (
        <>
          <GeneralLayout title="View Document">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <Input
                value={file?.filename || ''}
                style={{ marginRight: '10px' }}
              />
              <Select value={decodedCategory} />
            </div>
            <PdfViewer
              fileUrl={file.presignedUrl || file.fileUrl}
              height={'60vh'}
              width={'100'}
            />
          </GeneralLayout>
        </>
      )}
    </>
  );
};

export default ViewDocument;
