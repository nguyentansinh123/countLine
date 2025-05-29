import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Avatar, 
  List, 
  Button, 
  message, 
  Skeleton, 
  Tabs, 
  Tag, 
  Divider, 
  Empty,
  Tooltip,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  ClockCircleOutlined, 
  FileOutlined,
  EyeOutlined,
  LeftOutlined,
  IdcardOutlined,
  TeamOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';

const UserDetails: React.FC = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const { TabPane } = Tabs;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user and documents in parallel
        const [userRes, docsRes] = await Promise.all([
          fetch(`http://localhost:5001/api/users/${user_id}`, {
            credentials: 'include',
          }),
          fetch(`http://localhost:5001/api/users/${user_id}/documents`, {
            credentials: 'include',
          })
        ]);
        
        const userData = await userRes.json();
        const docsData = await docsRes.json();
        
        if (userData.success) {
          setUser(userData.data);
        } else {
          message.error('Failed to load user details');
        }
        
        if (docsData.success) {
          setDocuments(docsData.data);
        } else {
          message.error('Failed to load user documents');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        message.error('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user_id]);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'N/A' 
        : date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
    } catch (err) {
      return 'N/A';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role?: string) => {
    if (!role) return '#d9d9d9';
    
    switch(role.toLowerCase()) {
      case 'admin': return '#ff4d4f';
      case 'client': return '#1890ff';
      default: return '#52c41a';
    }
  };

  // View document function
  const viewDocument = (doc: any) => {
    const formattedType = doc.documentType?.replace(/\s/g, '') || 'General';
    window.open(
      `/viewdocument/${formattedType}/${doc.documentId}`,
      '_blank'
    );
  };

  // Document type icon mapping
  const getDocumentTypeIcon = (type?: string) => {
    if (!type) return <FileOutlined />;
    
    const typeL = type.toLowerCase();
    if (typeL.includes('id') || typeL.includes('license')) {
      return <IdcardOutlined />;
    } else if (typeL.includes('report') || typeL.includes('history')) {
      return <HistoryOutlined />;
    } else {
      return <FileOutlined />;
    }
  };

  return (
    <GeneralLayout title="User Details">
      <div style={{ padding: '0 16px', maxWidth: '1200px', margin: '0 auto' }}>
        <Button 
          icon={<LeftOutlined />} 
          onClick={() => navigate('/users')}
          style={{ 
            marginBottom: '16px',
            borderRadius: '6px'
          }}
        >
          Back to Users
        </Button>

        {loading ? (
          <Card
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Skeleton avatar paragraph={{ rows: 4 }} active />
          </Card>
        ) : !user ? (
          <Card 
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              textAlign: 'center',
              padding: '40px 0'
            }}
          >
            <Empty 
              description="User not found" 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
            <Button 
              type="primary" 
              onClick={() => navigate('/users')}
              style={{ marginTop: '16px' }}
            >
              Return to Users
            </Button>
          </Card>
        ) : (
          <>
            {/* User Profile Card */}
            <Card
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                marginBottom: '16px'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '24px',
                }}
              >
                {/* User Avatar */}
                <div>
                  <Avatar 
                    size={100} 
                    src={user.profilePicture}
                    icon={!user.profilePicture && <UserOutlined />}
                    style={{ 
                      backgroundColor: user.profilePicture ? undefined : getRoleBadgeColor(user.role),
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {!user.profilePicture && user.name?.[0]}
                  </Avatar>
                </div>

                {/* User Details */}
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ 
                      margin: 0, 
                      fontSize: '24px', 
                      fontWeight: 600,
                      color: '#111827'
                    }}>
                      {user.name}
                    </h1>
                    
                    <Tag 
                      color={getRoleBadgeColor(user.role)}
                      style={{ 
                        padding: '2px 12px', 
                        borderRadius: '12px', 
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      {user.role}
                    </Tag>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginTop: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MailOutlined style={{ color: '#6b7280' }} />
                      <span style={{ color: '#374151', fontWeight: 500 }}>Email:</span>
                      <span style={{ color: '#4b5563' }}>{user.email}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ClockCircleOutlined style={{ color: '#6b7280' }} />
                      <span style={{ color: '#374151', fontWeight: 500 }}>Joined:</span>
                      <span style={{ color: '#4b5563' }}>{formatDate(user.created_at)}</span>
                    </div>
                    
                    {user.teams && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TeamOutlined style={{ color: '#6b7280' }} />
                        <span style={{ color: '#374151', fontWeight: 500 }}>Teams:</span>
                        <Badge 
                          count={user.teams.length} 
                          style={{ backgroundColor: user.teams.length ? '#1890ff' : '#d9d9d9' }}
                          showZero
                        />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileOutlined style={{ color: '#6b7280' }} />
                      <span style={{ color: '#374151', fontWeight: 500 }}>Documents:</span>
                      <Badge 
                        count={documents.length} 
                        style={{ backgroundColor: documents.length ? '#1890ff' : '#d9d9d9' }}
                        showZero
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs Section */}
            <Card
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <Tabs 
                defaultActiveKey="1" 
                onChange={(key) => setActiveTab(key)}
                type="card"
              >
                <TabPane 
                  tab={
                    <span>
                      <FileOutlined /> Documents
                    </span>
                  } 
                  key="1"
                >
                  {documents.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={documents}
                      renderItem={(doc) => (
                        <List.Item
                          style={{ 
                            padding: '16px',
                            borderRadius: '6px',
                            border: '1px solid #f0f0f0',
                            marginBottom: '8px',
                            transition: 'all 0.3s ease'
                          }}
                          actions={[
                            <Tooltip title="View Document">
                              <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                onClick={() => viewDocument(doc)}
                                style={{ borderRadius: '6px' }}
                              >
                                View
                              </Button>
                            </Tooltip>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div style={{ 
                                background: '#f3f4f6',
                                color: '#6b7280',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                fontSize: '20px'
                              }}>
                                {getDocumentTypeIcon(doc.documentType)}
                              </div>
                            }
                            title={
                              <div style={{ fontWeight: 500, color: '#111827' }}>
                                {doc.filename || doc.fileName || doc.name || 'Unnamed Document'}
                              </div>
                            }
                            description={
                              <>
                                <Tag color="blue" style={{ borderRadius: '12px' }}>
                                  {doc.documentType || 'General'}
                                </Tag>
                                {doc.created_at && (
                                  <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>
                                    Uploaded: {formatDate(doc.created_at)}
                                  </span>
                                )}
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty 
                      description="No documents found for this user"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ padding: '40px 0' }}
                    />
                  )}
                </TabPane>
                
                {user.teams && user.teams.length > 0 && (
                  <TabPane 
                    tab={
                      <span>
                        <TeamOutlined /> Teams
                      </span>
                    } 
                    key="2"
                  >
                    <Card style={{ border: 'none' }}>
                      <p>Teams functionality would be displayed here.</p>
                    </Card>
                  </TabPane>
                )}
                
                <TabPane 
                  tab={
                    <span>
                      <HistoryOutlined /> Activity
                    </span>
                  } 
                  key="3"
                >
                  <Card style={{ border: 'none' }}>
                    <Empty 
                      description="Activity history coming soon"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ padding: '40px 0' }}
                    />
                  </Card>
                </TabPane>
              </Tabs>
            </Card>
          </>
        )}
      </div>
    </GeneralLayout>
  );
};

export default UserDetails;
