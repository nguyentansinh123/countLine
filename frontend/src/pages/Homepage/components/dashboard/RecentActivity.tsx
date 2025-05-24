import { Button, Card, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndActivities = async () => {
      try {
        // Fetch current user
        const userRes = await axios.get('http://localhost:5001/api/users/me', {
          withCredentials: true,
        });

        const currentUser = userRes.data;
        console.log(userRes.data);

        setUser(currentUser);

        // Fetch activity data
        const endpoint =
          currentUser.role === 'admin'
            ? 'http://localhost:5001/api/history/all'
            : `http://localhost:5001/api/history/user/${currentUser.user_id}`;

        const activityRes = await axios.get(endpoint, {
          withCredentials: true,
        });

        const activityData = activityRes.data.data || [];
        setActivities(activityData);

        if (currentUser.role === 'admin') {
          try {
            const usersRes = await axios.get(
              'http://localhost:5001/api/users/getAllUser',
              {
                withCredentials: true,
              }
            );
            const userMapObj: Record<string, string> = {};
            for (const user of usersRes.data.data || []) {
              userMapObj[user.user_id] = user.name;
            }
            setUserMap(userMapObj);
          } catch (err) {
            console.error(
              'Admin-only fetch failed (as expected for users):',
              err
            );
          }
        } else {
          setUserMap({ [currentUser.user_id]: currentUser.name });
        }
      } catch (error) {
        console.error('Failed to fetch activities or users:', error);
      }
    };

    fetchUserAndActivities();
  }, []);

  console.log(userMap);

  return (
    <div
      className="Activities"
      style={{
        margin: '0px 40px 0px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          margin: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <h2 style={{ marginLeft: 20, marginBottom: 0, color: '#00004C' }}>
          Your Recent Activities
        </h2>
        <a
          onClick={() => navigate('/activities')}
          style={{
            marginRight: 20,
            marginBottom: 0,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          View all Activities
        </a>
      </div>

      <Card
        style={{
          width: '100%',
          border: 'solid 1px',
          marginTop: 0,
        }}
      >
        <div
          style={{
            maxHeight: '40vh',
            overflowY: 'auto',
            paddingRight: 10,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={[...activities]
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .slice(0, 7)}
            renderItem={(item: any) => {
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
              const timestamp = dayjs(item.timestamp).format(
                'DD/MM/YYYY, HH:mm:ss'
              );

              const actionText = item.action.replace(/_/g, ' ');
              const description =
                fileName !== 'N/A'
                  ? `Action: ${actionText}, File: ${fileName}`
                  : `Action: ${actionText}`;

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
                    description={description}
                  />
                  <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {timestamp}
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default RecentActivity;
