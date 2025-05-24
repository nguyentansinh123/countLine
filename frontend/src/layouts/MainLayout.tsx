import React from 'react';
import SideBar from '../components/Navbar/sidebar/sideBar';
import AppBar from '../components/Navbar/appbar/appBar';
import { Outlet } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = () => {
  return (
    <div style={{ 
      display: 'flex', 
      width: '100%',
      minHeight: '100vh'
    }}>
      <SideBar />
      <div style={{ 
        flex: 1,
        width: 'calc(100vw - 300px)',
        marginLeft: '300px',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AppBar />
        <div style={{ 
          padding: '8px 24px',
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
