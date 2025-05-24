import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Upload, message, Select, Typography, Space, Divider, Switch, Row, Col } from 'antd';
import { UploadOutlined, FileOutlined, TagsOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const fileTypes = [
  { label: 'NDA', value: 'NDA' },
  { label: 'I.P Agreement', value: 'I.P Agreement' },
  { label: 'Executive Document', value: 'Executive Document' },
  { label: 'Legal Document', value: 'Legal Document' },
];

const UploadDocument: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<any>(null);
  const [fileName, setFileName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string>('');
  const [messageApi, contextHolder] = message.useMessage();

  const [requiresSignature, setRequiresSignature] = useState(false);
  const [signaturesRequired, setSignaturesRequired] = useState<string[]>([]);

  const [users, setUsers] = useState<
    { user_id: string; name: string; email: string }[]
  >([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await axios.get(
          'http://localhost:5001/api/users/getAllUser',
          {
            withCredentials: true,
          }
        );
        if (response.data.success) {
          const nonAdmins = response.data.data.filter(
            (u: any) => u.role !== 'admin'
          );
          setUsers(nonAdmins);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        messageApi.error('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpload = async () => {
    if (!file || !fileName || selectedTypes.length === 0) {
      messageApi.warning('Please fill all fields before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', fileName);
    formData.append('documentType', selectedTypes);
    formData.append('requiresSignature', String(requiresSignature));
    if (requiresSignature) {
      formData.append('signaturesRequired', JSON.stringify(signaturesRequired));
    }

    console.log(formData.get);

    try {
      const response = await fetch(
        'http://localhost:5001/api/document/upload',
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      const result = await response.json();
      if (response.ok) {
        messageApi.success('File uploaded successfully!');
        setTimeout(() => {
          navigate('/non-disclosure-agreement');
        }, 500);
        console.log(result);
      } else {
        message.error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      message.error('An error occurred during the upload');
    }
  };

  return (
    <GeneralLayout title="Upload Document">
      {contextHolder}
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>
              <FileOutlined /> Document Information
            </Title>
            <Divider style={{ margin: '12px 0' }} />
            
            <Row gutter={[16, 24]} align="middle">
              <Col span={6}>
                <Text strong>File Name:</Text>
              </Col>
              <Col span={18}>
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name"
                  style={{ 
                    borderRadius: '6px',
                    width: '100%'
                  }}
                />
              </Col>
            </Row>
            
            <Row gutter={[16, 24]} align="middle" style={{ marginTop: '20px' }}>
              <Col span={6}>
                <Text strong>
                  <TagsOutlined /> File Type:
                </Text>
              </Col>
              <Col span={18}>
                <Select
                  value={selectedTypes}
                  onChange={setSelectedTypes}
                  placeholder="Select File Type"
                  style={{ width: '100%', borderRadius: '6px' }}
                >
                  {fileTypes.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>
          
          <div>
            <Title level={4}>
              <UserOutlined /> Signature Requirements
            </Title>
            <Divider style={{ margin: '12px 0' }} />
            
            <Row gutter={[16, 24]} align="middle">
              <Col span={6}>
                <Text strong>Requires Signature:</Text>
              </Col>
              <Col span={18}>
                <Switch
                  checked={requiresSignature}
                  onChange={(checked) => setRequiresSignature(checked)}
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                />
              </Col>
            </Row>

            {requiresSignature && (
              <Row gutter={[16, 24]} align="middle" style={{ marginTop: '20px' }}>
                <Col span={6}>
                  <Text strong>Signatories:</Text>
                </Col>
                <Col span={18}>
                  <Select
                    mode="multiple"
                    placeholder="Select users to sign this document"
                    style={{ width: '100%' }}
                    value={signaturesRequired}
                    onChange={setSignaturesRequired}
                    optionFilterProp="children"
                    loading={loadingUsers}
                  >
                    {loadingUsers ? (
                      <Option disabled value="">
                        Loading...
                      </Option>
                    ) : (
                      users.map((user) => (
                        <Option key={user.user_id} value={user.user_id}>
                          {user.name} ({user.email})
                        </Option>
                      ))
                    )}
                  </Select>
                </Col>
              </Row>
            )}
          </div>

          <div>
            <Title level={4}>
              <UploadOutlined /> Upload File
            </Title>
            <Divider style={{ margin: '12px 0' }} />
            
            <Space direction="vertical" size="middle" align="center" style={{ width: '100%' }}>
              <Upload
                beforeUpload={(file) => {
                  const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain',
                  ];

                  if (!allowedTypes.includes(file.type)) {
                    messageApi.error('File type not supported');
                    return Upload.LIST_IGNORE;
                  }

                  setFile(file);
                  if (!fileName) {
                    setFileName(file.name.replace(/\.[^/.]+$/, ''));
                  }
                  return false;
                }}
                showUploadList={false}
              >
                <Button 
                  icon={<UploadOutlined />}
                  size="large"
                  style={{ 
                    borderRadius: '6px',
                    height: '80px',
                    width: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '16px'
                  }}
                >
                  <div style={{ marginTop: '8px' }}>Select Document</div>
                </Button>
              </Upload>

              {file && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px 16px',
                  backgroundColor: '#f0f7ff', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                  <Text strong>Selected: {file.name}</Text>
                </div>
              )}
            </Space>
          </div>

          <Divider style={{ margin: '24px 0' }} />
          
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="primary" 
              onClick={handleUpload}
              size="large"
              style={{ 
                borderRadius: '6px',
                minWidth: '150px',
                height: '48px'
              }}
            >
              Upload Document
            </Button>
          </div>
        </Space>
      </Card>
    </GeneralLayout>
  );
};

export default UploadDocument;
