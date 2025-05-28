import React, { useEffect, useState } from 'react';
import { Input, Select, Button, Alert, Layout, message, Typography, Tag, Card } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import {
  EditOutlined,
  FileTextOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import PdfEditor from '../../../components/Editor/PdfEditor';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';
import PdfViewer from '../../../components/Editor/PdfViewer';

const { Option } = Select;
const { Content } = Layout;
const { Title, Text } = Typography;

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const EditDocument: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { category, file_id } = useParams<{
    category: string;
    file_id: string;
  }>();
  const decodedCategory = decodeURIComponent(category || '');

  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<any>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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
          setNewFile(result.data);
          setDocumentType(result.data.documentType);
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

  const handleBack = () => {
    navigate('/non-disclosure-agreement');
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'nda documents':
        return '#003eb3';
      case 'ip agreements':
        return '#52c41a';
      case 'executive documents':
        return '#722ed1';
      case 'legal documents':
        return '#fa541c';
      default:
        return '#1677ff';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <GeneralLayout title="Edit Document" noBorder={true}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh' 
        }}>
          <Alert 
            message={error} 
            type="error" 
            style={{ 
              borderRadius: '8px',
              padding: '20px',
              fontSize: '16px'
            }}
          />
        </div>
      </GeneralLayout>
    );
  }

  const handleSave = async () => {
    if (!newFile) {
      messageApi.error('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();

    formData.append('filename', title);
    formData.append('documentType', documentType);

    if (newFile instanceof File) {
      formData.append('file', newFile);
    }

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
        messageApi.success('Document updated successfully');
        setTimeout(() => {
          navigate('/non-disclosure-agreement');
        }, 1000);
      } else {
        setError(result.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralLayout title="Edit Document" noBorder={true}>
      {contextHolder}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '20px',
        height: '100%',
        background: '#f8f9fa'
      }}>
        {file && (
          <>
            {/* Header Section */}
            <Card
              style={{
                width: '100%',
                maxWidth: '1200px',
                marginBottom: '24px',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBack}
                  style={{
                    marginRight: '16px',
                    color: '#666',
                    fontSize: '16px',
                    padding: '8px'
                  }}
                >
                  Back
                </Button>
                <Title level={3} style={{ margin: 0, color: '#262626' }}>
                  <EditOutlined style={{ marginRight: '12px', color: '#003eb3' }} />
                  Edit Document
                </Title>
              </div>

              {/* Edit Form */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr auto',
                gap: '16px',
                alignItems: 'end',
                marginBottom: '20px'
              }}>
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'block' }}>
                    Document Name
                  </Text>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document name"
                    style={{
                      background: '#fff',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                    prefix={<FileTextOutlined style={{ color: '#003eb3' }} />}
                  />
                </div>

                <div>
                  <Text strong style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'block' }}>
                    Category
                  </Text>
                  <Select
                    value={documentType}
                    onChange={setDocumentType}
                    style={{ 
                      width: '100%',
                      height: '40px'
                    }}
                  >
                    <Option value="NDA">NDA Document</Option>
                    <Option value="I.P Agreement">IP Agreements</Option>
                    <Option value="Executive Document">Executive Documents</Option>
                    <Option value="Legal Document">Legal Documents</Option>
                  </Select>
                </div>

                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={isLoading}
                  style={{
                    background: '#003eb3',
                    borderColor: '#003eb3',
                    borderRadius: '6px',
                    height: '40px',
                    fontWeight: 600,
                    paddingLeft: '20px',
                    paddingRight: '20px'
                  }}
                >
                  Save Changes
                </Button>
              </div>

              {/* File Upload Section */}
              <div style={{
                background: '#f8f9fa',
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <UploadOutlined style={{ fontSize: '24px', color: '#666', marginBottom: '8px' }} />
                <div style={{ marginBottom: '12px' }}>
                  <Text strong style={{ color: '#262626' }}>
                    Upload New Version
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
                  </Text>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setNewFile(e.target.files[0]);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: '#fff'
                  }}
                />
                {newFile && newFile instanceof File && (
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="green" style={{ borderRadius: '12px' }}>
                      New file selected: {newFile.name}
                    </Tag>
                  </div>
                )}
              </div>

              {/* Document Metadata */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                background: '#fff',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '12px',
                border: '1px solid #e9ecef'
              }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    Current Category
                  </Text>
                  <div style={{ marginTop: '4px' }}>
                    <Tag 
                      color={getCategoryColor(documentType)} 
                      style={{ fontSize: '10px', borderRadius: '8px' }}
                    >
                      {documentType}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    Uploaded By
                  </Text>
                  <div style={{ fontWeight: 500, color: '#262626', marginTop: '2px' }}>
                    {file.uploadedBy || 'Unknown'}
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    Last Modified
                  </Text>
                  <div style={{ fontWeight: 500, color: '#262626', marginTop: '2px' }}>
                    {formatDate(file.uploadedAt)}
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    Document ID
                  </Text>
                  <div style={{ fontWeight: 500, color: '#262626', marginTop: '2px', fontFamily: 'monospace' }}>
                    {file.documentId?.slice(-8) || 'N/A'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Document Preview */}
            <div style={{
              width: '100%',
              maxWidth: '1200px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #003eb3 0%, #002a80 100%)',
                padding: '12px 20px',
                color: 'white'
              }}>
                <Text strong style={{ color: 'white', fontSize: '14px' }}>
                  <EyeOutlined style={{ marginRight: '8px' }} />
                  Current Document Preview
                </Text>
              </div>
              
              <div style={{ 
                background: '#fff',
                height: '65vh',
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '20px'
              }}>
                {file?.fileUrl && (
                  <PdfViewer
                    fileUrl={file.presignedUrl || file.fileUrl}
                    height={'60vh'}
                    width={'800px'}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* Loading State */}
        {!file && !error && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            color: '#999'
          }}>
            <EditOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
            <Title level={4} style={{ color: '#999', margin: 0 }}>Loading document...</Title>
            <Text type="secondary">Please wait while we fetch your document.</Text>
          </div>
        )}
      </div>
    </GeneralLayout>
  );
};

export default EditDocument;
