import { Button, Card, Input, Select, Tabs, TabsProps } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import systemUsersConst from '../const/systemUserConst';
import clientUserConst from '../const/clientUserConst';
import UserForm from './contents/UserForm';

function AddUser() {
  const privilegesData = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Users', label: 'Users' },
    { value: 'NDAs', label: 'NDAs' },
    { value: 'Projects', label: 'Projects' },
    { value: 'Teams', label: 'Teams' },
  ];

  const navigate = useNavigate();
  let currentPage = '';

  const onChange = (key: string) => {
    if (key === '1') {
      currentPage = 'Client User';
    } else if (key === '2') {
      currentPage = 'System User';
    }
  };

  const [Name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Update privileges to be an array of strings
  const [privileges, setPrivileges] = useState<string[]>([]);

  const handleClientAddUser = () => {
    if (!Name || !mail || !type) {
      alert('Please fill in all fields');
      return;
    }
    const newUserId = (
      parseInt(clientUserConst[systemUsersConst.length - 1].userId) + 1
    ).toString();
    const newUser = {
      mail: mail,
      userId: newUserId,
      name: Name,
      type: type,
      category: 'Client',
      date: date,
      documents: [],
    };
    clientUserConst.push(newUser);
    console.log('New Client User:', newUser);
    navigate('/users');
  };

  const handleSystemAddUser = () => {
    if (!Name || !mail || !type || privileges.length === 0) {
      alert('Please fill in all fields');
      return;
    }
    const newUserId = (
      parseInt(systemUsersConst[systemUsersConst.length - 1].userId) + 1
    ).toString();
    const newUser = {
      mail: mail,
      userId: newUserId,
      name: Name,
      type: type,
      category: 'System',
      date: date,
      privileges: privileges.map((privilege) => ({ name: privilege })),
    };
    systemUsersConst.push(newUser);

    console.log('New System User:', newUser);
    navigate('/users');
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Client User',
      children: (
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
        />
      ),
    },
    {
      key: '2',
      label: 'System User',
      children: (
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
          onPrivilegesChange={(value) => setPrivileges(value)} // Pass the updated privileges array
          onSave={handleSystemAddUser}
          onCancel={() => navigate('/users')}
        />
      ),
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
