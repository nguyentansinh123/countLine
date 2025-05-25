import React, { useState, useEffect } from 'react';
import { Card, Tabs, message, type TabsProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserForm from './contents/UserForm';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';


interface Privilege {
  value: string;  
  label: string;  

}

function AddUser() {
  const navigate = useNavigate();
  const [Name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [type, setType] = useState('');
  const [privileges, setPrivileges] = useState<string[]>([]);
  
 
  const [privilegesData] = useState<Privilege[]>([
    { value: 'view', label: 'View' },
    { value: 'edit', label: 'Edit' },
    { value: 'delete', label: 'Delete' },
    { value: 'admin', label: 'Admin' }
  ]);

  const onChange = () => {
    setName('');
    setMail('');
    setType('');
    setPrivileges([]);
  };

  const handleClientAddUser = async () => {
    if (!Name || !mail || !type) {
      message.error('Please fill in all fields');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: Name,
          email: mail,
          role: 'client',
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        message.error(result.message || 'Failed to create client user');
        return;
      }
      message.success('Client user created successfully');
      navigate('/users');
    } catch (err) {
      console.error(err);
      message.error('Error creating client user');
    }
  };

  const handleSystemAddUser = async () => {
    if (!Name || !mail || !type || privileges.length === 0) {
      message.error('Please fill in all fields');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: Name,
          email: mail,
          role: 'system',
          privileges,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        message.error(result.message || 'Failed to create system user');
        return;
      }
      message.success('System user created successfully');
      navigate('/users');
    } catch (err) {
      console.error(err);
      message.error('Error creating system user');
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Client User',
      children:
        <UserForm
          name={Name}
          mail={mail}
          type={type}
          category="Client"
          userId=""
          onNameChange={(value) => setName(value)}
          onMailChange={(value) => setMail(value)}
          onTypeChange={(value) => setType(value)}
          onSave={handleClientAddUser}
          onCancel={() => navigate('/users')}
        />,
    },
    {
      key: '2',
      label: 'System User',
      children:
        <UserForm
          name={Name}
          mail={mail}
          type={type}
          privileges={privileges}
          privilegesData={privilegesData}
          category="System"
          userId=""
          onNameChange={(value) => setName(value)}
          onMailChange={(value) => setMail(value)}
          onTypeChange={(value) => setType(value)}
          onPrivilegesChange={(value) => setPrivileges(value)}
          onSave={handleSystemAddUser}
          onCancel={() => navigate('/users')}
        />,
    },
  ];

  return (
    <Card
      title="Add User"
      style={{
        width: '100%',
        maxWidth: 1350,
        margin: '0 auto',
        border: 'solid 1px #156CC9',
        marginTop: 10,
      }}
    >
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </Card>
  );
}

export default AddUser;
