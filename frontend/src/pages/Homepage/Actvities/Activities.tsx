
import { Button, Card, Dropdown, List, MenuProps, Tabs, TabsProps } from 'antd';
import React from 'react'
import requestedChangeActivities from './components/const/requestedChangesConst';
import completedActivities from './components/const/completedActivities';
import pendingActivities from './components/const/pendingActivitiesConst';

const onChange = (key: string) => {
    console.log(key);
  };
  

  
const menuItems: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
        edit
      </a>
    ),
  },
  {
    key: '2',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
        delete
      </a>
    ),
  },
];

      
const ActivityList = ({ data }: { data: any[] }) => (
  <Card style={{ width: "100%", maxWidth: 1350, height: "75vh", border: "solid 1px", marginTop: 0 }}>
 
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 2fr 1.5fr 1fr",
        fontWeight: "bold",
        paddingBottom: 8,
        borderBottom: "1px solid #ccc",
      }}
    >
      <span>Username</span>
      <span>Document</span>
      <span>Date</span>
      <span>Status</span>
    </div>

  
    <div style={{ height: "65vh", padding: 5, overflowY: "auto", paddingRight: 10 }}>
      <List
        dataSource={data}
        renderItem={(item) => (
<List.Item 
  style={{ 
    display: "flex", 
    justifyContent: "space-between",
    alignItems: "center", 
    width: "100%",
  }}
>
  {/* Left side content */}
  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr 1fr", flex: 1 }}>
    <span>
      <strong>{item.username}</strong>
      <br />
      <small style={{ color: "#888" }}>{item.project}</small>
    </span>
    <span>{item.document}</span>
    <span>{item.date}</span>
    <span
      style={{
        fontWeight: "bold",
        color: item.status === "Finished" ? "green" : item.status === "In Progress" ? "orange" : "red",
      }}
    >
      {item.status}
    </span>
  </div>

  <Dropdown menu={{ items: menuItems }} placement="bottomRight">
    <Button style={{ color: "#156CC9", border: "solid 1px #156CC9" }}>...</Button>
  </Dropdown>
</List.Item>

        )}
      />
    </div>
  </Card>
);

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Requested Changes",
    children: <ActivityList data={requestedChangeActivities} />,
  },
  {
    key: "2",
    label: "Completed",
    children: <ActivityList data={completedActivities} />,
  },
  {
    key: "3",
    label: "Pending",
    children: <ActivityList data={pendingActivities} />,
  },
];

function Activities() {
  return( 
    <div style={{display:'flex',flexDirection:'column'}}>
      <h2 style={{color:'#00004C', margin:0, marginTop:-15}}>All Activities</h2>
  <Tabs defaultActiveKey="1" items={items} onChange={onChange} style={{ marginTop: 0, width:'100%' }} />
  </div>
  )}

export default Activities;