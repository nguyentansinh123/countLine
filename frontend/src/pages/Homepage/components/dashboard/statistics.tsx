import { Card, Button, List, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { Route, useNavigate } from 'react-router-dom';
import NDA from '../../../NDA/NDA';
import {
  TeamStats,
  ProjectStats,
  DocumentTypeCounts,
  DashboardStats,
  User,
} from '../../../../types';
import axios from 'axios';

import DocumentBarChart from './BarChart';

function statistics() {
  const navigate = useNavigate();

  const [teamsData, setTeams] = useState<TeamStats | null>(null);
  const [projectsData, setProjects] = useState<ProjectStats | null>(null);
  const [documentsCount, setDocumentsCount] =
    useState<DocumentTypeCounts | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);

  const STAT_KEYS = {
    teams: ['active', 'inactive', 'total'] as const,
    projects: ['active', 'inactive', 'total'] as const,
  } as const;
  type TeamKey = (typeof STAT_KEYS.teams)[number];
  type ProjectKey = (typeof STAT_KEYS.projects)[number];

  // Colours for just those three keys
  const Colors: Record<TeamKey | ProjectKey, string> = {
    active: '#52C41A',
    inactive: '#FAAD14',
    total: '#722ED1',
  };

  const fetch = async () => {
    const API_BASE =
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

    try {
      console.log('trying');
      setLoading(true);
      setError('');

      const teamsRes = await axios.get(`${API_BASE}/api/statistics/teams`, {
        withCredentials: true,
      });
      const projectsRes = await axios.get(
        `${API_BASE}/api/statistics/projects`,
        {
          withCredentials: true,
        }
      );
      const dashboardRes = await axios.get(
        `${API_BASE}/api/statistics/dashboard`,
        {
          withCredentials: true,
        }
      );
      const documentsRes = await axios.get(
        `${API_BASE}/api/statistics/documents/type-counts`,
        {
          withCredentials: true,
        }
      );

      if (
        !teamsRes.data.success ||
        !projectsRes.data.success ||
        !dashboardRes.data.success ||
        !documentsRes.data.success
      ) {
        throw new Error('Failed to fetch some statistics');
      }
      console.log('team1', teamsRes.data);
      console.log('team2', teamsRes.data.data);
      setTeams(teamsRes.data.data as TeamStats);
      setProjects(projectsRes.data.data as ProjectStats);
      setDashboardStats(dashboardRes.data.data as DashboardStats);
      setDocumentsCount(documentsRes.data.data as DocumentTypeCounts);
    } catch (err) {
      console.error(err, 'Unknown error');
    } finally {
      setLoading(false);
    }
    try {
      const checkUser = await axios.get(`${API_BASE}/api/users/me`, {
        withCredentials: true,
      });
      const user = checkUser.data as User;

      if (user.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error(error, 'Admin check error');
      setIsAdmin(false);
    }
    try {
      const res = await axios.get(
        'http://localhost:5001/api/users/getAllUser',
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const allUsers = res.data.data as User[];
        const admins = allUsers.filter((u) => u.role === 'admin');

        setSystemUsers(admins);
        console.log(res.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetch();
  }, []);
  console.log(teamsData, 'team');
  console.log(documentsCount, 'docOC');
  return (
    <>
      <div
        className="Statistics"
        style={{
          margin: '0px 40px 0px 40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Card
          variant="borderless"
          style={{
            width: '100%',
            overflowY: 'auto',
            maxHeight: '40vh',
            backgroundColor: '#151349',
            margin: 'none',
            padding: 'none',
            color: 'white',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              margin: 0,
              padding: 0,
              gap: 50,
            }}
          >
            <div
              style={{
                minHeight: '30%',
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'flex-start',
                width: '30%',
                marginTop: 0,
                padding: 5,
              }}
            >
              <h2 style={{ marginTop: 0, width: '30%' }}>Documents</h2>

              <div
                style={{
                  height: ' 100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 5,
                    margin: '0px 0 0 20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      width: '100%',
                      flexDirection: 'row',
                      alignContent: 'flex-start',
                    }}
                  >
                    {loading ? (
                      <Spin />
                    ) : (
                      <DocumentBarChart data={documentsCount} />
                    )}
                    <div
                      style={{
                        height: 10,
                        width: 10,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    ></div>
                    <span></span>
                  </div>
                </div>
              </div>
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  backgroundColor: '#156CC9',
                  border: 'none',
                  color: 'white',
                  width: '100%',
                }}
                onClick={() => (
                  <Route>
                    <Route path="/nda" element={<NDA />} />
                  </Route>
                )}
              >
                manage Documents
              </Button>
            </div>

            <div
              style={{
                minHeight: '30%',
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'flex-start',
                minWidth: 100,
                width: '20%',
                marginTop: 0,
                padding: 5,
              }}
            >
              <h2 style={{ marginTop: 0, marginLeft: 10 }}>Teams</h2>
              <div style={{ maxHeight: 220, height: 220, overflowY: 'auto' }}>
                {teamsData &&
                  STAT_KEYS.teams.map((key) => (
                    <div key={key} style={{ marginLeft: 20, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                        {key}
                      </h3>
                      <span style={{ color: Colors[key] }}>
                        {teamsData[key]}
                      </span>
                    </div>
                  ))}
              </div>
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  backgroundColor: '#156CC9',
                  border: 'none',
                  color: 'white',
                  width: 200,
                }}
                onClick={() => navigate('/teams')}
              >
                manage Teams
              </Button>
            </div>

            <div
              style={{
                minHeight: '30%',
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'flex-start',
                width: '20%',
                marginTop: 0,
                padding: 5,
              }}
            >
              <h2 style={{ marginTop: 0, marginLeft: 20, width: '100%' }}>
                Projects
              </h2>
              <div style={{ maxHeight: 220, height: 220, overflowY: 'auto' }}>
                {projectsData &&
                  STAT_KEYS.projects.map((key) => (
                    <div key={key} style={{ marginLeft: 20, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                        {key}
                      </h3>
                      <span style={{ color: Colors[key] }}>
                        {key === 'active'
                          ? projectsData.inProgress
                          : key === 'inactive'
                            ? projectsData.cancelled
                            : projectsData.total}
                      </span>
                    </div>
                  ))}
              </div>
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  backgroundColor: '#156CC9',
                  border: 'none',
                  color: 'white',
                  width: 200,
                }}
                onClick={() => navigate('/projects')}
              >
                manage Projects
              </Button>
            </div>
            {isAdmin && (
              <div
                style={{
                  minHeight: '30%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignContent: 'flex-start',
                  width: '30%',
                  marginTop: 0,
                  padding: 5,
                }}
              >
                <h2 style={{ marginTop: 0 }}>Users</h2>
                <div
                  style={{
                    maxHeight: 220,
                    height: 220,
                    overflowY: 'auto',
                    paddingRight: 10,
                  }}
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={systemUsers.slice(-5)}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            <img
                              src={item.profilePicture}
                              style={{
                                borderRadius: '50%',
                                width: 40,
                                height: 40,
                              }}
                            />
                          }
                          title={
                            <strong style={{ color: 'white' }}>
                              {item.name}
                            </strong>
                          }
                          description={
                            <span style={{ color: 'white' }}>
                              Role: {item.role}
                            </span>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
                <Button
                  style={{
                    padding: 10,
                    margin: 10,
                    backgroundColor: '#156CC9',
                    border: 'none',
                    color: 'white',
                    width: 200,
                  }}
                  onClick={() => navigate('/users')}
                >
                  manage Users
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

export default statistics;
