import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import axios from 'axios';
import { List, Avatar, Spin, Alert, Typography } from 'antd';

const { Title } = Typography;

interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
}

export const SearchResults = () => {
  const { value } = useParams<{ value: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchUsers = async () => {
      if (!value) return;

      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`${API_URL}/api/search`, {
          params: { term: value },
          withCredentials: true,
        });

        if (res.data.success) {
          setUsers(res.data.data);
        } else {
          setError(res.data.message || 'Search failed');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [value, API_URL]);

  return (
    <GeneralLayout title={`Search: ${value}`}>
      {loading ? (
        <Spin tip="Searching users..." />
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : users.length === 0 ? (
        <Title level={4}>No users found.</Title>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={users}
          renderItem={(user) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={user.profilePicture || undefined} />}
                title={user.name}
                description={`${user.email} | ${user.role}`}
              />
            </List.Item>
          )}
        />
      )}
    </GeneralLayout>
  );
};

export default SearchResults;
