import { Button, Card, Collapse, Dropdown, List, Menu } from 'antd';
import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TeamConst from '../Teams/const/TeamsConst';

function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState(TeamConst);

  const handleMenuClick = (key: string, teamId: string) => {
    if (key === 'edit') {
      navigate(`/editteam/${teamId}`);
    } else if (key === 'delete') {
      setTeams((prevTeams) =>
        prevTeams.filter((item) => item.teamId !== Number(teamId))
      );
    }
  };

  const menuItems = (teamId: string) => (
    <Menu onClick={({ key }) => handleMenuClick(key, teamId)}>
      <Menu.Item key="edit">Edit</Menu.Item>
      <Menu.Item key="delete">Delete</Menu.Item>
    </Menu>
  );

  useEffect(() => {
    setTeams(TeamConst);
  }, []);

  const collapseItem = teams.map((item) => ({
    key: item.teamId,
    label: (
      <List>
        <List.Item
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '10px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <strong>{item.teamName}</strong>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              {item.members ? item.members.length : 0}
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>{item.date}</div>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                fontWeight: 'bold',
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
          </div>
          <Dropdown
            overlay={menuItems(item.teamId.toString())}
            placement="bottomRight"
          >
            <Button style={{ color: '#156CC9', border: 'solid 1px #156CC9' }}>
              ...
            </Button>
          </Dropdown>
        </List.Item>
      </List>
    ),
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            margin: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {item.description}
        </div>
        <List>
          {item.members?.map((member, index) => (
            <List.Item
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <div>
                <span>{member.name}</span>
              </div>
              <Button
                onClick={() => navigate(`/users`, { state: { user: member } })}
              >
                Details
              </Button>
            </List.Item>
          ))}
        </List>
      </div>
    ),
  }));

  return (
    <>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', margin: 1 }}
      >
        <h2 style={{ color: '#00004C', margin: '0px 40px 10px 10px' }}>
          Teams
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          shape="round"
          size="large"
          style={{
            backgroundColor: '#335DFF',
            border: 'none',
            margin: '0px 40px 10px 10px',
          }}
          onClick={() => navigate('/addteam')}
        >
          Add New Team
        </Button>
      </div>
      <Card
        style={{
          width: '98%',
          maxWidth: '98%',
          height: '80vh',
          border: 'solid 1px',
          margin: '0 0 0 10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 70,
            fontWeight: 'bold',
            width: '100%',
            margin: '0 auto',
            paddingBottom: 8,
            borderBottom: '1px solid #ccc',
          }}
        >
          <div style={{ flex: 1, textAlign: 'left', marginLeft: 40 }}>
            Username
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>Team</div>
          <div style={{ flex: 1, textAlign: 'center' }}>Date</div>
          <div style={{ flex: 1, textAlign: 'center', marginRight: 100 }}>
            Status
          </div>
        </div>

        <div
          style={{
            height: '70vh',
            padding: 5,
            overflowY: 'auto',
            paddingRight: 10,
          }}
        >
          <Collapse
            expandIcon={() => null}
            items={collapseItem}
            style={{
              marginTop: 0,
              backgroundColor: 'transparent',
              border: 'none',
            }}
          />
        </div>
      </Card>
    </>
  );
}

export default Teams;
