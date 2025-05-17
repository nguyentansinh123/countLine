import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Input,
  Button,
  Typography,
  Divider,
  Upload,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import defaultProfile from '../../assets/simple-user-default-icon-free-png (1).png';

const { Title, Text } = Typography;

function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Local state copies
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:5001/api/users/me', { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        setUser(res.data);
        setFirstName(res.data.name?.split(' ')[0] || '');
        setEmail(res.data.email || '');
        setProfilePic(res.data.profilePicture || '');
        setLoading(false);
      })
      .catch(() => {
        message.error('Failed to load user profile');
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    const maxSizeKB = 100;
    const maxSizeBytes = maxSizeKB * 1024;

    if (profilePic && profilePic.startsWith('data:image')) {
      const base64Length = profilePic.split(',')[1]?.length || 0;
      const approxFileSize = (base64Length * 3) / 4; // converting to byte from b64

      if (approxFileSize > maxSizeBytes) {
        message.error({ content: 'Too large!', duration: 3 });
        return;
      }
    }
    axios
      .put(
        'http://localhost:5001/api/users/update',
        {
          name: firstName,
          email: email,
          profilePicture: profilePic,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setUser(res.data);
        setEditMode(false);
        message.success('Profile updated!');
      })
      .catch((err) => {
        console.log('here ');

        console.error(err);
        console.log(err);

        message.error('Failed to update profile');
      });
  };

  const handleProfilePicChange = (file: Blob) => {
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      message.error(`Image too large. Max allowed size is 5 MB`);
      return false;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProfilePic(reader.result);
      } else {
        message.error('Failed to read the file.');
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <Card
      title={<Title level={3}>Profile</Title>}
      style={{
        border: 'solid 1px black',
        width: '100%',
        maxWidth: 700,
        margin: 'auto',
        padding: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <img
          src={profilePic || defaultProfile}
          alt="Profile"
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            marginRight: 15,
            objectFit: 'cover',
          }}
        />
        <div>
          <Text strong>
            {firstName} {lastName}
          </Text>
          <br />
          <Text type="secondary">{email}</Text>
        </div>
      </div>

      <Divider />
      <Upload
        accept="image/*"
        beforeUpload={handleProfilePicChange}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
      </Upload>

      <Divider />

      {/* Fields */}
      <div style={{ display: 'grid', gap: 15 }}>
        <div style={{ display: 'flex', gap: 15 }}>
          <div style={{ flex: 1 }}>
            <Text strong>First Name</Text>
            {editMode ? (
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            ) : (
              <p>{firstName}</p>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Text strong>Last Name</Text>
            {editMode ? (
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            ) : (
              <p>{lastName}</p>
            )}
          </div>
        </div>

        <div>
          <Text strong>Email</Text>
          {editMode ? (
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          ) : (
            <p>{email}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 15 }}>
          <div style={{ flex: 1 }}>
            <Text strong>Country</Text>
            {editMode ? (
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            ) : (
              <p>{country}</p>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Text strong>Title</Text>
            {editMode ? (
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            ) : (
              <p>{title}</p>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Text strong>Language</Text>
            {editMode ? (
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            ) : (
              <p>{language}</p>
            )}
          </div>
        </div>

        <div>
          <Text strong>Phone</Text>
          {editMode ? (
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          ) : (
            <p>{phone}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {editMode ? (
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        ) : (
          <Button type="default" onClick={() => setEditMode(true)}>
            Edit
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ProfilePage;
