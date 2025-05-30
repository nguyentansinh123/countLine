import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Tabs,
  Typography,
  message,
} from 'antd';
import {
  EyeTwoTone,
  EyeInvisibleOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './form.css';

const { Title, Text } = Typography;

const logoVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const knightPathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: 'easeInOut' },
      opacity: { duration: 0.3 },
    },
  },
};

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: custom * 0.1,
      ease: 'easeOut',
    },
  }),
};

const successVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 15 
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

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
  const [loading, setLoading] = useState(false);
  
  const onFinish = async (values: SignupFormValues): Promise<void> => {
    setLoading(true);
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
      messageApi.success('Account created successfully!');
      
      navigate('/home');
    } catch (error: any) {
      messageApi.error(
        error?.response?.data?.message ||
          'Signup failed! Please try again.'
      );
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="form-container"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {contextHolder}
      
      <div className="form-header">
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          Create Account
        </Title>
        <Text type="secondary">Join the White Knight community</Text>
      </div>

      <Form
        form={form}
        name="signup"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        requiredMark={false}
        className="auth-form"
      >
        <div>
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>
        </div>

        <div>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email Address"
              size="large"
            />
          </Form.Item>
        </div>

        <div>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
        </div>

        <div>
          <Form.Item
            name="confirmPassword"
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
              prefix={<SafetyOutlined className="site-form-item-icon" />}
              placeholder="Confirm Password"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
        </div>

        <div>
          <div className="terms-section">
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
                I agree to the <a href="#">Terms and Conditions</a>
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
                I agree to the <a href="#">Privacy Policy</a>
              </Checkbox>
            </Form.Item>
          </div>
        </div>

        <div>
          <Form.Item style={{ marginBottom: '12px' }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '16px',
              }}
            >
              Create Account
            </Button>
          </Form.Item>
        </div>

        {/* Keep animation just for the footer text */}
        <motion.div
          className="form-footer"
          custom={6}
          variants={formItemVariants}
          initial="hidden"
          animate="visible"
        >
          <Text type="secondary">Already have an account?</Text>
          <Button
            type="link"
            onClick={switchTab}
            style={{ fontWeight: 500, padding: '0 4px' }}
          >
            Sign In
          </Button>
        </motion.div>
      </Form>
    </motion.div>
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
  const [loading, setLoading] = useState(false);
  
  const onFinish = async (values: LoginFormValues): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5001/api/auth/login',
        {
          email: values.email,
          password: values.password,
        },
        { withCredentials: true }
      );

      console.log('Login successful:', response.data);
      messageApi.success('Login successful!');
      
      navigate('/home');
    } catch (error: any) {
      messageApi.error(
        error?.response?.data?.message ||
          'Login failed! Please check your credentials.'
      );
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="form-container"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {contextHolder}
      
      <div className="form-header">
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          Welcome Back
        </Title>
        <Text type="secondary">Sign in to continue</Text>
      </div>

      <Form
        form={form}
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        requiredMark={false}
        className="auth-form"
      >
        {/* Change all motion.div to regular div */}
        <div>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email Address"
              size="large"
            />
          </Form.Item>
        </div>

        <div>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
        </div>

        <div>
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Button type="link" href="/forgot-password" style={{ padding: 0 }}>
              Forgot password?
            </Button>
          </div>
        </div>

        <div>
          <Form.Item style={{ marginBottom: '12px' }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<LoginOutlined />}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '16px',
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </div>
      </Form>

      <motion.div
        className="form-footer"
        custom={4}
        variants={formItemVariants}
        initial="hidden"
        animate="visible"
      >
        <Text type="secondary">Don't have an account?</Text>
        <Button
          type="link"
          onClick={switchTab}
          style={{ fontWeight: 500, padding: '0 4px' }}
        >
          Sign Up
        </Button>
      </motion.div>
    </motion.div>
  );
};

