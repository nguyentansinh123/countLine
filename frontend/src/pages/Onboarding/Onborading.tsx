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
      
      // Direct navigation without animation
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

const KnightLogo: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="logo-container"
    >
      <motion.svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        variants={logoVariants}
      >
        <motion.path
          d="M60 10 L20 30 V60 C20 90, 60 110, 60 110 C60 110, 100 90, 100 60 V30 L60 10"
          fill="rgba(24, 144, 255, 0.1)"
          stroke="#1890ff"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { delay: 0.5, duration: 1 }
          }}
        />
        
        {/* Simplified Knight chess piece path */}
        <motion.path
          d="M60 10 C50 10, 46 15, 44 20 C42 25, 40 35, 40 40 L35 50 L30 70 L25 80 C25 80, 30 85, 35 85 L45 85 L50 105 C50 105, 50 110, 60 110 C70 110, 70 105, 70 105 L75 85 L85 85 C90 85, 95 80, 95 80 L90 70 L85 50 L80 40 C80 35, 78 25, 76 20 C74 15, 70 10, 60 10 Z"
          fill="none"
          stroke="#1890ff"
          strokeWidth="3"
          variants={knightPathVariants}
        />
        
        {/* Crown/Top element */}
        <motion.path
          d="M50 20 L60 15 L70 20"
          fill="none"
          stroke="#1890ff"
          strokeWidth="3"
          variants={knightPathVariants}
        />
        
        {/* Base element */}
        <motion.path
          d="M40 105 L80 105"
          fill="none"
          stroke="#1890ff"
          strokeWidth="3"
          variants={knightPathVariants}
        />
        
        {/* Add some decorative elements with animations */}
        <motion.circle
          cx="60"
          cy="40"
          r="3"
          fill="#1890ff"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { delay: 2.2, duration: 0.3 } 
          }}
        />
      </motion.svg>
      
      <motion.div 
        className="logo-text"
        variants={logoVariants}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          WHITE KNIGHT
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
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
            <KnightLogo />
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
                <svg width="40" height="40" viewBox="0 0 120 120">
                  <path
                    d="M60 10 C50 10, 46 15, 44 20 C42 25, 40 35, 40 40 L35 50 L30 70 L25 80 C25 80, 30 85, 35 85 L45 85 L50 105 C50 105, 50 110, 60 110 C70 110, 70 105, 70 105 L75 85 L85 85 C90 85, 95 80, 95 80 L90 70 L85 50 L80 40 C80 35, 78 25, 76 20 C74 15, 70 10, 60 10 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  <path
                    d="M50 20 L60 15 L70 20"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  <path
                    d="M40 105 L80 105"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
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
