import React, { useState } from 'react';
import { Input, Avatar, Popover, List, Menu, Dropdown } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';

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

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <div
      style={{
        width: '95%',
        display: 'flex',
        justifyContent: 'flex-end',
        gap:20,
        marginBottom:20,
        alignItems: 'center',
        flexWrap: 'wrap'
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
        <BellOutlined style={{ fontSize: '24px' }} />
      </Popover>


      <Dropdown overlay={userMenu} trigger={['click']}>
        <Avatar size="large" icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
      </Dropdown>
    
      
    </div>
  );
};

export default AppBar;
