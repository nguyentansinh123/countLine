import React, { useEffect, useState } from 'react';
import { Input, Select, Button, Alert } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import ndaDocuments from '../const/ndaDocuments';
import legalDocuments from '../const/legalDocuments';
import executiveDocumentTemplates from '../const/executiveDocuments';
import ipAgreements from '../const/ipDocuments';
import { fetchPdfFile } from '../../../utils/fetchFile';
import PdfEditor from '../../../components/Editor/PdfEditor';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';

const { Option } = Select;
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const EditDocument: React.FC = () => {
  const navigate = useNavigate();
  const { category, file_id } = useParams<{ category: string; file_id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

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
    const loadPdf = async () => {
      setLoading(true);
      try {
        if (file?.location) {
          const blob = await fetchPdfFile(file.location);
          setPdfBlob(blob);
        } else {
          throw new Error("File location not found");
        }
      } catch (error) {
        setError('Failed to load the PDF');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [file]);



  if (error) {
    return <Alert message={error} type="error" />;
  }

  function setTxtContent(value: string): void {
    console.log("File content updated:", value);
  }

  return (
    <GeneralLayout title="Edit Document">
      <div style={{ display: 'flex' }}>
        <div style={{ flexGrow: 1, paddingLeft: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <Input
              value={file?.title || ''}
              onChange={(e) => setTxtContent(e.target.value)}
              style={{ marginRight: '10px' }}
              placeholder="Enter file content"
            />
            <Select value={decodedCategory} style={{ width: '150px' }}>
              <Option value="NDA Documents">NDA Documents</Option>
              <Option value="IP Agreements">IP Agreements</Option>
              <Option value="Executive Documents">Executive Documents</Option>
              <Option value="Legal Documents">Legal Documents</Option>
            </Select>
          </div>

          {pdfBlob && <PdfEditor pdfBlob={pdfBlob} />}
          
          <div style={{ marginTop: '20px' }}>
            <Button type="primary" onClick={() => navigate("/non-disclosure-agreement")}>
              Save Document
            </Button>
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
};

export default EditDocument;
