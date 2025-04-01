// src/components/LoginForm.tsx
import React from 'react'
import { Button, Form, Input, Divider, Typography } from 'antd'
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'
import '../form.css'

const { Title } = Typography

interface LoginFormValues {
  email: string
  password: string
}

interface LoginFormProps {
  switchTab: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ switchTab }) => {
  const [form] = Form.useForm<LoginFormValues>()

  const onFinish = (values: LoginFormValues): void => {
    console.log('Login form values:', values)
    // You can handle the login logic here
  }

  return (
    <div className="form-card">
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
  )
}

export default LoginForm
