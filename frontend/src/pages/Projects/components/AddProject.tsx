import { Button, Card, Input, Select } from 'antd';
import React, { useState } from 'react';
import teamsData from '../../Teams/const/TeamsConst';
import projectConst from '../const/ProjectConst';
import { useNavigate } from 'react-router-dom';
import ProjectConst from '../const/ProjectConst';

const status = [
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Dismissed', label: 'Dismissed' },
];

function AddProject() {
  const navigate = useNavigate();

  // States for project details
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [projectTeam, setProjectTeam] = useState('');

  // Handle adding a new project
  const handleAddProject = () => {
    // Check if all values are present
    if (!projectName || !startDate || !projectStatus || !projectTeam) {
      alert('Please fill in all fields');
      return;
    }

    const newProject = {
      projectId: projectConst.length + 1,
      project: projectName,
      date: startDate,
      status: projectStatus,
      team: projectTeam,
    };

    // Log new project for testing
    console.log('New Project:', newProject);
    ProjectConst.push(newProject);
    // Navigate to the projects page
    navigate('/projects');
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
        title="Add Project"
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
            <h3>Project Name</h3>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
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
            <h3>Project Status</h3>
            <Select
              value={projectStatus}
              onChange={(value) => setProjectStatus(value)}
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
            <h3>Project Team</h3>
            <Select
              value={projectTeam}
              onChange={(value) => setProjectTeam(value)}
              placeholder="Select team"
              style={{ width: '100%' }}
            >
              {teamsData.map((item) => (
                <Select.Option key={item.team} value={item.team}>
                  {item.team}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 20,
            padding: 10,
            marginTop: '30%',
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
              navigate('/projects');
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
            onClick={handleAddProject}
          >
            Add Project
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AddProject;
