import React from 'react';
import { List, Dropdown, Button, MenuProps } from 'antd';

interface ListComponentsProps {
  column: string[];
  data: Array<Record<string, any>>;
  menu?: (item: any) => MenuProps; // Made optional
}

function ListComponents(props: ListComponentsProps) {
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Column Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${props.column.length}, 1fr)`,
          fontWeight: 'bold',
          paddingBottom: 8,
          borderBottom: '1px solid #ccc',
        }}
      >
        {props.column.map((col, index) => (
          <span key={index} style={{ textAlign: 'start' }}>
            {col}
          </span>
        ))}
      </div>

      {/* Data List */}
      <div
        style={{
          height: '70vh',
          padding: 5,
          overflowY: 'auto',
          paddingRight: 10,
        }}
      >
        <List
          dataSource={props.data}
          renderItem={(item, index) => (
            <List.Item
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${props.column.length}, 1fr)${props.menu ? ' 40px' : ''}`,
                width: '100%',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {props.column.map((col, colIndex) => {
                const lowerCol = col.toLowerCase();
                const fieldKey = lowerCol === 'date' ? 'created_at' : lowerCol;

                return (
                  <span
                    key={`${index}-${colIndex}`}
                    style={{ textAlign: 'start' }}
                  >
                    {lowerCol === 'role' ? (
                      Array.isArray(item[fieldKey]) ? (
                        item[fieldKey].map((priv: any) => priv.name).join(', ')
                      ) : (
                        item[fieldKey]
                      )
                    ) : lowerCol === 'status' ? (
                      <span
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color:
                            item.status === 'Finished'
                              ? 'green'
                              : item.status === 'In Progress'
                                ? 'orange'
                                : 'red',
                        }}
                      >
                        {item[fieldKey]}
                      </span>
                    ) : lowerCol === 'date' && item[fieldKey] ? (
                      formatDate(item[fieldKey])
                    ) : (
                      item[fieldKey]
                    )}
                  </span>
                );
              })}

              {/* Optional Dropdown Menu */}
              {props.menu && (
                <Dropdown menu={props.menu(item)} placement="bottomRight">
                  <Button
                    style={{
                      color: '#156CC9',
                      border: 'solid 1px #156CC9',
                      alignSelf: 'center',
                    }}
                  >
                    ...
                  </Button>
                </Dropdown>
              )}
            </List.Item>
          )}
        />
      </div>
    </>
  );
}

export default ListComponents;
