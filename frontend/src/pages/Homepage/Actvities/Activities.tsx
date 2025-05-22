import { Button, Card, Dropdown, List, MenuProps, Tabs, TabsProps } from 'antd';
import React from 'react';
import requestedChangeActivities from './components/const/requestedChangesConst';
import completedActivities from './components/const/completedActivities';
import pendingActivities from './components/const/pendingActivitiesConst';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';
import ListComponents from '../../../components/listComponents/listComponents';
import { useNavigate } from 'react-router-dom';



function Activities() {
   const navigate = useNavigate(); // Use navigate here

   const onChange = (key: string) => {
  console.log(key);
};

const menuItems = (item: any): MenuProps => ({
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
    },{
      key: 'view',
      label: 'View',
      onClick: () => handleMenuClick('view', item),
    },
  ],
});

const handleMenuClick = (key: string, item: any) => {
 
  if (key === 'View') {
    console.log('View:', item);
    // You can redirect to an edit page here if needed
  } else if (key === 'delete') {
    console.log('Deleting:', item);
    // Add delete logic here, for now, you can log or modify state
  }else if (key ==='view'){
    console.log('viewing document')
  }
};

const ActivityList = ({ data }: { data: any[] }) => (
  
  <ListComponents column={['username', 'Document', 'Date', 'Status']} data={data} menu={menuItems} height='65vh' />
);

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Requested Changes',
    children: <ActivityList data={requestedChangeActivities} />,
  },
  {
    key: '2',
    label: 'Completed',
    children: <ActivityList data={completedActivities} />,
  },
  {
    key: '3',
    label: 'Pending',
    children: <ActivityList data={pendingActivities} />,
  },
];
  return (
    <GeneralLayout title="All Activities" buttonLabel="" navigateLocation="">
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} style={{ marginTop: 0, width: '100%' }} />
    </GeneralLayout>
  );
}

export default Activities;
