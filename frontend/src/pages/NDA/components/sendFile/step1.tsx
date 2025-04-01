import { Input, Select, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import teamsData from '../../../Teams/const/TeamsConst';
import clientUserConst from '../../../Users/const/clientUserConst';
import { Document, Team, TeamMember, UserData } from './types';

interface Step1Props {
  file: Document | undefined;
  category: string | undefined;
  selectedUser: string;
  setSelectedUser: React.Dispatch<React.SetStateAction<string>>;
  clientUserConst: { mail: string; name: string }[];
  teamsData: Team[];
  userEmail: string;
}

const Step1: React.FC<Step1Props> = ({
  file,
  category,
  selectedUser,
  setSelectedUser,
  clientUserConst,
  teamsData,
  userEmail,
}) => {
  const [teamMembersWithData, setTeamMembersWithData] = useState<(UserData | TeamMember)[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const getTeamMembersWithUserData = (teamId: number): (UserData | TeamMember)[] => {
    const team = teamsData.find((t) => t.teamId === teamId);

    if (!team) {
      return []; // Team not found
    }

    return team.members.map((member) => {
      const user = clientUserConst.find((u) => u.name === member.name);
      if (user) {
        return { ...user, mail: user.mail || '' };
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
  }, [selectedTeamId]);

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
            <Select style={{ width: 200 }} value={selectedUser} onChange={(value) => setSelectedUser(value)}>
              {clientUserConst.map((user) => (
                <Select.Option key={user.name} value={user.name}>
                  {user.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <h4>Mail Description</h4>
          <div style={{ width: '60%' }}>
            <textarea
              style={{ width: '100%', height: 300 }}
              defaultValue={`Dear ${selectedUser},\n\nYou can sign the document: ${file?.title}.\n\nBest regards,`}
            />
          </div>

          <div>
            <p>Email: {userEmail}</p>
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
                  {member.mail ? `<span class="math-inline">\{member\.name\} \(</span>{member.mail})` : member.name}
                </li>
              ))}
            </ul>
          </div>

          <h4>Mail Description</h4>
          <div style={{ width: '60%' }}>
            <textarea
              style={{ width: '100%', height: 300 }}
              defaultValue={`Dear Team,\n\nYou can sign the document: ${file?.title}.\n\nBest regards,`}
            />
          </div>
        </div>
      ),
    },
  ];

  return <Tabs defaultActiveKey="1" items={items} />;
};

export default Step1;