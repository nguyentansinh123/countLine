import { Button, Card, Input, Select } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamConst from '../../Teams/const/TeamsConst';
import TextArea from 'antd/es/input/TextArea';

const status = [
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Dismissed', label: 'Dismissed' },
];

const members = [
  { value: 'member1', label: 'Member 1' },
  { value: 'member2', label: 'Member 2' },
  { value: 'member3', label: 'Member 3' },
];

function AddTeam() {
  const navigate = useNavigate();

  // States for team details
  const [teamName, setTeamName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [teamStatus, setTeamStatus] = useState('');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  // Handle adding a new team
  const handleAddTeam = () => {
    // Check if all values are present
    if (!teamName || !startDate || !teamStatus || teamMembers.length === 0) {
      alert('Please fill in all fields');
      return;
    }

    const newTeam = {
      teamId: TeamConst.length + 1,
      teamName: teamName,
      date: startDate,
      status: teamStatus,
      description: '',
      members: teamMembers.map((member) => ({ name: member })),
    };

    // Log new team for testing
    console.log('New team:', newTeam);
    TeamConst.push(newTeam);
    // Navigate to the teams page
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
        maxHeight: '80vh',
      }}
    >
      <Card
        variant="outlined"
        title="Add Team"
        style={{
          border: 'solid 1px',
          minWidth: '60vw',
          maxWidth: '80%',
          padding: 10,
        }}
      >
        <div
          style={{
            maxWidth: '100%',
            padding: 10,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            maxHeight: '80vw',
          }}
        >
          <div>
            <h3>Team Name</h3>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              type="text"
            />
          </div>
          <div>
            <h3>Start Date</h3>
            <Input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Select start date"
              type="date"
            />
          </div>
          <div>
            <h3>Team Status</h3>
            <Select
              value={teamStatus}
              onChange={(value) => setTeamStatus(value)}
              placeholder="Select status"
              style={{ width: '100%' }}
            >
              {status.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <h3>Members</h3>
            <Select
              mode="multiple"
              placeholder="Please select"
              value={teamMembers}
              onChange={(value) => setTeamMembers(value)}
              style={{ width: '100%' }}
            >
              {members.map((item) => (
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
        </div>
        <div
          style={{
            display: 'flex',
            gap: 20,
            padding: 10,
            marginTop: '15%',
          }}
        >
          <Button
            style={{
              padding: 10,
              margin: 10,
              border: 'solid 1px #156CC9',
              color: '#156CC9',
              width: 200,
            }}
            onClick={() => {
              navigate('/teams');
              console.log('Cancel');
            }}
          >
            Cancel
          </Button>
          <Button
            style={{
              padding: 10,
              margin: 10,
              backgroundColor: '#156CC9',
              border: 'none',
              color: 'white',
              width: 200,
            }}
            onClick={handleAddTeam}
          >
            Add Team
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AddTeam;
