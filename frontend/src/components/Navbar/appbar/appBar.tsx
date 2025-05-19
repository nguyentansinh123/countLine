import React, { useState, useEffect } from 'react';
import { Input, Avatar, Popover, Badge, Menu, Dropdown, Space, Spin } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Notification from '../notification/notification';
import axios from 'axios';

const AppBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  
  const [userData, setUserData] = useState({
    profilePic: '',
    userName: 'Loading...',
  });
  const [loading, setLoading] = useState(true);

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
          // Using the same approach as your ProfilePage
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

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

  const { Search } = Input;

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
        onClick={async () => {
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
        }}
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
      <Search
        placeholder="Input search text"
        style={{ width: 300 }}
        className="appbar-search"
      />

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
                return false; // This prevents the default fallback behavior
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
