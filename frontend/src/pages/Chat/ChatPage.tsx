import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';
import { StreamChat } from 'stream-chat';
import { message, Spin, Button, Tooltip } from 'antd';
import { LoadingOutlined, VideoCameraOutlined, DesktopOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';

import 'stream-chat-react/dist/css/v2/index.css';
import './Chat.css';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage: React.FC = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndToken = async () => {
      try {
        const userResponse = await axios.get('http://localhost:5001/api/users/me', {
          withCredentials: true
        });
        
        if (!userResponse.data) {
          throw new Error('Not authenticated');
        }
        
        setCurrentUser(userResponse.data);
        
        const tokenResponse = await axios.get('http://localhost:5001/api/chat/token', {
          withCredentials: true
        });
        
        if (!tokenResponse.data || !tokenResponse.data.token) {
          throw new Error('Failed to get chat token');
        }
        
        initializeChat(userResponse.data, tokenResponse.data.token);
      } catch (error) {
        console.error('Error fetching user or token:', error);
        message.error('Could not connect to chat. Please try again.');
        setLoading(false);
      }
    };
    
    fetchUserAndToken();
  }, [targetUserId]);

  const generateChannelId = (userId1: string, userId2: string): string => {
    const sortedIds = [userId1, userId2].sort().join('-');
    
    const hash = CryptoJS.MD5(sortedIds).toString();
    
    return `chat-${hash}`;
  };

  const initializeChat = async (user: any, token: string) => {
    if (!user || !token || !targetUserId) return;

    try {
      console.log("Initializing stream chat client...");

      const client = StreamChat.getInstance(STREAM_API_KEY);

      await client.connectUser(
        {
          id: user.user_id,
          name: user.name || user.email,
          image: user.profilePicture,
        },
        token
      );

      const channelId = generateChannelId(user.user_id, targetUserId);

      const newChannel = client.channel("messaging", channelId, {
        members: [user.user_id, targetUserId],
      });

      await newChannel.watch();

      setChatClient(client);
      setChannel(newChannel);
    } catch (error) {
      console.error("Error initializing chat:", error);
      message.error("Could not connect to chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
        attachments: [{
          type: 'video-call',
          title: 'Video Call',
          og_scrape_url: callUrl
        }]
      });
      
      // Open the call in a new tab
      window.open(callUrl, '_blank');
      
      message.success("Video call started in a new tab!");
    }
  };

  useEffect(() => {
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [chatClient]);

  if (loading || !chatClient || !channel) {
    return (
      <div className="chat-loading-container">
        <div className="chat-loading-content">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
          <div className="chat-loading-text">Connecting to chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-chat-container">
      <div className="chat-header">
        <Tooltip title="Start video call with screen sharing">
          <Button 
            type="primary" 
            className="video-call-button" 
            onClick={handleVideoCall}
            icon={<VideoCameraOutlined />}
          >
            Video Call
          </Button>
        </Tooltip>
      </div>
      <div className="chat-content">
        <Chat client={chatClient} theme="messaging light">
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;