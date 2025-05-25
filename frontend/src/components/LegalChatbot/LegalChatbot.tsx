import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, List, Typography, Spin, Avatar, Tooltip, FloatButton } from 'antd';
import type { InputRef } from 'antd'; 
import { SendOutlined, RobotOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import './LegalChatbot.css';

const { Text } = Typography;

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const LegalChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your legal assistant. How can I help you with legal questions today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      content: input,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GPT_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a helpful legal assistant In Australia. Provide concise, accurate information about legal topics. If you're not sure about something, be clear about limitations. Always suggest consulting with a qualified legal professional for specific advice."
            },
            {
              role: "user",
              content: input
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const botMessage = {
          content: data.choices[0].message.content,
          sender: 'bot' as const,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Error fetching from OpenAI:', error);
      const errorMessage = {
        content: "I'm sorry, I couldn't process your request. Please try again later.",
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChatbot = () => {
    setVisible(!visible);
  };

  return (
    <>
      <FloatButton
        icon={<RobotOutlined />}
        type="primary"
        onClick={toggleChatbot}
        tooltip="Legal Assistant"
        style={{ right: 24, bottom: 24 }}
      />
      
      {visible && (
        <Card
          className="legal-chatbot-container"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <span>Legal Assistant</span>
              </div>
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={toggleChatbot}
                size="small"
              />
            </div>
          }
          bordered={true}
        >
          <div className="chat-message-container scroll-container">
            <List
              itemLayout="horizontal"
              dataSource={messages}
              renderItem={(message) => (
                <List.Item className={`message-item ${message.sender}`}>
                  <div className="message-content">
                    <div className="message-header">
                      <Avatar 
                        icon={message.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                        style={{ 
                          backgroundColor: message.sender === 'user' ? '#1890ff' : '#52c41a',
                        }}
                        size="small"
                      />
                      <Text type="secondary" className="timestamp">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </div>
                    <div className="message-bubble">
                      <Text>{message.content}</Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-container">
            <Input
              ref={inputRef}
              placeholder="Ask a legal question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              suffix={
                loading ? (
                  <Spin size="small" />
                ) : (
                  <Tooltip title="Send">
                    <Button 
                      type="primary" 
                      shape="circle" 
                      icon={<SendOutlined />} 
                      size="small"
                      onClick={handleSend}
                      disabled={input.trim() === ''}
                    />
                  </Tooltip>
                )
              }
            />
          </div>
        </Card>
      )}
    </>
  );
};

export default LegalChatbot;