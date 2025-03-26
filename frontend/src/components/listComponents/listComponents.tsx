import React from 'react';
import { List, Dropdown, Button, Menu, MenuProps } from 'antd';

interface ListComponentsProps {
  column: string[];
  data: Array<Record<string, any>>;
  menu: (item: any) => MenuProps; // Accepting 'item' instead of just 'id'
}

function ListComponents(props: ListComponentsProps) {
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
          height: '65vh',
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
                gridTemplateColumns: `repeat(${props.column.length}, 1fr) 40px`,
                width: '100%',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {/* Render Columns */}
              {props.column.map((col, colIndex) => {
                return (
                  <span key={`${index}-${colIndex}`} style={{ textAlign: 'start' }}>
                    {col.toLowerCase() === 'privileges' ? (
                      <>
                        {item[col.toLowerCase()]?.map((privileges: any) => privileges.name).join(', ')}
                      </>
                    ) : col.toLowerCase() === 'status' ? (
                      
                      <span style={{
                        flex: 1,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color:
                          item.status === 'Finished'
                            ? 'green'
                            : item.status === 'In Progress'
                              ? 'orange'
                              : 'red'}}
                              >{item[col.toLowerCase()]}</span>
                    ) : (
                      item[col.toLowerCase()]
                    )}
                  </span>
                );
              })}
              {/* Dropdown Menu */}
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
            </List.Item>
          )}
        />
      </div>
    </>
  );
}

export default ListComponents;
