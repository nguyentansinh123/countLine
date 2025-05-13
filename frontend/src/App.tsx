// src/App.tsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './index.css';
import {HomePage,MainLayout,NDA,Projects,Teams,AddTeam,EditTeam ,Users,Contact,AboutUs,Activities,AddProject,
  EditProject,ProfilePage,AddUser,EditUsers,ViewDocument,EditDocument,UploadDocument,SendFile,Onboarding,Overview} from './mainImp'
import ViewHistory from './pages/Users/components/ViewHistory';

function App() {
  return (
    <Router>
      <Routes>
        {/* Onboarding Routes (without MainLayout) */}
        <Route path="/" element={<Onboarding />} />

        {/* Main Routes with MainLayout wrapper */}
        <Route element={<MainLayout children={undefined} />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/non-disclosure-agreement" element={<NDA />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/addteam" element={<AddTeam />} />
          <Route path="/editteam/:teamId" element={<EditTeam />} />
          <Route path='/overview' element={<Overview/>} />
          <Route path="/users" element={<Users />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/addprojects" element={<AddProject />} />
          <Route path="/editproject/:projectId" element={<EditProject />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/adduser" element={<AddUser />} />
          <Route path="/edituser/:userId" element={<EditUsers />} />
           <Route path="/viewhistory/:userId" element={<ViewHistory />} />
          <Route path = "/viewdocument/:category/:file_id" element={<ViewDocument/>}/>
          <Route path="/editDocuments/:category/:file_id" element={<EditDocument />} />
          <Route path="/sendfile/:category/:file_id" element={<SendFile />} />
          <Route path="/uploadDocuments" element={<UploadDocument />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
