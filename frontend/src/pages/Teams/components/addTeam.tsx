import { Button, Card, Input, Select, message, InputNumber } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Inactive', label: 'Inactive' },
];

function AddTeam() {
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');

  const handleAddTeam = async () => {
    if (!teamName || !teamSize || !status) {
      message.error('Please fill in all required fields');
      return;
    }

    const newTeam = {
      teamName,
      teamSize,
      description,
      status,
    };

    try {
      await axios.post('http://localhost:5001/api/team/addTeam', newTeam, {
        withCredentials: true,
      });
      message.success('Team added successfully!');
      navigate('/teams');
    } catch (error) {
      console.error('Error adding team:', error);
      message.error('Failed to add team. Please try again.');
    }
  };
console.log("date ne "+ new Date());

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: 40 }}>
      <Card title="Add Team" style={{ width: '80%' }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
        >
          <div>
            <h3>Team Name</h3>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
            />
          </div>
          <div>
            <h3>Team Size</h3>
            <InputNumber
              min={1}
              max={50}
              value={teamSize ?? undefined}
              onChange={(value) => setTeamSize(value ?? null)}
              style={{ width: '100%' }}
              placeholder="Enter team size"
            />
          </div>
          <div>
            <h3>Status</h3>
            <Select
              value={status}
              onChange={setStatus}
              placeholder="Select status"
              style={{ width: '100%' }}
            >
              {statusOptions.map((s) => (
                <Select.Option key={s.value} value={s.value}>
                  {s.label}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <h3>Description</h3>
            <TextArea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Team description"
            />
          </div>
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}
        >
          <Button
            onClick={() => navigate('/teams')}
            style={{ marginRight: 10 }}
          >
            Cancel
          </Button>
          <Button type="primary" onClick={handleAddTeam}>
            Add Team
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AddTeam;
