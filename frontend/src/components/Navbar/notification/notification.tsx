import React, { useState } from 'react';
import { List, Avatar, Typography, Button, Divider, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface NotificationItem {
  id: number | string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  type?: string;
  data?: any;
}

interface NotificationProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  loading?: boolean;
}

// Add scrollbar CSS here
const scrollBarStyles = `
  /* Firefox */
  .scroll-container {
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }
  /* WebKit */
  .scroll-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .scroll-container::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
    border: 2px solid #f1f1f1;
  }
  .scroll-container::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;

const Notification: React.FC<NotificationProps> = ({ 
  notifications, 
  onMarkAllRead,
  loading = false
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [hoveredItemId, setHoveredItemId] = useState<number | string | null>(null);

  return (
    <>
      {/* inject scrollbar styles */}
      <style>{scrollBarStyles}</style>

      <div style={{ width: '320px', maxHeight: '450px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Title level={5} style={{ margin: 0 }}>
            Notifications {unreadCount > 0 && 
              <Text type="secondary" style={{ fontSize: '14px', fontWeight: 'normal' }}>
                ({unreadCount} new)
              </Text>
            }
          </Title>
          {unreadCount > 0 && (
            <Button 
              type="text" 
              size="small" 
              onClick={onMarkAllRead}
              icon={<CheckOutlined />}
              style={{ padding: '4px 8px' }}
            >
              Mark all read
            </Button>
          )}
        </div>
        
        {/* scrollable notification list */}
        <div 
          className="scroll-container"
          style={{ 
            maxHeight: '320px', 
            overflowY: 'auto',
            padding: '4px 0'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <Spin size="default" />
            </div>
          ) : notifications.length > 0 ? (
            <List
              dataSource={notifications}
              renderItem={item => (
                <List.Item 
                  style={{ 
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    marginBottom: '4px',
                    borderLeft: item.isRead ? 'none' : '3px solid #1890ff',
                    backgroundColor: hoveredItemId === item.id 
                      ? 'rgba(0, 0, 0, 0.03)' 
                      : item.isRead 
                        ? 'transparent' 
                        : 'rgba(24, 144, 255, 0.05)'
                  }}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={38}
                        src={item.avatar} 
                        icon={!item.avatar && <BellOutlined />} 
                        style={{ 
                          backgroundColor: '#1890ff',
                          filter: item.isRead ? 'grayscale(0.7)' : 'none'
                        }}
                      />
                    }
                    title={
                      <Text 
                        style={{ 
                          fontWeight: item.isRead ? 'normal' : 'bold',
                          marginBottom: '4px',
                          display: 'block'
                        }}
                      >
                        {item.message}
                      </Text>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.time}
                      </Text>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No notifications' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <BellOutlined style={{ fontSize: '28px', color: '#d9d9d9' }} />
              <p style={{ marginTop: '16px', color: '#8c8c8c' }}>No new notifications</p>
            </div>
          )}
        </div>
        
        <Divider style={{ margin: '8px 0' }} />
        
        <div style={{ 
          textAlign: 'center', 
          padding: '8px 16px'
        }}>
          <Button type="link" size="small">
            View all notifications
          </Button>
        </div>
      </div>
    </>
  );
};

export default Notification;
