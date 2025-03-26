import React, { useState } from 'react';
import {
  Card,
  Button,
  List,
  Dropdown,
  Tabs,
  Empty,
  Collapse,
  Menu,
  message,
  MenuProps,
} from 'antd';

import clientUserConst from './const/clientUserConst';
import systemUsersConst from './const/systemUserConst';
import { useNavigate } from 'react-router-dom';
import ListComponents from '../../components/listComponents/listComponents';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';

function UserPage() {
  const [activeTab, setActiveTab] = useState('Client');
  const [clientUsers, setClientUsers] = useState(clientUserConst);
  const [systemUsers, setSystemUsers] = useState(systemUsersConst);

  const navigate = useNavigate();
  const { TabPane } = Tabs;
  const { Panel } = Collapse;

  // Menu click handler
  const handleMenuClick = (
    key: string,
    user: any,
    type: 'client' | 'system'
  ) => {
    if (key === 'edit') {
      navigate(`/edituser/${user.userId}`);
    } else if (key === 'delete') {
      if (type === 'client') {
        setClientUsers((prev) => prev.filter((u) => u.userId !== user.userId));
        message.success(`Client user "${user.name}" deleted.`);
      } else {
        setSystemUsers((prev) => prev.filter((u) => u.userId !== user.userId));
        message.success(`System user "${user.name}" deleted.`);
        console.log('System user deleted:', user);
      }
    }
  };

  // Dropdown menu generator
  const renderUserMenu = (user: any, type: 'client' | 'system'): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: 'Edit',
        onClick: () => handleMenuClick('edit', user, type),
      },
      {
        key: 'delete',
        label: 'Delete',
        onClick: () => handleMenuClick('delete', user, type),
      },
    ],
  });

  return (
    <>
<GeneralLayout title='Users' buttonLabel='Add Users' navigateLocation='/adduser'>
      <Tabs
        defaultActiveKey="Client"
        onChange={setActiveTab}
        style={{ margin: '0 8px' }}
      >
        {/* Client Users Tab */}
        <TabPane tab="Client Users" key="Client">
          {clientUsers.length > 0 ? (
            <Card
              style={{
                width: '98%',
                maxWidth: '98%',
                height: '70vh',
                border: 'solid 1px',
                marginTop: 0,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr',
                  fontWeight: 'bold',
                  paddingBottom: 8,
                  borderBottom: '1px solid #ccc',
                }}
              >
                <span>Username</span>
                <span>Documents</span>
                <span>Type</span>
                <span>Date</span>
              </div>

              <div
                style={{
                  height: '60vh',
                  padding: 5,
                  overflowY: 'auto',
                  paddingRight: 10,
                }}
              >
                <Collapse
                  defaultActiveKey={[]}
                  expandIcon={() => null}
                  bordered={false}
                >
                  {clientUsers.map((item) => (
                    <Panel
                      header={
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr 0.1fr',
                            flex: 1,
                          }}
                        >
                          <span>
                            <strong>{item.name}</strong>
                          </span>
                          <span>
                            {item.documents ? item.documents.length : 0}
                          </span>
                          <span>{item.type || 'N/A'}</span>
                          <span>{item.date || 'N/A'}</span>
                          <Dropdown
                            menu={renderUserMenu(item, 'client')}
                            placement="bottomRight"
                          >
                            <Button
                              style={{
                                color: '#156CC9',
                                border: 'solid 1px #156CC9',
                              }}
                            >
                              ...
                            </Button>
                          </Dropdown>
                        </div>
                      }
                      key={item.userId}
                    >
                      <div
                        style={{
                          marginTop: 20,
                          display: 'grid',
                          gridTemplateColumns: '5fr',
                        }}
                      >
                        <List>
                          {item.documents.map((doc, index) => (
                            <List.Item
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>{doc.name}</span>
                              <div style={{ display: 'flex', gap: 10 }}>
                                <Button
                                  type="primary"
                                  shape="round"
                                  style={{
                                    backgroundColor: '#335DFF',
                                    border: 'none',
                                    marginTop: 10,
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  shape="round"
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: 'solid 1px #335DFF',
                                    marginTop: 10,
                                    color: '#335DFF',
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </List.Item>
                          ))}
                        </List>
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              </div>
            </Card>
          ) : (
            <Empty description="No matching users found" />
          )}
        </TabPane>

        {/* System Users Tab */}
        <TabPane tab="System Users" key="System">
          <ListComponents column={['Name', 'Privileges', 'Date']} data={systemUsers} menu={(item: any) => renderUserMenu(item, 'system')} />
        </TabPane>
      </Tabs>
      </GeneralLayout>
    </>
  );
}

export default UserPage;
