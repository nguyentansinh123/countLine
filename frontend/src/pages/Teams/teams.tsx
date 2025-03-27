import { Button, Card, Collapse, Dropdown, List, Menu, MenuProps } from 'antd';
import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TeamConst from '../Teams/const/TeamsConst';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import CollapsableComponent from '../../components/CollapsableComponent/CollapsableComponent';

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

const menuItems = (item: any): MenuProps => {
    return {
      items: [
        {
          key: 'edit',
          label: 'Edit',
          onClick: () => handleMenuClick('edit', item),
        },
        {
          key: 'delete',
          label: 'Delete',
          onClick: () => handleMenuClick('delete', item),
        },
      ],
    };
  };

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
              <strong>{item.team}</strong>
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
            menu={menuItems(item.teamId.toString())}
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
     <GeneralLayout 
  title="Teams" 
  buttonLabel="Add New Team" 
  navigateLocation="/addteams" 
>

<CollapsableComponent 
  column={['Team', 'Members', 'Date', 'Status']} 
  data={teams} 
  menu={(item) => menuItems(item.teamId)}
/>

      </GeneralLayout>
    </>
  );
}

export default Teams;
