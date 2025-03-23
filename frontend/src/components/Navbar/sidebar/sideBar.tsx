<<<<<<< HEAD
import { Divider, Menu } from "antd";
import { Link } from "react-router-dom"; // Import Link to map menu items to routes

type MenuItem = {
  key: string;
  label: React.ReactNode;
};

const mainItems: MenuItem[] = [
  { key: "1", label: "Home" },
  { key: "2", label: "Non Disclosure Agreement" },
  { key: "3", label: "Projects" },
  { key: "4", label: "Teams" },
  { key: "5", label: "Overview" },
  { key: "6", label: "Users" },
];

const footerItems: MenuItem[] = [
  { key: "7", label: "Contact" },
  { key: "8", label: "About Us" },
];

function SideBar() {
  return (
    <div
      style={{
        width: 300,
        height: "100vh",
        backgroundColor: "#151349",
        color: "white",
        display: "flex",
        position: "relative",
        flexDirection: "column",
        padding: "0px 20px 0px 30px",
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          textAlign: "end",
          fontSize: "32px",
          fontWeight: "bold",
          marginRight: 20,
          padding: "20px 10px 0 10px",
        }}
      >
        White Knight
      </div>

      <Divider style={{ backgroundColor: "white" }} />

      {/* Main Menu (Centered Items) */}
      <div style={{ flexGrow: 1 }}>
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="vertical"
          style={{
            backgroundColor: "transparent",
            color: "white",
          }}
        >
          {mainItems.map((item) => (
            <Menu.Item key={item.key}>
              <Link
                to={
                  item.key === "1"
                    ? "/"
                    : `/${String(item.label)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`
                }
              >
                {item.label}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </div>

      {/* Footer Menu (At the Bottom) */}
      <Menu
        theme="dark"
        mode="vertical"
        style={{
          backgroundColor: "transparent",
          color: "white",
        }}
      >
        {footerItems.map((item) => (
          <Menu.Item key={item.key}>
            <Link to={item.key === "7" ? "/contact" : "/about-us"}>
              {item.label}
            </Link>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
}

export default SideBar;
=======
import { Divider, Menu } from 'antd';
import { Link } from 'react-router-dom'; // Import Link to map menu items to routes

type MenuItem = {
  key: string;
  label: React.ReactNode;
};

const mainItems: MenuItem[] = [
  { key: '1', label: 'Home' },
  { key: '2', label: 'Non Disclosure Agreement' },
  { key: '3', label: 'Projects' },
  { key: '4', label: 'Teams' },
  { key: '5', label: 'Overview' },
  { key: '6', label: 'Users' },
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
        position: 'relative',
        flexDirection: 'column',
        padding: '0px 20px 0px 30px',
      }}
    >
      {/* Sidebar Header */}
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

      {/* Main Menu (Centered Items) */}
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
            <Menu.Item key={item.key}>
              <Link
                to={
                         `/${String(item.label)
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`
                }
              >
                {item.label}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </div>

      {/* Footer Menu (At the Bottom) */}
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
>>>>>>> develop
