import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('http://localhost:5001/api/users/me', {
          withCredentials: true,
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Not authorized');
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) return <div>Loading...</div>;

  return children;
};

export default ProtectedRoute;
