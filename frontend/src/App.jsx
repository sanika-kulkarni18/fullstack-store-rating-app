import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginRegister from './pages/LoginRegister';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import UpdatePassword from './pages/UpdatePassword';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div className="pulse" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Loading RateSphere...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Landing Page - Routes based on Role
const HomeRoute = () => {
  const { user } = useAuth();
  
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  } else if (user.role === 'STORE_OWNER') {
    return <OwnerDashboard />;
  } else {
    return <UserDashboard />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <div style={{ flexGrow: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginRegister />} />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <HomeRoute />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/update-password" 
                element={
                  <ProtectedRoute allowedRoles={['NORMAL', 'STORE_OWNER']}>
                    <UpdatePassword />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
