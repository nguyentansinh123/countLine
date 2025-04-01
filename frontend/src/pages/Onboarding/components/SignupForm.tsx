// src/components/SignupForm.tsx
import React from 'react'
import { Button, Checkbox, Divider, Form, Input, Typography } from 'antd'
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'
import '../form.css'

const { Title } = Typography

interface SignupFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  termsAndConditions: boolean
  privacyPolicy: boolean
}

interface SignupFormProps {
  switchTab: () => void
}

const SignupForm: React.FC<SignupFormProps> = ({ switchTab }) => {
  const [form] = Form.useForm<SignupFormValues>()

  const onFinish = (values: SignupFormValues): void => {
    console.log('Signup form values:', values)
    // You can handle the signup logic here
  }

  return (
    <div className="form-card">
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
                  return Promise.resolve()
                }
                return Promise.reject(new Error('The two passwords do not match!'))
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
  )
}

export default SignupForm
