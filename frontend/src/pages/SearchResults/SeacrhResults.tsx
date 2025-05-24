import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import axios from 'axios';
import { 
  List, Avatar, Spin, Alert, Typography, Card, Input, Space, Tag, Empty, 
  Divider, Modal, Tabs, Timeline, Button
} from 'antd';
import { 
  UserOutlined, SearchOutlined, MailOutlined, IdcardOutlined, 
  FileOutlined, ClockCircleOutlined, TeamOutlined, EditOutlined
} from '@ant-design/icons';
import { User } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

export const SearchResults: React.FC = () => {
  const { value = "" } = useParams<{ value: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(value);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5001";

  const fetchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const controller = new AbortController();
    
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/users/search`, {
        params: { term: searchTerm },
        withCredentials: true,
        signal: controller.signal,
      });

      res.data.success
        ? setUsers(res.data.data)
        : setError(res.data.message || "Search failed");
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
    
    return () => controller.abort();
  };

  useEffect(() => {
    fetchUsers(value);
  }, [value, API_URL]);

  const handleSearch = (searchTerm: string) => {
    fetchUsers(searchTerm);
  };

  const getRoleTag = (role: string) => {
    let color = '';
    
    switch(role.toLowerCase()) {
      case 'admin':
        color = 'red';
        break;
      case 'employee':
        color = 'blue';
        break;
      case 'user':
        color = 'green';
        break;
      default:
        color = 'default';
    }
    
    return <Tag color={color}>{role.toUpperCase()}</Tag>;
  };

  const handleUserClick = async (user: any) => {
    setSelectedUser(user);
    setModalVisible(true);
    setLoadingDocuments(true);
    
    try {
      const response = await axios.get(`${API_URL}/api/users/${user.user_id}/documents`, {
        withCredentials: true
      });
      
      console.log("User documents response:", response.data);
      
      if (response.data && response.data.success) {
        const documents = response.data.data || [];
        console.log(`Found ${documents.length} documents for user:`, user.name);
        
        const sortedDocuments = [...documents].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setUserDocuments(sortedDocuments);
      } else {
        console.warn("No documents found or invalid response format:", response.data);
        setUserDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching user documents:", error);
      setUserDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleViewDocument = async (document: any) => {
    try {
      const response = await axios.get(`${API_URL}/api/document/presigned-url/${document.documentId}`, {
        withCredentials: true,
      });
      
      if (response.data && response.data.success && response.data.presignedUrl) {
        window.open(response.data.presignedUrl, '_blank');
      } else {
        console.error("Failed to get presigned URL for document");
      }
    } catch (err) {
      console.error("Error opening document:", err);
    }
  };

  const getDocumentTypeIcon = (docType: string) => {
    if (docType?.includes('PDF')) {
      return <FileOutlined style={{ color: '#ff4d4f' }} />;
    } else if (docType?.includes('Word')) {
      return <FileOutlined style={{ color: '#1890ff' }} />;
    } else if (docType?.includes('Excel')) {
      return <FileOutlined style={{ color: '#52c41a' }} />;
    } else {
      return <FileOutlined style={{ color: '#faad14' }} />;
    }
  };

  return (
    <GeneralLayout title={`Search Results for "${value}"`}>
      <Card
        style={{ 
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Divider orientation="left">
            <Space>
              <Text type="secondary">Results</Text>
              <Tag color="blue">{users.length}</Tag>
            </Space>
          </Divider>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" tip="Searching..." />
            </div>
          ) : error ? (
            <Alert 
              type="error" 
              message="Search Error" 
              description={error} 
              showIcon 
              style={{ marginBottom: 16 }} 
            />
          ) : users.length === 0 ? (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={
                <Text style={{ fontSize: '16px' }}>
                  No users found matching "{value}"
                </Text>
              }
            />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={users}
              renderItem={(user:any, index) => (
                <List.Item
                  key={user.user_id || index}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    backgroundColor: hoveredItemIndex === index ? '#f5f5f5' : 'transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredItemIndex(index)}
                  onMouseLeave={() => setHoveredItemIndex(null)}
                  onClick={() => handleUserClick(user)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={50}
                        src={user.profilePicture}
                        style={{ 
                          backgroundColor: user.profilePicture ? undefined : '#1890ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {!user.profilePicture && user.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    title={
                      <Space size={8}>
                        <Text strong style={{ fontSize: '16px' }}>{user.name}</Text>
                        {getRoleTag(user.role)}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={2} style={{ marginTop: '4px' }}>
                        <Space size={8}>
                          <MailOutlined style={{ color: '#8c8c8c' }} />
                          <Text type="secondary">{user.email}</Text>
                        </Space>
                        <Space size={8}>
                          <IdcardOutlined style={{ color: '#8c8c8c' }} />
                          <Text type="secondary">{user.role}</Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              style={{ maxWidth: '900px' }}
            />
          )}
        </Space>
      </Card>

      <Modal
        title={
          <Space align="center">
            <Avatar 
              size={40} 
              src={selectedUser?.profilePicture}
              style={{
                backgroundColor: selectedUser?.profilePicture ? undefined : '#1890ff'
              }}
            >
              {!selectedUser?.profilePicture && selectedUser?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: '18px' }}>{selectedUser?.name}</Text>
              <Space>
                {selectedUser?.role && getRoleTag(selectedUser.role)}
              </Space>
            </Space>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Tabs defaultActiveKey="info">
          <TabPane tab="User Information" key="info">
            <Card bordered={false} className="profile-card">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Email</Text>
                  <Paragraph strong>{selectedUser?.email}</Paragraph>
                </div>
                
                <div>
                  <Text type="secondary">Role</Text>
                  <Paragraph strong>{selectedUser?.role}</Paragraph>
                </div>

                {selectedUser?.teams && selectedUser.teams.length > 0 && (
                  <div>
                    <Text type="secondary">Teams</Text>
                    <div>
                      {selectedUser.teams.map((team: any, index: number) => (
                        <Tag key={index} color="blue" style={{ margin: '4px' }}>
                          <TeamOutlined /> {team.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedUser?.createdAt && (
                  <div>
                    <Text type="secondary">Created At</Text>
                    <Paragraph>
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </Paragraph>
                  </div>
                )}
              </Space>
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                Documents
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {loadingDocuments ? '...' : userDocuments.length}
                </Tag>
              </span>
            } 
            key="documents"
          >
            {loadingDocuments ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin />
              </div>
            ) : userDocuments.length === 0 ? (
              <Empty description="No documents shared with this user" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={userDocuments}
                renderItem={document => (
                  <List.Item
                    key={document.documentId}
                    actions={[
                      <Button 
                        type="link" 
                        onClick={() => handleViewDocument(document)}
                        icon={<FileOutlined />}
                      >
                        View
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={getDocumentTypeIcon(document.documentType)}
                          style={{ 
                            backgroundColor: '#f0f2f5',
                            color: document.documentType?.includes('PDF') ? '#ff4d4f' : 
                                  document.documentType?.includes('Word') ? '#1890ff' : '#faad14'
                          }}
                        />
                      }
                      title={document.filename || "Untitled Document"}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{document.documentType || "Document"}</Text>
                          <Text type="secondary">
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {document.createdAt 
                              ? new Date(document.createdAt).toLocaleDateString() 
                              : "Unknown date"}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
            
            {userDocuments.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Divider orientation="left">
                  <Text type="secondary">Document Revisions</Text>
                </Divider>
                
                <Timeline style={{ marginTop: '16px' }}>
                  {userDocuments
                    .filter(doc => doc.revisions && doc.revisions.length > 0)
                    .flatMap(doc => 
                      doc.revisions.map((revision: any) => ({
                        ...revision,
                        documentName: doc.filename,
                        documentId: doc.documentId
                      }))
                    )
                    .sort((a: any, b: any) => 
                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )
                    .map((revision: any, index: number) => (
                      <Timeline.Item 
                        key={index} 
                        dot={<EditOutlined style={{ fontSize: '16px' }} />}
                      >
                        <Space direction="vertical" size={0}>
                          <Text strong>
                            {revision.documentName} - Revision {index + 1}
                          </Text>
                          <Text type="secondary">
                            {revision.timestamp 
                              ? new Date(revision.timestamp).toLocaleString() 
                              : "Unknown date"}
                          </Text>
                          <Text>{revision.status}</Text>
                          {revision.editedBy && (
                            <Text type="secondary">Edited by: {revision.editedBy}</Text>
                          )}
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => handleViewDocument({
                              documentId: revision.documentId
                            })}
                          >
                            View
                          </Button>
                        </Space>
                      </Timeline.Item>
                    ))
                  }
                  

                  {userDocuments.every(doc => !doc.revisions || doc.revisions.length === 0) && (
                    <Empty description="No document revisions" />
                  )}
                </Timeline>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Modal>
    </GeneralLayout>
  );
};