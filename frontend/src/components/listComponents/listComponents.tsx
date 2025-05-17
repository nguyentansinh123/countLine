import React from 'react';
import { List, Dropdown, Button, MenuProps } from 'antd';

interface ListComponentsProps {
  column: string[];
  data: Array<Record<string, any>>;
  menu?: (item: any) => MenuProps; // Made optional
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
              {props.column.map((col, colIndex) => (
                <span key={`${index}-${colIndex}`} style={{ textAlign: 'start' }}>
                  {col.toLowerCase() === 'privileges' ? (
                    item[col.toLowerCase()]?.map((priv: any) => priv.name).join(', ')
                  ) : col.toLowerCase() === 'status' ? (
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
                      {item[col.toLowerCase()]}
                    </span>
                  ) : (
                    item[col.toLowerCase()]
                  )}
                </span>
              ))}

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
