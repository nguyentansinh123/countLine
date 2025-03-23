import { Button, Card, List } from 'antd';
import { Route, useNavigate } from 'react-router-dom';
import NDA from '../NDA/NDA';
import Chart from '../../assets/chart.svg';
import Documents from './components/const/documentConst';
import Users from './components/const/usersConst';
import currentActivities from './components/const/currentActivitiesConst';
import projectConst from './components/const/projectConst';
import teamConst from './components/const/teamConst';

function HomePage() {
  const navigate = useNavigate();
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
            maxHeight: 400,
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
                <img src={Chart}></img>
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
                  {Object.entries(Documents).map(([key]) => (
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
                      <div
                        style={{
                          height: 10,
                          width: 10,
                          backgroundColor:
                            key === 'IP'
                              ? '#52C41A'
                              : key === 'NDA'
                                ? '#01B4D2'
                                : '#FD0000',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      ></div>
                      <span>{key}</span>
                    </div>
                  ))}
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
              <div style={{ maxHeight: 220, height: 220 }}>
                {Object.entries(teamConst).map(([key, value]) => (
                  <div style={{ margin: 0 }}>
                    <h4 style={{ margin: 2, marginTop: 10, marginLeft: 20 }}>
                      {key}
                    </h4>
                    <div
                      style={{
                        margin: 2,
                        marginTop: 10,
                        marginLeft: 20,
                        color:
                          key === 'Current Team'
                            ? '#01B4D2'
                            : key === 'Dismissed Team'
                              ? '#FD0000'
                              : '#35B700',
                      }}
                    >
                      {value}
                    </div>
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
              <div style={{ maxHeight: 220, height: 220 }}>
                {Object.entries(projectConst).map(([key, value]) => (
                  <div style={{ margin: 0 }}>
                    <h4 style={{ margin: 2, marginTop: 10, marginLeft: 20 }}>
                      {key}
                    </h4>
                    <div
                      style={{
                        margin: 2,
                        marginTop: 10,
                        marginLeft: 20,
                        color:
                          key === 'Current Projects'
                            ? '#01B4D2'
                            : key === 'Dismissed Projects'
                              ? '#FD0000'
                              : '#35B700',
                      }}
                    >
                      {value}
                    </div>
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
                  dataSource={Users}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <List.Item.Meta
                        avatar={item.profilepic}
                        title={
                          <strong style={{ color: 'white' }}>
                            {item.username}
                          </strong>
                        }
                        description={
                          <span style={{ color: 'white' }}>
                            {item.userRoles.join(', ')}
                          </span>
                        }
                        style={{ color: 'white' }}
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
          </div>
        </Card>
      </div>

      <div
        className="Activities"
        style={{
          margin: '0px 40px 0px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            margin: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <h2 style={{ marginLeft: 20, marginBottom: 0, color: '#00004C' }}>
            {' '}
            Activities
          </h2>
          <a
            onClick={() => navigate('/activities')}
            style={{
              marginRight: 20,
              marginBottom: 0,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            View all Activities
          </a>
        </div>

        <Card
          style={{
            width: '100%',
          
            border: 'solid 1px',
            marginTop: 0,
          }}
        >
          <div
            style={{
              maxHeight: 350,
              overflowY: 'auto',
              paddingRight: 10,
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={currentActivities}
              renderItem={(item) => (
                <List.Item
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <List.Item.Meta
                    title={<strong>{item.username}</strong>}
                    description={item.project}
                  />
                  <div
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'right',
                      color:
                        item.status === 'Finished'
                          ? 'green'
                          : item.status === 'In Progress'
                            ? 'orange'
                            : 'red',
                    }}
                  >
                    {item.status}
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
export default HomePage;
