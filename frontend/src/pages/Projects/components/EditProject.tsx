import { Button, Card, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectConst from '../const/ProjectConst';

const status = [
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Dismissed', label: 'Dismissed' },
];

function EditProject() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);

  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [projectTeam, setProjectTeam] = useState('');

  useEffect(() => {
    if (projectId) {
      const foundProject = ProjectConst.find(
        (p) => p.projectId === Number(projectId)
      );

      console.log('Found Project:', foundProject);
      if (foundProject) {
        setProject(foundProject);
        setProjectName(foundProject.project);
        setStartDate(formatDateForInput(foundProject.date));
        setProjectStatus(foundProject.status);
        setProjectTeam(foundProject.team);
      }
    }
  }, [projectId]);

  const formatDateForInput = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleSave = () => {
    const updatedProject = {
      projectId: Number(projectId),
      project: projectName,
      date: startDate.split('-').reverse().join('/'),
      status: projectStatus,
      team: projectTeam,
    };

    console.log('Updated Project:', updatedProject);
    ProjectConst.splice(
      ProjectConst.findIndex((p) => p.projectId === Number(projectId)),
      1,
      updatedProject
    );
    navigate('/projects');
  };

  const navigate = useNavigate();

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
        style={{
          border: 'solid 1px',
          minWidth: '60vw',
          maxWidth: '80%',
          padding: 10,
        }}
      >
        <h2>Edit Project</h2>
        {project ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <div>
              <h3>Project Name</h3>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
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
              <Input
                value={projectTeam}
                onChange={(e) => setProjectTeam(e.target.value)}
                placeholder="Team Name"
              />
            </div>
          </div>
        ) : (
          <p>Project not found</p>
        )}
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
            onClick={() => navigate('/projects')}
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
            onClick={handleSave}
          >
            Save Project
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default EditProject;
