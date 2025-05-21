import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Menu, MenuProps, message } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';

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
    console.log(fileType)
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

  // Handle navigation to edit, send, or upload file
  const handleEdit = (fileId: string, category: string): void => {
    console.log(`Navigating to view: /viewdocument/${category}/${fileId}`);
    const cleanCategory = category.replace(/\s+/g, '');
    navigate(`/editDocuments/${cleanCategory}/${fileId}`);
  };

  const handleUpload = (): void => {
    navigate('/uploadDocuments');
  };

  const handleSendFile = () => {
    if (selectedFile) {
      const category = selectedFile.documentType.replace(/\s+/g, ''); // remove all spaces
      navigate(`/sendfile/${category}/${selectedFile.documentId}`);
    } else {
      messageApi.info('select a file to send');
    }
  };

  function handleView(id: string, category: string): void {
    const formattedCategory = category.replace(/\s+/g, ''); // remove all spaces
    navigate(`/viewdocument/${formattedCategory}/${id}`);
  }

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
        setDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc.documentId !== fileId)
        );
        messageApi.success('Document deleted successfully');
        console.log(`Document with ID ${fileId} deleted successfully.`);
      } else {
        messageApi.error('Failed to delete document. Ask admin for help');
        console.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const menu = (file: File, category: string): MenuProps => {
    return {
      items: [
        {
          key: 'view',
          label: 'View',
          onClick: () => handleView(file.documentId, category),
        },
        {
          key: 'edit',
          label: 'Edit',
          onClick: () => handleEdit(file.documentId, category),
        },
        {
          key: 'delete',
          label: 'Delete',
          onClick: () => handleDeleteFile(file.documentId),
        },
      ],
    };
  };

  const handleDocumentClick = (file: File) => {
    // Select the document when clicked
    setSelectedFile(file);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
        }}
      >
        {contextHolder}
        <h2 style={{ color: '00004C' }}>List of Documents:</h2>
        <div>
          <Button
            type="primary"
            style={{ marginRight: '10px' }}
            onClick={handleUpload}
          >
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
              style={{
                border: '2px solid #151349',
                borderRadius: '10px',
                padding: '10px',
                height: '200px',
                overflowY: 'auto',
                backgroundColor: 'white',
              }}
            >
              {files.map((file: File) => (
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
                      selectedFile?.documentId === file.documentId
                        ? '#ddd'
                        : 'white',
                  }}
                  onClick={() => handleDocumentClick(file)} // Select document on click
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
                    }} // Prevent click event from propagating to document selection
                  >
                    <MoreOutlined
                      style={{ fontSize: '20px', cursor: 'pointer' }}
                    />
                  </Dropdown>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NDA;
