import React from "react";
import SideBar from "../components/Navbar/sidebar/sideBar";
import AppBar from "../components/Navbar/appbar/appBar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: "flex", width: "100vw" }}>
      <SideBar />
      <div style={{ flex: 1, width: "100%" }}>
        <AppBar />
        <div style={{ padding: "16px" }}>{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
