import {
  Button,
  Card,
  Input,
  InputNumber,
  Select,
  Tabs,
  TabsProps,
} from 'antd';
import React, { use, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import systemUsersConst from '../const/systemUserConst';
import clientUserConst from '../const/clientUserConst';

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

  const [privileges, setPrivileges] = useState('');

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
    console.log('New System User:', newUser);
    navigate('/users');
  };

  const handleSystemAddUser = () => {
    if (!Name || !mail || !type || !privileges) {
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
      privileges: [{ name: privileges }],
    };
    systemUsersConst.push(newUser);

    console.log('New System User:', newUser);
    navigate('/users');
    return;
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Client User',
      children: (
        <div>
          <div
            style={{
              maxWidth: '100%',
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
                placeholder="Enter  name"
                type="text"
              />
            </div>
            <div>
              <h3>mail</h3>
              <Input
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="Enter mail"
                type="mail"
              />
            </div>
            <div style={{}}>
              <h3> Type</h3>
              <Input
                value={type}
                placeholder="Type"
                onChange={(e) => setType(e.target.value)}
                style={{ width: '100%' }}
              ></Input>
            </div>
            <div></div>
            <div
              style={{
                display: 'flex',
                gap: 20,
                padding: 10,
                marginTop: '30%',
              }}
            >
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  border: 'solid 1px #156CC9',
                  color: '#156CC9',
                  width: 200,
                }}
                onClick={() => navigate('/users')}
              >
                Cancel
              </Button>
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  backgroundColor: '#156CC9',
                  border: 'none',
                  color: 'white',
                  width: 200,
                }}
                onClick={handleClientAddUser}
              >
                Add User
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'System User',
      children: (
        <div>
          <div
            style={{
              maxWidth: '100%',
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
                placeholder="Enter  name"
                type="text"
              />
            </div>
            <div>
              <h3>mail</h3>
              <Input
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="Enter mail"
                type="mail"
              />
            </div>
            <div>
              <h3> Type</h3>
              <Input
                value={type}
                placeholder="Type"
                onChange={(e) => setType(e.target.value)}
                style={{ width: '100%' }}
              ></Input>
            </div>
            <div>
              <h3> Privilges</h3>
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
            <div
              style={{
                display: 'flex',
                gap: 20,
                padding: 10,
                marginTop: '30%',
              }}
            >
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  border: 'solid 1px #156CC9',
                  color: '#156CC9',
                  width: 200,
                }}
                onClick={() => navigate('/users')}
              >
                Cancel
              </Button>
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  backgroundColor: '#156CC9',
                  border: 'none',
                  color: 'white',
                  width: 200,
                }}
                onClick={handleSystemAddUser}
              >
                Add User
              </Button>
            </div>
          </div>
        </div>
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
