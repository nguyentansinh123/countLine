import React, { useState } from 'react';
import { Input, Avatar, Popover, Badge, Menu, Dropdown, Space } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Notification from '../notification/notification';

const AppBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const savedProfilePicture = localStorage.getItem('profilePic') || '';
  const savedUserName = localStorage.getItem('userName') || 'User';

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
    // funtion to mark notifications as read
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
            const res = await fetch('http://localhost:5001/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });

            const data = await res.json();

            if (data.success) {
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
          <Avatar
            size="large"
            icon={<UserOutlined />}
            src={savedProfilePicture || ''}
          />
          <span
            style={{
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {savedUserName}
          </span>
        </Space>
      </Dropdown>
    </div>
  );
};

export default AppBar;
