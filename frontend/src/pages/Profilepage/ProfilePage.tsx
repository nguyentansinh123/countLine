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
  SendOutlined
} from '@ant-design/icons';
import defaultProfile from '../../assets/simple-user-default-icon-free-png (1).png';

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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card
        bordered
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          borderRadius: '12px'
        }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            activeTab === '1' ? (
              <Space>
                {editMode ? (
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleSave}
                    loading={saving}
                  >
                    Save Changes
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Space>
            ) : null
          }
        >
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                Profile
              </span>
            } 
            key="1"
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={10} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                  <Avatar 
                    src={profilePic || defaultProfile} 
                    alt="Profile" 
                    size={150}
                    style={{ border: '2px solid #f0f0f0' }}
                  />
                </div>
                
                <Upload
                  accept="image/*"
                  beforeUpload={(file) => {
                    handleProfilePicChange({ file: { originFileObj: file } });
                    return false;  // Prevent automatic upload
                  }}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} type="primary" ghost>
                    Change Profile Picture
                  </Button>
                </Upload>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary">Max 5MB</Text>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <Text strong style={{ marginRight: '10px' }}>Role:</Text>
                    <Tag color={getRoleColor(role)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                      {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
                    </Tag>
                  </div>
                  
                  <div>
                    <Text strong style={{ marginRight: '10px' }}>Status:</Text>
                    {isVerified ? (
                      <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: '14px', padding: '4px 8px' }}>
                        Verified
                      </Tag>
                    ) : (
                      <Tag 
                        color="warning" 
                        icon={<CloseCircleOutlined />} 
                        style={{ fontSize: '14px', padding: '4px 8px', cursor: 'pointer' }}
                        onClick={() => setActiveTab('2')}
                      >
                        Not Verified
                      </Tag>
                    )}
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={14}>
                <Form 
                  form={form}
                  layout="vertical"
                  initialValues={{
                    name,
                    email
                  }}
                >
                  <Form.Item label="Full Name" name="name">
                    {editMode ? (
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                      />
                    ) : (
                      <div className="ant-form-text" style={{ fontSize: '16px' }}>{name}</div>
                    )}
                  </Form.Item>
                  
                  <Form.Item label="Email" name="email">
                    {editMode ? (
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                      />
                    ) : (
                      <div className="ant-form-text" style={{ fontSize: '16px' }}>{email}</div>
                    )}
                  </Form.Item>
                  
                  <Divider />
                  
                  <div style={{ fontSize: '14px', color: '#888888' }}>
                    <p>Account created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
                  </div>
                </Form>
              </Col>
            </Row>
          </TabPane>
          
          {!isVerified && (
            <TabPane 
              tab={
                <span>
                  <CheckCircleOutlined />
                  Verify Account
                </span>
              } 
              key="2"
            >
              <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <Title level={4}>Verify Your Account</Title>
                  <Text type="secondary">
                    Verify your account to access all features. We'll send a verification code to your email.
                  </Text>
                </div>
                
                {otpSent ? (
                  <Form
                    form={verifyForm}
                    layout="vertical"
                    onFinish={verifyAccount}
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
                        style={{ width: '100%' }} 
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={verifyLoading}
                        block
                      >
                        Verify Account
                      </Button>
                    </Form.Item>
                    
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
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
                  <div style={{ textAlign: 'center' }}>
                    <p>Click the button below to receive a verification code on your email</p>
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />}
                      loading={sendingOtp}
                      onClick={sendVerificationOTP}
                      size="large"
                      style={{ marginTop: '20px' }}
                    >
                      Send Verification Code
                    </Button>
                  </div>
                )}
              </div>
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
}

export default ProfilePage;
