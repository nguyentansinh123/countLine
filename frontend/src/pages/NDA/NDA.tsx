import React, { useState } from 'react';
import { Button, Dropdown, Menu, message } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ndaDocuments from './const/ndaDocuments';
import legalDocuments from './const/legalDocuments';
import executiveDocumentTemplates from './const/executiveDocuments';
import ipAgreements from './const/ipDocuments';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';

const NDA: React.FC = () => {
  const navigate = useNavigate();

  interface File {
    id: string;
    title: string;
    uploadedBy: string;
    uploadedAt: string;
    status: string;
    fileType: string;
    location: string;
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<
    'NDA' | 'IP Agreement' | 'Executive Documents' | 'Legal Documents'
  >('NDA');

  const [messageApi, contextHolder] = message.useMessage();

  const documentCategories = {
    'NDA Documents': ndaDocuments,
    'IP Agreements': ipAgreements,
    'Executive Documents': executiveDocumentTemplates,
    'Legal Documents': legalDocuments,
  };

  // Handle navigation to edit, send, or upload file
  const handleEdit = (fileId: string, category: string): void => {
    console.log(`Navigating to view: /viewdocument/${category}/${fileId}`);
    navigate(`/editDocuments/${category}/${fileId}`);
  };

  const handleUpload = (): void => {
    navigate('/uploadDocuments');
  };

  const getCategoryFromFileId = (fileId: string) => {
    if (ndaDocuments.some((doc) => doc.id === fileId)) {
      return 'NDA';
    } else if (ipAgreements.some((doc) => doc.id === fileId)) {
      return 'IP';
    } else if (executiveDocumentTemplates.some((doc) => doc.id === fileId)) {
      return 'Executive Document';
    } else if (legalDocuments.some((doc) => doc.id === fileId)) {
      return 'Legal Document';
    } else {
      return 'Unknown Category'; // If no match found
    }
  };

  const handleSendFile = () => {
    if (selectedFile) {
      const category = getCategoryFromFileId(selectedFile.id);
      console.log (category);
      navigate(`/sendfile/${category}/${selectedFile.id}`);
    }else{
      messageApi.info('select a file to send');
    }
  };

  function handleView(id: string, category: string): void {
    console.log(`Navigating to view: /viewdocument/${category}/${id}`);
    navigate(`/viewdocument/${category}/${id}`)
  }
  
  
  
  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/documents/${fileId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Handle file removal from state (you'd want to update the list here)
        console.log(`Document with ID ${fileId} deleted successfully.`);
      } else {
        console.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const menu = (file: File, category: string) => (
    <Menu>
      <Menu.Item key="view" onClick={() => handleView(file.id, category)}>
        View
      </Menu.Item>
      <Menu.Item key="edit" onClick={() => handleEdit(file.id, category)}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleDeleteFile(file.id)}>
        Delete
      </Menu.Item>
    </Menu>
  );

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
                  key={file.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    borderBottom: '1px solid #ddd',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backgroundColor: selectedFile?.id === file.id ? '#ddd' : 'white',
                  }}
                  onClick={() => handleDocumentClick(file)} // Select document on click
                >
                  {file.title}
                  <Dropdown
                    overlay={menu(file, category)}
                    trigger={['click']}
                    onVisibleChange={(visible) => {
                      if (!visible) return;
                      document.addEventListener('click', (e) => e.stopPropagation(), { once: true });
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
