import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  List, Avatar, Badge, Input, Empty, Spin, Card, 
  Typography, Button, message, Grid, Row, Col 
} from 'antd';
import { 
  SearchOutlined, UserOutlined, MessageOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import './Chat.css';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

interface User {
  user_id: string;
  name?: string;
  email: string;
  profilePicture?: string;
  role?: string;
}

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const currentUserResponse = await axios.get('http://localhost:5001/api/users/me', {
        withCredentials: true
      });
      
      if (!currentUserResponse.data) {
        throw new Error('Not authenticated');
      }
      
      setCurrentUser(currentUserResponse.data);
      
      const allUsersResponse = await axios.get('http://localhost:5001/api/users/getAllUser', {
        withCredentials: true
      });
      
      if (allUsersResponse.data && allUsersResponse.data.data) {
        const otherUsers = allUsersResponse.data.data.filter(
          (user: User) => user.user_id !== currentUserResponse.data.user_id
        );
        
        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startChat = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  const renderUserCards = () => {
    const cols = screens.xl ? 4 : screens.lg ? 3 : screens.md ? 2 : 1;
    
    return (
      <Row gutter={[24, 24]}>
        {filteredUsers.map(user => (
          <Col key={user.user_id} xs={24} sm={12} md={12} lg={8} xl={6}>
            <Card 
              hoverable
              className="user-card"
              onClick={() => startChat(user.user_id)}
            >
              <div className="user-card-content">
                <Avatar 
                  size={80} 
                  src={user.profilePicture} 
                  icon={!user.profilePicture && <UserOutlined />}
                  className="user-avatar"
                />
                <div className="user-info">
                  <Text strong className="user-name">{user.name || user.email}</Text>
                  {user.role && (
                    <Badge 
                      color={
                        user.role === 'admin' ? 'red' : 
                        user.role === 'employee' ? 'blue' : 
                        user.role === 'lawyer' ? 'purple' :
                        'green'
                      } 
                      text={user.role} 
                    />
                  )}
                  <Button 
                    type="primary" 
                    icon={<MessageOutlined />}
                    className="start-chat-button"
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderUsersList = () => {
    if (loading) {
      return (
        <div className="chat-loading">
          <Spin size="large" />
          <Text>Finding people for you to connect with...</Text>
        </div>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <Empty 
          description={
            searchTerm 
              ? "No users match your search" 
              : "No other users found"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return renderUserCards();
  };

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <Title level={2}>Chat with our users</Title>
        <Text type="secondary">Select someone to begin a conversation</Text>
      </div>

      <div className="chat-search">
        <Input
          placeholder="Search users by name, email or role..."
          prefix={<SearchOutlined />}
          onChange={e => setSearchTerm(e.target.value)}
          size="large"
          allowClear
        />
      </div>

      {renderUsersList()}
    </div>
  );
};

export default ChatList;