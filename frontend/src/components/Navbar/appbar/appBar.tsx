import React, { useState, useEffect } from 'react';
import { Input, Avatar, Popover, Badge, Menu, Dropdown, Space, Spin, List, Tabs, message } from 'antd';
import { BellOutlined, UserOutlined, SearchOutlined, FileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Notification from '../notification/notification';
import axios from 'axios';
import Search from 'antd/es/input/Search';
import io from 'socket.io-client'; // You'll need to install socket.io-client

// Add TabPane
const { TabPane } = Tabs;
const AppBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  const [userData, setUserData] = useState({
    profilePic: '',
    userName: 'Loading...',
    userId: '', 
  });
  const [loading, setLoading] = useState(true);
 const [dropdownVisible, setDropdownVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [documentResults, setDocumentResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    if (!userData.userId) return;
    
    try {
      const socket = io(API_URL);
      
      socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('join', userData.userId);
      });
      
      socket.on('notification', (notification) => {
        console.log('Received notification:', notification);
        fetchNotifications(); 
        message.info({
          content: notification.message,
          duration: 3,
        });
      });
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      return () => {
        socket.disconnect();
      };
    } catch (error) {
      console.error('Error setting up socket connection:', error);
    }
  }, [userData.userId, API_URL]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${API_URL}/api/users/me`, {
          withCredentials: true
        });

        console.log("User data response:", response.data);

        if (response.data) {
          console.log("User object:", response.data);
          
          setUserData({
            profilePic: response.data.profilePicture || '',
            userName: response.data.name || response.data.email || 'User',
            userId: response.data.user_id || response.data.id || '',
          });
          
          console.log("Set user data to:", {
            profilePic: response.data.profilePicture || '',
            userName: response.data.name || response.data.email || 'User',
            userId: response.data.user_id || response.data.id || '',
          });
        } else {
          console.error('Failed to fetch user data');
          setUserData({
            profilePic: '',
            userName: 'User',
            userId: '',
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserData({
          profilePic: '',
          userName: 'User',
          userId: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [API_URL]);

  const fetchNotifications = async () => {
    if (!userData.userId) return;
    
    try {
      setLoadingNotifications(true);
      const response = await axios.get(`${API_URL}/api/notification`, {
        withCredentials: true
      });
      
      console.log('Notification response:', response.data);
      
      if (response.data && response.data.success) {
        const notificationData = response.data.data || [];
        
        const formattedNotifications = notificationData.map((notif: any) => ({
          id: notif.notificationId,
          message: notif.message,
          time: new Date(notif.createdAt).toLocaleString(),
          isRead: notif.isRead,
          avatar: '', 
          type: notif.type,
          data: notif.data
        }));
        
        setNotifications(formattedNotifications);
        
        const unread = formattedNotifications.filter((n: any) => !n.isRead).length;
        setNotificationCount(unread);
      } else {
        console.warn('Failed to fetch notifications or empty response');
        setNotifications([]);
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setNotificationCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      if (unreadNotifications.length === 0) return;
      
      await Promise.all(
        unreadNotifications.map(notification => 
          axios.patch(
            `${API_URL}/api/notification/${notification.id}/read`, 
            {},
            { withCredentials: true }
          )
        )
      );
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setNotificationCount(0);
      
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchNotifications();
    }
  };

  useEffect(() => {
    if (userData.userId) {
      fetchNotifications();
    }
  }, [userData.userId]);

  const notificationsData = [
    {
      id: 1,
      message: 'New message from Sarah',
      time: '5 minutes ago',
      isRead: false,
      avatar:
        'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    },
    {
      id: 2,
      message: 'Your report has been approved',
      time: '1 hour ago',
      isRead: false,
      avatar: '',
    },
    {
      id: 3,
      message: 'Project deadline is approaching',
      time: '5 hours ago',
      isRead: true,
      avatar: '',
    },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        setUserData({
          profilePic: '',
          userName: 'User',
          userId: ''  
        });
        navigate('/');
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        onClick={() => {
          console.log('Profile Clicked');
          navigate('/profile');
        }}
      >
        Profile
      </Menu.Item>
      <Menu.Item
        key="logout"
        onClick={handleLogout}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  const [openNotification, setOpenNotification] = useState(false);

  const handleNotificationClick = () => {
    setOpenNotification(!openNotification);
  };

  const handleNotificationClose = () => {
    setOpenNotification(false);
  };

  const searchDropdown = (
    <div 
      style={{ 
        width: 300, 
        maxHeight: 400, 
        overflow: 'hidden', 
        backgroundColor: '#fff', 
        borderRadius: '4px', 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
    >
      {searchLoading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      ) : searchValue ? (
        <Tabs 
          defaultActiveKey="users" 
          style={{ padding: '0 8px' }}
          className="search-tabs"
        >
          <TabPane tab={`Users (${searchResults.length})`} key="users">
            <div style={{ maxHeight: 330, overflowY: 'auto', overflowX: 'hidden' }}>
              {searchResults.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={searchResults}
                  renderItem={(user) => (
                    <List.Item 
                      style={{ padding: '8px 12px', cursor: 'pointer' }}
                      onClick={() => handleUserClick(user)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            src={user.profilePicture} 
                            icon={!user.profilePicture && <UserOutlined />}
                          >
                            {!user.profilePicture && user.name?.charAt(0)}
                          </Avatar>
                        }
                        title={<span style={{ color: '#000' }}>{user.name}</span>}
                        description={<span style={{ color: '#666' }}>{user.email}</span>}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                  No users found
                </div>
              )}
            </div>
          </TabPane>
          <TabPane tab={`Documents (${documentResults.length})`} key="documents">
            <div style={{ maxHeight: 330, overflowY: 'auto', overflowX: 'hidden' }}>
              {documentResults.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={documentResults}
                  renderItem={(document) => (
                    <List.Item 
                      style={{ padding: '8px 12px', cursor: 'pointer' }}
                      onClick={() => handleDocumentClick(document)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<FileOutlined />}
                            style={{ 
                              backgroundColor: document.documentType?.includes('PDF') ? '#ff4d4f' : 
                                            document.documentType?.includes('Word') ? '#1890ff' : 
                                            document.documentType?.includes('Excel') ? '#52c41a' : 
                                            '#faad14' 
                            }}
                          />
                        }
                        title={
                          <span style={{ 
                            color: '#000',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '220px',
                            display: 'block'
                          }}>
                            {document.filename || document.name || "Untitled"}
                          </span>
                        }
                        description={
                          <span style={{ 
                            color: '#666',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '220px',
                            display: 'block'
                          }}>
                            {document.documentType || "Document"}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                  No documents found
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      ) : recentSearches.length > 0 ? (
        <div style={{ maxHeight: 330, overflowY: 'auto', overflowX: 'hidden' }}>
          <Menu>
            <Menu.Item disabled style={{ color: '#999' }}>Recent Searches</Menu.Item>
            {recentSearches.map((item, idx) => (
              <Menu.Item key={idx} onClick={() => handleSearch(item)}>
                <SearchOutlined style={{ marginRight: 8 }} />
                <span style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '220px',
                  display: 'block'
                }}>
                  {item}
                </span>
              </Menu.Item>
            ))}
          </Menu>
        </div>
      ) : (
        <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
          No recent searches
        </div>
      )}
    </div>
  );

  const handleUserClick = (user: any) => {
    setDropdownVisible(false);
    // pick a sensible search term (name or email)
    const term = user.name || user.email || "";
    if (term) {
      navigate(`/search/${encodeURIComponent(term)}`);
    } else {
      // fallback
      navigate(`/profile/${user.user_id || user.id}`);
    }
  };

  const handleDocumentClick = (document: any) => {
    setDropdownVisible(false);
    
    if (document.documentId) {
      axios.get(`${API_URL}/api/document/presigned-url/${document.documentId}`, {
        withCredentials: true,
      })
      .then(response => {
        if (response.data && response.data.success && response.data.presignedUrl) {
          window.open(response.data.presignedUrl, '_blank');
        } else {
          message.error('Failed to open document');
        }
      })
      .catch(err => {
        console.error('Error opening document:', err);
        message.error('Failed to open document');
      });
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.trim().length >= 2) {
      setSearchLoading(true);
      
      const searchTimer = setTimeout(() => {
        Promise.all([
          axios.get(`${API_URL}/api/users/search`, {
            params: { term: value },
            withCredentials: true,
          }),
          axios.get(`${API_URL}/api/document/search`, {
            params: { term: value },
            withCredentials: true,
          })
        ])
        .then(([usersResponse, documentsResponse]) => {
          if (usersResponse.data && usersResponse.data.success) {
            setSearchResults(usersResponse.data.data || []);
          }
          
          if (documentsResponse.data && documentsResponse.data.success) {
            setDocumentResults(documentsResponse.data.data || []);
          }
        })
        .catch(err => {
          console.error('Search error:', err);
          setSearchResults([]);
          setDocumentResults([]);
        })
        .finally(() => {
          setSearchLoading(false);
        });
      }, 300);
      
      return () => clearTimeout(searchTimer);
    } else {
      setSearchResults([]);
      setDocumentResults([]);
      setSearchLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    
    setRecentSearches(prev => {
      const updatedSearches = [value, ...prev.filter(item => item !== value)];
      return updatedSearches.slice(0, 5); 
    });
    
    axios.post(`${API_URL}/api/users/recent-searches`, { name: value }, {
      withCredentials: true
    }).catch(err => {
      console.error('Error saving recent search:', err);
    });
    
    setDropdownVisible(false);
    navigate(`/search/${value}`);
  };

  return (
    <div
      style={{
        width: '95%',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 20,
        marginBottom: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '10px',
      }}
    >
      <Dropdown
        overlay={searchDropdown}
        visible={dropdownVisible}
        onVisibleChange={setDropdownVisible}
        trigger={['click']}
      >
        <Search
          placeholder="Search users and documents..."
          style={{ width: 300 }}
          value={searchValue}
          onChange={handleSearchInputChange}
          onSearch={handleSearch}
          onClick={() => setDropdownVisible(true)}
          className="appbar-search"
        />
      </Dropdown>

      <Popover
        content={
          <Notification
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            loading={loadingNotifications}
          />
        }
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottomRight"
        overlayStyle={{ width: '320px' }}
      >
        <Badge count={notificationCount} overflowCount={99} size="small">
          <BellOutlined
            style={{
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
            }}
          />
        </Badge>
      </Popover>

      <Dropdown overlay={userMenu} trigger={['click']}>
        <Space style={{ cursor: 'pointer' }}>
          {loading ? (
            <Spin size="small" />
          ) : (
            <Avatar
              size="large"
              icon={<UserOutlined />}
              src={userData.profilePic || ''}
              onError={() => {
                console.error("Failed to load profile picture from URL:", userData.profilePic);
                return false; 
              }}
            />
          )}
          <span
            style={{
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Loading...' : userData.userName}
          </span>
        </Space>
      </Dropdown>
    </div>
  );
};

export default AppBar;
