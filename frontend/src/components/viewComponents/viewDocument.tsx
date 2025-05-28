import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Select, Button, Typography, Tag } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined, DownloadOutlined, ZoomInOutlined, ZoomOutOutlined, ExpandOutlined } from '@ant-design/icons';
import GeneralLayout from '../General_Layout/GeneralLayout';
import PdfViewer from '../Editor/PdfViewer';

const { Title, Text } = Typography;

const scrollBarStyles = `
  /* Firefox */
  .pdf-viewer-container {
    scrollbar-width: thin;
    scrollbar-color: #003eb3 #f0f0f0;
  }
  
  /* WebKit (Chrome, Safari, Edge) */
  .pdf-viewer-container::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  .pdf-viewer-container::-webkit-scrollbar-track {
    // background: #f1f1f1;
    border-radius: 10px;
    margin: 5px;
  }
  
  .pdf-viewer-container::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #003eb3 0%, #002a80 100%);
    border-radius: 10px;
    border: 2px solid #f1f1f1;
    transition: all 0.3s ease;
  }
  
  .pdf-viewer-container::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #002a80 0%, #001d5c 100%);
    transform: scale(1.1);
  }
  
  .pdf-viewer-container::-webkit-scrollbar-corner {
    background: #f1f1f1;
  }
  
  /* Fullscreen scrollbar */
  .pdf-viewer-fullscreen::-webkit-scrollbar {
    width: 14px;
    height: 14px;
  }
  
  .pdf-viewer-fullscreen::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #003eb3 0%, #002a80 100%);
    border-radius: 12px;
    border: 3px solid rgba(255, 255, 255, 0.2);
  }
  
  .pdf-viewer-fullscreen::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 12px;
  }
`;

const ViewDocument: React.FC = () => {
  const navigate = useNavigate();
  const { category, file_id } = useParams<{
    category: string;
    file_id: string;
  }>();

  const decodedCategory = decodeURIComponent(category || '');
  const [file, setFile] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/document/document/${file_id}`,
          {
            credentials: 'include',
          }
        );
        const result = await response.json();
        if (response.ok && result.success) {
          setFile(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch document:', error);
      }
    };

    fetchDocument();
  }, [file_id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    if (file?.presignedUrl || file?.fileUrl) {
      const link = document.createElement('a');
      link.href = file.presignedUrl || file.fileUrl;
      link.download = file.filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'nda':
      case 'ndadocuments':
        return '#003eb3';
      case 'ipagreements':
        return '#52c41a';
      case 'executivedocuments':
        return '#722ed1';
      case 'legaldocuments':
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

  return (
    <>
      {/* Inject scrollbar styles */}
      <style>{scrollBarStyles}</style>
      
      <GeneralLayout title="Document Viewer" noBorder={true}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          padding: isFullscreen ? '10px' : '20px',
          height: '100%',
          background: '#f8f9fa'
        }}>
          {file && (
            <>
              {/* Header Controls - Hide in fullscreen */}
              {!isFullscreen && (
                <div style={{
                  width: '100%',
                  maxWidth: '1200px',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                  }}>
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={handleBack}
                      style={{
                        color: '#666',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      Back to Documents
                    </Button>
                    
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                      style={{
                        background: '#003eb3',
                        borderColor: '#003eb3',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}
                    >
                      Download
                    </Button>
                  </div>

                  {/* Document Info */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <Text strong style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'block' }}>
                        Document Name
                      </Text>
                      <Input
                        value={file?.filename || ''}
                        readOnly
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
                      <Tag
                        color={getCategoryColor(decodedCategory)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          fontWeight: 600,
                          borderRadius: '16px',
                          border: 'none',
                          width: '100%',
                          textAlign: 'center'
                        }}
                      >
                        {decodedCategory.replace(/([A-Z])/g, ' $1').trim()}
                      </Tag>
                    </div>
                  </div>

                  {/* Metadata */}
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
                        Uploaded By
                      </Text>
                      <div style={{ fontWeight: 500, color: '#262626', marginTop: '2px' }}>
                        {file.uploadedBy || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                        Upload Date
                      </Text>
                      <div style={{ fontWeight: 500, color: '#262626', marginTop: '2px' }}>
                        {formatDate(file.uploadedAt)}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                        Status
                      </Text>
                      <div style={{ marginTop: '2px' }}>
                        <Tag 
                          color={file.status === 'active' ? 'green' : 'orange'} 
                          style={{ fontSize: '10px', borderRadius: '8px' }}
                        >
                          {file.status || 'Active'}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Viewer with Zoom Controls */}
              <div style={{
                width: '100%',
                maxWidth: isFullscreen ? '100%' : '1200px',
                height: isFullscreen ? '100vh' : 'auto',
                border: '2px solid #e9ecef',
                borderRadius: isFullscreen ? '0' : '8px',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: isFullscreen ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? '0' : 'auto',
                left: isFullscreen ? '0' : 'auto',
                zIndex: isFullscreen ? 9999 : 'auto'
              }}>
                {/* PDF Viewer Header with Zoom Controls */}
                <div style={{
                  background: 'linear-gradient(135deg, #003eb3 0%, #002a80 100%)',
                  padding: '12px 20px',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FileTextOutlined style={{ marginRight: '8px' }} />
                    <Text strong style={{ color: 'white', fontSize: '14px' }}>
                      Document Preview
                    </Text>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                      size="small"
                      icon={<ZoomOutOutlined />}
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white'
                      }}
                    />
                    
                    <Button
                      size="small"
                      onClick={handleResetZoom}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white',
                        minWidth: '50px',
                        fontSize: '12px'
                      }}
                    >
                      {zoomLevel}%
                    </Button>
                    
                    <Button
                      size="small"
                      icon={<ZoomInOutlined />}
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 200}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white'
                      }}
                    />
                    
                    <Button
                      size="small"
                      icon={<ExpandOutlined />}
                      onClick={toggleFullscreen}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white',
                        marginLeft: '8px'
                      }}
                    />
                    
                    {isFullscreen && (
                      <Button
                        size="small"
                        onClick={toggleFullscreen}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          color: 'white'
                        }}
                      >
                        Exit
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* PDF Viewer Container with Custom Scrollbar */}
                <div 
                  className={`pdf-viewer-container ${isFullscreen ? 'pdf-viewer-fullscreen' : ''}`}
                  style={{ 
                    background: '#fff',
                    height: isFullscreen ? 'calc(100vh - 48px)' : '75vh',
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '20px'
                  }}
                >
                  <div style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s ease'
                  }}>
                    <PdfViewer
                      fileUrl={file.presignedUrl || file.fileUrl}
                      height={isFullscreen ? 'calc(100vh - 88px)' : '70vh'}
                      width={'800px'}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Loading State */}
          {!file && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '70vh',
              color: '#999'
            }}>
              <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <Title level={4} style={{ color: '#999', margin: 0 }}>Loading document...</Title>
              <Text type="secondary">Please wait while we fetch your document.</Text>
            </div>
          )}
        </div>
      </GeneralLayout>
    </>
  );
};

export default ViewDocument;
