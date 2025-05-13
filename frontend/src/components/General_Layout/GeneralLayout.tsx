import { PlusOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import React, { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface GeneralLayoutProps {
  children: ReactNode;
  title: string;
  buttonLabel?: string;
  navigateLocation?: string;
}

function GeneralLayout(props: GeneralLayoutProps) {
  const navigate = useNavigate();
  
  const handleButtonClick = () => {
    if (props.navigateLocation) {
      navigate(props.navigateLocation);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: 1 }}>
        <h1 style={{ color: '#00004C', margin: '0px 40px 10px 10px' }}>
          {props.title}
        </h1>
        {props.buttonLabel && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            shape="round"
            size="large"
            style={{
              backgroundColor: '#335DFF',
              border: 'none',
              marginTop: 10,
              marginRight: 40,
            }}
            onClick={handleButtonClick}
          >
            {props.buttonLabel}
          </Button>
        )}
      </div>
      <Card
        style={{
          width: '98%',
          maxWidth: '98%',
          height: '80vh',
          border: 'solid 1px',
          margin: '0 0 0 10px',
        }}
      >
        <div>{props.children}</div>
      </Card>
    </>
  );
}

export default GeneralLayout;
