<<<<<<< HEAD
import React from "react";
import SideBar from "../components/Navbar/sidebar/sideBar";
import AppBar from "../components/Navbar/appbar/appBar";
=======
import React from 'react';
import SideBar from '../components/Navbar/sidebar/sideBar';
import AppBar from '../components/Navbar/appbar/appBar';
import { Outlet } from 'react-router-dom';
>>>>>>> develop

interface MainLayoutProps {
  children: React.ReactNode;
}

<<<<<<< HEAD
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: "flex", width: "100vw" }}>
      <SideBar />
      <div style={{ flex: 1, width: "100%" }}>
        <AppBar />
        <div style={{ padding: "16px" }}>{children}</div>
=======
const MainLayout: React.FC<MainLayoutProps> = () => {
  return (
    <div style={{ display: 'flex', width: '100vw' }}>
      <SideBar />
      <div style={{ flex: 1, width: '100%' }}>
        <AppBar />
        <div style={{ padding: '8px' }}><Outlet /></div>
>>>>>>> develop
      </div>
    </div>
  );
};

export default MainLayout;
