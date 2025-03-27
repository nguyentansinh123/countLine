import { Button, Card, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import teamsData from '../const/TeamsConst';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Inactive', label: 'Inactive' },
];

function EditTeam() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<{
    teamId: number;
    team: string;
    date: string;
    status: string;
    description: string;
    members: { name: string }[];
  } | null>(null);
  const [teamName, setTeamName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [teamStatus, setTeamStatus] = useState('');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  useEffect(() => {
    if (teamId) {
      const foundTeam = teamsData.find((t) => t.teamId === Number(teamId));
      if (foundTeam) {
        setTeam(foundTeam);
        setTeamName(foundTeam.team);
        setStartDate(formatDateForInput(foundTeam.date));
        setTeamStatus(foundTeam.status);
        setDescription(foundTeam.description);
        setTeamMembers(foundTeam.members.map((member) => member.name));
      }
    }
  }, [teamId]);

  const formatDateForInput = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleSave = () => {
    if (!team) return;

    const updatedTeam = {
      teamId: team.teamId,
      teamName,
      date: startDate.split('-').reverse().join('/'),
      status: teamStatus,
      description,
      members: teamMembers.map((name) => ({ name })),
    };

    console.log('Updated Team:', updatedTeam);
    navigate('/teams');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: 40,
        minWidth: '60vw',
        maxWidth: '100%',
        minHeight: '80vh',
      }}
    >
      <Card
        style={{
          border: 'solid 1px',
          minWidth: '60vw',
          maxWidth: '80%',
          padding: 10,
        }}
      >
        <h2>Edit Team</h2>
        {team ? (
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
          >
            <div>
              <h3>Team Name</h3>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team Name"
              />
            </div>
            <div>
              <h3>Start Date</h3>
              <Input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
              />
            </div>
            <div>
              <h3>Team Status</h3>
              <Select
                value={teamStatus}
                onChange={setTeamStatus}
                placeholder="Select status"
                style={{ width: '100%' }}
              >
                {statusOptions.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <h3>Description</h3>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Team Description"
                rows={3}
              />
            </div>
            <div>
              <h3>Members</h3>
              <Select
                mode="multiple"
                placeholder="Please select"
                value={teamMembers}
                onChange={setTeamMembers}
                style={{ width: '100%' }}
              >
                {teamsData
                  .flatMap((t) => t.members)
                  .map((member, index) => (
                    <Select.Option key={index} value={member.name}>
                      {member.name}
                    </Select.Option>
                  ))}
              </Select>
            </div>
          </div>
        ) : (
          <p>Team not found</p>
        )}
        <div
          style={{ display: 'flex', gap: 20, padding: 10, marginTop: '10%' }}
        >
          <Button
            style={{
              border: 'solid 1px #156CC9',
              color: '#156CC9',
              width: 200,
            }}
            onClick={() => navigate('/teams')}
          >
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: '#156CC9',
              border: 'none',
              color: 'white',
              width: 200,
            }}
            onClick={handleSave}
          >
            Save Team
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default EditTeam;
