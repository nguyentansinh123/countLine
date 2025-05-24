import { Divider, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { ShareAltOutlined } from '@ant-design/icons'; 

type MenuItem = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode; 
};

const mainItems: MenuItem[] = [
  { key: '1', label: 'Home' },
  { key: '2', label: 'Non Disclosure Agreement' },
  { key: '3', label: 'Projects' },
  { key: '4', label: 'Teams' },
  { key: '5', label: 'Overview' },
  { key: '6', label: 'Users' },
  {
    key: 'shared-documents',
    label: <Link to="/shared-documents">Shared With Me</Link>,
    icon: <ShareAltOutlined />,
  },
];

const footerItems: MenuItem[] = [
  { key: '7', label: 'Contact' },
  { key: '8', label: 'About Us' },
];

function SideBar() {
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
          defaultSelectedKeys={['1']}
          mode="vertical"
          style={{
            backgroundColor: 'transparent',
            color: 'white',
          }}
        >
          {mainItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.key !== 'shared-documents' ? (
                <Link
                  to={
                    `/${String(item.label)
                      .toLowerCase()
                      .replace(/\s+/g, '-')}`
                  }
                >
                  {item.label}
                </Link>
              ) : (
                item.label 
              )}
            </Menu.Item>
          ))}
        </Menu>
      </div>

      <Menu
        theme="dark"
        mode="vertical"
        style={{
          backgroundColor: 'transparent',
          color: 'white',
        }}
      >
        {footerItems.map((item) => (
          <Menu.Item key={item.key}>
            <Link to={item.key === '7' ? '/contact' : '/about-us'}>
              {item.label}
            </Link>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
}

export default SideBar;
