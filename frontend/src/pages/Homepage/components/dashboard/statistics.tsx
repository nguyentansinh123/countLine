import { Card, Button, List } from 'antd'
import React, { useEffect, useState } from 'react'
import { Route, useNavigate } from 'react-router-dom'
import NDA from '../../../NDA/NDA'
import Documents from '../const/documentConst'
import projectConst from '../const/projectConst'
import teamConst from '../const/teamConst'
import Users from '../const/usersConst'
import Chart from '../../../../assets/chart.svg'
import axios from 'axios'
import DocumentLineChart from './BarChart'
import DocumentBarChart from './BarChart'


function statistics() {
   const navigate = useNavigate();
const [teamsData, setTeams] = useState<TeamStats | null>(null);
  const [projectsData, setProjects] = useState<ProjectStats | null>(null);
  const [documentsCount, setDocumentsCount] = useState<DocumentTypeCounts | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
const Colors: Record<string, string> = {
  active: '#52C41A',       // green
  inProgress: '#1890FF',   // blue
  inactive: '#FAAD14',     // orange
  other: '#8C8C8C',        // gray
  total: '#722ED1',        // purple
};

  type DocumentTypeCounts = Record<string, number>;
  type  DashboardStats= {
  teams: {
    current: number;
    dismissed: number;
    past: number;
    total: number;
  };
  projects: {
    current: number;
    dismissed: number;
    past: number;
    total: number;
  };
}
type TeamStats ={
  active: number;
  inProgress: number;
  inactive: number;
  other: number;
  total: number;
}
type ProjectStats = {
  finished: number;
  inProgress: number;
  drafted: number;
  cancelled: number;
  other: number;
  total: number;
}
 const fetchStats= async()=> {
      console.log("fecth started")
      try {
        console.log("trying")
        setLoading(true);
        setError('');

        // Example: Replace with your actual API base URL
        const API_BASE =  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
        console.log(API_BASE)
        const teamsRes=    await axios.get(`${API_BASE}/api/statistics/teams`, {
          withCredentials: true
        });
        const projectsRes =await axios.get(`${API_BASE}/api/statistics/projects`, {
          withCredentials: true
        });
        const dashboardRes=await axios.get(`${API_BASE}/api/statistics/dashboard`, {
          withCredentials: true
        });
        const documentsRes = await axios.get(`${API_BASE}/api/statistics/documents/type-counts`,{
          withCredentials: true});
        
          console.log("heelo")
          
        if (!teamsRes.data.success || !projectsRes.data.success || !dashboardRes.data.success || !documentsRes.data.success) {
          throw new Error('Failed to fetch some statistics');
        }
        console.log("team1",teamsRes.data);
        console.log("team2",teamsRes.data.data)
        setTeams(teamsRes.data.data as TeamStats);
        setProjects(projectsRes.data.data as ProjectStats);
        setDashboardStats(dashboardRes.data.data as DashboardStats);
        setDocumentsCount(documentsRes.data.data as DocumentTypeCounts);
        
    
      } catch (err) {
        console.error(err, 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
   
    fetchStats();
  }, []);
   console.log(teamsData,"team")
   console.log(documentsCount,"docOC")
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
            overflowY:'auto',
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
              <h2 style={{ marginTop: 0,width: '30%', }}>Documents</h2>

              <div style={{ 
                height:' 100%' }}>
                {Object.entries(Documents).map(([]) => (
                  <div style={{ margin: 0 }}>
         
                  </div>
                ))}
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
        <DocumentBarChart  data={documentsCount ? [{ name: "Documents", ...documentsCount }] : []} />
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
              <div style={{ maxHeight: 220, height: 220, overflowY:'auto' }}>
              {teamsData &&
            Object.entries(teamsData).map(([key, value]) => (
              <div key={key} style={{ marginLeft: 20, marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>{key}</h3>
                <div style={{ color: Colors[key] || 'white' }}>{value}</div>
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
              <h2 style={{ marginTop: 0, marginLeft: 20, width:'100%' }}>Projects</h2>
              <div style={{ maxHeight: 220, height: 220, overflowY:'auto' }}>
              {projectsData &&
            Object.entries(projectsData).map(([key, value]) => (
              <div key={key} style={{ marginLeft: 20, marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>{key}</h3>
                <div style={{ color: Colors[key] || 'white' }}>{value}</div>
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
           
          </div>
        </Card>
      </div>

    </>
  )
}

export default statistics