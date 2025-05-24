import { Tabs, List } from 'antd';
import React, { useEffect, useState } from 'react';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';
import axios from 'axios';
import dayjs from 'dayjs';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);

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

    return (
      <List.Item
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <List.Item.Meta
          title={<strong>{username}</strong>}
          description={`Action: ${item.action.replace(/_/g, ' ')}, File: ${fileName}`}
        />
        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
          {timestamp}
        </div>
      </List.Item>
    );
  };

  const items = [
    {
      key: 'all',
      label: 'All Activities',
      children: (
        <List
          dataSource={[...activities].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )}
          renderItem={renderActivityItem}
          style={{ height: '70vh', overflowY: 'auto', paddingRight: 12 }}
        />
      ),
    },
  ];

  return (
    <GeneralLayout title="All Activities" buttonLabel="" navigateLocation="">
      <Tabs defaultActiveKey="all" items={items} />
    </GeneralLayout>
  );
}

export default Activities;
