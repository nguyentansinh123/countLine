import { Tabs, TabsProps } from "antd";
import React from "react";

const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Requested Changes",
    children: <></>,
  },
  {
    key: "2",
    label: "Completed",
    children: <></>,
  },
  {
    key: "3",
    label: "Pending",
    children: <></>,
  },
];
function Activities() {
  return (
    <Tabs
      defaultActiveKey="1"
      items={items}
      onChange={onChange}
      style={{ marginTop: 0 }}
    />
  );
}

export default Activities;
