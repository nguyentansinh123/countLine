import { Button, Card, Input, Select, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import systemUsersConst from '../const/systemUserConst';
import clientUserConst from '../const/clientUserConst';

function EditUsers() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const privilegesData = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Users', label: 'Users' },
    { value: 'NDAs', label: 'NDAs' },
    { value: 'Projects', label: 'Projects' },
    { value: 'Teams', label: 'Teams' },
  ];

  const [category, setCategory] = useState<'Client' | 'System' | ''>('');
  const [tabKey, setTabKey] = useState<string>('1');
  const [Name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [privileges, setPrivileges] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      const clientUser = clientUserConst.find((user) => user.userId === userId);
      const systemUser = systemUsersConst.find(
        (user) => user.userId === userId
      );

      if (clientUser) {
        setCategory('Client');
        setTabKey('1');
        setName(clientUser.name);
        setMail(clientUser.mail);
        setType(clientUser.type || '');
        setDate(clientUser.date || new Date().toISOString().split('T')[0]);
        setPrivileges([]); // Reset privileges for client user
      } else if (systemUser) {
        setCategory('System');
        setTabKey('2');
        setName(systemUser.name);
        setMail(systemUser.mail);
        setType(systemUser.type || '');
        setDate(systemUser.date || new Date().toISOString().split('T')[0]);
        const privList = systemUser.privileges?.map((p) => p.name) || [];
        setPrivileges(privList);
      }
    }
  }, [userId]);

  const handleClientUserSave = () => {
    if (!Name || !mail || !type) {
      alert('Please fill in all fields');
      return;
    }

    if (userId && category === 'Client') {
      const index = clientUserConst.findIndex((user) => user.userId === userId);
      if (index !== -1) {
        clientUserConst[index] = {
          ...clientUserConst[index],
          name: Name,
          mail,
          type,
          date,
        };
      }
    } else {
      const newUserId = (
        parseInt(clientUserConst[clientUserConst.length - 1]?.userId || '0') + 1
      ).toString();
      const newUser = {
        mail,
        userId: newUserId,
        name: Name,
        type,
        category: 'Client',
        date,
        documents: [],
      };
      clientUserConst.push(newUser);
    }
    navigate('/users');
  };

  const handleSystemUserSave = () => {
    if (!Name || !mail || !type || privileges.length === 0) {
      alert('Please fill in all fields');
      return;
    }

    if (userId && category === 'System') {
      const index = systemUsersConst.findIndex(
        (user) => user.userId === userId
      );
      if (index !== -1) {
        systemUsersConst[index] = {
          ...systemUsersConst[index],
          name: Name,
          mail,
          type,
          date,
          privileges: privileges.map((p) => ({ name: p })),
        };
        alert('System user updated successfully');
      }
    } else {
      const newUserId = (
        parseInt(systemUsersConst[systemUsersConst.length - 1]?.userId || '0') +
        1
      ).toString();
      const newUser = {
        mail,
        userId: newUserId,
        name: Name,
        type,
        category: 'System',
        date,
        privileges: privileges.map((p) => ({ name: p })),
      };
      systemUsersConst.push(newUser);
      alert('System user added successfully');
    }

    navigate('/users');
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Client User',
      children: (
        <div
          style={{
            padding: 10,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          <div>
            <h3>Name</h3>
            <Input
              value={Name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div>
            <h3>Mail</h3>
            <Input
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="Enter mail"
            />
          </div>
          <div>
            <h3>Type</h3>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Type"
            />
          </div>
          <div />
          <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
            <Button
              onClick={() => navigate('/users')}
              style={{ border: '1px solid #156CC9', color: '#156CC9' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClientUserSave}
              style={{ backgroundColor: '#156CC9', color: '#fff' }}
            >
              {userId && category === 'Client' ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'System User',
      children: (
        <div
          style={{
            padding: 10,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          <div>
            <h3>Name</h3>
            <Input
              value={Name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div>
            <h3>Mail</h3>
            <Input
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="Enter mail"
            />
          </div>
          <div>
            <h3>Type</h3>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Type"
            />
          </div>
          <div>
            <h3>Privileges</h3>
            <Select
              mode="multiple"
              value={privileges}
              onChange={(value) => setPrivileges(value)}
              placeholder="Select privileges"
              style={{ width: '100%' }}
            >
              {privilegesData.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
            <Button
              onClick={() => navigate('/users')}
              style={{ border: '1px solid #156CC9', color: '#156CC9' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSystemUserSave}
              style={{ backgroundColor: '#156CC9', color: '#fff' }}
            >
              {userId && category === 'System' ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card
      title={userId ? 'Edit User' : 'Add User'}
      style={{
        maxWidth: 1350,
        margin: '0 auto',
        border: '1px solid #156CC9',
        marginTop: 10,
      }}
    >
      {userId ? (
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
        // Show both tabs when adding new user
        <Tabs defaultActiveKey="1" items={items} />
      )}
    </Card>
  );
}

export default EditUsers;
