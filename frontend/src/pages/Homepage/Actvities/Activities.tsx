import { Tabs, List, Typography, Badge, Space, Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';
import axios from 'axios';
import dayjs from 'dayjs';
import { HistoryOutlined } from '@ant-design/icons'; // Import the history icon

const { Text, Title } = Typography;

const styles = {
  tabsContainer: {
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    padding: '20px',
  },
  tabLabel: {
    fontSize: '15px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  listContainer: {
    height: '72vh',
    overflowY: 'auto' as const,
    padding: '0 4px',
    marginTop: '10px',
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#d1d5db transparent',
    '&::-webkit-scrollbar': {
      width: '8px',
    } as any,
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    } as any,
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#d1d5db',
      borderRadius: '20px',
      border: '3px solid transparent',
    } as any,
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#9ca3af',
    } as any,
  },
  listItem: {
    borderRadius: '6px',
    margin: '8px 0',
    padding: '16px',
    background: '#f9fafc',
    border: '1px solid #f0f2f5',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    '&:hover': {
      boxShadow: '0 3px 6px rgba(0,0,0,0.06)',
      transform: 'translateY(-1px)',
    } as any,
  },
  username: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1677ff',
  },
  actionText: {
    fontSize: '14px',
    color: '#555',
  },
  fileLabel: {
    fontSize: '14px',
    color: '#777',
    fontStyle: 'italic',
  },
  timestamp: {
    textAlign: 'right' as const,
    fontSize: '13px',
    color: '#888',
    whiteSpace: 'nowrap' as const,
  },
};

// CSS for custom scrollbar (added as a style element)
const scrollbarStyles = `
  .activities-list::-webkit-scrollbar {
    width: 8px;
  }
  .activities-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .activities-list::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 20px;
    border: 3px solid transparent;
  }
  .activities-list::-webkit-scrollbar-thumb:hover {
    background-color: #9ca3af;
  }
`;

function Activities() {
  const [activities, setActivities] = useState([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);

  // No logic changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const userRes = await axios.get('http://localhost:5001/api/users/me', {
          withCredentials: true,
        });
        const user = userRes.data;
        setCurrentUser(user);

        // Fetch activity data
        const endpoint =
          user.role === 'admin'
            ? 'http://localhost:5001/api/history/all'
            : `http://localhost:5001/api/history/user/${user.user_id}`;

        const activityRes = await axios.get(endpoint, {
          withCredentials: true,
        });

        const activityData = activityRes.data.data || [];
        setActivities(activityData);

        // Map userId to name (admin only)
        if (user.role === 'admin') {
          const usersRes = await axios.get(
            'http://localhost:5001/api/users/getAllUser',
            { withCredentials: true }
          );
          const userMapObj: Record<string, string> = {};
          for (const u of usersRes.data.data || []) {
            userMapObj[u.user_id] = u.name;
          }
          setUserMap(userMapObj);
        } else {
          setUserMap({ [user.user_id]: user.name });
        }
      } catch (err) {
        console.error('Error loading activity data:', err);
      }
    };

    fetchData();
  }, []);

  // Enhanced rendering for individual activity items
  const renderActivityItem = (item: any) => {
    let details = item.details;
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch {
        details = {};
      }
    }

    const username = userMap[item.userId] || item.userId;
    const fileName = details?.filename || 'N/A';
    const timestamp = dayjs(item.timestamp).format('DD/MM/YYYY, HH:mm:ss');
    const action = item.action.replace(/_/g, ' ');

    return (
      <List.Item style={styles.listItem}>
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </div>
          <Divider style={{ margin: '10px 0' }} />
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <div>
              <Badge color="#1677ff" />
              <Text style={styles.actionText}> {action}</Text>
            </div>
            <div>
              <Text style={styles.fileLabel}>File: {fileName}</Text>
            </div>
          </Space>
        </div>
      </List.Item>
    );
  };

  // Updated tab configuration with icon
  const items = [
    {
      key: 'all',
      label: (
        <span style={styles.tabLabel}>
          <HistoryOutlined style={{ fontSize: '18px' }} />
          All Activities
        </span>
      ),
      children: (
        <List
          dataSource={[...activities].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )}
          renderItem={renderActivityItem}
          style={styles.listContainer}
          className="activities-list" // Added for scrollbar styling
        />
      ),
    },
  ];

  return (
    <GeneralLayout title="All Activities" buttonLabel="" navigateLocation="" noBorder={true}>
      <style>{scrollbarStyles}</style>
      <div style={styles.tabsContainer}>
        <Tabs defaultActiveKey="all" items={items} />
      </div>
    </GeneralLayout>
  );
}

export default Activities;