const LoadingLogo: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="logo-container"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: "20px" }}
      >
        <svg width="120" height="120" viewBox="0 0 512 512">
          <motion.path
            d="M372.757,390.068h-15.275v-30.341c0-12.134-7.655-22.459-18.36-26.579c-3.648-15.901,5.158-43.553,9.272-53.73  c8.511-23.961,13.825-47.783,15.747-70.766c8.616-102.137-72.391-134.488-88.889-139.976c-9.298-14.751-21.008-25.709-25.762-29.869  c-2.429-2.115-5.89-2.657-8.844-1.311c-2.552,1.153-4.859,4.719-4.859,7.533l-0.542,24.136h-4.474  c-7.515,0-13.65,6.135-13.65,13.667v4.107c-14.838,3.426-25.674,12.426-32.455,19.854c-9.106,10.014-19.208,20.256-32.717,33.189  l-18.875,18.019c-10.451,9.997-15.013,24.625-11.902,38.205c2.849,12.584,11.168,20.973,24.014,24.258  c26.268,6.659,45.441-9.508,52.537-16.848c7.41,1.416,15.118,3.513,22.965,6.274c5.138,1.8,11.325,3.495,17.67,4.142l-25.027,29.554  c-5.466,5.916-49.379,54.879-41.587,89.494c-10.806,4.067-18.552,14.434-18.552,26.643v30.341h-12.024  c-10.486,0-19.033,8.546-19.033,19.033v47.101c0,10.486,8.546,19.033,19.033,19.033h231.591c10.486,0,19.033-8.546,19.033-19.033  v-47.101C391.79,398.615,383.243,390.068,372.757,390.068z M224.06,253.082l37.052-43.746c2.185-2.587,2.255-6.362,0.175-9.036  c-2.097-2.674-5.785-3.513-8.791-2.027c-5.872,2.884-15.485,2.167-27.072-1.888c-9.508-3.356-18.893-5.82-29.135-7.55  c-2.587-0.559-5.243,0.577-6.869,2.622c-0.682,0.856-17.093,21.235-40.705,15.135c-7.603-1.94-11.937-6.257-13.597-13.562  c-1.975-8.704,1.031-18.159,7.847-24.678l18.875-18.019c13.772-13.178,24.066-23.629,33.417-33.888  c6.03-6.641,16.114-14.856,29.799-16.341c3.635-0.384,6.397-3.461,6.397-7.113l-0.682-9.49h4.474  c8.197,0,14.873-6.676,14.873-14.873v-9.193c4.614,5.033,9.857,11.518,14.279,18.945c0.961,1.608,2.517,2.779,4.334,3.251  c3.67,0.961,89.676,24.625,81.147,125.836c-1.835,21.759-6.869,44.357-14.873,66.868c-1.539,3.809-13.337,33.881-10.832,56.854  H185.934C179.288,308.528,211.343,266.856,224.06,253.082z M167.521,359.728c0-7.847,6.362-14.209,14.192-14.209h147.229  c7.847,0,14.209,6.362,14.209,14.209v30.341H167.521V359.728z M377.458,456.203c0,2.604-2.097,4.701-4.701,4.701H141.166  c-2.604,0-4.701-2.097-4.701-4.701v-47.101c0-2.604,2.097-4.701,4.701-4.701h19.19h189.961h22.441c2.604,0,4.701,2.097,4.701,4.701  V456.203z"
            fill="#FFFFFF"
            stroke="#1890ff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={knightPathVariants}
          />
        </svg>
      </motion.div>
      
      <motion.div 
        className="logo-text"
        variants={logoVariants}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          style={{ fontWeight: 700 }}
        >
          WHITE KNIGHT
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          style={{ fontWeight: 500 }}
        >
          Securing your digital future
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

const AnimatedFeature: React.FC<{ icon: string, title: string, description: string, index: number }> = ({ 
  icon, title, description, index 
}) => {
  return (
    <motion.div 
      className="feature-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + (index * 0.2) }}
      whileHover={{ x: 5 }}
    >
      <motion.div 
        className="feature-icon"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
      >
        {icon}
      </motion.div>
      <div className="feature-text">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </motion.div>
  );
};

const Onboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('1');
  const [showLogo, setShowLogo] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="onboarding-page">
      <AnimatePresence>
        {showLogo && (
          <motion.div
            className="logo-animation-container"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5 },
            }}
          >
            <LoadingLogo /> {/* Use the new component here instead of KnightLogo */}
          </motion.div>
        )}
      </AnimatePresence>

      {!showLogo && (
        <div className="onboarding-content" ref={contentRef}>
          <motion.div
            className="onboarding-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="branding">
              <motion.div 
                className="logo-small"
                whileHover={{ rotate: 10 }}
              >
                <svg width="40" height="40" viewBox="0 0 512 512">
                  <path
                    d="M372.757,390.068h-15.275v-30.341c0-12.134-7.655-22.459-18.36-26.579c-3.648-15.901,5.158-43.553,9.272-53.73  c8.511-23.961,13.825-47.783,15.747-70.766c8.616-102.137-72.391-134.488-88.889-139.976c-9.298-14.751-21.008-25.709-25.762-29.869  c-2.429-2.115-5.89-2.657-8.844-1.311c-2.552,1.153-4.859,4.719-4.859,7.533l-0.542,24.136h-4.474  c-7.515,0-13.65,6.135-13.65,13.667v4.107c-14.838,3.426-25.674,12.426-32.455,19.854c-9.106,10.014-19.208,20.256-32.717,33.189  l-18.875,18.019c-10.451,9.997-15.013,24.625-11.902,38.205c2.849,12.584,11.168,20.973,24.014,24.258  c26.268,6.659,45.441-9.508,52.537-16.848c7.41,1.416,15.118,3.513,22.965,6.274c5.138,1.8,11.325,3.495,17.67,4.142l-25.027,29.554  c-5.466,5.916-49.379,54.879-41.587,89.494c-10.806,4.067-18.552,14.434-18.552,26.643v30.341h-12.024  c-10.486,0-19.033,8.546-19.033,19.033v47.101c0,10.486,8.546,19.033,19.033,19.033h231.591c10.486,0,19.033-8.546,19.033-19.033  v-47.101C391.79,398.615,383.243,390.068,372.757,390.068z M224.06,253.082l37.052-43.746c2.185-2.587,2.255-6.362,0.175-9.036  c-2.097-2.674-5.785-3.513-8.791-2.027c-5.872,2.884-15.485,2.167-27.072-1.888c-9.508-3.356-18.893-5.82-29.135-7.55  c-2.587-0.559-5.243,0.577-6.869,2.622c-0.682,0.856-17.093,21.235-40.705,15.135c-7.603-1.94-11.937-6.257-13.597-13.562  c-1.975-8.704,1.031-18.159,7.847-24.678l18.875-18.019c13.772-13.178,24.066-23.629,33.417-33.888  c6.03-6.641,16.114-14.856,29.799-16.341c3.635-0.384,6.397-3.461,6.397-7.113l-0.682-9.49h4.474  c8.197,0,14.873-6.676,14.873-14.873v-9.193c4.614,5.033,9.857,11.518,14.279,18.945c0.961,1.608,2.517,2.779,4.334,3.251  c3.67,0.961,89.676,24.625,81.147,125.836c-1.835,21.759-6.869,44.357-14.873,66.868c-1.539,3.809-13.337,33.881-10.832,56.854  H185.934C179.288,308.528,211.343,266.856,224.06,253.082z M167.521,359.728c0-7.847,6.362-14.209,14.192-14.209h147.229  c7.847,0,14.209,6.362,14.209,14.209v30.341H167.521V359.728z M377.458,456.203c0,2.604-2.097,4.701-4.701,4.701H141.166  c-2.604,0-4.701-2.097-4.701-4.701v-47.101c0-2.604,2.097-4.701,4.701-4.701h19.19h189.961h22.441c2.604,0,4.701,2.097,4.701,4.701  V456.203z"
                  fill="#FFFFFF"
                  stroke="#40a9ff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
              <h2>WHITE KNIGHT</h2>
            </div>

            <div className="left-content">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Your Trusted Security Partner
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Providing advanced digital security solutions to protect what
                matters most.
              </motion.p>

              <div className="features">
                <AnimatedFeature 
                  icon="🛡️"
                  title="Advanced Protection"
                  description="State-of-the-art security for your digital assets"
                  index={0}
                />
                
                <AnimatedFeature 
                  icon="🔒"
                  title="Data Privacy"
                  description="Your information stays confidential and secure"
                  index={1}
                />
                
                <AnimatedFeature 
                  icon="📊"
                  title="Comprehensive Analytics"
                  description="Detailed insights into your security posture"
                  index={2}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="onboarding-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="auth-card" bordered={false}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  centered
                  size="large"
                  type="line"
                  className="auth-tabs"
                  items={[
                    {
                      key: '1',
                      label: 'Sign Up',
                      children: (
                        <AnimatePresence mode="wait">
                          {activeTab === '1' && (
                            <SignupForm switchTab={() => setActiveTab('2')} />
                          )}
                        </AnimatePresence>
                      ),
                    },
                    {
                      key: '2',
                      label: 'Log In',
                      children: (
                        <AnimatePresence mode="wait">
                          {activeTab === '2' && (
                            <LoginForm switchTab={() => setActiveTab('1')} />
                          )}
                        </AnimatePresence>
                      ),
                    },
                  ]}
                />
              </motion.div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
