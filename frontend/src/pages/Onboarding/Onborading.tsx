// src/pages/Onboarding.tsx
import React, { useState } from 'react'
import { Card, Tabs } from 'antd'
import { useNavigate } from 'react-router-dom'
import SignupForm from './components/SignupForm'
import LoginForm from './components/LoginForm'
import './form.css'

const Onboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('1')

  return (
    <div className="onboarding-container">
      <div className="onboarding-heading">
        <h4>Welcome to</h4>
        <h2>WHITE KNIGHT</h2>
      </div>

      <Card style={{ minHeight: '80vh', display: 'flex', alignContent: 'start' }}>
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
  )
}

export default Onboarding
