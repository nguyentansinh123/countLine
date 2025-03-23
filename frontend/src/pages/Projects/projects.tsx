import { Button, Card, Dropdown, List, Menu } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import ProjectConst from './const/ProjectConst';
import { useNavigate } from 'react-router-dom';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(ProjectConst);

  const handleMenuClick = (key: string, projectId: string) => {
    if (key === 'edit') {
      navigate(`/editproject/${projectId}`);
    } else if (key === 'delete') {
      setProjects((prevProjects) =>
        prevProjects.filter((item) => item.projectId !== Number(projectId))
      );
    }
  };

  const menuItems = (projectId: string) => (
    <Menu onClick={({ key }) => handleMenuClick(key, projectId)}>
      <Menu.Item key="edit">Edit</Menu.Item>
      <Menu.Item key="delete">Delete</Menu.Item>
    </Menu>
  );

  return (
    <>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', margin: 1 }}
      >
        <h2 style={{ color: '#00004C', margin: '0px 40px 10px 10px' }}>
          Projects
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
          onClick={() => navigate('/addprojects')}
        >
          Add New Project
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
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr',
            fontWeight: 'bold',
            paddingBottom: 8,
            borderBottom: '1px solid #ccc',
          }}
        >
          <span>Username</span>
          <span>Team</span>
          <span>Date</span>
          <span>Status</span>
        </div>

        <div
          style={{
            height: '70vh',
            padding: 5,
            overflowY: 'auto',
            paddingRight: 10,
          }}
        >
          <List
            dataSource={projects} // Use projects instead of ProjectConst
            renderItem={(item) => (
              <List.Item
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {/* Left side content */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr',
                    flex: 1,
                  }}
                >
                  <span>
                    <strong>{item.project}</strong>
                    <br />
                  </span>
                  <span>{item.Team}</span>
                  <span>{item.date}</span>
                  <span
                    style={{
                      marginLeft: 40,
                      alignContent: 'right',
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
                  </span>
                </div>

                <Dropdown
                  overlay={menuItems(item.projectId.toString())}
                  placement="bottomRight"
                >
                  <Button
                    style={{ color: '#156CC9', border: 'solid 1px #156CC9' }}
                  >
                    ...
                  </Button>
                </Dropdown>
              </List.Item>
            )}
          />
        </div>
      </Card>
    </>
  );
}

export default Projects;
