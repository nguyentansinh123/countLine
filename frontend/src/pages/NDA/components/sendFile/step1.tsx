import { Input, Select, Tabs, Spin, message, Typography, Card, Space, Divider, List, Avatar } from 'antd';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Document, Team, TeamMember, UserData } from './types';
import { TeamOutlined, UserOutlined, MailOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Step1Props {
  file: any;
  category: string | undefined;
  selectedUser: string;
  setSelectedUser: React.Dispatch<React.SetStateAction<string>>;
  teamsData: any[];
  userEmail: string;
  selectedTeam: Team | null;
  setSelectedTeam: React.Dispatch<React.SetStateAction<Team | null>>;
  selectedUserId: string;
  setSelectedUserId: React.Dispatch<React.SetStateAction<string>>;
}

interface ApiUser {
  user_id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role?: string;
}

const styles = {
  container: {
    padding: '0 20px',
  },
  fileInfoRow: {
    display: 'flex',
    gap: '24px', 
    marginBottom: '24px',
  },
  fileInfoField: {
    flex: 1,
  },
  fileInfoLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 500,
    margin: '24px 0 12px',
  },
  selectContainer: {
    marginBottom: '24px',
  },
  messageContainer: {
    marginTop: '24px',
  },
  textArea: {
    width: '100%',
    minHeight: '200px',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #d9d9d9',
    fontSize: '14px',
    resize: 'vertical',
    backgroundColor: '#f9f9f9', 
    color: '#333', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: '1.5',
  },
  emailInfo: {
    fontSize: '14px',
    color: '#666',
    padding: '8px 12px',
    background: '#f5f5f5',
    borderRadius: '4px',
    marginTop: '12px',
  },
  teamMembersList: {
    maxHeight: '200px',
    overflow: 'auto',
    border: '1px solid #f0f0f0',
    borderRadius: '4px',
    padding: '8px',
    backgroundColor: '#fafafa',
  }
};

