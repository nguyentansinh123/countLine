import { Input, Select, Tabs, Spin, message } from 'antd';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Document, Team, TeamMember, UserData } from './types';

interface Step1Props {
  file: any;
  category: string | undefined;
  selectedUser: string;
  setSelectedUser: React.Dispatch<React.SetStateAction<string>>;
  teamsData: any[];
  userEmail: string;
}

interface ApiUser {
  user_id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role?: string;
}

const Step1: React.FC<Step1Props> = ({
  file,
  category,
  selectedUser,
  setSelectedUser,
  teamsData,
  userEmail,
}) => {
  const [teamMembersWithData, setTeamMembersWithData] = useState<(UserData | TeamMember)[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageContent, setMessageContent] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/api/users/getAllUser', {
          withCredentials: true
        });
        
        if (response.data.success) {
          console.log("Users loaded from API:", response.data.data);
          setUsers(response.data.data);
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
    setMessageContent(
      `Dear ${selectedUser || '[User]'},\n\nYou can sign the document: ${file?.title || '[Document]'}.\n\nBest regards,`
    );
  }, [selectedUser, file]);

  const getTeamMembersWithUserData = (teamId: number): (UserData | TeamMember)[] => {
    const team = teamsData.find((t) => t.teamId === teamId);

    if (!team) {
      return [];
    }

    return team.members.map((member:any) => {
      const user = users.find((u) => u.name === member.name);
      if (user) {
        return { ...user, mail: user.email || '' };
      } else {
        return { ...member, mail: '' };
      }
    });
  };

  useEffect(() => {
    if (selectedTeamId !== null) {
      const members = getTeamMembersWithUserData(selectedTeamId);
      setTeamMembersWithData(members);
    }
  }, [selectedTeamId, users]);

  const handleTeamChange = (teamName: string) => {
    const selectedTeam = teamsData.find((team) => team.team === teamName);
    if (selectedTeam) {
      setSelectedTeamId(selectedTeam.teamId);
    }
  };

  const items = [
    {
      key: '1',
      label: 'User',
      children: (
        <div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <div style={{ width: 100 }}>File Name</div>
              <div style={{ width: '100%' }}>
                <Input contentEditable={false} value={file?.title || ''} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <div style={{ width: 100 }}>File Type</div>
              <div style={{ width: '100%' }}>
                <Input contentEditable={false} value={category} />
              </div>
            </div>
          </div>

          <div>
            <h4>User</h4>
            {loading ? (
              <Spin size="small" />
            ) : (
              <Select 
                style={{ width: 200 }} 
                value={selectedUser || undefined}
                placeholder="Select a user"
                onChange={(value) => setSelectedUser(value)}
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {users.map((user) => (
                  <Select.Option key={user.user_id} value={user.name}>
                    {user.name} ({user.email})
                  </Select.Option>
                ))}
              </Select>
            )}
          </div>

          <h4>Mail Description</h4>
          <div style={{ width: '60%' }}>
            <textarea
              style={{ width: '100%', height: 300 }}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
          </div>

          <div>
            <p>Email: {userEmail || 'Not selected'}</p>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Team',
      children: (
        <div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <div style={{ width: 100 }}>File Name</div>
              <div style={{ width: '100%' }}>
                <Input contentEditable={false} value={file?.title} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <div style={{ width: 100 }}>File Type</div>
              <div style={{ width: '100%' }}>
                <Input contentEditable={false} value={category} />
              </div>
            </div>
          </div>

          <div>
            <h4>Team</h4>
            <Select style={{ width: 200 }} onChange={handleTeamChange}>
              {teamsData.map((team) => (
                <Select.Option key={team.teamId.toString()} value={team.team}>
                  {team.team}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <h4>Team Members</h4>
            <ul>
              {teamMembersWithData.map((member, index) => (
                <li key={index}>
                  {member.mail ? `${member.name} (${member.mail})` : member.name}
                </li>
              ))}
            </ul>
          </div>

          <h4>Mail Description</h4>
          <div style={{ width: '60%' }}>
            <textarea
              style={{ width: '100%', height: 300 }}
              defaultValue={`Dear Team,\n\nYou can sign the document: ${file?.title || '[Document]'}.\n\nBest regards,`}
            />
          </div>
        </div>
      ),
    },
  ];

  return <Tabs defaultActiveKey="1" items={items} />;
};

export default Step1;