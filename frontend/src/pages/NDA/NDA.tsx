import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Menu, MenuProps, message, Typography, Alert } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';

const { Title } = Typography;

// Add scrollbar CSS here
const scrollBarStyles = `
  /* Firefox */
  .scroll-container {
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }
  /* WebKit */
  .scroll-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .scroll-container::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
    border: 2px solid #f1f1f1;
  }
  .scroll-container::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;

const NDA: React.FC = () => {
  const navigate = useNavigate();

  interface File {
    documentId: string;
    filename: string;
    uploadedBy: string;
    uploadedAt: string;
    status: string;
    documentType: string;
    fileUrl: string;
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<
    'NDA' | 'I.P Agreement' | 'Executive Documents' | 'Legal Documents'
  >('NDA');

  const [messageApi, contextHolder] = message.useMessage();
  const [documents, setDocuments] = useState<File[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(
          'http://localhost:5001/api/document/my-documents',
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        const result = await response.json();
        if (result.success) {
          setDocuments(result.data);
        } else {
          messageApi.error('Failed to fetch documents');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        messageApi.error('Error fetching documents');
      }
    };
    fetchDocuments();
  }, []);

  const documentCategories = {
    'NDA Documents': documents.filter((doc) =>
      doc.documentType?.toLowerCase().includes('nda')
    ),
    'IP Agreements': documents.filter((doc) =>
      doc.documentType?.toLowerCase().includes('i.p')
    ),
    'Executive Documents': documents.filter((doc) =>
      doc.documentType?.toLowerCase().includes('executive')
    ),
    'Legal Documents': documents.filter((doc) =>
      doc.documentType?.toLowerCase().includes('legal')
    ),
  };

  const handleEdit = (fileId: string, category: string): void => {
    const cleanCategory = category.replace(/\s+/g, '');
    navigate(`/editDocuments/${cleanCategory}/${fileId}`);
  };

  const handleUpload = (): void => {
    navigate('/uploadDocuments');
  };

  const handleSendFile = () => {
    if (selectedFile) {
      const category = selectedFile.documentType.replace(/\s+/g, '');
      navigate(`/sendfile/${category}/${selectedFile.documentId}`);
    } else {
      messageApi.info('select a file to send');
    }
  };

  const handleView = (id: string, category: string): void => {
    const formattedCategory = category.replace(/\s+/g, '');
    navigate(`/viewdocument/${formattedCategory}/${id}`);
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/document/delete/${fileId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.documentId !== fileId));
        messageApi.success('Document deleted successfully');
      } else {
        messageApi.error('Failed to delete document. Ask admin for help');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const menu = (file: File, category: string): MenuProps => ({
    items: [
      { key: 'view', label: 'View', onClick: () => handleView(file.documentId, category) },
      { key: 'edit', label: 'Edit', onClick: () => handleEdit(file.documentId, category) },
      { key: 'delete', label: 'Delete', onClick: () => handleDeleteFile(file.documentId) },
    ],
  });

  const handleDocumentClick = (file: File) => {
    setSelectedFile(file);
  };

  return (
    <>
      {/* Inject scrollbar styles */}
      <style>{scrollBarStyles}</style>
      {contextHolder}
      <div style={{ padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
          }}
        >
          <Title level={2} style={{ color: '#00004C' }}>
            List of Documents:
          </Title>
          <div>
            <Button type="primary" style={{ marginRight: '10px' }} onClick={handleUpload}>
              Upload File
            </Button>
            <Button type="primary" onClick={handleSendFile}>
              Send File
            </Button>
          </div>
        </div>

        {/* Document Boxes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {Object.entries(documentCategories).map(([category, files]) => (
            <div key={category}>
              <h3>{category}</h3>
              <div
                className="scroll-container"
                style={{
                  border: '2px solid #151349',
                  borderRadius: '10px',
                  padding: '10px',
                  height: '200px',
                  overflowY: 'auto',
                  backgroundColor: 'white',
                }}
              >
                {files.length === 0 ? (
                  <Alert message="No documents" type="info" showIcon />
                ) : (
                  files.map((file) => (
                    <div
                      key={file.documentId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        borderBottom: '1px solid #ddd',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        backgroundColor:
                          selectedFile?.documentId === file.documentId ? '#ddd' : 'white',
                      }}
                      onClick={() => handleDocumentClick(file)}
                    >
                      {file.filename}
                      <Dropdown
                        menu={menu(file, category)}
                        trigger={['click']}
                        onOpenChange={(visible) => {
                          if (!visible) return;
                          document.addEventListener(
                            'click',
                            (e) => e.stopPropagation(),
                            { once: true }
                          );
                        }}
                      >
                        <MoreOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
                      </Dropdown>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NDA;
