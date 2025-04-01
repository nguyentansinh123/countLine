import React, { useEffect, useState } from 'react';
import { Input, Select, Button, Card, Alert } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import ndaDocuments from '../const/ndaDocuments';
import legalDocuments from '../const/legalDocuments';
import executiveDocumentTemplates from '../const/executiveDocuments';
import ipAgreements from '../const/ipDocuments';
import PdfViewer from '../../../components/Editor/PdfViewer';

const { Option } = Select;
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const EditDocument: React.FC = () => {
  const navigate=useNavigate();
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

console.log(file.location);
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
            <PdfViewer fileUrl={file.location}/>

        

          <div style={{ marginTop: '20px' }}>
            <Button type="primary" onClick={() =>  navigate("/non-disclosure-agreement")}>
              Save Document
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EditDocument;
