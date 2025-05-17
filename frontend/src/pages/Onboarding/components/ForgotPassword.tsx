// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async ({ email }: { email: string }) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/auth/send-reset-otp', {
        email,
      });
      messageApi.success('OTP sent to your email!');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err: any) {
      messageApi.error(err?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      {contextHolder}
      <Title level={3}>Reset Password</Title>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="email"
          label="Enter your email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email' },
          ]}
        >
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Send OTP
        </Button>
      </Form>
    </div>
  );
};

export default ForgotPassword;
