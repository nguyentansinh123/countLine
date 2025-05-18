import { Button, Card, Input, Select, message } from 'antd';
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
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [team, setTeam] = useState<{
    teamId: number;
    teamName: string;
    date: string;
    status: string;
    description: string;
    members: { name: string }[];
  } | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/team/${teamId}`,
          {
            credentials: 'include',
          }
        );
        const data = await response.json();
        if (data.success) {
          const foundTeam = data.data;
          setTeam({
            ...foundTeam,
            date: formatDateForInput(foundTeam.dateCreated),
          });
        } else {
          console.error('Team not found');
        }
      } catch (error) {
        console.error('Failed to fetch team:', error);
      }
    };

    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const formatDateForInput = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleSave = async () => {
    try {
      const updatedTeam = {
        teamName: team?.teamName,
        description: team?.description,
        status: team?.status,
      };

      const response = await fetch(`http://localhost:5001/api/team/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedTeam),
      });
      console.log('Updated Team:', updatedTeam);
      const result = await response.json();
      if (result.success) {
        messageApi.success('Team updated successfully');
        console.log('Team updated successfully');
        setTimeout(() => {
          navigate('/teams');
        }, 1000);
      } else {
        messageApi.error('Failed to update team');
        console.error('Failed to update team:', result.message);
      }
    } catch (error) {
      console.error('Failed to save team:', error);
    }
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
      {contextHolder}
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
                value={team.teamName}
                onChange={(e) => setTeam({ ...team, teamName: e.target.value })}
                placeholder="Team Name"
              />
            </div>
            <div>
              <h3>Start Date</h3>
              <Input
                value={team.date}
                onChange={(e) => setTeam({ ...team, date: e.target.value })}
                type="date"
              />
            </div>
            <div>
              <h3>Team Status</h3>
              <Select
                value={team.status}
                onChange={(value) => setTeam({ ...team, status: value })}
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
                value={team.description}
                onChange={(e) =>
                  setTeam({ ...team, description: e.target.value })
                }
                placeholder="Team Description"
                rows={3}
              />
            </div>
            <div>
              <h3>Members</h3>
              <Select
                mode="multiple"
                placeholder="Please select"
                value={team.members.map((member) => member.name)}
                onChange={(value: string[]) =>
                  setTeam({
                    ...team,
                    members: value.map((name) => ({
                      name,
                    })),
                  })
                }
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