const Step1: React.FC<Step1Props> = ({
  file,
  category,
  selectedUser,
  setSelectedUser,
  teamsData,
  userEmail,
  selectedTeam,
  setSelectedTeam,
  selectedUserId,
  setSelectedUserId,
}) => {
  const [teamMembersWithData, setTeamMembersWithData] = useState<
    (UserData | TeamMember)[]
  >([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageContent, setMessageContent] = useState<string>('');
  const [teamMessageContent, setTeamMessageContent] = useState<string>('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5001/api/team/getAllTeams',
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setTeams(response.data.data);
        } else {
          message.error('Failed to fetch teams');
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        message.error('Error loading teams');
      }
    };

    fetchTeams();
  }, []);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:5001/api/users/getAllUser',
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setUsers(response.data.data);
          console.log('Users loaded from API:', response.data.data);
        } else {
          message.error('Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        message.error('Error loading users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    console.log('Current file data:', file);
  }, [file]);

  useEffect(() => {
    if (file) {
      console.log('File data loaded:', file);
      console.log('File title:', file.title);
      console.log('Alternative title fields:', {
        name: file.name,
        fileName: file.fileName,
        docName: file.docName,
      });
    }
  }, [file]);

  useEffect(() => {
    const documentTitle =
      file?.title ||
      file?.name ||
      file?.fileName ||
      (file && typeof file === 'object' ? Object.values(file)[0] : null) ||
      '[Document]';

    console.log('Document title being used:', documentTitle);

    setMessageContent(
      `Dear ${selectedUser || '[User]'},\n\nYou can sign the document: ${documentTitle}.\n\nBest regards,`
    );
  }, [selectedUser, file]);

  useEffect(() => {
    const documentTitle =
      file?.title ||
      file?.name ||
      file?.fileName ||
      (file && typeof file === 'object' ? Object.values(file)[0] : null) ||
      '[Document]';

    setTeamMessageContent(
      `Dear Team,\n\nYou can sign the document: ${documentTitle}.\n\nBest regards,`
    );
  }, [file]);

  const handleTeamChange = async (teamName: string) => {
    console.log(teamName);

    const selectedTeam = teams.find((team) => team.teamName === teamName);
    console.log(selectedTeam);

    if (selectedTeam) {
      setSelectedTeam(selectedTeam);
      setSelectedTeamId(selectedTeam.teamId);
      try {
        const res = await axios.get(
          `http://localhost:5001/api/team/${selectedTeam.teamId}/members`,
          { withCredentials: true }
        );

        if (res.data.success) {
          const members = res.data.data.members;
          console.log(members);

          setTeamMembersWithData(members);
        } else {
          message.error('Failed to fetch team members');
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        message.error('Error loading team members');
      }
    }
  };

  const handleUserSelect = (username: string) => {
    setSelectedUser(username);
    setSelectedTeam(null);
  };

  const items = [
    {
      key: '1',
      label: <span><UserOutlined /> Send to User</span>,
      children: (
        <div style={styles.container}>
          <Card bordered={false} style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ margin: '0 0 16px' }}>
              <FileTextOutlined style={{ marginRight: '8px' }} />
              Document Information
            </Title>
            
            <div style={styles.fileInfoRow}>
              <div style={styles.fileInfoField}>
                <Text type="secondary" style={styles.fileInfoLabel}>File Name</Text>
                <Input 
                  value={file?.filename || 'Not available'} 
                  readOnly
                  prefix={<FileTextOutlined style={{ color: '#999' }} />}
                />
              </div>
              
              <div style={styles.fileInfoField}>
                <Text type="secondary" style={styles.fileInfoLabel}>File Type</Text>
                <Input 
                  value={category || 'Not specified'} 
                  readOnly
                />
              </div>
            </div>
          </Card>

          {/* User Selection Section */}
          <Card bordered={false}>
            <Title level={5} style={{ margin: '0 0 16px' }}>
              <UserOutlined style={{ marginRight: '8px' }} />
              Select Recipient
            </Title>
            
            <div style={styles.selectContainer}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Spin size="large" tip="Loading users..." />
                </div>
              ) : (
                <>
                  <Text type="secondary">Choose a user to send this document to:</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    value={selectedUser || undefined}
                    placeholder="Select a user"
                    onChange={handleUserSelect}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children?.toString() || '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    size="large"
                  >
                    {users.map((user) => (
                      <Select.Option key={user.user_id} value={user.name}>
                        {user.name} ({user.email})
                      </Select.Option>
                    ))}
                  </Select>
                </>
              )}
              
              {selectedUserEmail && (
                <div style={styles.emailInfo}>
                  <MailOutlined style={{ marginRight: '8px' }} />
                  Email will be sent to: <Text strong>{selectedUserEmail}</Text>
                </div>
              )}
            </div>
            
            {/* Email Message Section */}
            <Divider orientation="left">
              <MailOutlined style={{ marginRight: '8px' }} /> Email Message
            </Divider>
            
            <div style={styles.messageContainer}>
              <Text type="secondary">This message will be included in the email:</Text>
              <div style={{ marginTop: '12px' }}>
                <textarea
                  style={styles.textArea}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: '2',
      label: <span><TeamOutlined /> Send to Team</span>,
      children: (
        <div style={styles.container}>
          {/* File Information Section */}
          <Card bordered={false} style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ margin: '0 0 16px' }}>
              <FileTextOutlined style={{ marginRight: '8px' }} />
              Document Information
            </Title>
            
            <div style={styles.fileInfoRow}>
              <div style={styles.fileInfoField}>
                <Text type="secondary" style={styles.fileInfoLabel}>File Name</Text>
                <Input 
                  value={file?.filename || 'Not available'} 
                  readOnly
                  prefix={<FileTextOutlined style={{ color: '#999' }} />}
                />
              </div>
              
              <div style={styles.fileInfoField}>
                <Text type="secondary" style={styles.fileInfoLabel}>File Type</Text>
                <Input 
                  value={category || 'Not specified'} 
                  readOnly
                />
              </div>
            </div>
          </Card>

          {/* Team Selection Section */}
          <Card bordered={false}>
            <Title level={5} style={{ margin: '0 0 16px' }}>
              <TeamOutlined style={{ marginRight: '8px' }} />
              Select Team
            </Title>
            
            <div style={styles.selectContainer}>
              <Text type="secondary">Choose a team to send this document to:</Text>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                onChange={(value) => handleTeamChange(value)}
                placeholder="Select a team"
                size="large"
              >
                {teams.map((team) => (
                  <Select.Option
                    key={team.teamId.toString()}
                    value={team?.teamName}
                  >
                    {team.teamName}
                  </Select.Option>
                ))}
              </Select>
            </div>
            
            {/* Team Members Section */}
            {teamMembersWithData.length > 0 && (
              <>
                <Divider orientation="left">
                  <UserOutlined style={{ marginRight: '8px' }} />
                  Team Members ({teamMembersWithData.length})
                </Divider>
                
                <div style={styles.teamMembersList}>
                  <List
                    itemLayout="horizontal"
                    dataSource={teamMembersWithData}
                    renderItem={member => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={member.name}
                          description={member.email || 'No email provided'}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </>
            )}
            
            {/* Email Message Section */}
            <Divider orientation="left">
              <MailOutlined style={{ marginRight: '8px' }} /> Email Message
            </Divider>
            
            <div style={styles.messageContainer}>
              <Text type="secondary">This message will be sent to all team members:</Text>
              <div style={{ marginTop: '12px' }}>
                <textarea
                  style={styles.textArea}
                  value={teamMessageContent}
                  onChange={(e) => setTeamMessageContent(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <Tabs defaultActiveKey="1" items={items} type="card" />
  );
};

export default Step1;
