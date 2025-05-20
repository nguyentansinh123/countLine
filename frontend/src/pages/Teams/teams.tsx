import { Button, Card, Collapse, Dropdown, List, Menu, MenuProps } from 'antd';
import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import CollapsableComponent from '../../components/CollapsableComponent/CollapsableComponent';

function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/team/getAllTeams', {
          credentials: 'include',
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setTeams(result.data);
        } else {
          console.error(result.message);
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleMenuClick = async (key: string, teamId: string) => {
    if (key === 'edit') {
      navigate(`/editteam/${teamId}`);
    } else if (key === 'delete') {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this team?'
      );
      if (!confirmDelete) return;

      try {
        const response = await fetch(
          `http://localhost:5001/api/team/${teamId}`,
          {
            method: 'DELETE',
            credentials: 'include', // if using cookies
          }
        );

        const result = await response.json();
        if (result.success) {
          setTeams((prevTeams) =>
            prevTeams.filter((item) => item.teamId !== Number(teamId))
          );
        } else {
          alert(result.message || 'Failed to delete team');
        }
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Server error while deleting team');
      }
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

  const collapseItem = teams.map((item) => ({
    key: item.teamId,
    Team: item.teamName ?? 'N/A',
    Members: item.members?.length ?? 0,
    Date: item.dateCreated ?? 'N/A',
    Status: item.status ?? 'N/A',
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
            <div style={{ flex: 1, textAlign: 'center' }}>TEST_RENDER</div>
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
          {item.members?.map(
            (member: { name: string; mail?: string }, index: number) => (
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
                  onClick={() =>
                    navigate(`/users/${member}`, { state: { user: member } })
                  }
                >
                  Details
                </Button>
              </List.Item>
            )
          )}
        </List>
      </div>
    ),
  }));

  return (
    <>
      <GeneralLayout
        title="Teams"
        buttonLabel="Add New Team"
        navigateLocation="/addteam"
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
