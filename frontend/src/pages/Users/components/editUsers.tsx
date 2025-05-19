import { Button, Card, Tabs, TabsProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import UserForm from './contents/UserForm';

function EditUsers() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [category, setCategory] = useState<'Client' | 'System' | ''>('');
  const [tabKey, setTabKey] = useState<string>('1');
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [type, setType] = useState('');
  const [privileges, setPrivileges] = useState<string[]>([]);

  const privilegesData = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Users', label: 'Users' },
    { value: 'NDAs', label: 'NDAs' },
    { value: 'Projects', label: 'Projects' },
    { value: 'Teams', label: 'Teams' },
  ];
  console.log(user_id);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/users/getUserById/${user_id}`,
          {
            withCredentials: true,
          }
        );

        const user = res.data.data;
        console.log(user);

        setName(user.name || '');
        setMail(user.email || '');
        setType(user.role || '');

        // Optional: handle category detection based on role or another indicator
        if (user.role === 'admin') {
          setCategory('System');
          setTabKey('2');
        } else {
          setCategory('Client');
          setTabKey('1');
        }

        const privList = user.privileges?.map((p: any) => p.name) || [];
        setPrivileges(privList);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    if (user_id) fetchUser();
  }, [user_id]);

  const handleSave = async () => {
    if (!name || !mail || !type) {
      messageApi.error('Please fill in all required fields');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5001/api/users/${user_id}`,
        {
          name,
          email: mail,
          role: type,
        },
        { withCredentials: true }
      );

      messageApi.success('User updated successfully');
      setTimeout(() => {
        navigate('/users');
      }, 1000);
    } catch (err) {
      console.error('Update failed:', err);
      messageApi.error('Failed to update user');
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Client User',
      children: (
        <UserForm
          name={name}
          mail={mail}
          type={type}
          category="Client"
          userId={user_id}
          onNameChange={setName}
          onMailChange={setMail}
          onTypeChange={setType}
          onSave={handleSave}
          onCancel={() => navigate('/users')}
        />
      ),
    },
    {
      key: '2',
      label: 'System User',
      children: (
        <UserForm
          name={name}
          mail={mail}
          type={type}
          privileges={privileges}
          privilegesData={privilegesData}
          category="System"
          userId={user_id}
          onNameChange={setName}
          onMailChange={setMail}
          onTypeChange={setType}
          onPrivilegesChange={setPrivileges}
          onSave={handleSave}
          onCancel={() => navigate('/users')}
        />
      ),
    },
  ];

  return (
    <Card
      title={user_id ? 'Edit User' : 'Add User'}
      style={{
        maxWidth: 1350,
        margin: '0 auto',
        border: '1px solid #156CC9',
        marginTop: 10,
      }}
    >
      {contextHolder}
      {user_id ? (
        category === 'System' ? (
          <Tabs
            activeKey="2"
            items={items.filter((item) => item.key === '2')}
          />
        ) : (
          <Tabs
            activeKey="1"
            items={items.filter((item) => item.key === '1')}
          />
        )
      ) : (
        <Tabs defaultActiveKey="1" items={items} />
      )}
    </Card>
  );
}

export default EditUsers;
