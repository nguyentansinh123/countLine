// src/pages/Onboarding.tsx
import React, { useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Tabs,
  Typography,
} from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './form.css';
import { message } from 'antd';

const { Title } = Typography;

interface SignupFormProps {
  switchTab: () => void;
}

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAndConditions: boolean;
  privacyPolicy: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ switchTab }) => {
  const [form] = Form.useForm<SignupFormValues>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: SignupFormValues): Promise<void> => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/auth/register',
        {
          name: values.name,
          email: values.email,
          password: values.password,
        },
        { withCredentials: true }
      );
      console.log('Signup successful:', response.data);
      messageApi.success('Signup successful! Directing to homepage.');
      setTimeout(() => {
        navigate('/home');
      }, 2000); // Simulate a delay for the success message
    } catch (error) {
      messageApi.error('Signup failed! Please try again.');
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="form-card">
      {contextHolder}
      <Title level={2}>Sign Up</Title>
      <Divider className="form-divider" />

      <Form
        form={form}
        name="signup"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        className="form"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords do not match!')
                );
              },
            }),
          ]}
        >
          <Input.Password
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          name="termsAndConditions"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error('Please accept the terms and conditions')
                    ),
            },
          ]}
        >
          <Checkbox>
            I have read and accepted the <a href="#">terms and conditions</a>
          </Checkbox>
        </Form.Item>

        <Form.Item
          name="privacyPolicy"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error('Please accept the privacy policy')
                    ),
            },
          ]}
        >
          <Checkbox>
            I have read and accepted the <a href="#">privacy policy</a>
          </Checkbox>
        </Form.Item>

        <Form.Item className="form-buttons">
          <Button type="primary" htmlType="submit" className="form-button">
            Sign Up
          </Button>
          <Button htmlType="button" className="form-button" onClick={switchTab}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

interface LoginFormProps {
  switchTab: () => void;
}

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ switchTab }) => {
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: LoginFormValues): Promise<void> => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/auth/login',
        {
          email: values.email,
          password: values.password,
        },
        { withCredentials: true }
      ); // To include cookies for authentication
      // for commiting purposes only

      console.log('Login successful:', response.data);
      messageApi.success('Login successful! Redirecting to homepage...');

      setTimeout(() => {
        // Simulate a delay for the success message
        navigate('/home');
      }, 2000); // Simulate a delay for the success message
    } catch (error) {
      messageApi.error('Login failed! Please check your credentials.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="form-card">
      {contextHolder}
      <Title level={2}>Log In</Title>
      <Divider className="form-divider" />

      <Form
        form={form}
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        className="form"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>
        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <a href="/forgot-password">Forgot password?</a>
        </div>

        <Form.Item className="form-buttons">
          <Button type="primary" htmlType="submit" className="form-button">
            Login
          </Button>
          <Button htmlType="button" className="form-button" onClick={switchTab}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const Onboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('1');

  return (
    <div className="onboarding-container">
      <div className="onboarding-heading">
        <h4>Welcome to</h4>
        <h2>WHITE KNIGHT</h2>
      </div>
      <Card
        style={{ minHeight: '80vh', display: 'flex', alignContent: 'start' }}
      >
        <Tabs
          style={{
            backgroundColor: '#f9f9f9',
            padding: '12px',
            borderRadius: '12px',
            height: '100%',
          }}
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: 'Sign Up',
              children: <SignupForm switchTab={() => setActiveTab('2')} />,
            },
            {
              key: '2',
              label: 'Log In',
              children: <LoginForm switchTab={() => setActiveTab('1')} />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Onboarding;
