import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import ListComponents from '../../components/listComponents/listComponents';
import { Button, Dropdown, MenuProps, message, Modal, Select, Spin } from 'antd';
import axios from 'axios';

const { Option } = Select;

interface Project {
  projectId: string | { S: string } | any; 
  project: string;
  team: string;
  date: string;
  status: string;
}

interface ProjectsApiResponse {
  success: boolean;
  data: Array<{
    projectId: string;
    projectName: string;
    teams?: string[];
    projectStart: string;
    status?: string;
  }>;
  message?: string;
}

interface Team {
  teamId: string;
  teamName: string;
}

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isAssigningTeam, setIsAssigningTeam] = useState<boolean>(false);
  const [teamModalVisible, setTeamModalVisible] = useState<boolean>(false);
  const [teamLoading, setTeamLoading] = useState<boolean>(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    try {
      fetchProjects();
    } catch (err) {
      console.error("Error in fetchProjects useEffect:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get<ProjectsApiResponse>(`${API_URL}/api/project/GetallProject`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        params: { _t: new Date().getTime() }
      });

      if (response.data.success) {
        console.log("Projects data received:", response.data);
        
        const formattedProjects = response.data.data.map(project => {
          let teamNames = 'No team assigned';
          
          const projectTeams = project.teams as any;
          if (projectTeams && 'L' in projectTeams && Array.isArray(projectTeams.L)) {
            const teamIds = projectTeams.L.map((team: any) => {
              if (team && 'S' in team) {
                return team.S;
              }
              return '';
            }).filter((id:any) => id !== '');
            
            if (teamIds.length > 0) {
              fetchTeamNames(teamIds)
                .then(names => {
                  if (names.length > 0) {
                    setProjects(prev => prev.map(p => {
                      // Type assertions here as well
                      const pId = typeof p.projectId === 'object' && p.projectId ? 
                                (p.projectId as any).S || String(p.projectId) : 
                                String(p.projectId);
                      const projectIdStr = typeof project.projectId === 'object' && project.projectId ? 
                                          (project.projectId as any).S || String(project.projectId) : 
                                          String(project.projectId);
                      
                      if (pId === projectIdStr) {
                        return { ...p, team: names.join(', ') };
                      }
                      return p;
                    }));
                  }
                })
                .catch(err => console.error("Error fetching team names:", err));
              
              teamNames = teamIds.join(', ');
            }
          }
          
          const projectName = (project.projectName as any)?.S || project.projectName;
          const projectStart = (project.projectStart as any)?.S || project.projectStart;
          const projectStatus = (project.status as any)?.S || project.status || 'N/A';
          
          return {
            projectId: project.projectId,
            project: projectName,
            team: teamNames,
            date: projectStart,
            status: projectStatus
          };
        });
        
        console.log("Formatted projects:", formattedProjects);
        setProjects(formattedProjects);
      } else {
        message.error('Failed to fetch projects');
        setError('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      message.error('Error loading projects');
      setError('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamNames = async (teamIds: string[]): Promise<string[]> => {
    try {
      const token = localStorage.getItem('token');
      const results: string[] = [];
      
      await Promise.all(teamIds.map(async (teamId) => {
        try {
          const response = await axios.get(`${API_URL}/api/team/${teamId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          });
          
          if (response.data.success && response.data.data) {
            const teamData = response.data.data as any;
            const teamName = teamData.teamName?.S || teamData.teamName;
            if (teamName) {
              results.push(teamName);
            }
          }
        } catch (err) {
          console.error(`Error fetching team with ID ${teamId}:`, err);
        }
      }));
      
      return results;
    } catch (err) {
      console.error("Error in fetchTeamNames:", err);
      return [];
    }
  };

  const fetchTeams = async () => {
    try {
      setTeamLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/team/getAllTeams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      });

      if (response.data.success) {
        console.log("Teams data received:", response.data);
        setTeams(response.data.data.map((team: any) => ({
          teamId: team.teamId,
          teamName: team.teamName
        })));
      } else {
        message.error('Failed to fetch teams');
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      message.error('Error loading teams');
    } finally {
      setTeamLoading(false);
    }
  };

  const assignTeamToProject = async () => {
    if (!selectedTeam || !selectedProject) {
      message.error('Please select both a team and a project');
      return;
    }

    try {
      setIsAssigningTeam(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/api/project/addTeamToProject`, 
        {
          projectId: selectedProject,
          teamId: selectedTeam
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        message.success('Team assigned to project successfully');
        
        // Get the name of the assigned team
        const assignedTeamName = teams.find(team => team.teamId === selectedTeam)?.teamName;
        
        setProjects(prevProjects => prevProjects.map(project => {
          const projectIdStr = typeof project.projectId === 'object' && project.projectId?.S ? 
                               project.projectId.S : String(project.projectId);
          
          if (projectIdStr === selectedProject && assignedTeamName) {
            return {
              ...project,
              team: project.team === 'No team assigned' ? 
                    assignedTeamName : 
                    `${project.team}, ${assignedTeamName}`
            };
          }
          return project;
        }));
        
        setTeamModalVisible(false);
        setSelectedTeam(null);
        
        setTimeout(fetchProjects, 1000);
      } else {
        message.error(response.data.message || 'Failed to assign team');
      }
    } catch (err: any) {
      console.error('Error assigning team:', err);
      
      if (err.response) {
        if (err.response.status === 409) {
          message.warning('This team is already assigned to the project');
        } else {
          message.error(err.response.data?.message || 'Failed to assign team');
        }
      } else {
        message.error('Failed to connect to server');
      }
    } finally {
      setIsAssigningTeam(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    console.log("*** handleDelete function called with ID:", projectId);

    try {
      console.log("Attempting to delete project with ID:", projectId);
      
      console.log(`Sending delete request to: ${API_URL}/api/project/${projectId}`);
      
      const loadingMessage = message.loading('Deleting project...', 0);
      
      const response = await axios.delete(`${API_URL}/api/project/${projectId}`, {
        withCredentials: true 
      });

      loadingMessage();
      
      console.log("Delete response:", response.data);

      if (response.data.success) {
        message.success('Project deleted successfully');
        
        setProjects(prevProjects => {
          const filtered = prevProjects.filter(project => {
            if (typeof project.projectId === 'object' && project.projectId !== null) {
              if ('S' in project.projectId) {
                console.log("Comparing DynamoDB ID", project.projectId.S, "with", projectId);
                return project.projectId.S !== projectId;
              }
            }
            console.log("Comparing regular ID", String(project.projectId), "with", projectId);
            return String(project.projectId) !== projectId;
          });
          
          console.log(`Filtered from ${prevProjects.length} to ${filtered.length} projects`);
          return filtered;
        });
        
        setTimeout(() => {
          console.log("Refreshing project list after deletion");
          fetchProjects();
        }, 1000);
      } else {
        message.error(response.data.message || 'Failed to delete project');
      }
    } catch (err: any) {
      console.error('Error deleting project:', err);
      
      if (err.response) {
        console.error("Server responded with:", err.response.status, err.response.data);
        if (err.response.status === 403) {
          message.error("You don't have permission to delete this project");
        } else if (err.response.status === 404) {
          message.error("Project not found");
          fetchProjects();
        } else {
          message.error(err.response.data?.message || 'Failed to delete project');
        }
      } else if (err.request) {
        console.error("No response received from server");
        message.error('Server did not respond. Check your network connection.');
      } else {
        message.error('An unexpected error occurred');
      }
    }
  };

  const menuItems = (item: Project): MenuProps => {
    return {
      items: [
        {
          key: 'edit',
          label: 'Edit',
          onClick: () => {
            console.log("Complete item object:", item);
            console.log("Project ID type:", typeof item.projectId);
            console.log("Project ID value:", item.projectId);
            
            let id;
            
            if (item.projectId === null || item.projectId === undefined) {
              console.error("Project ID is null or undefined");
              message.error("Cannot edit project: Invalid project ID");
              return;
            }
            if (typeof item.projectId === 'object') {
              const projectIdObj = item.projectId as { S?: string };
              
              if (projectIdObj.S) {
                id = projectIdObj.S;
                console.log("Extracted ID from DynamoDB format:", id);
              } else {
                try {
                  id = JSON.stringify(item.projectId);
                  console.log("Stringified object ID:", id);
                } catch (e) {
                  console.error("Failed to stringify project ID:", e);
                  id = "invalid-id";
                }
              }
            } else {
              id = String(item.projectId);
              console.log("Simple string/number ID:", id);
            }
            
            if (id === "[object Object]") {
              console.error("Failed to extract proper ID from:", item.projectId);
              message.error("Cannot edit project: Invalid project ID format");
              return;
            }
            
            console.log("Final ID for navigation:", id);
            navigate(`/editproject/${id}`);
          },
        },
        {
          key: 'assignTeam',
          label: 'Assign Team',
          onClick: () => {
            console.log("Assign team to project:", item);
            let id;
            if (typeof item.projectId === 'object' && item.projectId !== null && 'S' in item.projectId) {
              id = item.projectId.S;
            } else {
              id = String(item.projectId);
            }
            
            setSelectedProject(id);
            fetchTeams();
            setTeamModalVisible(true);
          },
        },
        {
          key: 'delete',
          label: 'Delete',
          onClick: () => {
            let id;
            if (typeof item.projectId === 'object' && item.projectId !== null && 'S' in item.projectId) {
              id = item.projectId.S;
              console.log("Using DynamoDB ID:", id);
            } else {
              id = String(item.projectId);
              console.log("Using regular ID:", id);
            }

            if (confirm(`Are you sure you want to delete this project? This action cannot be undone.`)) {
              console.log("User confirmed deletion, calling handleDelete with ID:", id);
              handleDelete(id);
            } else {
              console.log("User cancelled deletion");
            }
          },
        },
      ],
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p>Loading projects...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: 'red' }}>{error}</p>
          <button 
            onClick={fetchProjects}
            style={{ padding: '5px 10px', marginTop: '10px' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <ListComponents 
        column={['Project', 'Team', 'Date', 'Status']} 
        data={projects} 
        menu={menuItems}
      />
    );
  };

  const teamAssignmentModal = (
    <Modal
      title="Assign Team to Project"
      open={teamModalVisible}
      onCancel={() => {
        setTeamModalVisible(false);
        setSelectedTeam(null);
      }}
      onOk={assignTeamToProject}
      okText="Assign"
      confirmLoading={isAssigningTeam}
    >
      <div style={{ marginBottom: '20px' }}>
        <p>Select a team to assign to this project:</p>
        <Select
          style={{ width: '100%' }}
          placeholder="Select a team"
          loading={teamLoading}
          onChange={(value) => setSelectedTeam(value)}
          value={selectedTeam}
        >
          {teams.map(team => (
            <Option key={team.teamId} value={team.teamId}>{team.teamName}</Option>
          ))}
        </Select>
      </div>
    </Modal>
  );

  return (
    <React.Fragment>
      <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
        <GeneralLayout 
          title="Projects" 
          buttonLabel="Add Projects" 
          navigateLocation="/addprojects"
        >
          {renderContent()}
          {teamAssignmentModal}
        </GeneralLayout>
      </ErrorBoundary>
    </React.Fragment>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode }, 
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default Projects;
