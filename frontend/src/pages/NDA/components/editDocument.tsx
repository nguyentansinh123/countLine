import React, { useEffect, useState } from 'react';
import { Input, Select, Button, Alert, Layout } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import { EditOutlined, FileTextOutlined, SignatureOutlined, CalendarOutlined, NumberOutlined } from '@ant-design/icons';
import ndaDocuments from '../const/ndaDocuments';
import legalDocuments from '../const/legalDocuments';
import executiveDocumentTemplates from '../const/executiveDocuments';
import ipAgreements from '../const/ipDocuments';
import PdfEditor from '../../../components/Editor/PdfEditor';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';
import PdfViewer from '../../../components/Editor/PdfViewer';


const { Option } = Select;
const { Sider, Content } = Layout;

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const EditDocument: React.FC = () => {
  const navigate = useNavigate();
  const { category, file_id } = useParams<{ category: string; file_id: string }>();
  const decodedCategory = decodeURIComponent(category || '');

  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load file list based on category
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

  const file = fileData.find((f) => f.id === file_id);

  useEffect(() => {
    if (!file) {
      setError('Document not found.');
    } else {
      setTitle(file.title || '');
    }
  }, [file]);

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const handleSave = () => {
    console.log('Saving document with title:', title);
    // TODO: Add save logic here (e.g., API call or state update)
    navigate('/non-disclosure-agreement');
  };




  return (
    <GeneralLayout title="Edit Document">
         

          <Content style={{ padding: '20px' }}>
         
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ flex: 1 }}
                  placeholder="Enter file title"
                />
                <Select value={decodedCategory} style={{ width: '200px' }} >
                  <Option value="NDA Documents">NDA Documents</Option>
                  <Option value="IP Agreements">IP Agreements</Option>
                  <Option value="Executive Documents">Executive Documents</Option>
                  <Option value="Legal Documents">Legal Documents</Option>
                </Select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', }}>
              
              {file?.location && <PdfViewer fileUrl={file.location} height={'60vh'} width={'100%'}/>}

         
            </div>
          
            </div>
          </Content>
          
    </GeneralLayout>
  );
};

export default EditDocument;
