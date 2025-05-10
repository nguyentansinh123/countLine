import React, { useState } from 'react';
import { Button, Input, Typography, message } from 'antd';
import { useAuthStore } from '../../../storage/useAuthStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../form.css';

const { Title } = Typography;

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!user) return message.error('No user session found.');

    try {
      setLoading(true);
      await axios.post('http://localhost:5001/api/auth/verify-account', {
        user_id: user.user_id,
        otp,
      });

      message.success('Account verified successfully!');
      navigate('/home');
    } catch (error: any) {
      console.error(error);
      message.error(error?.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page-wrapper">
      <div className="form-card verify-fade-in">
        <Title level={2}>Verify Your Email</Title>
        <p>Please enter the OTP sent to your email.</p>
        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <Button
          type="primary"
          onClick={handleVerify}
          loading={loading}
          style={{ marginBottom: '8px', width: '100%' }}
        >
          Verify
        </Button>
        <Button
          type="link"
          onClick={() => navigate('/')}
          style={{ paddingLeft: 0 }}
        >
          ← Back to Sign Up
        </Button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
