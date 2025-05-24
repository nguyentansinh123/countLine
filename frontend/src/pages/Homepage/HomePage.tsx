import { Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Statistics from './components/dashboard/statistics';
import RecentActivity from './components/dashboard/RecentActivity';

function HomePage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide scrollbar for Chrome, Safari and Opera */
      ::-webkit-scrollbar {
        display: none !important;
      }
      
      /* Hide scrollbar for IE, Edge and Firefox */
      body {
        -ms-overflow-style: none !important;  /* IE and Edge */
        scrollbar-width: none !important;  /* Firefox */
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Statistics />
      <RecentActivity/>
    </>
  );
}

export default HomePage;
