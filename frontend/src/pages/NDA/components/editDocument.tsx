import React, { useEffect, useState } from 'react';
import { Input, Select, Button, Alert, Layout } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import {
  EditOutlined,
  FileTextOutlined,
  SignatureOutlined,
  CalendarOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import PdfEditor from '../../../components/Editor/PdfEditor';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';
import PdfViewer from '../../../components/Editor/PdfViewer';

const { Option } = Select;
const { Sider, Content } = Layout;

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const EditDocument: React.FC = () => {
  const navigate = useNavigate();
  const { category, file_id } = useParams<{
    category: string;
    file_id: string;
  }>();
  const decodedCategory = decodeURIComponent(category || '');

  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load file list based on category
  const [file, setFile] = useState<any>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/document/document/${file_id}`,
          {
            credentials: 'include',
          }
        );
        const result = await res.json();
        if (res.ok && result.success) {
          setTitle(result.data.filename.replace(/\.[^/.]+$/, ''));
          setFile(result.data);
          setDocumentType(result.data.documentType); // assuming backend returns it
        } else {
          setError(result.message || 'Failed to load document');
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong');
      }
    };

    fetchDocument();
  }, [file_id]);
  console.log(file);

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const handleSave = async () => {
    if (!newFile) {
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', newFile);

    try {
      const res = await fetch(
        `http://localhost:5001/api/document/update/${file_id}`,
        {
          method: 'PUT',
          body: formData,
          credentials: 'include',
        }
      );

      const result = await res.json();
      if (res.ok && result.success) {
        alert('Document updated successfully');
        navigate('/non-disclosure-agreement'); // Or wherever you want to go
      } else {
        setError(result.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };
  return (
    <GeneralLayout title="Edit Document">
      <Content style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              gap: '10px',
            }}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ flex: 1 }}
              placeholder="Enter file title"
            />
            <Select
              value={documentType}
              style={{ width: '200px' }}
              onChange={setDocumentType}
            >
              <Option value="NDA Documents">NDA Documents</Option>
              <Option value="IP Agreements">IP Agreements</Option>
              <Option value="Executive Documents">Executive Documents</Option>
              <Option value="Legal Documents">Legal Documents</Option>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {file?.fileUrl && (
              <PdfViewer
                fileUrl={file.presignedUrl || file.fileUrl}
                height={'60vh'}
                width={'100%'}
              />
            )}

            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setNewFile(e.target.files[0]);
                }
              }}
            />
            <Button type="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Content>
    </GeneralLayout>
  );
};

export default EditDocument;
