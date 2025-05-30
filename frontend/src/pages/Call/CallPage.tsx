import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./CallPage.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage: React.FC = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<any>(null);
  const [call, setCall] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCall = async () => {
      if (!callId) {
        setError("Call ID is missing");
        setIsConnecting(false);
        return;
      }

      try {
        const userResponse = await axios.get('http://localhost:5001/api/users/me', {
          withCredentials: true
        });
        
        if (!userResponse.data) {
          throw new Error('Not authenticated');
        }
        
        const tokenResponse = await axios.get('http://localhost:5001/api/chat/token', {
          withCredentials: true
        });
        
        if (!tokenResponse.data || !tokenResponse.data.token) {
          throw new Error('Failed to get token');
        }

        console.log("Initializing Stream video client...");

        const user = {
          id: userResponse.data.user_id,
          name: userResponse.data.name || userResponse.data.email,
          image: userResponse.data.profilePicture,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenResponse.data.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
        
      } catch (error) {
        console.error("Error joining call:", error);
        setError("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [callId]);

  const handleRetry = () => {
    setIsConnecting(true);
    setError(null);
    window.location.reload();
  };

  if (isConnecting) {
    return (
      <div className="wk_call_loading_container">
        <div className="wk_call_loading_spinner"></div>
        <p className="wk_call_loading_text">Setting up your call...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wk_call_error_container">
        <div className="wk_call_error_content">
          <h3 className="wk_call_error_title">Connection Error</h3>
          <p className="wk_call_error_message">{error}</p>
          <div className="wk_call_error_actions">
            <button className="wk_call_retry_button" onClick={handleRetry}>
              Retry
            </button>
            <button 
              className="wk_call_back_button" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wk_call_page_container">
      <div className="wk_call_main_content">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="wk_call_init_error">
            <p>Could not initialize call. Please refresh or try again later.</p>
            <button 
              className="wk_call_back_button" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) {
    useEffect(() => {
      navigate(-1);
    }, [navigate]);
    return null;
  }

  return (
    <StreamTheme>
      <div className="wk_call_layout_container">
        <SpeakerLayout />
      </div>
      <div className="wk_call_controls_container">
        <CallControls />
      </div>
    </StreamTheme>
  );
};

export default CallPage;