import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CheckEmailPage from './pages/CheckEmailPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminCreateAccountPage from './pages/AdminCreateAccountPage.jsx';

import StudentLayout from './components/StudentLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import { USE_BACKEND } from '../constants/appConfig.js';
import StudentOverview from './pages/StudentOverview.jsx';
import StudentBookings from './pages/StudentBookings.jsx';
import StudentProfilePage from './pages/StudentProfilePage.jsx';
import StudentHistory from './pages/StudentHistory.jsx';
import StudentHealthQuest from './pages/StudentHealthQuest.jsx';
import StudentSickNotes from './pages/StudentSickNotes.jsx';
import AdminProfile from './pages/AdminProfile.jsx';
import AdminAppointments from './pages/AdminAppointments.jsx';
import AdminHealthQuests from './pages/AdminHealthQuests.jsx';
import AdminSickNotes from './pages/AdminSickNotes.jsx';
import AdminHistory from './pages/AdminHistory.jsx';

import '../css/App.css';

function getStoredUser() {
  const storedUser = localStorage.getItem('pulseupUser');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Could not read saved PulseUp user:', error);

    localStorage.removeItem('pulseupUser');

    return null;
  }
}

function normalizeRole(role) {
  return String(role || '')
    .trim()
    .toUpperCase()
    .replace('ROLE_', '');
}

function getToken(user) {
  return user?.token || user?.accessToken || user?.jwt || '';
}

function getDashboardPath(role) {
  switch (normalizeRole(role)) {
    case 'STUDENT':
      return '/student/dashboard';

    case 'STAFF':
      return '/staff/dashboard';

    case 'ADMIN':
      return '/admin/dashboard';

    default:
      return '/login';
  }
}

function PublicOnlyRoute({ children }) {
  const user = getStoredUser();

  const token = getToken(user);

  if (user && token) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}

function ProtectedRoute({ allowedRoles, children }) {
  const user = getStoredUser();

  const token = getToken(user);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user.role);

  const acceptedRoles = allowedRoles.map((role) => normalizeRole(role));

  if (!acceptedRoles.includes(userRole)) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return children;
}

function DashboardRedirect() {
  const user = getStoredUser();

  const token = getToken(user);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}

function NotFoundPage() {
  return (
    <main className="pulse-not-found">
      <section className="pulse-not-found-card">
        <p>404</p>

        <h1>Page not found</h1>

        <span>The page you requested does not exist.</span>

        <a href="/">Return to home</a>
      </section>
    </main>
  );
}

function renderClientPages(prefix) {
  return (
    <>
      <Route index element={<Navigate to={`${prefix}/dashboard`} replace />} />

      {!USE_BACKEND && (
        <Route path="dashboard" element={<StudentOverview />} />
      )}

      <Route path="overview" element={<StudentOverview />} />

      <Route path="bookings" element={<StudentBookings />} />

      <Route path="profile" element={<StudentProfilePage />} />

      <Route path="history" element={<StudentHistory />} />

      {prefix === '/student' && (
        <Route path="health-quests" element={<StudentHealthQuest />} />
      )}

      <Route path="sick-notes" element={<StudentSickNotes />} />
    </>
  );
}

function renderClinicPages(prefix) {
  return (
    <>
      <Route index element={<Navigate to={`${prefix}/dashboard`} replace />} />

      {!USE_BACKEND && (
        <Route path="dashboard" element={<AdminAppointments />} />
      )}

      <Route path="profile" element={<AdminProfile />} />

      <Route path="bookings" element={<AdminAppointments />} />

      {prefix === '/admin' && (
        <Route path="health-quests" element={<AdminHealthQuests />} />
      )}

      {prefix === '/admin' && (
        <Route path="sick-notes" element={<AdminSickNotes />} />
      )}

      <Route path="history" element={<AdminHistory />} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route path="/check-email" element={<CheckEmailPage />} />

        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="/dashboard" element={<DashboardRedirect />} />

        {USE_BACKEND && (
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        )}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          {renderClientPages('/student')}
        </Route>

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {renderClinicPages('/staff')}
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {renderClinicPages('/admin')}
        </Route>

        {USE_BACKEND && (
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STAFF']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
        )}

        {USE_BACKEND && (
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        )}

        {USE_BACKEND && (
          <Route
            path="/admin/create-account"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCreateAccountPage />
              </ProtectedRoute>
            }
          />
        )}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
