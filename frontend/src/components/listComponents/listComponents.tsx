import React from 'react';
import { List, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';

interface ListComponentsProps {
  column: string[];
  data: any[];
  menu: (item: any) => MenuProps;
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

const safeToString = (value: any): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((v) => safeToString(v)).join(', ');
    }
    if (value && 'S' in value) {
      return value.S || 'N/A';
    }
    try {
      return JSON.stringify(value);
    } catch (e) {
      return 'Complex Object';
    }
  }

  return String(value);
};

const getStatusColor = (status: any): string => {
  const statusValue =
    typeof status === 'object' && status !== null && 'S' in status
      ? status.S
      : String(status);

  switch (statusValue) {
    case 'Finished':
      return 'green';
    case 'In Progress':
      return 'orange';
    case 'Drafted':
      return 'blue';
    case 'Cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

const ListComponents: React.FC<ListComponentsProps> = (props) => {
  const gridTemplateColumns = `repeat(${props.column.length}, 1fr) 80px`;

  return (
    <div className="list-components">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns,
          padding: '12px 16px',
          background: '#fafafa',
          borderBottom: '1px solid #f0f0f0',
          fontWeight: 'bold',
        }}
      >
        {props.column.map((col, index) => (
          <div key={`header-${index}`}>{col}</div>
        ))}
        <div>Action</div>
      </div>

      <List
        dataSource={props.data}
        renderItem={(item, index) => {
          return (
            <List.Item
              key={item.projectId || `item-${index}`}
              style={{
                display: 'grid',
                gridTemplateColumns,
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              {props.column.map((col, colIndex) => {
                const lowerCol = col.toLowerCase();

                const fieldKey =
                  lowerCol === 'project'
                    ? 'project'
                    : lowerCol === 'team'
                      ? 'team'
                      : lowerCol === 'date'
                        ? 'date'
                        : lowerCol === 'status'
                          ? 'status'
                          : lowerCol;

                // for user the field name is created_at, so we need to check that
                // and use created_at instead of date
                let value = '';
                if (item[fieldKey] === undefined && item['created_at']) {
                  value = item['created_at'];
                } else {
                  value = item[fieldKey];
                }

                if (lowerCol === 'status') {
                  return (
                    <div key={`item-${index}-${colIndex}`}>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: getStatusColor(value),
                        }}
                      >
                        {safeToString(value)}
                      </span>
                    </div>
                  );
                }

                if (lowerCol === 'date') {
                  return (
                    <div key={`item-${index}-${colIndex}`}>
                      {typeof value === 'string'
                        ? formatDate(value)
                        : safeToString(value)}
                    </div>
                  );
                }

                return (
                  <div key={`item-${index}-${colIndex}`}>
                    {safeToString(value)}
                  </div>
                );
              })}

              {/* Action button */}
              <div>
                <Dropdown
                  menu={props.menu(item)}
                  placement="bottomRight"
                  trigger={['click']}
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
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default ListComponents;
