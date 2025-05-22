import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import axios from 'axios';
import { List, Avatar, Spin, Alert, Typography } from 'antd';
import{User} from '../../types' 
const { Title } = Typography;

export const SearchResults: React.FC = () => {
  const { value = "" } = useParams<{ value: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string|null>(null);

  const API_URL =
    import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5001";

  useEffect(() => {
    if (!value.trim()) return;

    const controller = new AbortController();
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/users/search`, {
          params: { term: value },
          withCredentials: true,
          signal: controller.signal,
        });

        res.data.success
          ? setUsers(res.data.data)
          : setError(res.data.message || "Search failed");
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          setError(err.response?.data?.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [value, API_URL]);

  return (
    <GeneralLayout title={`Search: ${value}`}>
      {loading ? (
        <Spin tip="Searching users..." />
      ) : error ? (
        <Alert type="error" message={error} showIcon />
      ) : users.length === 0 ? (
        <Title level={4}>No users found.</Title>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={users}
          renderItem={(user) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar src={user.profilePicture}>
                    {!user.profilePicture && user.name.charAt(0)}
                  </Avatar>
                }
                title={<strong>{user.name}</strong>}
                description={`${user.email} | ${user.role}`}
              />
            </List.Item>
          )}
        />
      )}
    </GeneralLayout>
  );
};
