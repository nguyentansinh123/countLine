import React, { useEffect, useState } from 'react';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';
import ListComponents from '../../../components/listComponents/listComponents';
import axios from 'axios';
import { useParams } from 'react-router-dom';
const ViewHistory = () => {
  const [activityData, setActivityData] = useState<any[]>([]);
  const { user_id } = useParams();
  const [userName, setUserName] = useState('Unknown');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Get user name first
        const userRes = await axios.get(
          `http://localhost:5001/api/users/${user_id}`,
          {
            withCredentials: true,
          }
        );
        const name = userRes.data?.data?.name || 'Unknown';
        setUserName(name);

        // 2. Then fetch activity using that name
        console.log("Fetching activity for user:", user_id);
        const activityRes = await axios.get(
          `http://localhost:5001/api/history/user/${user_id}`,
          {
            withCredentials: true,
          }
        );

        console.log("Activity response:", activityRes.data);
        const items = activityRes.data.data || [];

        const formatted = items.reverse().map((item: any) => {
          const activity = item.action || 'N/A';

          const formattedActivity = activity
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          // Safely extract filename from DynamoDB-style or normal JSON
          const filename =
            item.details?.filename?.S || item.details?.filename || null;

          return {
            name: name,
            activity: formattedActivity,
            data: filename || '-',
            date: item.timestamp
              ? item.timestamp.split('T')[0]
              : 'Invalid Date',
            time: item.timestamp
              ? item.timestamp.split('T')[1]?.split('.')[0]
              : 'Invalid Time',
          };
        });

        setActivityData(formatted);
      } catch (err) {
        console.error('Failed to fetch user data or activity:', err);
        // Display specific error details
        if (axios.isAxiosError(err) && err.response) {
          console.error('Error response:', err.response.data);
        }
      }
    };

    if (user_id) fetchUserData();
  }, [user_id]);

  return (
    <GeneralLayout title="User History">
      <ListComponents
        column={['name', 'activity', 'data', 'date', 'time']}
        data={activityData}
        showAction={false} // hide 3 dots
      />
    </GeneralLayout>
  );
};

export default ViewHistory;
