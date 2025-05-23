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
  selectedTeam: Team | null;
  setSelectedTeam: React.Dispatch<React.SetStateAction<Team | null>>;
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
  selectedTeam,
  setSelectedTeam,
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
  const [teams, setTeams] = useState<Team[]>([]); // or any[]

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
  console.log(teams);

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
    // Log the file data after fetching
    if (file) {
      console.log('File data loaded:', file);
      console.log('File title:', file.title);
      // Try different property names if title is undefined
      console.log('Alternative title fields:', {
        name: file.name,
        fileName: file.fileName,
        docName: file.docName,
      });
    }
  }, [file]);

  useEffect(() => {
    // More defensive approach to get document title
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
    // Same defensive approach for team messages
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

  console.log(teamMembersWithData);

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
                <Input contentEditable={false} value={file?.filename || ''} />
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
                onChange={(value, option: any) => {
                  setSelectedUser(value);

                  // Find the selected user's email and update state
                  const selectedUserData = users.find(
                    (user) => user.name === value
                  );
                  if (selectedUserData) {
                    setSelectedUserEmail(selectedUserData.email);
                  } else {
                    setSelectedUserEmail('');
                  }
                }}
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.toString() || '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
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
            <p>Email: {selectedUserEmail || userEmail || 'Not selected'}</p>
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
                <Input contentEditable={false} value={file?.filename} />
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
            <Select
              style={{ width: 200 }}
              onChange={(value) => handleTeamChange(value)}
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

          <div>
            <h4>Team Members</h4>
            <ul>
              {teamMembersWithData.map((member, index) => (
                <li key={index}>
                  {member.email
                    ? `${member.name} (${member.email})`
                    : member.name}
                </li>
              ))}
            </ul>
          </div>

          <h4>Mail Description</h4>
          <div style={{ width: '60%' }}>
            <textarea
              style={{ width: '100%', height: 300 }}
              value={teamMessageContent}
              onChange={(e) => setTeamMessageContent(e.target.value)}
            />
          </div>
        </div>
      ),
    },
  ];

  return <Tabs defaultActiveKey="1" items={items} />;
};

export default Step1;
