import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Protects routes based on user authentication and role
 * 
 * @param {Object} props - Component props
 * @param {React.Component} props.element - Element to render if authorized
 * @param {string|string[]} props.requiredRole - Required role(s): 'admin', 'user', or ['admin', 'user']
 * @returns {React.Component} - Protected route or redirect
 */
export const ProtectedRoute = ({ element, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#475569' }}>
        Loading...
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
