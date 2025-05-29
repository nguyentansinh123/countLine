import { 
  Button, 
  Card, 
  Collapse, 
  Dropdown, 
  List, 
  Input, 
  Empty, 
  Modal, 
  message, 
  Tag, 
  Skeleton, 
  Avatar, 
  Badge, 
  Tooltip,
  Divider
} from 'antd';
import React, { useState, useEffect } from 'react';
import { 
  PlusOutlined, 
  TeamOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  UserOutlined,
  RightOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';

function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<number[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<any>(null);
  const { Panel } = Collapse;

  // Filter teams based on search
  const filteredTeams = searchTerm
    ? teams.filter(team => 
        team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : teams;

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/team/getAllTeams', {
        credentials: 'include',
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTeams(result.data);
      } else {
        messageApi.error(result.message || 'Failed to fetch teams');
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      messageApi.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/users/getAllUser', {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const getUserById = (userId: string) => {
    return users.find((user) => user.user_id === userId);
  };

  const showDeleteModal = (team: any) => {
    setTeamToDelete(team);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOk = async () => {
    if (!teamToDelete) return;
    
    try {
      const response = await fetch(
        `http://localhost:5001/api/team/${teamToDelete.teamId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const result = await response.json();
      if (result.success) {
        setTeams((prevTeams) =>
          prevTeams.filter((item) => item.teamId !== teamToDelete.teamId)
        );
        messageApi.success(`Team "${teamToDelete.teamName}" deleted successfully`);
      } else {
        messageApi.error(result.message || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      messageApi.error('Server error while deleting team');
    } finally {
      setIsDeleteModalOpen(false);
      setTeamToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTeamToDelete(null);
  };

  // Toggle expanded team
  const toggleTeamExpand = (teamId: number) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Invalid Date' 
        : date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Get status tag color
  const getStatusTag = (status?: string) => {
    if (!status) return <Tag color="default">Unknown</Tag>;
    
    switch (status.toLowerCase()) {
      case 'finished':
        return (
          <Tag 
            icon={<CheckCircleOutlined />} 
            color="success"
            style={{ fontWeight: 500, borderRadius: '12px' }}
          >
            Finished
          </Tag>
        );
      case 'in progress':
        return (
          <Tag 
            icon={<ClockCircleOutlined />} 
            color="processing"
            style={{ fontWeight: 500, borderRadius: '12px' }}
          >
            In Progress
          </Tag>
        );
      case 'cancelled':
        return (
          <Tag 
            icon={<CloseCircleOutlined />} 
            color="error"
            style={{ fontWeight: 500, borderRadius: '12px' }}
          >
            Cancelled
          </Tag>
        );
      case 'draft':
      case 'drafted':
        return (
          <Tag 
            icon={<InfoCircleOutlined />} 
            color="default"
            style={{ fontWeight: 500, borderRadius: '12px' }}
          >
            Draft
          </Tag>
        );
      default:
        return (
          <Tag 
            color="default"
            style={{ fontWeight: 500, borderRadius: '12px' }}
          >
            {status}
          </Tag>
        );
    }
  };

  // Handle team actions
  const handleTeamAction = (action: string, team: any) => {
    switch (action) {
      case 'edit':
        navigate(`/editteam/${team.teamId}`);
        break;
      case 'delete':
        showDeleteModal(team);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {contextHolder}
      <GeneralLayout
        title="Teams"
        buttonLabel="Add New Team"
        navigateLocation="/addteam"
      >
        <div style={{ padding: '0 16px' }}>
          {/* Search Bar and Stats */}
          <Card 
            style={{ 
              marginBottom: '16px', 
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <Input
                placeholder="Search teams by name or description"
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '300px', 
                  borderRadius: '6px'
                }}
                allowClear
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(22, 119, 255, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(22, 119, 255, 0.2)'
                }}>
                  <TeamOutlined style={{ color: '#1677ff', marginRight: '8px' }} />
                  <span style={{ fontWeight: 500, color: '#1f2937' }}>
                    Total Teams
                  </span>
                  <div style={{ 
                    background: '#1677ff', 
                    color: 'white', 
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    marginLeft: '8px',
                    minWidth: '24px',
                    textAlign: 'center'
                  }}>
                    {teams.length}
                  </div>
                </div>
                
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchTeams}
                  loading={loading}
                  style={{ borderRadius: '6px' }}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </Card>

          {/* Teams list */}
          <Card 
            bodyStyle={{ padding: '0' }}
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          >
            {loading ? (
              <div style={{ padding: '24px' }}>
                <Skeleton active paragraph={{ rows: 5 }} />
              </div>
            ) : filteredTeams.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchTerm ? "No teams match your search" : "No teams found"
                }
                style={{ padding: '40px 0' }}
              />
            ) : (
              <div style={{ overflow: 'auto' }}>
                {/* Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 2fr 1fr 1fr 1fr 60px',
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#4b5563',
                  }}
                >
                  <div></div>
                  <div>Team Name</div>
                  <div>Members</div>
                  <div>Status</div>
                  <div>Created</div>
                  <div>Actions</div>
                </div>

                {/* Team rows */}
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {filteredTeams.map((team) => (
                    <div key={team.teamId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      {/* Team row */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '24px 2fr 1fr 1fr 1fr 60px',
                          padding: '12px 16px',
                          alignItems: 'center',
                          borderLeft: expandedTeams.includes(team.teamId) 
                            ? '3px solid #1677ff' 
                            : '3px solid transparent',
                          background: expandedTeams.includes(team.teamId) 
                            ? '#f0f7ff' 
                            : 'white',
                        }}
                      >
                        {/* Expand/Collapse button */}
                        <div>
                          <Button
                            type="text"
                            icon={expandedTeams.includes(team.teamId) ? <DownOutlined /> : <RightOutlined />}
                            size="small"
                            onClick={() => toggleTeamExpand(team.teamId)}
                            style={{ color: '#6b7280' }}
                          />
                        </div>

                        {/* Team info */}
                        <div>
                          <div style={{ fontWeight: 500 }}>{team.teamName || 'Unnamed Team'}</div>
                          {team.description && (
                            <div 
                              style={{ 
                                fontSize: '12px', 
                                color: '#6b7280',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '300px'
                              }}
                            >
                              {team.description}
                            </div>
                          )}
                        </div>

                        {/* Members count */}
                        <div>
                          <Badge 
                            count={team.members?.length || 0} 
                            style={{ backgroundColor: (team.members?.length || 0) > 0 ? '#1677ff' : '#d9d9d9' }}
                            showZero 
                          />
                        </div>

                        {/* Status */}
                        <div>
                          {getStatusTag(team.status)}
                        </div>

                        {/* Created date */}
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                          {formatDate(team.dateCreated)}
                        </div>

                        {/* Actions */}
                        <div>
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: 'edit',
                                  icon: <EditOutlined />,
                                  label: 'Edit Team',
                                  onClick: () => handleTeamAction('edit', team),
                                },
                                {
                                  type: 'divider',
                                },
                                {
                                  key: 'delete',
                                  icon: <DeleteOutlined />,
                                  label: 'Delete Team',
                                  danger: true,
                                  onClick: () => handleTeamAction('delete', team),
                                },
                              ],
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                          >
                            <Button 
                              type="text" 
                              icon={<MoreOutlined />}
                              style={{ color: '#6b7280' }}
                            />
                          </Dropdown>
                        </div>
                      </div>

                      {/* Team details (expandable) */}
                      {expandedTeams.includes(team.teamId) && (
                        <div style={{ padding: '0 16px 16px 56px', background: '#f9fafb' }}>
                          <Divider style={{ margin: '0 0 16px 0' }} />
                          
                          {/* Description */}
                          {team.description && (
                            <div style={{ marginBottom: '16px' }}>
                              <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Description</h4>
                              <div style={{ 
                                padding: '12px 16px', 
                                background: 'white', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                color: '#4b5563',
                                fontSize: '14px'
                              }}>
                                {team.description}
                              </div>
                            </div>
                          )}
                          
                          {/* Team members */}
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', color: '#374151', display: 'flex', alignItems: 'center' }}>
                              Team Members
                              <Badge 
                                count={team.members?.length || 0} 
                                style={{ 
                                  backgroundColor: '#1677ff',
                                  marginLeft: '8px' 
                                }}
                                showZero
                              />
                            </h4>
                            
                            {team.members && team.members.length > 0 ? (
                              <div style={{
                                background: 'white',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden'
                              }}>
                                {team.members.map((memberId: string, index: number) => {
                                  const user = getUserById(memberId);
                                  return (
                                    <div
                                      key={memberId || index}
                                      style={{
                                        display: 'grid',
                                        gridTemplateColumns: '3fr 1fr auto',
                                        padding: '12px 16px',
                                        alignItems: 'center',
                                        borderBottom: index < team.members.length - 1 ? '1px solid #f3f4f6' : 'none'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Avatar 
                                          src={user?.profilePicture}
                                          icon={!user?.profilePicture && <UserOutlined />}
                                          style={{ backgroundColor: user?.profilePicture ? undefined : '#1677ff' }}
                                        />
                                        <div>
                                          <div style={{ fontWeight: 500 }}>{user?.name || 'Unknown User'}</div>
                                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{user?.email || 'No email'}</div>
                                        </div>
                                      </div>
                                      
                                      <Tag 
                                        color={user?.role === 'admin' ? '#ff4d4f' : '#1677ff'} 
                                        style={{ borderRadius: '12px' }}
                                      >
                                        {user?.role || 'Member'}
                                      </Tag>
                                      
                                      <Button
                                        type="primary"
                                        size="small"
                                        onClick={() => navigate(`/users/${memberId}`)}
                                        style={{ borderRadius: '6px' }}
                                      >
                                        View Profile
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No members in this team"
                                style={{ 
                                  padding: '24px',
                                  background: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px'
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>Delete Team</span>
            </div>
          }
          open={isDeleteModalOpen}
          onOk={handleDeleteOk}
          onCancel={handleDeleteCancel}
          okText="Delete"
          okButtonProps={{ 
            danger: true,
            style: { borderRadius: '6px' }
          }}
          cancelButtonProps={{ 
            style: { borderRadius: '6px' } 
          }}
          width={400}
          centered
        >
          {teamToDelete && (
            <>
              <div style={{
                backgroundColor: '#fff2f0',
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '16px',
                border: '1px solid #ffccc7',
              }}>
                <p style={{ fontWeight: 500, color: '#cf1322', margin: 0 }}>
                  Warning: This action cannot be undone
                </p>
                <p style={{ color: '#ff4d4f', margin: '4px 0 0 0', fontSize: '13px' }}>
                  All team data will be permanently deleted
                </p>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                padding: '12px 16px',
                border: '1px solid #f0f0f0',
                borderRadius: '6px',
                marginBottom: '16px',
                background: '#f9fafb'
              }}>
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                  {teamToDelete.teamName}
                </div>
                
                {teamToDelete.description && (
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    {teamToDelete.description}
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TeamOutlined style={{ color: '#6b7280' }} />
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      {teamToDelete.members?.length || 0} members
                    </span>
                  </div>
                  
                  <div>
                    {getStatusTag(teamToDelete.status)}
                  </div>
                </div>
              </div>
              
              <p style={{ textAlign: 'center', marginBottom: 0 }}>
                Are you sure you want to delete this team?
              </p>
            </>
          )}
        </Modal>
      </GeneralLayout>
    </>
  );
}

export default Teams;
