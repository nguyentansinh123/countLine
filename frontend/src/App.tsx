// src/App.tsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './index.css';
import {
  HomePage,
  MainLayout,
  NDA,
  Projects,
  Teams,
  AddTeam,
  EditTeam,
  Users,
  Contact,
  AboutUs,
  Activities,
  AddProject,
  EditProject,
  ProfilePage,
  AddUser,
  EditUsers,
  ViewDocument,
  EditDocument,
  UploadDocument,
  SendFile,
  Onboarding,
  Overview,
  ProtectedRoute,
  VerifyOtpAndReset,
  VerifyOtpPage,
  ForgotPassword,
  UserDetails,
} from './mainImp';
import 'antd/dist/reset.css';
import LinkGuard from './utils/LinkGuard';
import PdfEditor from './TempWebsite/pdf editor/TempEditor';
import TempEditor from './TempWebsite/pdf editor/TempEditor';
import ViewHistory from './pages/Users/components/ViewHistory';
import { SearchResults } from './pages/SearchResults/SeacrhResults';
import SharedDocumentsPage from './pages/SharedDocumentsPage/SharedDocumentsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<VerifyOtpAndReset />} />

        <Route element={<MainLayout children={undefined} />}>
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:user_id"
            element={
              <ProtectedRoute>
                <UserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/non-disclosure-agreement"
            element={
              <ProtectedRoute>
                <NDA />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addteam"
            element={
              <ProtectedRoute>
                <AddTeam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editteam/:teamId"
            element={
              <ProtectedRoute>
                <EditTeam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overview"
            element={
              <ProtectedRoute>
                <Overview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about-us"
            element={
              <ProtectedRoute>
                <AboutUs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <Activities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addprojects"
            element={
              <ProtectedRoute>
                <AddProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editproject/:projectId"
            element={
              <ProtectedRoute>
                <EditProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adduser"
            element={
              <ProtectedRoute>
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edituser/:user_id"
            element={
              <ProtectedRoute>
                <EditUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewdocument/:category/:file_id"
            element={
              <ProtectedRoute>
                <ViewDocument />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editDocuments/:category/:file_id"
            element={
              <ProtectedRoute>
                <EditDocument />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sendfile/:category/:file_id"
            element={
              <ProtectedRoute>
                <SendFile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uploadDocuments"
            element={
              <ProtectedRoute>
                <UploadDocument />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewHistory/:user_id"
            element={
              <ProtectedRoute>
                <ViewHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search/:value"
            element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shared-documents"
            element={
              <ProtectedRoute>
                <SharedDocumentsPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="tempEditor/:user_id/:file_id"
          element={
            <ProtectedRoute>
              <TempEditor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
