import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SideBar from './components/Navbar/sidebar/sideBar';  // Import Sidebar
import HomePage from './pages/Homepage/HomePage';  // Example Component for Home
import NDA from './pages/NDA/nda';  // Example Component for Non-Disclosure Agreement
import Projects from './pages/Projects/projects';  // Example Component for Projects
import Teams from './pages/Teams/teams';  // Example Component for Teams
import Users from './pages/Users/users';  // Example Component for Users
import Contact from './pages/Contact/contact';  // Example Component for Contact
import AboutUs from './pages/About/about';  // Example Component for About Us
import AppBar from './components/Navbar/appbar/appBar';
import Activities from './pages/Actvities/Activities';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <SideBar />
        
        <div style={{ marginLeft: 350, padding: 20, width: '100%' }}>
        <AppBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nda" element={<NDA />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/users" element={<Users />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/activities" element={<Activities />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
