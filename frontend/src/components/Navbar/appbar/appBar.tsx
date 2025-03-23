<<<<<<< HEAD
import React, { useState } from "react";
import { Input, Avatar, Popover, List, Menu, Dropdown } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";

const { Search } = Input;

/* notification for the user */
const notifications = [
  { id: 1, message: "New message from Sarah" },
  { id: 2, message: "Your report has been approved" },
  { id: 3, message: "Project deadline is approaching" },
];

const userMenu = (
  <Menu>
    <Menu.Item key="profile">Profile</Menu.Item>
    <Menu.Item key="settings">Settings</Menu.Item>
    <Menu.Item key="logout">Logout</Menu.Item>
  </Menu>
);

/*   is used to manage */
const AppBar = () => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <div
      style={{
        width: "95%",
        display: "flex",
        justifyContent: "flex-end",
        gap: 20,
        marginBottom: 20,
        alignItems: "center",
        flexWrap: "wrap",
        padding: "10px",
      }}
    >
      {/* search bar */}
      <Search
        placeholder="Input search text"
        style={{ width: 300 }}
        className="appbar-search"
      />
      <Popover
        content={
          <div>
            <List
              size="small"
              dataSource={notifications}
              /* the following is standar way of mapping values in antd */
              renderItem={(item) => (
                <List.Item>
                  <span>{item.message}</span>
                </List.Item>
              )}
            />
          </div>
        }
        title="Notifications"
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
      >
        <BellOutlined style={{ fontSize: "24px" }} />
      </Popover>

      <Dropdown overlay={userMenu} trigger={["click"]}>
        <Avatar
          size="large"
          icon={<UserOutlined />}
          style={{ cursor: "pointer" }}
        />
      </Dropdown>
    </div>
  );
};

export default AppBar;
=======
import React, { useState, useEffect } from 'react';
import { Input, Avatar, Popover, List, Menu, Dropdown } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AppBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  // Fetch the profile picture from localStorage
  const savedProfilePicture = localStorage.getItem('profilePic') || '';

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const notifications = [
    { id: 1, message: 'New message from Sarah' },
    { id: 2, message: 'Your report has been approved' },
    { id: 3, message: 'Project deadline is approaching' },
  ];

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
        onClick={() => {
          /* handle logout logic */
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
      {/* search bar */}
      <Search
        placeholder="Input search text"
        style={{ width: 300 }}
        className="appbar-search"
      />

      {/* Notification Popover */}
      <Popover
        content={
          <div>
            <List
              size="small"
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <span>{item.message}</span>
                </List.Item>
              )}
            />
          </div>
        }
        title="Notifications"
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
      >
        <BellOutlined style={{ fontSize: '24px' }} />
      </Popover>

      {/* User Dropdown Menu */}
      <Dropdown overlay={userMenu} trigger={['click']}>
        <Avatar
          size="large"
          icon={<UserOutlined />}
          src={savedProfilePicture || ''} 
          style={{ cursor: 'pointer' }}
        />
      </Dropdown>
    </div>
  );
};

export default AppBar;
>>>>>>> develop
