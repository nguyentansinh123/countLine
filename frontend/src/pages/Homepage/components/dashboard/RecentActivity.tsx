import { Button, Card, List } from 'antd';
import currentActivities from '../../components/const/currentActivitiesConst';
import { useNavigate } from 'react-router-dom';
const RecentActivity = () => {
    const navigate=useNavigate();
  return (
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
              maxHeight: '40vh',
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
  )
}

export default RecentActivity