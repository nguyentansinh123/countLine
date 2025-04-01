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
