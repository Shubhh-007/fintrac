import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';

/**
 * App.jsx - Main Application Router
 * 
 * Route Structure:
 * - Public routes: /auth, /select, /login, /signup
 * - Protected User routes: /dashboard, /transactions, /analytics, /profile
 * - Protected Admin routes: /admin/dashboard
 * 
 * Role-based redirects:
 * - After login: admin → /admin/dashboard, user → /dashboard
 * - Direct access by wrong role redirects to appropriate dashboard
 */
function App() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const publicPaths = ['/', '/auth', '/select', '/login', '/signup'];

  // Show loading while checking authentication
  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#475569' }}>Loading...</div>;
  }

  // Redirect unauthenticated users to login
  if (!user && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/auth" />;
  }

  // Redirect authenticated users away from auth pages to their dashboard
  if (user && publicPaths.includes(location.pathname)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />;
  }

  return (
    <div className="app">
      {user && <Sidebar />}
      <div className="main">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <Landing />} />

          {/* Public Authentication Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/select" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* Protected User Routes */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute element={<Dashboard />} requiredRole="user" />} 
          />
          <Route 
            path="/transactions" 
            element={<ProtectedRoute element={<Transactions />} requiredRole={['user', 'admin']} />} 
          />
          <Route 
            path="/analytics" 
            element={<ProtectedRoute element={<Analytics />} requiredRole="user" />} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute element={<Profile />} requiredRole={['user', 'admin']} />} 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} 
          />

          {/* Catch-all - Redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
