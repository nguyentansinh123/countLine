import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Divider,
  message,
  Alert
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
  ShareAltOutlined,
  LeftOutlined,
  RightOutlined,
  FileExclamationOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

dayjs.extend(relativeTime);
const { Title, Text, Paragraph } = Typography;

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;



function SharedDocumentsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [viewDocument, setViewDocument] = useState<any>(null);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [documentError, setDocumentError] = useState<boolean>(false);
  const [refreshingUrl, setRefreshingUrl] = useState<boolean>(false);

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5001/api/document/shared-with-me', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setDocuments(response.data.data || []);
      } else {
        setError('Failed to load shared documents');
        message.error('Failed to load shared documents');
      }
    } catch (err) {
      console.error('Error fetching shared documents:', err);
      setError('Error loading shared documents');
      message.error('Error loading shared documents');
    } finally {
      setLoading(false);
    }
  };

  const refreshPresignedUrl = async (documentId: string) => {
    try {
      setRefreshingUrl(true);
      
      console.log(`Refreshing URL for document: ${documentId}`);
      
      const response = await axios.get(`http://localhost:5001/api/document/presigned-url/${documentId}`, {
        withCredentials: true
      });
      
      console.log('Presigned URL response:', response.data);
      
      if (response.data.success) {
        message.success('Document link refreshed');
        setDocumentError(false);
        return response.data.presignedUrl;
      }
      
      message.warning('Could not refresh document link');
      return null;
    } catch (error) {
      console.error('Error refreshing URL:', error);
      message.error('Could not access document. You may not have permission.');
      return null;
    } finally {
      setRefreshingUrl(false);
    }
  };

  const handleViewDocument = async (document: any) => {
    console.log('Opening document directly:', document);
    setLoading(true);
    
    try {
      const freshUrl = await refreshPresignedUrl(document.documentId);
      
      if (freshUrl) {
        window.open(freshUrl, '_blank');
        message.success('Opening document in new tab');
      } else if (document.presignedUrl) {
        window.open(document.presignedUrl, '_blank');
        message.info('Opening document with existing link');
      } else {
        message.error('Unable to get document URL');
      }
    } catch (error) {
      console.error('Error preparing document view:', error);
      message.error('Error opening document');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshView = async () => {
    if (!viewDocument) return;
    
    setLoading(true);
    const freshUrl = await refreshPresignedUrl(viewDocument.documentId);
    
    if (freshUrl) {
      setViewDocument((prev:any) => ({
        ...prev,
        presignedUrl: freshUrl
      }));
      setDocumentError(false);
    } else {
      setDocumentError(true);
    }
    setLoading(false);
  };

  const handleInfoClick = (document: any) => {
    setSelectedDocument(document);
    setInfoModalVisible(true);
  };

  const handleViewSpecificRevision = async (revision: any, parentDoc: any) => {
    const viewObj = {
      ...parentDoc,
      currentRevision: revision,
      presignedUrl: revision.presignedUrl || revision.fileUrl
    };
    
    setViewDocument(viewObj);
    setViewModalVisible(true);
    setDocumentError(false);
    setLoading(true);
    
    try {
      // Try to get a fresh URL for the revision
      if (!revision.presignedUrl) {
        const freshUrl = await refreshPresignedUrl(parentDoc.documentId);
        if (freshUrl) {
          setViewDocument((prev:any) => ({
            ...prev,
            presignedUrl: freshUrl
          }));
        } else {
          setDocumentError(true);
        }
      }
    } catch (error) {
      console.error('Error refreshing revision URL:', error);
      setDocumentError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignDocument = async (documentId: string) => {
    try {
      const response = await axios.post(`http://localhost:5001/api/document/sign/${documentId}`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        message.success('Document signed successfully');
        fetchSharedDocuments(); 
      } else {
        message.error(response.data.message || 'Failed to sign document');
      }
    } catch (error) {
      console.error('Error signing document:', error);
      message.error('Error signing document');
    }
  };

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`http://localhost:5001/api/document/download/${documentId}`, {
        withCredentials: true,
        responseType: 'blob' 
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename || `document-${documentId}.pdf`; 
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('Document download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      message.error('Failed to download document');
    } finally {
      setLoading(false);
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

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

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
              loading={loading && viewDocument?.documentId === record.documentId} 
            />
          </Tooltip>
          
          <Tooltip title="Download">
            <Button 
              shape="circle" 
              icon={<DownloadOutlined />} 
              onClick={(e) => {
                e.stopPropagation(); 
                handleDownloadDocument(record.documentId, record.filename);
              }} 
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
            <span>
              Document Preview
              {viewDocument?.currentRevision && (
                <Tag color="blue" style={{ marginLeft: '8px' }}>
                  Version {viewDocument.currentRevision.version || '1.0'}
                </Tag>
              )}
            </span>
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setPageNumber(1);
          setNumPages(null);
          setDocumentError(false);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setPageNumber(1);
            setNumPages(null);
            setDocumentError(false);
          }}>
            Close
          </Button>,
          numPages && numPages > 1 ? (
            <div key="pagination" style={{ display: 'inline-flex', alignItems: 'center', marginRight: 16 }}>
              <Button 
                icon={<LeftOutlined />} 
                disabled={pageNumber <= 1}
                onClick={previousPage}
                size="small"
              />
              <Text style={{ margin: '0 8px' }}>
                Page {pageNumber} of {numPages}
              </Text>
              <Button 
                icon={<RightOutlined />} 
                disabled={pageNumber >= numPages}
                onClick={nextPage}
                size="small"
              />
            </div>
          ) : null,
          <Button 
            key="refresh"
            onClick={handleRefreshView}
            icon={<ReloadOutlined />}
            loading={refreshingUrl}
          >
            Refresh
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => viewDocument && handleDownloadDocument(viewDocument.documentId, viewDocument.filename)}
            loading={loading}
          >
            Download
          </Button>
        ]}
        width={900}
      >
        {viewDocument && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Document Name:</Text> {viewDocument.filename}
              {viewDocument.currentRevision && (
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary">
                    Created {dayjs(viewDocument.currentRevision.createdAt || viewDocument.createdAt).format('MMM D, YYYY')}
                    {viewDocument.currentRevision.createdBy && ` by ${viewDocument.currentRevision.createdBy}`}
                  </Text>
                </div>
              )}
            </div>
            
            <div style={{ 
              background: '#f5f5f5', 
              padding: '20px', 
              textAlign: 'center', 
              minHeight: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {loading ? (
                <div>
                  <Spin size="large" />
                  <Text style={{ display: 'block', marginTop: '16px' }}>Loading document...</Text>
                </div>
              ) : viewDocument.presignedUrl ? (
                viewDocument.documentType?.toLowerCase().includes('pdf') ? (
                  <div style={{ width: '100%', height: '600px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {/* Direct iframe embedding */}
                    <iframe 
                      src={viewDocument.presignedUrl}
                      style={{ 
                        width: '100%', 
                        height: '450px', 
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                      }}
                      title="PDF Preview"
                    />
                    
                    {/* Keep your existing controls */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: '10px',
                      padding: '10px',
                      marginTop: '15px',
                      background: '#f0f0f0',
                      borderRadius: '4px'
                    }}>
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
                        onClick={() => window.open(viewDocument.presignedUrl, '_blank')}
                      >
                        Open in New Tab
                      </Button>
                      <Button 
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadDocument(viewDocument.documentId, viewDocument.filename)}
                      >
                        Download PDF
                      </Button>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefreshView}
                        loading={refreshingUrl}
                      >
                        Refresh Link
                      </Button>
                    </div>
                  </div>
                ) : viewDocument.documentType?.toLowerCase().includes('image') ? (
                  <img 
                    src={viewDocument.presignedUrl} 
                    alt={viewDocument.filename}
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                    onError={() => setDocumentError(true)}
                  />
                ) : documentError ? (
                  <div>
                    <FileExclamationOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
                    <Text>This document type cannot be previewed directly.</Text>
                    <Text type="secondary" style={{ display: 'block', margin: '8px 0 16px' }}>
                      Please download the file to view it in its native application.
                    </Text>
                    <Space>
                      <Button 
                        type="primary"
                        onClick={() => window.open(viewDocument.presignedUrl, '_blank')}
                      >
                        Open in new tab
                      </Button>
                      <Button
                        onClick={handleRefreshView}
                        icon={<ReloadOutlined />}
                        loading={refreshingUrl}
                      >
                        Refresh Link
                      </Button>
                    </Space>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>
                      {getDocumentIcon(viewDocument.documentType)}
                    </div>
                    <Text>Trying to load preview...</Text>
                    <Text type="secondary" style={{ display: 'block', margin: '8px 0 16px' }}>
                      If the preview doesn't load, this file type may not be supported for in-browser viewing.
                    </Text>
                    <iframe 
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewDocument.presignedUrl)}`}
                      style={{ width: '100%', height: '500px', border: 'none' }}
                      onLoad={() => setDocumentError(false)}
                      onError={() => setDocumentError(true)}
                    />
                  </div>
                )
              ) : documentError ? (
                <div>
                  <FileExclamationOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
                  <Text>Could not load document preview.</Text>
                  <Text type="secondary" style={{ display: 'block', margin: '8px 0 16px' }}>
                    The document URL might have expired or you don't have access.
                  </Text>
                  <Button 
                    type="primary"
                    onClick={handleRefreshView}
                    icon={<ReloadOutlined />}
                    loading={refreshingUrl}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '64px', marginBottom: '24px' }}>
                    {getDocumentIcon(viewDocument.documentType)}
                  </div>
                  <Text>Document preview is not available.</Text>
                  <Text type="secondary">Click Download to view the actual file.</Text>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
      
      {/* Document Info Modal - Unchanged */}
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