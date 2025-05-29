import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import ListComponents from '../../components/listComponents/listComponents';
import {
  Button,
  Dropdown,
  MenuProps,
  message,
  Modal,
  Select,
  Spin,
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Avatar,
  Menu,
  Tooltip,
} from 'antd';
import {
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  UserAddOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  MoreOutlined,
  FileOutlined,
  FolderOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { Title, Text } = Typography;
const { confirm } = Modal;
import './projects.css';

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

  const [showModal, setShowModal] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string>('');
  const [deleteProjectName, setDeleteProjectName] = useState<string>('');

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    try {
      fetchProjects();
    } catch (err) {
      console.error('Error in fetchProjects useEffect:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get<ProjectsApiResponse>(
        `${API_URL}/api/project/GetallProject`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          params: { _t: new Date().getTime() },
        }
      );

      if (response.data.success) {
        console.log('Projects data received:', response.data);

        const formattedProjects = response.data.data.map((project) => {
          let teamNames = 'No team assigned';

          const projectTeams = project.teams as any;
          if (
            projectTeams &&
            'L' in projectTeams &&
            Array.isArray(projectTeams.L)
          ) {
            const teamIds = projectTeams.L.map((team: any) => {
              if (team && 'S' in team) {
                return team.S;
              }
              return '';
            }).filter((id: any) => id !== '');

            if (teamIds.length > 0) {
              fetchTeamNames(teamIds)
                .then((names) => {
                  if (names.length > 0) {
                    setProjects((prev) =>
                      prev.map((p) => {
                        const pId =
                          typeof p.projectId === 'object' && p.projectId
                            ? (p.projectId as any).S || String(p.projectId)
                            : String(p.projectId);
                        const projectIdStr =
                          typeof project.projectId === 'object' &&
                          project.projectId
                            ? (project.projectId as any).S ||
                              String(project.projectId)
                            : String(project.projectId);

                        if (pId === projectIdStr) {
                          return { ...p, team: names.join(', ') };
                        }
                        return p;
                      })
                    );
                  }
                })
                .catch((err) =>
                  console.error('Error fetching team names:', err)
                );

              teamNames = teamIds.join(', ');
            }
          }

          const projectName =
            (project.projectName as any)?.S || project.projectName;
          const projectStart =
            (project.projectStart as any)?.S || project.projectStart;
          const projectStatus =
            (project.status as any)?.S || project.status || 'N/A';

          return {
            projectId: project.projectId,
            project: projectName,
            team: teamNames,
            date: projectStart,
            status: projectStatus,
          };
        });

        console.log('Formatted projects:', formattedProjects);
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

      await Promise.all(
        teamIds.map(async (teamId) => {
          try {
            const response = await axios.get(`${API_URL}/api/team/${teamId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
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
        })
      );

      return results;
    } catch (err) {
      console.error('Error in fetchTeamNames:', err);
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
        withCredentials: true,
      });

      if (response.data.success) {
        console.log('Teams data received:', response.data);
        setTeams(
          response.data.data.map((team: any) => ({
            teamId: team.teamId,
            teamName: team.teamName,
          }))
        );
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

      const response = await axios.post(
        `${API_URL}/api/project/addTeamToProject`,
        {
          projectId: selectedProject,
          teamId: selectedTeam,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        message.success('Team assigned to project successfully');

        const assignedTeamName = teams.find(
          (team) => team.teamId === selectedTeam
        )?.teamName;

        setProjects((prevProjects) =>
          prevProjects.map((project) => {
            const projectIdStr =
              typeof project.projectId === 'object' && project.projectId?.S
                ? project.projectId.S
                : String(project.projectId);

            if (projectIdStr === selectedProject && assignedTeamName) {
              return {
                ...project,
                team:
                  project.team === 'No team assigned'
                    ? assignedTeamName
                    : `${project.team}, ${assignedTeamName}`,
              };
            }
            return project;
          })
        );

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

  const handleDelete = async (projectId: string): Promise<void> => {
    console.log('*** handleDelete function called with ID:', projectId);

    try {
      console.log('Attempting to delete project with ID:', projectId);

      const token = localStorage.getItem('token');
      console.log(
        `Sending delete request to: ${API_URL}/api/project/${projectId}`
      );

      const loadingMessage = message.loading('Deleting project...', 0);

      const response = await axios.delete(
        `${API_URL}/api/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      loadingMessage();

      console.log('Delete response:', response.data);

      if (response.data.success) {
        message.success('Project deleted successfully');

        setProjects((prevProjects) => {
          const filtered = prevProjects.filter((project) => {
            if (
              typeof project.projectId === 'object' &&
              project.projectId !== null
            ) {
              if ('S' in project.projectId) {
                console.log(
                  'Comparing DynamoDB ID',
                  project.projectId.S,
                  'with',
                  projectId
                );
                return project.projectId.S !== projectId;
              }
            }
            console.log(
              'Comparing regular ID',
              String(project.projectId),
              'with',
              projectId
            );
            return String(project.projectId) !== projectId;
          });

          console.log(
            `Filtered from ${prevProjects.length} to ${filtered.length} projects`
          );
          return filtered;
        });

        setTimeout(() => {
          console.log('Refreshing project list after deletion');
          fetchProjects();
        }, 1000);
      } else {
        message.error(response.data.message || 'Failed to delete project');
        throw new Error(response.data.message || 'Failed to delete project');
      }
    } catch (err: any) {
      console.error('Error deleting project:', err);

      if (err.response) {
        console.error(
          'Server responded with:',
          err.response.status,
          err.response.data
        );
        if (err.response.status === 401) {
          message.error('Authentication failed. Please login again.');
        } else if (err.response.status === 403) {
          message.error("You don't have permission to delete this project");
        } else if (err.response.status === 404) {
          message.error('Project not found');
          fetchProjects();
        } else {
          message.error(
            err.response.data?.message || 'Failed to delete project'
          );
        }
      } else if (err.request) {
        console.error('No response received from server');
        message.error('Server did not respond. Check your network connection.');
      } else {
        message.error('An unexpected error occurred');
      }
      throw err;
    }
  };

  const menuItems = (item: Project): MenuProps => {
    return {
      items: [
        {
          key: 'edit',
          label: 'Edit Project',
          icon: <EditOutlined />,
          onClick: () => {
            console.log('Complete item object:', item);
            console.log('Project ID type:', typeof item.projectId);
            console.log('Project ID value:', item.projectId);

            let id;

            if (item.projectId === null || item.projectId === undefined) {
              console.error('Project ID is null or undefined');
              message.error('Cannot edit project: Invalid project ID');
              return;
            }
            if (typeof item.projectId === 'object') {
              const projectIdObj = item.projectId as { S?: string };

              if (projectIdObj.S) {
                id = projectIdObj.S;
                console.log('Extracted ID from DynamoDB format:', id);
              } else {
                try {
                  id = JSON.stringify(item.projectId);
                  console.log('Stringified object ID:', id);
                } catch (e) {
                  console.error('Failed to stringify project ID:', e);
                  id = 'invalid-id';
                }
              }
            } else {
              id = String(item.projectId);
              console.log('Simple string/number ID:', id);
            }

            if (id === '[object Object]') {
              console.error(
                'Failed to extract proper ID from:',
                item.projectId
              );
              message.error('Cannot edit project: Invalid project ID format');
              return;
            }

            console.log('Final ID for navigation:', id);
            navigate(`/editproject/${id}`);
          },
        },
        {
          key: 'assignTeam',
          label: 'Assign Team',
          icon: <UserAddOutlined />,
          onClick: () => {
            console.log('Assign team to project:', item);
            let id;
            if (
              typeof item.projectId === 'object' &&
              item.projectId !== null &&
              'S' in item.projectId
            ) {
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
          label: 'Delete Project',
          icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
          danger: true,
          onClick: () => {
            let id;
            if (
              typeof item.projectId === 'object' &&
              item.projectId !== null &&
              'S' in item.projectId
            ) {
              id = item.projectId.S;
              console.log('Using DynamoDB ID:', id);
            } else {
              id = String(item.projectId);
              console.log('Using regular ID:', id);
            }

            showDeleteConfirm(id, item.project);
          },
        },
      ],
    };
  };

  const showDeleteConfirm = (id: string, projectName: string) => {
    console.log('showDeleteConfirm called with:', { id, projectName });
    setDeleteProjectId(id);
    setDeleteProjectName(projectName);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await handleDelete(deleteProjectId);
      setShowModal(false);
      setDeleteProjectId('');
      setDeleteProjectName('');
    } catch (error) {}
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setDeleteProjectId('');
    setDeleteProjectName('');
  };

  const DeleteConfirmationModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-icon">⚠️</div>
            <h3>Delete Project</h3>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete{' '}
              <strong>{deleteProjectName}</strong>?
            </p>
            <p className="warning-text">This action cannot be undone.</p>
          </div>

          <div className="modal-footer">
            <button className="btn btn-cancel" onClick={handleCancelDelete}>
              Cancel
            </button>
            <button className="btn btn-delete" onClick={handleConfirmDelete}>
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return <CheckCircleOutlined style={{ color: '#ffffff' }} />;
      case 'completed':
        return <FileOutlined style={{ color: '#ffffff' }} />;
      case 'on hold':
        return <PauseCircleOutlined style={{ color: '#ffffff' }} />;
      case 'cancelled':
        return <StopOutlined style={{ color: '#ffffff' }} />;
      case 'planning':
        return <ClockCircleOutlined style={{ color: '#ffffff' }} />;
      default:
        return <FolderOutlined style={{ color: '#ffffff' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return '#52c41a'; // Green
      case 'completed':
        return '#1890ff'; // Blue
      case 'on hold':
        return '#faad14'; // Orange/Yellow
      case 'cancelled':
        return '#ff4d4f'; // Red
      case 'planning':
        return '#722ed1'; // Purple
      default:
        return '#8c8c8c'; // Gray
    }
  };

  const getStatusTag = (status: string) => {
    let color = '';
    let icon = null;

    switch (status.toLowerCase()) {
      case 'active':
      case 'ongoing':
        color = 'green';
        icon = <CheckCircleOutlined />;
        break;
      case 'completed':
        color = 'blue';
        icon = <FileOutlined />;
        break;
      case 'on hold':
        color = 'orange';
        icon = <PauseCircleOutlined />;
        break;
      case 'cancelled':
        color = 'red';
        icon = <StopOutlined />;
        break;
      case 'planning':
        color = 'purple';
        icon = <ClockCircleOutlined />;
        break;
      default:
        color = 'default';
        icon = <FolderOutlined />;
    }

    return (
      <Tag color={color} icon={icon}>
        {status}
      </Tag>
    );
  };

  const transformProjectsForDisplay = () => {
    return projects.map((project) => ({
      ...project,
      projectDisplay: (
        <Space>
          <Avatar
            style={{ backgroundColor: getStatusColor(project.status) }}
            icon={getStatusIcon(project.status)}
          />
          <Text strong>{project.project}</Text>
        </Space>
      ),
      teamDisplay: (
        <Space>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <Text>{project.team}</Text>
        </Space>
      ),
      dateDisplay: (
        <Space>
          <CalendarOutlined style={{ color: '#52c41a' }} />
          <Text>{project.date}</Text>
        </Space>
      ),
      statusDisplay: getStatusTag(project.status),
    }));
  };

  const colorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#1890ff',
      '#52c41a',
      '#faad14',
      '#f5222d',
      '#722ed1',
      '#13c2c2',
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="loading-card">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
            }}
          >
            <Spin size="large" />
            <Text style={{ marginTop: '20px', fontSize: '16px' }}>
              Loading projects...
            </Text>
          </div>
        </Card>
      );
    }

    if (error) {
      return (
        <Card
          className="error-card"
          style={{ borderLeft: '5px solid #ff4d4f' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '30px 20px',
            }}
          >
            <ExclamationCircleOutlined
              style={{
                fontSize: '48px',
                color: '#ff4d4f',
                marginBottom: '16px',
              }}
            />
            <Title level={4} style={{ color: '#ff4d4f', marginBottom: '16px' }}>
              Error Loading Projects
            </Title>
            <Text style={{ marginBottom: '24px' }}>{error}</Text>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchProjects}
              size="large"
            >
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    if (projects.length === 0) {
      return (
        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '40px 20px',
              background: '#f8f8f8',
              borderRadius: '8px',
            }}
          >
            <ProjectOutlined
              style={{
                fontSize: '64px',
                color: '#d9d9d9',
                marginBottom: '16px',
              }}
            />
            <Title level={3} style={{ marginBottom: '16px' }}>
              No Projects Found
            </Title>
            <Text style={{ marginBottom: '24px', color: '#8c8c8c' }}>
              Get started by creating your first project
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<ProjectOutlined />}
              onClick={() => navigate('/addprojects')}
            >
              Create New Project
            </Button>
          </div>
        </Card>
      );
    }

    const transformedProjects = transformProjectsForDisplay();

    return (
      <Card
        className="projects-card"
        bordered={false}
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: '8px',
        }}
      >
        <Table
          dataSource={transformedProjects}
          rowKey={(record) => {
            if (typeof record.projectId === 'object' && record.projectId?.S) {
              return record.projectId.S;
            }
            return String(record.projectId);
          }}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: (
                <Space>
                  <ProjectOutlined />
                  <Text strong>Project</Text>
                </Space>
              ),
              dataIndex: 'projectDisplay',
              key: 'project',
              render: (_, record) => record.projectDisplay,
            },
            {
              title: (
                <Space>
                  <TeamOutlined />
                  <Text strong>Team</Text>
                </Space>
              ),
              dataIndex: 'teamDisplay',
              key: 'team',
              render: (_, record) => record.teamDisplay,
            },
            {
              title: (
                <Space>
                  <CalendarOutlined />
                  <Text strong>Date</Text>
                </Space>
              ),
              dataIndex: 'dateDisplay',
              key: 'date',
              render: (_, record) => record.dateDisplay,
            },
            {
              title: <Text strong>Status</Text>,
              dataIndex: 'statusDisplay',
              key: 'status',
              render: (_, record) => record.statusDisplay,
            },
            {
              title: <Text strong>Actions</Text>,
              key: 'action',
              width: 80,
              render: (_, record) => {
                let id;
                if (
                  typeof record.projectId === 'object' &&
                  record.projectId?.S
                ) {
                  id = record.projectId.S;
                } else {
                  id = String(record.projectId);
                }

                const items = [
                  {
                    key: 'edit',
                    icon: <EditOutlined />,
                    label: 'Edit Project',
                    onClick: () => navigate(`/editproject/${id}`),
                  },
                  {
                    key: 'assign',
                    icon: <UserAddOutlined />,
                    label: 'Assign Team',
                    onClick: () => {
                      setSelectedProject(id);
                      fetchTeams();
                      setTeamModalVisible(true);
                    },
                  },
                  {
                    type: 'divider' as const,
                  },
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: 'Delete Project',
                    danger: true,
                    onClick: () => {
                      const originalProject = projects.find((p) => {
                        const pId =
                          typeof p.projectId === 'object' && p.projectId?.S
                            ? p.projectId.S
                            : String(p.projectId);
                        return pId === id;
                      });

                      const projectName =
                        originalProject?.project || 'Unknown Project';
                      console.log(
                        'Delete clicked for project:',
                        projectName,
                        'with ID:',
                        id
                      );
                      showDeleteConfirm(id, projectName);
                    },
                  },
                ];

                return (
                  <Dropdown
                    menu={{ items }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<SettingOutlined style={{ fontSize: '18px' }} />}
                      className="action-button"
                      style={{
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s',
                      }}
                    />
                  </Dropdown>
                );
              },
            },
          ]}
        />
      </Card>
    );
  };

  const teamAssignmentModal = (
    <Modal
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '10px',
          }}
        >
          <UserAddOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            Assign Team to Project
          </Title>
        </div>
      }
      open={teamModalVisible}
      onCancel={() => {
        setTeamModalVisible(false);
        setSelectedTeam(null);
      }}
      onOk={assignTeamToProject}
      okText="Assign Team"
      okButtonProps={{
        icon: <CheckCircleOutlined />,
        style: { backgroundColor: '#52c41a', borderColor: '#52c41a' },
      }}
      cancelButtonProps={{ icon: <DeleteOutlined /> }}
      confirmLoading={isAssigningTeam}
      width={500}
      centered
      bodyStyle={{ padding: '24px' }}
    >
      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Selected Project:</Text>
          {selectedProject && (
            <Text>
              {projects.find((p) => {
                const pId =
                  typeof p.projectId === 'object' && p.projectId?.S
                    ? p.projectId.S
                    : String(p.projectId);
                return pId === selectedProject;
              })?.project || 'Loading...'}
            </Text>
          )}
        </Space>
      </div>

      <Divider />

      <div style={{ marginBottom: '20px' }}>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>
          Select a team to assign:
        </Text>
        {teamLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
            <div style={{ marginTop: '10px' }}>Loading teams...</div>
          </div>
        ) : teams.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              border: '1px dashed #d9d9d9',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            <TeamOutlined style={{ fontSize: '24px', color: '#d9d9d9' }} />
            <div style={{ marginTop: '10px', color: '#8c8c8c' }}>
              No teams available
            </div>
            <Button
              type="link"
              onClick={() => navigate('/addteam')}
              style={{ marginTop: '10px' }}
            >
              Create a team first
            </Button>
          </div>
        ) : (
          <Select
            style={{ width: '100%' }}
            placeholder="Select a team"
            onChange={(value) => setSelectedTeam(value)}
            value={selectedTeam}
            size="large"
            showSearch
            optionFilterProp="children"
            bordered
            dropdownStyle={{ maxHeight: '400px' }}
          >
            {teams.map((team) => (
              <Option key={team.teamId} value={team.teamId}>
                <Space>
                  <Avatar
                    size="small"
                    icon={<TeamOutlined />}
                    style={{ backgroundColor: colorFromString(team.teamName) }}
                  />
                  {team.teamName}
                </Space>
              </Option>
            ))}
          </Select>
        )}
      </div>
    </Modal>
  );

  return (
    <React.Fragment>
      <ErrorBoundary
        fallback={
          <Card
            style={{
              margin: '40px auto',
              maxWidth: '600px',
              textAlign: 'center',
            }}
          >
            <ExclamationCircleOutlined
              style={{
                fontSize: '48px',
                color: '#ff4d4f',
                marginBottom: '16px',
              }}
            />
            <Title level={3}>Oops! Something went wrong</Title>
            <Text style={{ display: 'block', marginBottom: '24px' }}>
              We encountered an error while loading the projects page.
            </Text>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
              size="large"
            >
              Refresh Page
            </Button>
          </Card>
        }
      >
        <GeneralLayout
          title={'Project Management'}
          buttonLabel="Add New Project"
          navigateLocation="/addprojects"
        >
          <div style={{ padding: '0 0 24px' }}>
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <Card
                  className="stats-card"
                  style={{
                    background:
                      'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    marginBottom: '24px',
                  }}
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card
                        bordered={false}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      >
                        <Statistic
                          title={
                            <Text style={{ color: 'white' }}>
                              Total Projects
                            </Text>
                          }
                          value={projects.length}
                          prefix={<ProjectOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card
                        bordered={false}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      >
                        <Statistic
                          title={
                            <Text style={{ color: 'white' }}>
                              Active Projects
                            </Text>
                          }
                          value={
                            projects.filter(
                              (p) =>
                                p.status.toLowerCase() === 'active' ||
                                p.status.toLowerCase() === 'ongoing'
                            ).length
                          }
                          prefix={<CheckCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card
                        bordered={false}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      >
                        <Statistic
                          title={
                            <Text style={{ color: 'white' }}>
                              Teams Assigned
                            </Text>
                          }
                          value={
                            projects.filter(
                              (p) => p.team !== 'No team assigned'
                            ).length
                          }
                          prefix={<TeamOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>{renderContent()}</Col>
            </Row>
            {teamAssignmentModal}
          </div>
        </GeneralLayout>
      </ErrorBoundary>
      <DeleteConfirmationModal />
    </React.Fragment>
  );
}

const Statistic = ({
  title,
  value,
  prefix,
}: {
  title: React.ReactNode;
  value: number;
  prefix: React.ReactNode;
}) => {
  return (
    <div>
      <div style={{ marginBottom: '8px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {prefix}
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</span>
      </div>
    </div>
  );
};

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
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default Projects;
