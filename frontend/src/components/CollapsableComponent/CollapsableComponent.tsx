import {
  Collapse,
  MenuProps,
  Dropdown,
  Button,
  List,
  Modal,
  message,
} from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useFormItemStatus from 'antd/es/form/hooks/useFormItemStatus';
import Item from 'antd/es/list/Item';

interface CollapsableComponentProps {
  column: string[]; 
  data: Array<Record<string, any>>; 
  menu: (item: any) => MenuProps; 
  onDocumentRemoved?: (userId: string, documentId: string) => void;
  height?: string;
  loading?: boolean;
}

function CollapsableComponent(props: CollapsableComponentProps) {
  const { column, data, menu, height } = props; 
  console.log(data);
  const [users, setUsers] = useState<any[]>([]);

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const columnKeyMap: Record<string, string[]> = {
    Team: ['teamName'],
    Members: ['members'],
    Date: ['dateCreated', 'created_at'],
    Status: ['status'],
    Name: ['name'],
    Documents: ['documents'],
    Role: ['role'],
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/users/getAllUser', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, []);

  const getUserById = (userId: string) =>
    users.find((user) => user.user_id === userId);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  console.log(data);

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    console.log('daetadsad', date);
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString('en-AU', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  };

  const collapseItems = data.map((item, index) => ({
    key: item.teamId || item.user_id || index, 
    label: (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.5fr 50px', 
          alignItems: 'center',
        }}
      >
        {props.column.map((col, idx) => {
          const keys = columnKeyMap[col] || [col];
          const resolvedKey = keys.find((key) => item[key] !== undefined); 

          const value = resolvedKey ? item[resolvedKey] : undefined;
          console.log('Resolved key:', resolvedKey, 'Value:', value);
          return (
            <span key={idx}>
              {Array.isArray(value)
                ? value.length
                : value !== undefined && value !== null
                  ? value
                  : 'N/A'}
            </span>
          );
        })}
        <Dropdown menu={menu(item)} placement="bottomRight">
          <Button style={{ color: '#156CC9', border: 'solid 1px #156CC9' }}>
            ...
          </Button>
        </Dropdown>
      </div>
    ),
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {item.members ? (
          <>
            <div>
              <div>{item.description}</div>
              <List>
                {item.members.map((memberId: string, index: number) => {
                  const user = getUserById(memberId);
                  return (
                    <List.Item
                      key={memberId || index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr auto',
                        alignItems: 'center',
                        marginTop: 10,
                      }}
                    >
                      <span style={{ fontWeight: 'bold' }}>
                        {user?.name || 'Unknown'}
                      </span>
                      <span
                        style={{ color: 'gray', textTransform: 'capitalize' }}
                      >
                        {user?.role || 'Member'}
                      </span>
                      <Button onClick={() => navigate(`/users/${memberId}`)}>
                        Details
                      </Button>
                    </List.Item>
                  );
                })}
              </List>
            </div>
          </>
        ) : (
          <></>
        )}

        {item.documents && item.documents.length > 0 ? (
          <List>
            {item.documents.map((document: any, index: number) => (
              <List.Item
                key={document.documentId || index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span>
                  {document.filename ||
                    document.fileName ||
                    document.name ||
                    'Unnamed Document'}
                </span>
                <span>{document.documentType || 'General'}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    type="primary"
                    shape="round"
                    style={{
                      backgroundColor: '#335DFF',
                      border: 'none',
                      marginTop: 10,
                    }}
                    onClick={() => {
                      const category = document.documentType || 'General';
                      const formattedCategory = category.replace(/\s+/g, '');
                      navigate(
                        `/viewdocument/${formattedCategory}/${document.documentId}`
                      );
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
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `http://localhost:5001/api/document/deleteHard/${document.documentId}`,
                          {
                            method: 'DELETE',
                            credentials: 'include',
                          }
                        );
                        const result = await response.json();
                        if (result.success) {
                          messageApi.success('Document deleted successfully');
                          if (props.onDocumentRemoved) {
                            props.onDocumentRemoved(
                              item.user_id,
                              document.documentId
                            );
                          }
                        } else {
                          messageApi.error(
                            result.message || 'Failed to delete document'
                          );
                        }
                      } catch (err) {
                        console.error(err);
                        messageApi.error('Error deleting document');
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </List.Item>
            ))}
          </List>
        ) : (
          <div>No documents found for this user</div>
        )}
      </div>
    ),
  }));

  return (
    <div style={{ width: '100%', paddingBottom: 8 }}>
      {contextHolder}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 2fr 1fr 1fr 1.5fr 50px', 
          fontWeight: 'bold',
          borderBottom: '1px solid #ccc',
          paddingBottom: 8,
        }}
      >
        <span />
        {props.column.map((col, index) => (
          <span key={index}>{col}</span>
        ))}
      </div>

      {props.loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading users and documents...
        </div>
      ) : data.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          No data available
        </div>
      ) : (
        <Collapse
          bordered={false}
          style={{ overflowY: 'auto', height: height || '70vh' }}
        >
          {collapseItems.map((item) => (
            <Collapse.Panel key={item.key} header={item.label}>
              {item.children}
            </Collapse.Panel>
          ))}
        </Collapse>
      )}
      {/* can be additionally be done */}
      {/* <Modal
        open={!!previewUrl}
        onCancel={() => setPreviewUrl(null)}
        footer={null}
        width={900}
      >
        <iframe
          src={previewUrl!}
          width="100%"
          height="600px"
          style={{ border: 'none' }}
        />
      </Modal> */}
    </div>
  );
}

export default CollapsableComponent;
