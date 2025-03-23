import { UserOutlined } from '@ant-design/icons';

const Users = [
  {
    profilepic: <UserOutlined />,
    username: 'David George',
    userRoles: ['admin', 'user'],
  },
  { profilepic: <UserOutlined />, username: 'John Doe', userRoles: ['admin'] },
  { profilepic: <UserOutlined />, username: 'Jane Smith', userRoles: ['user'] },
  {
    profilepic: <UserOutlined />,
    username: 'Michael Brown',
    userRoles: ['user'],
  },
  {
    profilepic: <UserOutlined />,
    username: 'Emily White',
    userRoles: ['admin', 'user'],
  },
  { profilepic: <UserOutlined />, username: 'Chris Lee', userRoles: ['user'] },
  {
    profilepic: <UserOutlined />,
    username: 'Anna Green',
    userRoles: ['admin'],
  },
];

export default Users;
