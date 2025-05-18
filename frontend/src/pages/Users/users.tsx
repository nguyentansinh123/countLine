import React, { useState, useEffect } from 'react';
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

import { data, useNavigate } from 'react-router-dom';
import clientUserConst from './const/clientUserConst';
import ListComponents from '../../components/listComponents/listComponents';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import CollapsableComponent from '../../components/CollapsableComponent/CollapsableComponent';
import teams from '../Teams/teams';
import axios from 'axios';

function UserPage() {
  type User = {
    created_at: string;
    verifyOTP: string;
    resetOTPExpireAt: number;
    isAccountVerified: boolean;
    email: string;
    name: string;
    documents: { name: string }[];
    user_id: string;
    recentSearches: string[];
    teams: string[];
    role: string; // or: 'user' | 'admin' | 'client' if known
    profilePicture: string;
    resetOTP: string;
    verifyOTPExpiredAt: number;
  };

  const [activeTab, setActiveTab] = useState('Client');
  const [clientUsers, setClientUsers] = useState<User[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { TabPane } = Tabs;
  const { Panel } = Collapse;

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5001/api/users/getAllUser',
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const allUsers = res.data.data as User[];
        const clients = allUsers.filter((u) => u.role === 'user');
        const admins = allUsers.filter((u) => u.role === 'admin');
        setClientUsers(clients);
        setSystemUsers(admins);
        console.log(res.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
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
        setClientUsers((prev) =>
          prev.filter((u) => u.user_id !== user.user_id)
        );
        message.success(`Client user "${user.name}" deleted.`);
      } else {
        setSystemUsers((prev) =>
          prev.filter((u) => u.user_id !== user.user_id)
        );
        message.success(`System user "${user.name}" deleted.`);
        console.log('System user deleted:', user);
      }
    } else if (key === 'viewHistory') {
      navigate(`/viewhistory/${user.userId}`);
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
      {
        key: 'viewHistory',
        label: 'View History',
        onClick: () => handleMenuClick('viewHistory', user, type),
      },
    ],
  });

  // const collapseItem = clientUsers.map((item) => ({
  //   key: item.userId,
  //   label: (
  //     <div
  //       style={{
  //         display: 'grid',
  //         gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr 0.1fr',
  //         flex: 1,
  //         alignItems: 'center',
  //       }}
  //     >
  //       <span>
  //         <strong>{item.name}</strong>
  //       </span>
  //       <span>{item.documents ? item.documents.length : 0}</span>
  //       <span>{item.category}</span>
  //       <span>{item.date || 'N/A'}</span>

  //       <Dropdown
  //         menu={renderUserMenu(item.userId, 'client')}
  //         placement="bottomRight"
  //       >
  //         <Button style={{ color: '#156CC9', border: 'solid 1px #156CC9' }}>
  //           ...
  //         </Button>
  //       </Dropdown>
  //     </div>
  //   ),
  //   children: (
  //     <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
  //       <List>
  //         {item.documents?.map((member, index) => (
  //           <List.Item
  //             key={index}
  //             style={{
  //               display: 'flex',
  //               justifyContent: 'space-between',
  //               alignItems: 'center',
  //               width: '100%',
  //             }}
  //           >
  //             <span>{member.name}</span>
  //             <div style={{ display: 'flex', gap: 10 }}>
  //               <Button
  //                 type="primary"
  //                 shape="round"
  //                 style={{
  //                   backgroundColor: '#335DFF',
  //                   border: 'none',
  //                   marginTop: 10,
  //                 }}
  //                 onClick={() =>
  //                   navigate(`/users`, { state: { user: member } })
  //                 }
  //               >
  //                 View
  //               </Button>
  //               <Button
  //                 shape="round"
  //                 style={{
  //                   backgroundColor: 'transparent',
  //                   border: 'solid 1px #335DFF',
  //                   marginTop: 10,
  //                   color: '#335DFF',
  //                 }}
  //               >
  //                 Remove
  //               </Button>
  //             </div>
  //           </List.Item>
  //         ))}
  //       </List>
  //     </div>
  //   ),
  // }));

  return (
    <>
      <GeneralLayout
        title="Users"
        buttonLabel="Add Users"
        navigateLocation="/adduser"
      >
        <Tabs
          defaultActiveKey="Client"
          onChange={setActiveTab}
          style={{ margin: '0 8px' }}
        >
          {/* Client Users Tab */}
          <TabPane tab="Client Users" key="Client">
            <CollapsableComponent
              column={['Name', 'Documents', 'Date']}
              data={clientUsers}
              menu={(item) => renderUserMenu(item.userId, 'client')}
            />
          </TabPane>

          {/* System Users Tab */}
          <TabPane tab="System Users" key="System">
            <ListComponents
              column={['Name', 'Role', 'Date']}
              data={systemUsers}
              menu={(item: any) => renderUserMenu(item, 'system')}
            />
          </TabPane>
        </Tabs>
      </GeneralLayout>
    </>
  );
}

export default UserPage;
