import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Typography, 
  Empty, 
  Tooltip,
  Modal,
  Spin,
  Avatar,
  Divider
} from 'antd';
import { 
  DownloadOutlined, 
  EyeOutlined, 
  FileTextOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  SignatureOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
const { Title, Text, Paragraph } = Typography;

const mockDocuments = [
  {
    documentId: '1',
    filename: 'Project_Proposal.pdf',
    documentType: 'PDF Document',
    fileSize: '2.5 MB',
    sharedBy: 'John Smith',
    sharedByAvatar: null,
    sharedAt: dayjs().subtract(2, 'day').toISOString(),
    signingStatus: 'pending',
    signaturesRequired: ['current-user-id'],
    signedBy: [],
    userId: 'current-user-id',
    description: 'Final project proposal for client approval',
    presignedUrl: 'https://example.com/sample.pdf'
  },
  {
    documentId: '2',
    filename: 'Financial_Report_2024.xlsx',
    documentType: 'Excel Spreadsheet',
    fileSize: '1.8 MB',
    sharedBy: 'Jane Wilson',
    sharedByAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    sharedAt: dayjs().subtract(1, 'week').toISOString(),
    signingStatus: 'completed',
    signaturesRequired: ['current-user-id'],
    signedBy: ['current-user-id'],
    userId: 'current-user-id',
    description: 'Q2 financial report with projections',
    presignedUrl: 'https://example.com/sample.xlsx'
  },
  {
    documentId: '3',
    filename: 'Team_Photo.jpg',
    documentType: 'Image',
    fileSize: '3.2 MB',
    sharedBy: 'Michael Brown',
    sharedByAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    sharedAt: dayjs().subtract(3, 'hour').toISOString(),
    signingStatus: 'not_required',
    signaturesRequired: [],
    signedBy: [],
    userId: 'current-user-id',
    description: 'Company retreat team photo',
    presignedUrl: 'https://example.com/sample.jpg'
  },
  {
    documentId: '4',
    filename: 'Contract_Agreement.docx',
    documentType: 'Word Document',
    fileSize: '1.1 MB',
    sharedBy: 'Sarah Davis',
    sharedByAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    sharedAt: dayjs().subtract(5, 'day').toISOString(),
    signingStatus: 'pending',
    signaturesRequired: ['current-user-id', 'other-user-id'],
    signedBy: [],
    userId: 'current-user-id',
    description: 'Legal contract for new partnership agreement',
    presignedUrl: 'https://example.com/sample.docx'
  },
  {
    documentId: '5',
    filename: 'Marketing_Presentation.pptx',
    documentType: 'Presentation',
    fileSize: '5.7 MB',
    sharedBy: 'Robert Johnson',
    sharedByAvatar: null,
    sharedAt: dayjs().subtract(12, 'hour').toISOString(),
    signingStatus: 'not_required',
    signaturesRequired: [],
    signedBy: [],
    userId: 'current-user-id',
    description: 'Q3 marketing strategy presentation',
    presignedUrl: 'https://example.com/sample.pptx'
  }
];

function SharedDocumentsPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [documents, setDocuments] = useState<any[]>(mockDocuments);
  const [viewDocument, setViewDocument] = useState<any>(null);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const handleViewDocument = (document: any) => {
    setViewDocument(document);
    setViewModalVisible(true);
  };

  const handleInfoClick = (document: any) => {
    setSelectedDocument(document);
    setInfoModalVisible(true);
  };

  const handleSignDocument = (documentId: string) => {
    const updatedDocs = documents.map(doc => {
      if (doc.documentId === documentId) {
        return {
          ...doc,
          signingStatus: 'completed',
          signedBy: [...(doc.signedBy || []), 'current-user-id']
        };
      }
      return doc;
    });
    
    setDocuments(updatedDocs);
    
    if (selectedDocument?.documentId === documentId) {
      setSelectedDocument({
        ...selectedDocument,
        signingStatus: 'completed',
        signedBy: [...(selectedDocument.signedBy || []), 'current-user-id']
      });
    }
  };

  const getDocumentIcon = (documentType: string) => {
    switch(documentType?.toLowerCase()) {
      case 'pdf document':
        return <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />;
      case 'excel spreadsheet':
        return <FileExcelOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
      case 'word document':
        return <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
      case 'image':
        return <FileImageOutlined style={{ fontSize: '24px', color: '#722ed1' }} />;
      default:
        return <FileUnknownOutlined style={{ fontSize: '24px', color: '#faad14' }} />;
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (text: string) => getDocumentIcon(text)
    },
    {
      title: 'Document Name',
      dataIndex: 'filename',
      key: 'filename',
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ cursor: 'pointer' }} onClick={() => handleViewDocument(record)}>
            {text}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.fileSize}</Text>
        </Space>
      )
    },
    {
      title: 'Shared By',
      dataIndex: 'sharedBy',
      key: 'sharedBy',
      render: (text: string, record: any) => (
        <Space>
          <Avatar 
            src={record.sharedByAvatar} 
            icon={!record.sharedByAvatar && <UserOutlined />} 
            size="small" 
          />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Shared Date',
      dataIndex: 'sharedAt',
      key: 'sharedAt',
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text>{dayjs(date).fromNow()}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'signingStatus',
      render: (status: string, record: any) => {
        let color = 'default';
        let text = 'Unknown';
        
        if (status === 'pending' && record.signaturesRequired?.includes(record.userId)) {
          color = 'orange';
          text = 'Signature Required';
        } else if (status === 'pending') {
          color = 'blue';
          text = 'Pending Signatures';
        } else if (status === 'completed') {
          color = 'green';
          text = 'Completed';
        } else if (status === 'not_required') {
          color = 'default';
          text = 'No Signature Required';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => (
        <Space size="middle">
          <Tooltip title="View Document">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDocument(record)} 
            />
          </Tooltip>
          
          <Tooltip title="Download">
            <Button 
              shape="circle" 
              icon={<DownloadOutlined />} 
              onClick={() => window.open(record.presignedUrl, '_blank')} 
            />
          </Tooltip>
          
          <Tooltip title="Document Info">
            <Button 
              shape="circle" 
              icon={<InfoCircleOutlined />} 
              onClick={() => handleInfoClick(record)} 
            />
          </Tooltip>
          
          {record.signingStatus === 'pending' && 
           record.signaturesRequired?.includes(record.userId) && 
           !record.signedBy?.includes(record.userId) && (
            <Tooltip title="Sign Document">
              <Button 
                type="primary" 
                shape="circle" 
                icon={<SignatureOutlined />} 
                onClick={() => handleSignDocument(record.documentId)} 
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        bordered={false}
        style={{
          boxShadow: '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)',
          borderRadius: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <ShareAltOutlined style={{ fontSize: '24px', marginRight: '16px', color: '#1890ff' }} />
          <div>
            <Title level={3} style={{ margin: 0 }}>Documents Shared With Me</Title>
            <Text type="secondary">
              View and manage documents that others have shared with you
            </Text>
          </div>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : documents.length > 0 ? (
          <Table 
            dataSource={documents} 
            columns={columns} 
            rowKey="documentId"
            pagination={{ pageSize: 5 }}
            style={{ marginTop: '16px' }}
          />
        ) : (
          <Empty 
            description="No documents have been shared with you yet" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        )}
      </Card>
      
      <Modal
        title={
          <Space>
            {viewDocument && getDocumentIcon(viewDocument.documentType)}
            <span>Document Preview</span>
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => viewDocument && window.open(viewDocument.presignedUrl, '_blank')}
          >
            Download
          </Button>
        ]}
        width={800}
      >
        {viewDocument && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Document Name:</Text> {viewDocument.filename}
            </div>
            
            <div style={{ 
              background: '#f5f5f5', 
              padding: '20px', 
              textAlign: 'center', 
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>
                {getDocumentIcon(viewDocument.documentType)}
              </div>
              <Text>Document preview would appear here in the actual implementation.</Text>
              <Text type="secondary">Click Download to view the actual file.</Text>
            </div>
          </div>
        )}
      </Modal>
      
      <Modal
        title="Document Information"
        open={infoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setInfoModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedDocument && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '40px', marginRight: '16px' }}>
                {getDocumentIcon(selectedDocument.documentType)}
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>{selectedDocument.filename}</Title>
                <Text type="secondary">{selectedDocument.documentType} • {selectedDocument.fileSize}</Text>
              </div>
            </div>
            
            <Divider />
            
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Description:</Text>
              <Paragraph>{selectedDocument.description || 'No description provided.'}</Paragraph>
            </div>
            
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ marginRight: '8px' }} />
              <Text strong style={{ marginRight: '8px' }}>Shared by:</Text>
              <Space>
                <Avatar 
                  src={selectedDocument.sharedByAvatar} 
                  icon={!selectedDocument.sharedByAvatar && <UserOutlined />} 
                  size="small" 
                />
                <Text>{selectedDocument.sharedBy}</Text>
              </Space>
            </div>
            
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <ClockCircleOutlined style={{ marginRight: '8px' }} />
              <Text strong style={{ marginRight: '8px' }}>Shared:</Text>
              <Text>{dayjs(selectedDocument.sharedAt).format('MMMM D, YYYY [at] h:mm A')}</Text>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ marginRight: '8px' }}>Status:</Text>
              {selectedDocument.signingStatus === 'pending' && 
               selectedDocument.signaturesRequired?.includes(selectedDocument.userId) ? (
                <Tag color="orange">Your signature is required</Tag>
              ) : selectedDocument.signingStatus === 'pending' ? (
                <Tag color="blue">Waiting for signatures</Tag>
              ) : selectedDocument.signingStatus === 'completed' ? (
                <Tag color="green">All signatures completed</Tag>
              ) : (
                <Tag>No signatures required</Tag>
              )}
            </div>
            
            {(selectedDocument.signingStatus === 'pending' && 
             selectedDocument.signaturesRequired?.includes(selectedDocument.userId) && 
             !selectedDocument.signedBy?.includes(selectedDocument.userId)) && (
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Button 
                  type="primary" 
                  icon={<SignatureOutlined />} 
                  onClick={() => {
                    handleSignDocument(selectedDocument.documentId);
                    setInfoModalVisible(false);
                  }}
                  size="large"
                >
                  Sign this document
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SharedDocumentsPage;