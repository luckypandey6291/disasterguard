import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import Login from './pages/shared/Login';
import Register from './pages/shared/Register';
import NotFound from './pages/shared/NotFound';

import CivilianDashboard from './pages/civilian/Dashboard';
import SOSPage from './pages/civilian/SOSPage';
import ResponderDashboard from './pages/responder/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Donate from './pages/civilian/Donate';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['CIVILIAN', 'NGO']}>
            <CivilianDashboard />
          </ProtectedRoute>
        } />
        <Route path="/sos" element={
          <ProtectedRoute allowedRoles={['CIVILIAN']}>
            <SOSPage />
          </ProtectedRoute>
        } />
        <Route path="/responder" element={
          <ProtectedRoute allowedRoles={['RESPONDER']}>
            <ResponderDashboard />
          </ProtectedRoute>
        } />

        <Route path="/donate" element={
          <ProtectedRoute allowedRoles={['CIVILIAN', 'NGO']}>
           <Donate />
        </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}