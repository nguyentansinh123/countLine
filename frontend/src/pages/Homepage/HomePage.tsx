
import { Route, useNavigate } from 'react-router-dom';

import Statistics from './components/dashboard/statistics';
import RecentActivity from './components/dashboard/RecentActivity';


function HomePage() {
  const navigate = useNavigate();
  return (
    <>
    
      <Statistics />
      <RecentActivity/>
    </>
  );
}
export default HomePage;
