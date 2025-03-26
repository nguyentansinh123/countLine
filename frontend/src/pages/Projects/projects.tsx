import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectConst from './const/ProjectConst';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import ListComponents from '../../components/listComponents/listComponents';
import { Button, Menu, MenuProps } from 'antd';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(ProjectConst);

  const handleMenuClick = (key: string, item: any) => {
    if (key === 'edit') {
      navigate(`/editproject/${item.projectId}`);
    } else if (key === 'delete') {
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.projectId !== item.projectId)
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

  return (
    <>
      <GeneralLayout title="Projects" buttonLabel="Add Projects" navigateLocation="/addprojects">
        <ListComponents column={['Project', 'Team', 'Date', 'Status']} data={projects} menu={menuItems} />
      </GeneralLayout>
    </>
  );
}

export default Projects;
