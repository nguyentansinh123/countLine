<<<<<<< HEAD
import React from 'react'

function overview() {
  return (
    <div>overview</div>
  )
}

export default  overview;
=======
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "antd";

const documentData = [
  { name: "NDA", count: 3 },
  { name: "IP Agreement", count: 3 },
  { name: "Executive Documents", count: 2 },
  { name: "Legal Documents", count: 2 },
];

const projectData = [
  { name: "Project A", count: 5 },
  { name: "Project B", count: 2 },
  { name: "Project C", count: 8 },
];

const teamData = [
  { name: "Team X", count: 4 },
  { name: "Team Y", count: 3 },
  { name: "Team Z", count: 6 },
];

const userData = [{ name: "Total Users", count: 1 }];

const Overview: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Documents");

  const renderGraph = () => {
    let data;
    switch (activeTab) {
      case "Documents":
        data = documentData;
        break;
      case "Projects":
        data = projectData;
        break;
      case "Teams":
        data = teamData;
        break;
      case "Users":
        data = userData;
        break;
      default:
        data = documentData;
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#151349" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ width: "100%", height: "100vh", padding: "20px" }}>
      <h2>Overview</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["Documents", "Projects", "Teams", "Users"].map((tab) => (
          <Button key={tab} type={activeTab === tab ? "primary" : "default"} onClick={() => setActiveTab(tab)}>
            {tab}
          </Button>
        ))}
      </div>
      {renderGraph()}
    </div>
  );
};

export default Overview;
>>>>>>> develop
