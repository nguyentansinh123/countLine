// src/pages/VerifyOtpAndReset.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const VerifyOtpAndReset: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const onFinish = async (values: any) => {
    try {
      await axios.post('http://localhost:5001/api/auth/reset-password', {
        email,
        otp: values.otp,
        newPassword: values.password,
      });
      message.success('Password reset successful');
      navigate('/login');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="form-card">
      <Title level={3}>Enter OTP & New Password</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="otp"
          label="OTP"
          rules={[{ required: true, message: 'OTP is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="New Password"
          rules={[{ required: true, message: 'Please enter a new password' }]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Reset Password
        </Button>
      </Form>
    </div>
  );
};

export default VerifyOtpAndReset;
