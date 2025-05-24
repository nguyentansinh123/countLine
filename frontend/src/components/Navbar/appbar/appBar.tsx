import React, { useState, useEffect } from 'react';
import { Input, Avatar, Popover, Badge, Menu, Dropdown, Space, Spin, List, Tabs } from 'antd';
import { BellOutlined, UserOutlined, SearchOutlined, FileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Notification from '../notification/notification';
import axios from 'axios';
import Search from 'antd/es/input/Search';

// Add TabPane
const { TabPane } = Tabs;
const AppBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  
  const [userData, setUserData] = useState({
    profilePic: '',
    userName: 'Loading...',
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
            userName: response.data.name || response.data.email || 'User'
          });
          
          console.log("Set user data to:", {
            profilePic: response.data.profilePicture || '',
            userName: response.data.name || response.data.email || 'User'
          });
        } else {
          console.error('Failed to fetch user data');
          setUserData({
            profilePic: '',
            userName: 'User'
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserData({
          profilePic: '',
          userName: 'User'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [API_URL]);


  const notifications = [
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

  const handleMarkAllRead = () => {
    setNotificationCount(0);
  };

 

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/recent-searches`, {
          withCredentials: true,
        });

        if (res.data?.data) {
          const names = res.data.data.map((s: any) => s.name);
          setRecentSearches(names);
        }
      } catch (err) {
        console.error('Error fetching recent searches:', err);
      }
    };

    fetchRecentSearches();
  }, [API_URL]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleSearch = (value: string) => {
    if (!value) return;
    setRecentSearches((prev) => {
      const updated = [value, ...prev.filter((v) => v !== value)];
      return updated.slice(0, 5);
    });
    setDropdownVisible(false);
    navigate(`/search/${value}`)
  };

  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      setDocumentResults([]);
      setDropdownVisible(false);
      return;
    }
    
    setSearchLoading(true);
    setDropdownVisible(true);
    
    try {
      const userRes = await axios.get(`${API_URL}/api/users/search`, {
        params: { term: value },
        withCredentials: true,
      });
      
      console.log("User search response:", userRes.data);
      
      if (userRes.data && userRes.data.success) {
        setSearchResults(userRes.data.data || []);
      } else {
        setSearchResults([]);
      }

      const docRes = await axios.get(`${API_URL}/api/document/search`, {
        params: { term: value },
        withCredentials: true,
      });
      
      console.log("Document search response:", docRes.data);
      
      if (docRes.data && docRes.data.success) {
        setDocumentResults(docRes.data.data || []);
      } else {
        setDocumentResults([]);
      }
    } catch (err) {
      console.error('Error searching:', err);
      setSearchResults([]);
      setDocumentResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUserClick = (user: any) => {
    setDropdownVisible(false);
    navigate(`/search/${user.name}`);
  };

  const handleDocumentClick = async (document: any) => {
    try {
      setDropdownVisible(false);
      const response = await axios.get(`${API_URL}/api/document/presigned-url/${document.documentId || document.id}`, {
        withCredentials: true,
      });
      
      console.log("Presigned URL response:", response.data);
      
      if (response.data && response.data.success && response.data.presignedUrl) {
        window.open(response.data.presignedUrl, '_blank');
      } else {
        console.error("Failed to get presigned URL for document");
        navigate(`/document/${document.documentId || document.id}`);
      }
    } catch (err) {
      console.error("Error opening document:", err);
      navigate(`/document/${document.documentId || document.id}`);
    }
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
          userName: 'User'
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
