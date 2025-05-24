import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from "recharts";
import { 
  Button, Card, Row, Col, Select, Spin, Alert, Statistic, Typography, 
  Divider, Tabs, Space, Badge, Table, Progress
} from "antd";
import GeneralLayout from "../../components/General_Layout/GeneralLayout";
import axios from "axios";

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const chartTypes = ["Bar", "Line", "Pie", "Area", "Radar", "Scatter"];

const COLORS = [
  "#151349", "#4CAF50", "#FF9800", "#F44336", "#2196F3",
  "#9C27B0", "#3F51B5", "#009688", "#795548", "#607D8B"
];

const API_BASE_URL = 'http://localhost:5001';

axios.defaults.withCredentials = true;

const Overview: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Documents");
  const [chartType, setChartType] = useState("Bar");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [documentTypeData, setDocumentTypeData] = useState<any[]>([]);
  const [projectStatusData, setProjectStatusData] = useState<any[]>([]);
  const [teamCollabData, setTeamCollabData] = useState<any[]>([]);
  const [userEngagementData, setUserEngagementData] = useState<any[]>([]);
  const [documentInsights, setDocumentInsights] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [projectStats, setProjectStats] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!dashboardStats) {
        try {
          const dashboardRes = await axios.get(`${API_BASE_URL}/api/statistics/dashboard`);
          if (dashboardRes.data && dashboardRes.data.data) {
            setDashboardStats(dashboardRes.data.data);
          }
        } catch (dashErr) {
          console.error("Error fetching dashboard stats:", dashErr);
        }
      }
      
      switch (activeTab) {
        case "Documents":
          try {
            const typeCountsRes = await axios.get(`${API_BASE_URL}/api/statistics/documents/type-counts`, {
              withCredentials: true
            });
            if (typeCountsRes.data && typeCountsRes.data.data) {
              const typeData = Object.entries(typeCountsRes.data.data).map(([name, count]) => ({
                name,
                count: count as number
              }));
              setDocumentTypeData(typeData);
            }
            
            const insightsRes = await axios.get(`${API_BASE_URL}/api/statistics/documents/insights`);
            if (insightsRes.data && insightsRes.data.data) {
              setDocumentInsights(insightsRes.data.data);
            }
          } catch (docErr) {
            console.error("Error fetching document data:", docErr);
            setError("Failed to load document statistics data.");
          }
          break;
          
        case "Projects":
          try {
            const projectDistRes = await axios.get(`${API_BASE_URL}/api/statistics/projects/progress-distribution`);
            if (projectDistRes.data && projectDistRes.data.data) {
              setProjectStatusData(projectDistRes.data.data);
            }
            
            if (!projectStats) {
              const projectStatsRes = await axios.get(`${API_BASE_URL}/api/statistics/projects`);
              if (projectStatsRes.data && projectStatsRes.data.data) {
                setProjectStats(projectStatsRes.data.data);
              }
            }
          } catch (projErr) {
            console.error("Error fetching project data:", projErr);
            setError("Failed to load project statistics data.");
          }
          break;
          
        case "Teams": 
          try {
            const teamsCollabRes = await axios.get(`${API_BASE_URL}/api/statistics/teams/collaboration-metrics`);
            if (teamsCollabRes.data && teamsCollabRes.data.data) {
              setTeamCollabData(teamsCollabRes.data.data);
            }
            
            if (!teamStats) {
              const teamStatsRes = await axios.get(`${API_BASE_URL}/api/statistics/teams`);
              if (teamStatsRes.data && teamStatsRes.data.data) {
                setTeamStats(teamStatsRes.data.data);
              }
            }
          } catch (teamsErr) {
            console.error("Error fetching teams data:", teamsErr);
            setError("Failed to load team statistics data.");
          }
          break;
          
        case "Users":
          try {
            const usersRes = await axios.get(`${API_BASE_URL}/api/statistics/users/engagement-metrics`);
            if (usersRes.data && usersRes.data.data) {
              setUserEngagementData(usersRes.data.data);
            }
          } catch (usersErr) {
            console.error("Error fetching user engagement data:", usersErr);
            setError("Failed to load user engagement data.");
          }
          break;
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }
    
    let data;
    let dataKey = "count";
    let nameKey = "name";
    let secondaryDataKey = null;
    let tertiaryDataKey = null;
    
    switch (activeTab) {
      case "Documents":
        data = documentTypeData;
        break;
        
      case "Projects":
        data = projectStatusData;
        break;
        
      case "Teams":
        data = teamCollabData;
        dataKey = "collaborationScore";
        nameKey = "teamName";
        secondaryDataKey = "efficiency";
        tertiaryDataKey = "documentCount";
        break;
        
      case "Users":
        data = userEngagementData;
        dataKey = "activeUsers";
        nameKey = "month";
        secondaryDataKey = "documentActivity";
        tertiaryDataKey = "projectActivity";
        break;
        
      default:
        data = [];
    }
    
    if (!data || data.length === 0) {
      return <Alert message="No data available" type="info" />;
    }
    
    const chartHeight = 400;
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 30 },
    };
    
    switch (chartType) {
      case "Line":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={dataKey} name={formatDataKey(dataKey)} stroke={COLORS[0]} strokeWidth={3} activeDot={{ r: 8 }} />
              {secondaryDataKey && (
                <Line type="monotone" dataKey={secondaryDataKey} name={formatDataKey(secondaryDataKey)} stroke={COLORS[1]} strokeWidth={3} />
              )}
              {tertiaryDataKey && (
                <Line type="monotone" dataKey={tertiaryDataKey} name={formatDataKey(tertiaryDataKey)} stroke={COLORS[2]} strokeWidth={3} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case "Area":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey={dataKey} name={formatDataKey(dataKey)} fill={COLORS[0]} stroke={COLORS[0]} fillOpacity={0.6} />
              {secondaryDataKey && (
                <Area type="monotone" dataKey={secondaryDataKey} name={formatDataKey(secondaryDataKey)} fill={COLORS[1]} stroke={COLORS[1]} fillOpacity={0.6} />
              )}
              {tertiaryDataKey && (
                <Area type="monotone" dataKey={tertiaryDataKey} name={formatDataKey(tertiaryDataKey)} fill={COLORS[2]} stroke={COLORS[2]} fillOpacity={0.6} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case "Pie":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={130}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, formatDataKey(dataKey)]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case "Radar":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={nameKey} />
              <PolarRadiusAxis />
              <Radar name={formatDataKey(dataKey)} dataKey={dataKey} stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
              {secondaryDataKey && (
                <Radar name={formatDataKey(secondaryDataKey)} dataKey={secondaryDataKey} stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />
              )}
              {tertiaryDataKey && (
                <Radar name={formatDataKey(tertiaryDataKey)} dataKey={tertiaryDataKey} stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} />
              )}
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      case "Scatter":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="category" dataKey={nameKey} name={nameKey} />
              <YAxis type="number" dataKey={dataKey} name={formatDataKey(dataKey)} />
              {secondaryDataKey && (
                <ZAxis type="number" dataKey={secondaryDataKey} range={[50, 500]} name={formatDataKey(secondaryDataKey)} />
              )}
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={formatDataKey(dataKey)} data={data} fill={COLORS[0]} shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      case "Bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey} name={formatDataKey(dataKey)} fill={COLORS[0]}>
                {activeTab === "Projects" && data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
              {secondaryDataKey && (
                <Bar dataKey={secondaryDataKey} name={formatDataKey(secondaryDataKey)} fill={COLORS[1]} />
              )}
              {tertiaryDataKey && (
                <Bar dataKey={tertiaryDataKey} name={formatDataKey(tertiaryDataKey)} fill={COLORS[2]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };
  
  const formatDataKey = (key: string) => {
    if (!key) return "";
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };
  
  // Generate additional statistics based on the selected tab
  const renderAdditionalStats = () => {
    switch (activeTab) {
      case "Documents":
        return documentInsights ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic 
                  title="Total Documents" 
                  value={documentInsights.totalDocuments} 
                  valueStyle={{ color: '#151349' }}
                />
                <div style={{ marginTop: 10 }}>
                  <Badge status="processing" text={`Monthly Growth: ${documentInsights.growthRate}%`} />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic 
                  title="Total Storage" 
                  value={documentInsights.storage.totalSize} 
                  valueStyle={{ color: '#151349' }}
                />
                <div style={{ marginTop: 10 }}>
                  <Text type="secondary">Average: {documentInsights.storage.averageSize} per document</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic 
                  title="Document Age" 
                  value={documentInsights.age.averageAgeInDays} 
                  suffix="days (avg)" 
                  valueStyle={{ color: '#151349' }}
                />
                <div style={{ marginTop: 10 }}>
                  <Text type="secondary">Oldest: {documentInsights.age.oldestDocumentInDays} days</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24}>
              <Card title="Top Editors">
                <Table 
                  dataSource={documentInsights.topEditors}
                  columns={[
                    { title: 'User', dataIndex: 'userId', key: 'userId' },
                    { 
                      title: 'Edits', 
                      dataIndex: 'count', 
                      key: 'count',
                      render: (count) => (
                        <Progress 
                          percent={Math.round((count / documentInsights.topEditors[0].count) * 100)} 
                          format={() => count}
                          strokeColor="#151349"
                        />
                      )
                    }
                  ]}
                  pagination={false}
                  rowKey="userId"
                />
              </Card>
            </Col>
          </Row>
        ) : null;
        
      case "Projects":
        return projectStats ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic 
                  title="Total Projects" 
                  value={projectStats.total} 
                  valueStyle={{ color: '#151349' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic 
                  title="In Progress" 
                  value={projectStats.inProgress} 
                  valueStyle={{ color: '#FFC107' }}
                />
                <div style={{ marginTop: 10 }}>
                  <Progress 
                    percent={Math.round((projectStats.inProgress / projectStats.total) * 100)} 
                    showInfo={false} 
                    strokeColor="#FFC107" 
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic 
                  title="Finished" 
                  value={projectStats.finished} 
                  valueStyle={{ color: '#4CAF50' }}
                />
                <div style={{ marginTop: 10 }}>
                  <Progress 
                    percent={Math.round((projectStats.finished / projectStats.total) * 100)} 
                    showInfo={false} 
                    strokeColor="#4CAF50" 
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic 
                  title="Drafted" 
                  value={projectStats.drafted} 
                  valueStyle={{ color: '#FF5252' }}
                />
                <div style={{ marginTop: 10 }}>
                  <Progress 
                    percent={Math.round((projectStats.drafted / projectStats.total) * 100)} 
                    showInfo={false} 
                    strokeColor="#FF5252" 
                  />
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          dashboardStats?.projects ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic 
                    title="Total Projects" 
                    value={dashboardStats.projects.total} 
                    valueStyle={{ color: '#151349' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic 
                    title="In Progress" 
                    value={dashboardStats.projects.current} 
                    valueStyle={{ color: '#FFC107' }}
                  />
                  <div style={{ marginTop: 10 }}>
                    <Progress 
                      percent={Math.round((dashboardStats.projects.current / dashboardStats.projects.total) * 100)} 
                      showInfo={false} 
                      strokeColor="#FFC107" 
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic 
                    title="Completed" 
                    value={dashboardStats.projects.past} 
                    valueStyle={{ color: '#4CAF50' }}
                  />
                  <div style={{ marginTop: 10 }}>
                    <Progress 
                      percent={Math.round((dashboardStats.projects.past / dashboardStats.projects.total) * 100)} 
                      showInfo={false} 
                      strokeColor="#4CAF50" 
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic 
                    title="Cancelled" 
                    value={dashboardStats.projects.dismissed} 
                    valueStyle={{ color: '#F44336' }}
                  />
                  <div style={{ marginTop: 10 }}>
                    <Progress 
                      percent={Math.round((dashboardStats.projects.dismissed / dashboardStats.projects.total) * 100)} 
                      showInfo={false} 
                      strokeColor="#F44336" 
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          ) : null
        );
        
      case "Teams":
        return teamCollabData.length > 0 ? (
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title="Team Collaboration Overview">
                <Table 
                  dataSource={teamCollabData}
                  columns={[
                    { title: 'Team Name', dataIndex: 'teamName', key: 'teamName' },
                    { 
                      title: 'Collaboration Score', 
                      dataIndex: 'collaborationScore', 
                      key: 'collaborationScore',
                      render: (score) => (
                        <Progress 
                          percent={score} 
                          format={() => `${score}%`}
                          status={score > 60 ? "success" : score > 30 ? "normal" : "exception"}
                        />
                      ),
                      sorter: (a, b) => a.collaborationScore - b.collaborationScore,
                      defaultSortOrder: 'descend'
                    },
                    { title: 'Documents', dataIndex: 'documentCount', key: 'documentCount' },
                    { title: 'Projects', dataIndex: 'projectCount', key: 'projectCount' },
                    { title: 'Members', dataIndex: 'memberCount', key: 'memberCount' }
                  ]}
                  pagination={false}
                  rowKey="teamName"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="Team Status Distribution">
                {teamStats && (
                  <>
                    <div style={{ marginBottom: 15 }}>
                      <Statistic 
                        title="Total Teams" 
                        value={teamStats.total} 
                        valueStyle={{ color: '#151349' }}
                      />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <Text>Active Teams</Text>
                      <Progress 
                        percent={Math.round((teamStats.active / teamStats.total) * 100)} 
                        format={() => teamStats.active}
                        strokeColor="#4CAF50" 
                      />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <Text>In Progress Teams</Text>
                      <Progress 
                        percent={Math.round((teamStats.inProgress / teamStats.total) * 100)} 
                        format={() => teamStats.inProgress}
                        strokeColor="#FFC107" 
                      />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <Text>Inactive Teams</Text>
                      <Progress 
                        percent={Math.round((teamStats.inactive / teamStats.total) * 100)} 
                        format={() => teamStats.inactive}
                        strokeColor="#607D8B" 
                      />
                    </div>
                  </>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="Team Performance Metrics">
                {teamCollabData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={teamCollabData.slice(0, 4)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="teamName" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Collaboration Score" dataKey="collaborationScore" stroke="#151349" fill="#151349" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>
          </Row>
        ) : (
          dashboardStats?.teams ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic 
                    title="Total Teams" 
                    value={dashboardStats.teams.total} 
                    valueStyle={{ color: '#151349' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic 
                    title="Active Teams" 
                    value={dashboardStats.teams.current} 
                    valueStyle={{ color: '#4CAF50' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic 
                    title="Inactive Teams" 
                    value={dashboardStats.teams.dismissed + dashboardStats.teams.past} 
                    valueStyle={{ color: '#607D8B' }}
                  />
                </Card>
              </Col>
            </Row>
          ) : null
        );
        
      case "Users":
        const latestMonth = userEngagementData && userEngagementData.length > 0 
          ? userEngagementData[userEngagementData.length - 1] 
          : null;
          
        return latestMonth ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic 
                  title="Active Users (Current)" 
                  value={latestMonth.activeUsers} 
                  valueStyle={{ color: '#151349' }}
                />
                <div style={{ marginTop: 10 }}>
                  {userEngagementData.length > 1 && (
                    <Badge 
                      status="processing" 
                      text={`Growth: ${Math.round(((latestMonth.activeUsers / userEngagementData[userEngagementData.length - 2].activeUsers) - 1) * 100)}%`} 
                    />
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic 
                  title="Documents Created" 
                  value={latestMonth.documentActivity} 
                  valueStyle={{ color: '#2196F3' }}
                />
                <div style={{ marginTop: 10 }}>
                  <Text type="secondary">Current Month</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic 
                  title="Projects Activity" 
                  value={latestMonth.projectActivity} 
                  valueStyle={{ color: '#FF9800' }}
                />
                <div style={{ marginTop: 10 }}>
                  <Text type="secondary">Current Month</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24}>
              <Card title="User Activity Trend">
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Active Users" key="1">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={userEngagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="activeUsers" stroke="#151349" fill="#151349" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </TabPane>
                  <TabPane tab="Document Activity" key="2">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={userEngagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="documentActivity" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </TabPane>
                  <TabPane tab="Project Activity" key="3">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={userEngagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="projectActivity" stroke="#FF9800" fill="#FF9800" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
        ) : null;
        
      default:
        return null;
    }
  };

  return (
    <GeneralLayout title="Statistics Dashboard" noBorder={true}>
      <div style={{ marginBottom: "20px" }}>
        <Row gutter={16} align="middle">
          <Col>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {["Documents", "Projects", "Teams", "Users"].map((tab) => (
                <Button 
                  key={tab} 
                  type={activeTab === tab ? "primary" : "default"} 
                  onClick={() => setActiveTab(tab)}
                  size="large"
                >
                  {tab}
                </Button>
              ))}
            </div>
          </Col>
          <Col flex="auto" />
          <Col>
            <Space>
              <Text strong>Chart Type:</Text>
              <Select 
                value={chartType} 
                style={{ width: 120 }} 
                onChange={value => setChartType(value)}
              >
                {chartTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>
      </div>
      
      {renderAdditionalStats()}
      
      <Divider />
      
      <Card>
        <Title level={4} style={{ marginBottom: 20 }}>
          {activeTab} {chartType} Chart
        </Title>
        {renderChart()}
      </Card>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Quick Overview">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="Total Documents" 
                  value={documentInsights?.totalDocuments || 0} 
                  valueStyle={{ color: '#151349' }} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Total Projects" 
                  value={projectStats?.total || dashboardStats?.projects?.total || 0} 
                  valueStyle={{ color: '#FF9800' }} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Teams" 
                  value={teamStats?.total || dashboardStats?.teams?.total || 0} 
                  valueStyle={{ color: '#4CAF50' }} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Active Users" 
                  value={userEngagementData?.length > 0 ? userEngagementData[userEngagementData.length - 1].activeUsers : 0} 
                  valueStyle={{ color: '#2196F3' }} 
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Storage Usage">
            {documentInsights?.storage && (
              <>
                <Statistic 
                  title="Total Storage Used" 
                  value={documentInsights.storage.totalSize} 
                  valueStyle={{ color: '#151349' }} 
                />
                <div style={{ marginTop: 15 }}>
                  <div style={{ marginBottom: 5 }}>
                    <Text>Average Document Size: {documentInsights.storage.averageSize}</Text>
                  </div>
                  <div style={{ marginBottom: 5 }}>
                    <Text>Largest Document: {documentInsights.storage.largestDocument}</Text>
                  </div>
                  <div style={{ marginTop: 15 }}>
                    <Progress 
                      percent={75} 
                      status="active" 
                      strokeColor={{
                        '0%': '#151349',
                        '100%': '#4CAF50',
                      }}
                      format={() => 'Usage'}
                    />
                  </div>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </GeneralLayout>
  );
};

export default Overview;
