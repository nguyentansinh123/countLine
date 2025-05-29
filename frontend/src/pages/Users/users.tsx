import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  List,
  Dropdown,
  Tabs,
  Empty,
  Collapse,
  Menu,
  message,
  MenuProps,
  Modal,
  Input,
  Avatar,
  Tag,
  Divider,
  Skeleton,
  Badge,
  Table,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  SearchOutlined,
  UserOutlined,
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  MoreOutlined,
  ReloadOutlined,
  EyeOutlined,
  WarningOutlined,
  DownOutlined,
  RightOutlined,
  FileOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';

function UserPage() {
  type User = {
    created_at: string;
    verifyOTP: string;
    resetOTPExpireAt: number;
    isAccountVerified: boolean;
    email: string;
    name: string;
    documents: {
      name: string;
      documentId: string;
      fileName?: string;
      filename?: string;
      documentType?: string;
    }[];
    user_id: string;
    recentSearches: string[];
    teams: string[];
    role: string;
    profilePicture: string;
    resetOTP: string;
    verifyOTPExpiredAt: number;
  };

  const [activeTab, setActiveTab] = useState('Client');
  const [clientUsers, setClientUsers] = useState<User[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const navigate = useNavigate();
  const { TabPane } = Tabs;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDocDeleteModalOpen, setIsDocDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [docToDelete, setDocToDelete] = useState<{
    userId: string;
    docId: string;
    docName: string;
  } | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Filter based on search
  const filteredClientUsers = searchTerm
    ? clientUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : clientUsers;

  const filteredSystemUsers = searchTerm
    ? systemUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : systemUsers;

  const showDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const showDocDeleteModal = (userId: string, docId: string, docName: string) => {
    setDocToDelete({ userId, docId, docName });
    setIsDocDeleteModalOpen(true);
  };

  const handleDeleteOk = async () => {
    try {
      await axios.delete(
        `http://localhost:5001/api/users/delete-user/${userToDelete?.user_id}`,
        {
          withCredentials: true,
        }
      );

      if (userToDelete?.role === 'admin') {
        setSystemUsers((prev) =>
          prev.filter((u) => u.user_id !== userToDelete.user_id)
        );
      } else {
        setClientUsers((prev) =>
          prev.filter((u) => u.user_id !== userToDelete?.user_id)
        );
      }

      messageApi.success({
        content: `User "${userToDelete?.name}" deleted successfully.`,
        style: { marginTop: '20px' },
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      messageApi.error('Failed to delete user');
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDocDeleteOk = async () => {
    if (!docToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/document/deleteHard/${docToDelete.docId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      const result = await response.json();
      if (result.success) {
        messageApi.success('Document deleted successfully');

        // Update the documents in the state
        setClientUsers((prev) =>
          prev.map((user) =>
            user.user_id === docToDelete.userId
              ? {
                  ...user,
                  documents: user.documents.filter(
                    (doc) => doc.documentId !== docToDelete.docId
                  ),
                }
              : user
          )
        );
      } else {
        messageApi.error(result.message || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      messageApi.error('Error deleting document');
    } finally {
      setIsDocDeleteModalOpen(false);
      setDocToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleDocDeleteCancel = () => {
    setIsDocDeleteModalOpen(false);
    setDocToDelete(null);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        'http://localhost:5001/api/users/getAllUser',
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const allUsers = res.data.data as User[];

        // Fetch documents for each user
        const clientsWithDocs = await Promise.all(
          allUsers
            .filter((u) => u.role !== 'admin')
            .map(async (user) => {
              try {
                const docsRes = await axios.get(
                  `http://localhost:5001/api/users/${user.user_id}/documents`,
                  { withCredentials: true }
                );

                return {
                  ...user,
                  documents: docsRes.data.success ? docsRes.data.data : [],
                };
              } catch (err) {
                console.error(
                  `Error fetching documents for user ${user.user_id}:`,
                  err
                );
                return user;
              }
            })
        );

        const admins = allUsers.filter((u) => u.role === 'admin');
        setClientUsers(clientsWithDocs);
        setSystemUsers(admins);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      messageApi.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? 'Invalid Date'
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Toggle expanded user
  const toggleUserExpand = (userId: string) => {
    setExpandedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // User menu actions
  const handleMenuClick = (key: string, user: User) => {
    switch (key) {
      case 'edit':
        navigate(`/edituser/${user.user_id}`);
        break;
      case 'delete':
        showDeleteModal(user);
        break;
      case 'viewHistory':
        navigate(`/viewhistory/${user.user_id}`);
        break;
    }
  };

  // View document function
  const viewDocument = (document: any) => {
    const category = document.documentType || 'General';
    const formattedCategory = category.replace(/\s+/g, '');
    navigate(`/viewdocument/${formattedCategory}/${document.documentId}`);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '#ff4d4f';
      case 'client':
        return '#1890ff';
      default:
        return '#52c41a';
    }
  };

  return (
    <>
      {contextHolder}
      <GeneralLayout
        title="Users"
        buttonLabel="Add User"
        navigateLocation="/adduser"
      >
        <div style={{ padding: '0 16px' }}>
          {/* Search Bar and Stats */}
          <Card
            style={{
              marginBottom: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Input
                placeholder="Search users by name or email"
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '300px',
                  borderRadius: '6px',
                }}
                allowClear
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(24, 144, 255, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(24, 144, 255, 0.2)'
                }}>
                  <UserOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                  <span style={{ fontWeight: 500, color: '#1f2937' }}>
                    Client Users
                  </span>
                  <div style={{ 
                    background: '#1890ff', 
                    color: 'white', 
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    marginLeft: '8px',
                    minWidth: '24px',
                    textAlign: 'center'
                  }}>
                    {clientUsers.length}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 77, 79, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 77, 79, 0.2)'
                }}>
                  <UserSwitchOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                  <span style={{ fontWeight: 500, color: '#1f2937' }}>
                    System Users
                  </span>
                  <div style={{ 
                    background: '#ff4d4f', 
                    color: 'white', 
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    marginLeft: '8px',
                    minWidth: '24px',
                    textAlign: 'center'
                  }}>
                    {systemUsers.length}
                  </div>
                </div>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchUsers}
                  loading={loading}
                  style={{ borderRadius: '6px' }}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </Card>

          <Tabs
            defaultActiveKey="Client"
            onChange={(key) => setActiveTab(key)}
            style={{ marginBottom: 8 }}
            type="card"
          >
            <TabPane
              tab={
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <UserOutlined />
                  Client Users
                </span>
              }
              key="Client"
            >
              <Card
                bodyStyle={{ padding: '0' }}
                style={{ borderRadius: '8px', overflow: 'hidden' }}
              >
                {loading ? (
                  <div style={{ padding: '24px' }}>
                    <Skeleton active paragraph={{ rows: 5 }} />
                  </div>
                ) : filteredClientUsers.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      searchTerm
                        ? 'No users match your search'
                        : 'No client users found'
                    }
                    style={{ padding: '40px 0' }}
                  />
                ) : (
                  <div style={{ overflow: 'auto' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          '24px 2fr 1fr 1fr 1fr 60px',
                        padding: '12px 16px',
                        background: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#4b5563',
                      }}
                    >
                      <div></div>
                      <div>Name</div>
                      <div>Role</div>
                      <div>Documents</div>
                      <div>Created</div>
                      <div>Actions</div>
                    </div>

                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                      {filteredClientUsers.map((user) => (
                        <div
                          key={user.user_id}
                          style={{
                            borderBottom: '1px solid #f3f4f6',
                          }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                '24px 2fr 1fr 1fr 1fr 60px',
                              padding: '12px 16px',
                              alignItems: 'center',
                              borderLeft: expandedUsers.includes(user.user_id)
                                ? '3px solid #1890ff'
                                : '3px solid transparent',
                              background: expandedUsers.includes(user.user_id)
                                ? '#f0f7ff'
                                : 'white',
                            }}
                          >
                            <div>
                              <Button
                                type="text"
                                icon={
                                  expandedUsers.includes(user.user_id) ? (
                                    <DownOutlined />
                                  ) : (
                                    <RightOutlined />
                                  )
                                }
                                size="small"
                                onClick={() => toggleUserExpand(user.user_id)}
                                style={{ color: '#6b7280' }}
                              />
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}
                            >
                              <Avatar
                                src={user.profilePicture}
                                icon={!user.profilePicture && <UserOutlined />}
                                style={{
                                  backgroundColor: user.profilePicture
                                    ? undefined
                                    : '#1890ff',
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 500 }}>{user.name}</div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#6b7280',
                                  }}
                                >
                                  {user.email}
                                </div>
                              </div>
                            </div>

                            {/* Role */}
                            <div>
                              <Tag
                                color={getRoleBadgeColor(user.role)}
                                style={{ borderRadius: '12px' }}
                              >
                                {user.role}
                              </Tag>
                            </div>

                            <div>
                              <Badge
                                count={user.documents?.length || 0}
                                style={{
                                  backgroundColor:
                                    (user.documents?.length || 0) > 0
                                      ? '#1890ff'
                                      : '#d9d9d9',
                                }}
                                showZero
                              />
                            </div>

                            <div
                              style={{
                                color: '#6b7280',
                                fontSize: '14px',
                              }}
                            >
                              {formatDate(user.created_at)}
                            </div>

                            {/* Actions */}
                            <div>
                              <Dropdown
                                menu={{
                                  items: [
                                    {
                                      key: 'edit',
                                      icon: <EditOutlined />,
                                      label: 'Edit User',
                                      onClick: () => handleMenuClick('edit', user),
                                    },
                                    {
                                      key: 'viewHistory',
                                      icon: <HistoryOutlined />,
                                      label: 'View History',
                                      onClick: () => handleMenuClick('viewHistory', user),
                                    },
                                    {
                                      type: 'divider',
                                    },
                                    {
                                      key: 'delete',
                                      icon: <DeleteOutlined />,
                                      label: 'Delete User',
                                      danger: true,
                                      onClick: () => handleMenuClick('delete', user),
                                    },
                                  ],
                                }}
                                trigger={['click']}
                                placement="bottomRight"
                              >
                                <Button
                                  type="text"
                                  icon={<MoreOutlined />}
                                  style={{ color: '#6b7280' }}
                                />
                              </Dropdown>
                            </div>
                          </div>

                          {expandedUsers.includes(user.user_id) && (
                            <div
                              style={{
                                padding: '0 16px 16px 56px',
                                background: '#f9fafb',
                              }}
                            >
                              <Divider style={{ margin: '0 0 16px 0' }} />
                              <div
                                style={{
                                  fontWeight: 500,
                                  marginBottom: '12px',
                                }}
                              >
                                User Documents
                              </div>

                              {user.documents?.length > 0 ? (
                                <div
                                  style={{
                                    background: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {user.documents.map((doc, idx) => (
                                    <div
                                      key={doc.documentId || idx}
                                      style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto',
                                        padding: '12px 16px',
                                        borderBottom:
                                          idx < user.documents.length - 1
                                            ? '1px solid #f3f4f6'
                                            : 'none',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                        }}
                                      >
                                        <div
                                          style={{
                                            background: '#f3f4f6',
                                            color: '#6b7280',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '4px',
                                          }}
                                        >
                                          <FileOutlined />
                                        </div>
                                        <div>
                                          <div style={{ fontWeight: 500 }}>
                                            {doc.filename ||
                                              doc.fileName ||
                                              doc.name ||
                                              'Unnamed Document'}
                                          </div>
                                          {doc.documentType && (
                                            <div
                                              style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                              }}
                                            >
                                              {doc.documentType}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button
                                          type="primary"
                                          icon={<EyeOutlined />}
                                          size="small"
                                          onClick={() => viewDocument(doc)}
                                        >
                                          View
                                        </Button>
                                        <Button
                                          danger
                                          icon={<DeleteOutlined />}
                                          size="small"
                                          onClick={() =>
                                            showDocDeleteModal(
                                              user.user_id,
                                              doc.documentId,
                                              doc.filename ||
                                                doc.fileName ||
                                                doc.name ||
                                                'this document'
                                            )
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description="No documents found for this user"
                                  style={{
                                    padding: '24px',
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <UserOutlined />
                  System Users
                </span>
              }
              key="System"
            >
              <Card
                bodyStyle={{ padding: '0' }}
                style={{ borderRadius: '8px', overflow: 'hidden' }}
              >
                {loading ? (
                  <div style={{ padding: '24px' }}>
                    <Skeleton active paragraph={{ rows: 5 }} />
                  </div>
                ) : filteredSystemUsers.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      searchTerm
                        ? 'No users match your search'
                        : 'No system users found'
                    }
                    style={{ padding: '40px 0' }}
                  />
                ) : (
                  <div style={{ overflow: 'auto' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '3fr 1fr 1fr 60px',
                        padding: '12px 16px',
                        background: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#4b5563',
                      }}
                    >
                      <div>Name</div>
                      <div>Role</div>
                      <div>Created</div>
                      <div>Actions</div>
                    </div>

                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                      {filteredSystemUsers.map((user) => (
                        <div
                          key={user.user_id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '3fr 1fr 1fr 60px',
                            padding: '12px 16px',
                            alignItems: 'center',
                            borderBottom: '1px solid #f3f4f6',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                            }}
                          >
                            <Avatar
                              src={user.profilePicture}
                              icon={!user.profilePicture && <UserOutlined />}
                              style={{
                                backgroundColor: user.profilePicture
                                  ? undefined
                                  : '#ff4d4f',
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 500 }}>{user.name}</div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  color: '#6b7280',
                                }}
                              >
                                {user.email}
                              </div>
                            </div>
                          </div>

                          {/* Role */}
                          <div>
                            <Tag
                              color={getRoleBadgeColor(user.role)}
                              style={{ borderRadius: '12px' }}
                            >
                              {user.role}
                            </Tag>
                          </div>

                          <div
                            style={{
                              color: '#6b7280',
                              fontSize: '14px',
                            }}
                          >
                            {formatDate(user.created_at)}
                          </div>

                          {/* Actions */}
                          <div>
                            <Dropdown
                              menu={{
                                items: [
                                  {
                                    key: 'edit',
                                    icon: <EditOutlined />,
                                    label: 'Edit User',
                                    onClick: () => handleMenuClick('edit', user),
                                  },
                                  {
                                    key: 'viewHistory',
                                    icon: <HistoryOutlined />,
                                    label: 'View History',
                                    onClick: () => handleMenuClick('viewHistory', user),
                                  },
                                  {
                                    type: 'divider',
                                  },
                                  {
                                    key: 'delete',
                                    icon: <DeleteOutlined />,
                                    label: 'Delete User',
                                    danger: true,
                                    onClick: () => handleMenuClick('delete', user),
                                  },
                                ],
                              }}
                              trigger={['click']}
                              placement="bottomRight"
                            >
                              <Button
                                type="text"
                                icon={<MoreOutlined />}
                                style={{ color: '#6b7280' }}
                              />
                            </Dropdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabPane>
          </Tabs>
        </div>

        <Modal
          title={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <WarningOutlined style={{ color: '#ff4d4f' }} />
              <span>Delete User</span>
            </div>
          }
          open={isDeleteModalOpen}
          onOk={handleDeleteOk}
          onCancel={handleDeleteCancel}
          okText="Delete"
          okButtonProps={{
            danger: true,
            style: { borderRadius: '6px' },
          }}
          cancelButtonProps={{
            style: { borderRadius: '6px' },
          }}
          width={400}
          centered
        >
          {userToDelete && (
            <>
              <div
                style={{
                  backgroundColor: '#fff2f0',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  border: '1px solid #ffccc7',
                }}
              >
                <p
                  style={{
                    fontWeight: 500,
                    color: '#cf1322',
                    margin: 0,
                  }}
                >
                  Warning: This action cannot be undone
                </p>
                <p
                  style={{
                    color: '#ff4d4f',
                    margin: '4px 0 0 0',
                    fontSize: '13px',
                  }}
                >
                  All user data will be permanently deleted
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '6px',
                  marginBottom: '16px',
                }}
              >
                <Avatar
                  src={userToDelete.profilePicture}
                  icon={!userToDelete.profilePicture && <UserOutlined />}
                  size="large"
                  style={{
                    backgroundColor: userToDelete.profilePicture
                      ? undefined
                      : userToDelete.role === 'admin'
                      ? '#ff4d4f'
                      : '#1890ff',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 500 }}>{userToDelete.name}</div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                    }}
                  >
                    {userToDelete.email}
                  </div>
                </div>
                <Tag
                  color={getRoleBadgeColor(userToDelete.role)}
                  style={{
                    marginLeft: 'auto',
                    borderRadius: '12px',
                  }}
                >
                  {userToDelete.role}
                </Tag>
              </div>

              <p
                style={{
                  textAlign: 'center',
                  marginBottom: 0,
                }}
              >
                Are you sure you want to delete this user?
              </p>
            </>
          )}
        </Modal>

        <Modal
          title={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <WarningOutlined style={{ color: '#ff4d4f' }} />
              <span>Delete Document</span>
            </div>
          }
          open={isDocDeleteModalOpen}
          onOk={handleDocDeleteOk}
          onCancel={handleDocDeleteCancel}
          okText="Delete"
          okButtonProps={{
            danger: true,
            style: { borderRadius: '6px' },
          }}
          cancelButtonProps={{
            style: { borderRadius: '6px' },
          }}
          width={400}
          centered
        >
          <div
            style={{
              backgroundColor: '#fff2f0',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid #ffccc7',
            }}
          >
            <p
              style={{
                fontWeight: 500,
                color: '#cf1322',
                margin: 0,
              }}
            >
              Warning: This action cannot be undone
            </p>
            <p
              style={{
                color: '#ff4d4f',
                margin: '4px 0 0 0',
                fontSize: '13px',
              }}
            >
              The document will be permanently deleted
            </p>
          </div>

          <p
            style={{
              textAlign: 'center',
              marginBottom: 0,
            }}
          >
            Are you sure you want to delete{' '}
            <strong>{docToDelete?.docName}</strong>?
          </p>
        </Modal>
      </GeneralLayout>
    </>
  );
}

export default UserPage;
