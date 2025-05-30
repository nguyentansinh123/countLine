import { Divider, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { ShareAltOutlined } from '@ant-design/icons'; 

type MenuItem = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  path: string; 
};

const mainItems: MenuItem[] = [
  { key: '1', label: 'Home', path: '/home' },
  { key: '2', label: 'Non Disclosure Agreement', path: '/non-disclosure-agreement' },
  { key: '3', label: 'Projects', path: '/projects' },
  { key: '4', label: 'Teams', path: '/teams' },
  { key: '5', label: 'Overview', path: '/overview' },
  { key: '6', label: 'Users', path: '/users' },
  { key: '7', label: 'Chat', path: '/chat' },
  {
    key: 'shared-documents',
    label: 'Shared With Me',
    icon: <ShareAltOutlined />,
    path: '/shared-documents'
  },
];

const footerItems: MenuItem[] = [
  { key: '8', label: 'Contact', path: '/contact' },
  { key: '9', label: 'About Us', path: '/about-us' },
];

function SideBar() {
  // Get current location to highlight active menu item
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Find the key of the current path
  const findSelectedKey = () => {
    // First check if we're on the home page or root
    if (currentPath === '/' || currentPath === '/home') {
      return ['1'];
    }
    
    // Check main items
    const mainMatch = mainItems.find(item => currentPath.startsWith(item.path));
    if (mainMatch) {
      return [mainMatch.key];
    }
    
    // Check footer items
    const footerMatch = footerItems.find(item => currentPath.startsWith(item.path));
    if (footerMatch) {
      return [footerMatch.key];
    }
    
    return ['1']; // Default to home if no match
  };

  const selectedKeys = findSelectedKey();

  return (
    <div
      style={{
        width: 300,
        height: '100vh',
        backgroundColor: '#151349',
        color: 'white',
        display: 'flex',
        position: 'fixed', 
        top: 0, 
        left: 0, 
        flexDirection: 'column',
        padding: '0px 20px 0px 30px',
        overflow: 'auto', 
        zIndex: 100, 
      }}
    >
      <div
        style={{
          textAlign: 'end',
          fontSize: '32px',
          fontWeight: 'bold',
          marginRight: 20,
          padding: '20px 10px 0 10px',
        }}
      >
        White Knight
      </div>

      <Divider style={{ backgroundColor: 'white' }} />

      <div style={{ flexGrow: 1 }}>
        <Menu
          theme="dark"
          selectedKeys={selectedKeys}
          mode="vertical"
          style={{
            backgroundColor: 'transparent',
            color: 'white',
          }}
        >
          {mainItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.path}>
                {typeof item.label === 'string' ? item.label : ''}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </div>

      <Menu
        theme="dark"
        selectedKeys={selectedKeys}
        mode="vertical"
        style={{
          backgroundColor: 'transparent',
          color: 'white',
        }}
      >
        {footerItems.map((item) => (
          <Menu.Item key={item.key}>
            <Link to={item.path}>
              {item.label}
            </Link>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
}

export default SideBar;
