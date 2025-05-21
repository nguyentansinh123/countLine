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
  Modal,
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const showDeleteModal = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOk = async () => {
    try {
      await axios.delete(
        `http://localhost:5001/api/users/delete-user/${userToDelete.user_id}`,
        {
          withCredentials: true,
        }
      );

      if (userToDelete.role === 'admin') {
        setSystemUsers((prev) =>
          prev.filter((u) => u.user_id !== userToDelete.user_id)
        );
      } else {
        setClientUsers((prev) =>
          prev.filter((u) => u.user_id !== userToDelete.user_id)
        );
      }

      messageApi.success(`User "${userToDelete.name}" deleted successfully.`);
    } catch (err) {
      console.error('Error deleting user:', err);
      messageApi.error('Failed to delete user');
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

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
        const clients = allUsers.filter((u) => u.role !== 'admin');
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

  // delete confirmation modal
  // const deleteUserModal = (
  //   <Modal
  //     title="Confirm Deletion"
  //     open={deleteUserModalVisible}
  //     onCancel={() => {
  //       setDeleteUserModalVisible(false);
  //       setUserToDelete(null);
  //     }}
  //     onOk={async () => {
  //       try {
  //         await axios.delete(
  //           `http://localhost:5001/api/users/delete-user/${userToDelete.user_id}`,
  //           {
  //             withCredentials: true,
  //           }
  //         );

  //         if (userToDelete.role === 'admin') {
  //           setSystemUsers((prev) =>
  //             prev.filter((u) => u.user_id !== userToDelete.user_id)
  //           );
  //         } else {
  //           setClientUsers((prev) =>
  //             prev.filter((u) => u.user_id !== userToDelete.user_id)
  //           );
  //         }

  //         messageApi.success(
  //           `User "${userToDelete.name}" deleted successfully.`
  //         );
  //       } catch (err) {
  //         console.error('Error deleting user:', err);
  //         messageApi.error('Failed to delete user');
  //       } finally {
  //         setDeleteUserModalVisible(false);
  //         setUserToDelete(null);
  //       }
  //     }}
  //     okText="Delete"
  //     okType="danger"
  //     cancelText="Cancel"
  //   >
  //     <p>
  //       Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
  //       This action cannot be undone.
  //     </p>
  //   </Modal>
  // );

  // Menu click handler
  const handleMenuClick = async (
    key: string,
    user: any,
    type: 'client' | 'system'
  ) => {
    if (key === 'edit') {
      navigate(`/edituser/${user.user_id}`);
    } else if (key === 'delete') {
      showDeleteModal(user);
    } else if (key === 'viewHistory') {
      navigate(`/viewhistory/${user.user_id}`);
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
      {contextHolder}
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
              column={['Name', 'Role', 'Documents', 'Date']}
              data={clientUsers}
              height='60vh'
              menu={(item) => renderUserMenu(item, 'client')}
              onDocumentRemoved={(userId, documentId) => {
                console.log(userId, documentId);

                setClientUsers((prev) =>
                  prev.map((user) =>
                    user.user_id === userId
                      ? {
                          ...user,
                          documents: (user.documents as any[]).filter(
                            (doc) => doc.documentId !== documentId
                          ),
                        }
                      : user
                  )
                );
              }}
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
        <Modal
          title="Confirm Deletion"
          open={isDeleteModalOpen}
          onOk={handleDeleteOk}
          onCancel={handleDeleteCancel}
          okText="Delete"
          okType="danger"
          cancelText="Cancel"
        >
          <p>
            Are you sure you want to delete{' '}
            <strong>{userToDelete?.name}</strong>?<br />
            This action cannot be undone.
          </p>
        </Modal>
      </GeneralLayout>
    </>
  );
}

export default UserPage;
