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
import { useState } from 'react';

interface CollapsableComponentProps {
  column: string[]; // Column headers
  data: Array<Record<string, any>>; // Data to display
  menu: (item: any) => MenuProps; // Dropdown menu generator
  onDocumentRemoved?: (userId: string, documentId: string) => void;
  height?:string;
}

function CollapsableComponent(props: CollapsableComponentProps) {
  const { column, height,data, menu } = props; // Destructuring the props here
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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  console.log(data);

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Create the collapseItems array based on the data
  const collapseItems = data.map((item, index) => ({
    key: item.teamId || item.user_id || index, // Ensure unique key
    label: (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.5fr 50px', // Added a fixed width for the button column
          alignItems: 'center',
        }}
      >
        {props.column.map((col, idx) => {
          const keys = columnKeyMap[col] || [col];
          const resolvedKey = keys.find((key) => item[key] !== undefined); // pick first valid key

          const value = resolvedKey ? item[resolvedKey] : undefined;

          return (
            <span key={idx}>
              {Array.isArray(value)
                ? `${value.length}`
                : value !== undefined
                  ? resolvedKey?.toLowerCase().includes('date') ||
                    resolvedKey === 'created_at'
                    ? formatDate(value)
                    : value
                  : 'N/A'}
            </span>
          );
        })}
        {/* Dropdown menu button */}
        <Dropdown menu={menu(item)} placement="bottomRight">
          <Button style={{ color: '#156CC9', border: 'solid 1px #156CC9' }}>
            ...
          </Button>
        </Dropdown>
      </div>
    ),
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Check if it's a team or user and render relevant information */}
        {item.members ? (
          <>
            <div>
              <div>{item.description}</div>
              <List>
                {item.members.map((member: any, index: number) => (
                  <List.Item
                    key={member.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{member.name}</span>
                    <Button
                      onClick={() => console.log('Navigate to user details')} // Update navigation logic here
                    >
                      Details
                    </Button>
                  </List.Item>
                ))}
              </List>
            </div>
          </>
        ) : (
          <></>
        )}

        {/* Check if there are documents and render them */}
        {item.documents ? (
          <List>
            {console.log(item)}
            {item.documents.map((document: any, index: number) => (
              <List.Item
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span>{document.fileName}</span>
                <span>{document.documentType}</span>
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
          <></>
        )}
      </div>
    ),
  }));

  return (
    <div style={{ width: '100%', paddingBottom: 8 }}>
      {/* Table Header */}
      {contextHolder}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 2fr 1fr 1fr 1.5fr 50px', // Same fixed width for the button column
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

      {/* Collapsible List */}
      <Collapse bordered={false}  style={{overflowY:'auto',height:height}}>
        {collapseItems.map((item) => (
          <Collapse.Panel key={item.key} header={item.label}>
            {item.children}
          </Collapse.Panel>
        ))}
      </Collapse>
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
