import { Collapse, MenuProps, Dropdown, Button, List } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CollapsableComponentProps {
  column: string[]; // Column headers
  data: Array<Record<string, any>>; // Data to display
  menu: (item: any) => MenuProps; // Dropdown menu generator
}

function CollapsableComponent(props: CollapsableComponentProps) {
  const { column, data, menu } = props; // Destructuring the props here
  const navigate = useNavigate();
  const columnKeyMap: Record<string, string> = {
    Team: 'teamName',
    Members: 'members',
    Date: 'dateCreated',
    Status: 'status',
  };
  // Create the collapseItems array based on the data
  const collapseItems = data.map((item, index) => ({
    key: item.teamId || item.userId || index, // Ensure unique key
    label: (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${props.column.length}, 1fr) 50px`, // Added a fixed width for the button column
          alignItems: 'center',
        }}
      >
        {props.column.map((col, idx) => {
          const value = item[columnKeyMap[col]];
          return (
            <span key={idx}>
              {Array.isArray(value)
                ? `${value.length} `
                : value !== undefined
                  ? value
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
                <span>{document.name}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    type="primary"
                    shape="round"
                    style={{
                      backgroundColor: '#335DFF',
                      border: 'none',
                      marginTop: 10,
                    }}
                    onClick={() =>
                      navigate(`/users`, { state: { user: document } })
                    }
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
        ) : (
          <></>
        )}
      </div>
    ),
  }));

  return (
    <div style={{ width: '100%', paddingBottom: 8 }}>
      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${props.column.length}, 1fr) 50px`, // Same fixed width for the button column
          fontWeight: 'bold',
          borderBottom: '1px solid #ccc',
          paddingBottom: 8,
        }}
      >
        {props.column.map((col, index) => (
          <span key={index}>{col}</span>
        ))}
      </div>

      {/* Collapsible List */}
      <Collapse bordered={false}>
        {collapseItems.map((item) => (
          <Collapse.Panel key={item.key} header={item.label}>
            {item.children}
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
}

export default CollapsableComponent;
