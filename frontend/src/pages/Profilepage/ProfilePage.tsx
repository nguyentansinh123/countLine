import React, { useState, useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Card, Input, Button, Typography, Divider, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function ProfilePage() {
  // Retrieve data from localStorage or set to empty strings
  const savedFirstName = localStorage.getItem('firstName') || '';
  const savedLastName = localStorage.getItem('lastName') || '';
  const savedCountry = localStorage.getItem('country') || '';
  const savedTitle = localStorage.getItem('title') || '';
  const savedLanguage = localStorage.getItem('language') || '';
  const savedPhone = localStorage.getItem('phone') || '';
  const savedEmail = localStorage.getItem('email') || '';
  const savedProfilePic = localStorage.getItem('profilePic') || '';

  // State variables to store user input
  const [firstName, setFirstName] = useState(savedFirstName);
  const [lastName, setLastName] = useState(savedLastName);
  const [country, setCountry] = useState(savedCountry);
  const [title, setTitle] = useState(savedTitle);
  const [language, setLanguage] = useState(savedLanguage);
  const [phone, setPhone] = useState(savedPhone);
  const [email, setEmail] = useState(savedEmail);
  const [saved, setSaved] = useState(false); 
  const [profilePic, setProfilePic] = useState(savedProfilePic);

  const handleSave = () => {
    // Save the data to localStorage
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
    localStorage.setItem('country', country);
    localStorage.setItem('title', title);
    localStorage.setItem('language', language);
    localStorage.setItem('phone', phone);
    localStorage.setItem('email', email);
    localStorage.setItem('profilePic', profilePic); 

    setSaved(true);
  };

  // Handle profile picture change
  const handleProfilePicChange = (file: Blob) => {
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

  
  const handleEdit = () => {
    setSaved(false);
  };

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
      {/* Profile Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <img
          src={profilePic}
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
          <Text strong>Username</Text>
          <br />
          <Text type="secondary">{saved ? email : 'mail@example.com'}</Text>
        </div>
      </div>

      {/* Profile Picture Upload */}
      <Divider />
      <Upload
        accept="image/*"
        beforeUpload={handleProfilePicChange}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
      </Upload>

      <Divider />

      {/* Profile Fields */}
      <div style={{ display: 'grid', gap: 15 }}>
        {/* First Name & Last Name */}
        <div style={{ display: 'flex', gap: 15 }}>
          <div style={{ flex: 1 }}>
            <Text strong>First Name</Text>
            {saved ? <p>{firstName}</p> : <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />}
          </div>
          <div style={{ flex: 1 }}>
            <Text strong>Last Name</Text>
            {saved ? <p>{lastName}</p> : <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />}
          </div>
        </div>

        {/* Email */}
        <div>
          <Text strong>Email</Text>
          {saved ? <p>{email}</p> : <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />}
        </div>

        {/* Country, Title & Language */}
        <div style={{ display: 'flex', gap: 15 }}>
          <div style={{ flex: 1 }}>
            <Text strong>Country</Text>
            {saved ? <p>{country}</p> : <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />}
          </div>
          <div style={{ flex: 1 }}>
            <Text strong>Title</Text>
            {saved ? <p>{title}</p> : <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />}
          </div>
          <div style={{ flex: 1 }}>
            <Text strong>Language</Text>
            {saved ? <p>{language}</p> : <Input placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} />}
          </div>
        </div>

        {/* Phone */}
        <div>
          <Text strong>Phone</Text>
          {saved ? <p>{phone}</p> : <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />}
        </div>
      </div>

      {/* Buttons */}
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {!saved ? (
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        ) : (
          <Button type="default" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ProfilePage;
