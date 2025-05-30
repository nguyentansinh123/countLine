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
  Modal,
  Row,
  Col,
  Avatar,
  Space,
  Form,
  Tag,
  Tabs,
  InputNumber
} from 'antd';
import { 
  UploadOutlined, 
  EditOutlined, 
  SaveOutlined, 
  UserOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  SettingOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import defaultProfile from '../../assets/simple-user-default-icon-free-png (1).png';
import './ProfilePage.css'; // Make sure to create this CSS file

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function ProfilePage() {
  const [form] = Form.useForm();
  const [verifyForm] = Form.useForm();
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [role, setRole] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = () => {
    axios
      .get('http://localhost:5001/api/users/me', { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        setUser(res.data);
        
        setName(res.data.name || '');
        setEmail(res.data.email || '');
        setProfilePic(res.data.profilePicture || '');
        setRole(res.data.role || '');
        setIsVerified(res.data.isAccountVerified || false);

        form.setFieldsValue({
          name: res.data.name || '',
          email: res.data.email || '',
        });
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading profile:', err);
        message.error('Failed to load user profile');
        setLoading(false);
      });
  };

  const handleSave = () => {
    setSaving(true);
    
    axios
      .put(
        'http://localhost:5001/api/users/update',
        {
          name: name,
          email: email,
          profilePicture: profilePic
        },
        { withCredentials: true }
      )
      .then((res) => {
        setUser(res.data);
        setEditMode(false);
        message.success('Profile updated successfully!');
        fetchUserProfile();
      })
      .catch((err) => {
        console.error('Error updating profile:', err);
        message.error(err.response?.data?.message || 'Failed to update profile');
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleProfilePicChange = (info: any) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.originFileObj) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (info.file.size > 1024 * 1024) {
            compressImage(reader.result, 800, 0.7).then(compressedImage => {
              uploadProfilePic(compressedImage);
            }).catch(err => {
              console.error("Compression error:", err);
              message.error({ 
                content: 'Failed to compress image', 
                key: 'profilePicUpload' 
              });
            });
          } else {
            uploadProfilePic(reader.result);
          }
        } else {
          message.error({ 
            content: 'Failed to read the file', 
            key: 'profilePicUpload' 
          });
        }
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
    return false;
  };

  const sendVerificationOTP = () => {
    if (!user || !user.user_id) {
      message.error('User information not available');
      return;
    }

    setSendingOtp(true);
    
    axios
      .post(
        'http://localhost:5001/api/auth/send-verify-otp',
        { user_id: user.user_id },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.success) {
          message.success('Verification OTP sent to your email');
          setOtpSent(true);
        } else {
          message.error(res.data.message || 'Failed to send verification OTP');
        }
      })
      .catch((err) => {
        console.error('Error sending verification OTP:', err);
        message.error(err.response?.data?.message || 'Failed to send verification OTP');
      })
      .finally(() => {
        setSendingOtp(false);
      });
  };

  const verifyAccount = (values: any) => {
    if (!user || !user.user_id) {
      message.error('User information not available');
      return;
    }

    setVerifyLoading(true);
    
    axios
      .post(
        'http://localhost:5001/api/auth/verify-account',
        {
          user_id: user.user_id,
          otp: values.otp.toString() 
        },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.success) {
          message.success('Account verified successfully!');
          setIsVerified(true);
          fetchUserProfile();
          setActiveTab('1');
        } else {
          message.error(res.data.message || 'Failed to verify account');
        }
      })
      .catch((err) => {
        console.error('Error verifying account:', err);
        message.error(err.response?.data?.message || 'Failed to verify account');
      })
      .finally(() => {
        setVerifyLoading(false);
      });
  };

  const compressImage = (base64: string, maxWidth: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = base64;
    });
  };

  const uploadProfilePic = (imageData: string) => {
    message.loading({ content: 'Uploading profile picture...', key: 'profilePicUpload' });
    
    // Create a file from the base64 string
    const byteString = atob(imageData.split(',')[1]);
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "profile-picture." + mimeString.split('/')[1], { type: mimeString });
    
    // Create FormData
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    axios
      .put(
        'http://localhost:5001/api/users/update-profile',
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      .then((res) => {
        if (res.data.success) {
          setProfilePic(res.data.user.profilePicture);
          message.success({ content: 'Profile picture updated!', key: 'profilePicUpload' });
          fetchUserProfile();
        } else {
          message.error({ content: 'Failed to update profile picture', key: 'profilePicUpload' });
        }
      })
      .catch((err) => {
        console.error('Error uploading profile picture:', err);
        if (err.response?.status === 413) {
          Modal.error({
            title: 'Image Too Large',
            content: 'The image is too large for upload. Please use a smaller image or try the compress option.',
            okText: 'OK'
          });
        } else {
          message.error({ 
            content: err.response?.data?.message || 'Failed to upload profile picture', 
            key: 'profilePicUpload' 
          });
        }
      });
  };

  const getRoleColor = (role: string) => {
    switch(role.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'employee':
        return 'blue';
      case 'client':
        return 'green';
      case 'intern':
        return 'orange';
      default:
        return 'default';
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Card loading style={{ width: 700 }} />
    </div>
  );
  
  if (!user) return (
    <div style={{ textAlign: 'center', margin: '50px' }}>
      <Title level={4}>User not found.</Title>
      <Text type="secondary">Please log in to view your profile.</Text>
    </div>
  );

  return (
    <div className="profile-page-container">
      {loading ? (
        <div className="loading-container">
          <Card loading style={{ width: 700 }} />
        </div>
      ) : !user ? (
        <div className="user-not-found">
          <Title level={4}>User not found.</Title>
          <Text type="secondary">Please log in to view your profile.</Text>
        </div>
      ) : (
        <div className="profile-content">
          <Card
            bordered={false}
            className="profile-card"
          >
            <div className="profile-header">
              <div className="profile-tabs">
                <div className={`tab ${activeTab === '1' ? 'active' : ''}`} onClick={() => setActiveTab('1')}>
                  Profile
                </div>
                {!isVerified && (
                  <div className={`tab ${activeTab === '2' ? 'active' : ''}`} onClick={() => setActiveTab('2')}>
                    Verify Account
                  </div>
                )}
              </div>
              
              {activeTab === '1' && (
                <div className="edit-buttons">
                  {editMode ? (
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />} 
                      onClick={handleSave}
                      loading={saving}
                      className="save-button"
                    >
                      Save Changes
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />} 
                      onClick={() => setEditMode(true)}
                      className="edit-button"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {activeTab === '1' ? (
              <div className="profile-details">
                <div className="profile-left">
                  <div className="avatar-container">
                    <Avatar 
                      src={profilePic || defaultProfile} 
                      alt={name}
                      size={120}
                      className="user-avatar"
                    />
                    <div className="avatar-upload">
                      <Upload
                        accept="image/*"
                        beforeUpload={(file) => {
                          handleProfilePicChange({ file: { originFileObj: file } });
                          return false;
                        }}
                        showUploadList={false}
                      >
                        <div className="change-photo-btn">
                          <UploadOutlined /> Change
                        </div>
                      </Upload>
                    </div>
                  </div>
                  
                  <div className="user-meta">
                    <div className="user-role">
                      <div className="meta-label">Role</div>
                      <Tag color={getRoleColor(role)} className="role-tag">
                        {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
                      </Tag>
                    </div>
                    
                    <div className="verification-status">
                      <div className="meta-label">Status</div>
                      {isVerified ? (
                        <Tag color="success" icon={<CheckCircleOutlined />} className="status-tag verified">
                          Verified
                        </Tag>
                      ) : (
                        <Tag 
                          color="warning" 
                          icon={<CloseCircleOutlined />} 
                          onClick={() => setActiveTab('2')}
                          className="status-tag not-verified"
                        >
                          Not Verified
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="profile-right">
                  <Form 
                    form={form}
                    layout="vertical"
                    className="profile-form"
                    initialValues={{ name, email }}
                  >
                    <Form.Item label="Full Name" name="name">
                      {editMode ? (
                        <Input 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className="profile-input"
                        />
                      ) : (
                        <div className="field-value">{name}</div>
                      )}
                    </Form.Item>
                    
                    <Form.Item label="Email" name="email">
                      {editMode ? (
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          className="profile-input"
                        />
                      ) : (
                        <div className="field-value">{email}</div>
                      )}
                    </Form.Item>
                    
                    <Divider />
                    
                    <div className="account-meta">
                      <div className="meta-item">
                        <div className="meta-label">Account created</div>
                        <div className="meta-value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div className="meta-item">
                        <div className="meta-label">Last login</div>
                        <div className="meta-value">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</div>
                      </div>
                    </div>
                  </Form>
                </div>
              </div>
            ) : (
              <div className="verification-container">
                <div className="verification-header">
                  <SecurityScanOutlined className="verify-icon" />
                  <Title level={4}>Verify Your Account</Title>
                  <Text type="secondary" className="verify-desc">
                    Verify your account to access all features. We'll send a verification code to your email.
                  </Text>
                </div>
                
                {otpSent ? (
                  <Form
                    form={verifyForm}
                    layout="vertical"
                    onFinish={verifyAccount}
                    className="verify-form"
                  >
                    <Form.Item 
                      name="otp" 
                      label="Enter Verification Code"
                      rules={[
                        { required: true, message: 'Please enter the verification code' },
                        { pattern: /^\d{6}$/, message: 'Verification code must be 6 digits' }
                      ]}
                    >
                      <Input
                        className="otp-input" 
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={verifyLoading}
                        className="verify-button"
                      >
                        Verify Account
                      </Button>
                    </Form.Item>
                    
                    <div className="resend-link">
                      <Button 
                        type="link" 
                        onClick={sendVerificationOTP}
                        loading={sendingOtp}
                      >
                        Resend Code
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="send-otp-container">
                    <p>Click the button below to receive a verification code on your email</p>
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />}
                      loading={sendingOtp}
                      onClick={sendVerificationOTP}
                      className="send-otp-button"
                    >
                      Send Verification Code
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
