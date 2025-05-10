import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../storage/useAuthStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/users/me', {
          withCredentials: true,
        });
        // check
        console.log('Response data from protected Route: ');
        console.log(res.data);
        // check
        setUser(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Not authorized');
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate, setUser]);

  if (isLoading) return <div>Loading...</div>;

  return children;
};

export default ProtectedRoute;
