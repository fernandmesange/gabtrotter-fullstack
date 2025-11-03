import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FormBuilder from './pages/FormBuilder';
import UpdateNewUser from './pages/UpdateNewUser';
import Dashboard from './pages/Dashboard';
import { Toaster } from '@/components/ui/toaster';
import EventManagement from './pages/Dashboard-Tabs/Event-management';
import EventPage from './pages/EventPage';
import CheckParticipants from './pages/Dashboard-Tabs/CheckParticipants';

import ProtectedRoute from './context/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/resetPassword';
import Header from './components/header/Header';
import SurveyResponses from './pages/SurveyResponses';
import OffersList from './pages/OffersList';
import OfferPage from './pages/OfferPage';
import CookieBanner from './components/CookieBanner';
import PolitiqueConfidentialite from './pages/Confidentiality';
import CourseManagement from './pages/Dashboard-Tabs/Course-Management';
import CoursePage from './pages/Dashboard-Tabs/CoursePage';
import LoginPage from './pages/LoginPage';
import UpdateUserLandingPage from './pages/UpdateUserLandingPage';
import EventsList from './pages/EventList';

function App() {
  return (
    <>
      <Router>
        <ConditionalHeader />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/formbuilder" element={<FormBuilder />} />
          <Route path="/auth/update-new-user/:id" element={<UpdateNewUser />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/offer/:id" element={<OfferPage />} />
          <Route path="/offers/" element={<OffersList />} />
          <Route path="/confidentiality" element={<PolitiqueConfidentialite />} />
          <Route path="/events" element={<EventsList/>} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/event/checkParticipation/" element={<CheckParticipants />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/update-subscriber-link/:id" element={<UpdateUserLandingPage />} />


          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/event-management/:id"
            element={
              <ProtectedRoute>
                <EventManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/event-management/:id"
            element={
              <ProtectedRoute>
                <EventManagement />
              </ProtectedRoute>
            }
          />

        <Route
            path="/dashboard/course-management/:id"
            element={
              <ProtectedRoute>
                <CourseManagement />
              </ProtectedRoute>
            }
          />

<Route path="/dashboard/coursePage/:courseId"
            element={
              <ProtectedRoute>
                <CoursePage/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/survey-responses/:id"
            element={<ProtectedRoute><SurveyResponses /></ProtectedRoute>}
          />
        </Routes>

        
      </Router>
      <Toaster />
      <CookieBanner />
    </>
  );
}

// ConditionalHeader Component
function ConditionalHeader() {
  const location = useLocation();

  // Hide header for admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  return !isAdminRoute && <Header />;
}

export default App;
