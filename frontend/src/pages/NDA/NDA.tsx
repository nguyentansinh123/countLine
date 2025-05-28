import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Menu, MenuProps, message, Typography, Alert } from 'antd';
import { MoreOutlined, FileTextOutlined, UploadOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const scrollBarStyles = `
  /* Firefox */
  .scroll-container {
    scrollbar-width: thin;
    scrollbar-color: #003eb3 #f1f1f1;
  }
  /* WebKit */
  .scroll-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 6px;
  }
  .scroll-container::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #003eb3 0%, #002a80 100%);
    border-radius: 6px;
    border: 1px solid #f1f1f1;
  }
  .scroll-container::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #002a80 0%, #001d5c 100%);
  }

  /* Smaller Cool Button Styles */
  .cool-btn {
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-right: 8px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .cool-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .upload-btn {
    background: #003eb3;
    color: white;
    border: 2px solid #003eb3;
  }

  .upload-btn:hover {
    background: transparent;
    color: #003eb3;
  }

  .send-btn {
    background: #52c41a;
    color: white;
    border: 2px solid #52c41a;
  }

  .send-btn:hover {
    background: transparent;
    color: #52c41a;
  }

  .send-btn-disabled {
    background: #f0f0f0;
    color: #999;
    border: 2px solid #f0f0f0;
    cursor: not-allowed;
  }

  .send-btn-disabled:hover {
    background: #f0f0f0;
    color: #999;
    transform: none;
    box-shadow: none;
  }

  .btn-icon {
    font-size: 14px;
    transition: transform 0.3s ease;
  }

  .cool-btn:hover .btn-icon {
    transform: scale(1.1);
  }

  .button-container {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .document-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #e8e8e8;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #262626;
  }

  .document-item:last-child {
    border-bottom: none;
  }

  .document-item:hover {
    background: linear-gradient(135deg, #e6f1ff 0%, #d4edff 100%);
    color: #003eb3;
    transform: translateX(3px);
  }

  .document-item.selected {
    background: linear-gradient(135deg, #d4edff 0%, #91d5ff 100%);
    color: #003eb3;
    font-weight: 700;
    border-left: 4px solid #003eb3;
  }

  .category-header {
    background: linear-gradient(135deg, #003eb3 0%, #002a80 100%);
    color: white;
    padding: 12px 16px;
    margin: 0 0 0 0;
    border-radius: 10px 10px 0 0;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .document-container {
    border: 2px solid #003eb3;
    border-radius: 10px;
    overflow: hidden;
    overflow-x: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 62, 179, 0.15);
  }

  .action-button:hover {
    color: #003eb3;
    transform: scale(1.1);
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
          <Title level={2} style={{ color: '#000000' }}>
            List of Documents:
          </Title>
          <div className="button-container">
            <button 
              className="cool-btn upload-btn"
              onClick={handleUpload}
            >
              <UploadOutlined className="btn-icon" />
              Upload File
            </button>
            
            <button 
              className={`cool-btn ${selectedFile ? 'send-btn' : 'send-btn-disabled'}`}
              onClick={handleSendFile}
              disabled={!selectedFile}
            >
              <SendOutlined className="btn-icon" />
              Send File
            </button>
          </div>
        </div>

        {/* Selected File Indicator */}
        {selectedFile && (
          <div 
            style={{
              background: 'linear-gradient(135deg, #d4edff 0%, #91d5ff 100%)',
              border: '2px solid #69c0ff',
              borderRadius: '8px',
              padding: '12px 16px',
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <FileTextOutlined style={{ color: '#003eb3', fontSize: '18px' }} />
            <div>
              <div style={{ fontWeight: 600, color: '#003eb3' }}>
                Selected: {selectedFile.filename}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {selectedFile.documentType} • Ready to send
              </div>
            </div>
          </div>
        )}

        {/* Document Boxes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {Object.entries(documentCategories).map(([category, files], index) => (
            <div 
              key={category} 
              className="document-container"
            >
              <h3 className="category-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileTextOutlined />
                  {category}
                </span>
                <span 
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {files.length}
                </span>
              </h3>
              <div
                className="scroll-container"
                style={{
                  height: '250px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  backgroundColor: 'white',
                }}
              >
                {files.length === 0 ? (
                  <div style={{ 
                    padding: '40px 20px', 
                    textAlign: 'center',
                    color: '#999'
                  }}>
                    <FileTextOutlined style={{ 
                      fontSize: '48px', 
                      color: '#ddd',
                      marginBottom: '16px'
                    }} />
                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                      No documents found
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      Upload documents to see them here
                    </div>
                  </div>
                ) : (
                  files.map((file, fileIndex) => (
                    <div
                      key={file.documentId}
                      className={`document-item ${
                        selectedFile?.documentId === file.documentId ? 'selected' : ''
                      }`}
                      onClick={() => handleDocumentClick(file)}
                    >
                      <span style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginRight: '12px'
                      }}>
                        {file.filename}
                      </span>
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
                        <MoreOutlined 
                          className="action-button"
                          style={{ 
                            fontSize: '18px', 
                            cursor: 'pointer',
                            color: '#999',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                          }} 
                        />
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
