import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
};

/**
 * Get the appropriate dashboard URL based on user role
 * @param {string} role - User role ('admin' or 'user')
 * @returns {string} - Dashboard URL path
 */
export const getDashboardUrl = (role) => {
  return role === 'admin' ? '/admin/dashboard' : '/dashboard';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api/v1' : 'http://localhost:5000/api/v1');

  useEffect(() => {
    // Set up request interceptor to attach JWT token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Set up response interceptor to handle auto logout on 401
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          const msg = error.response.data?.message || '';
          if (
            msg.toLowerCase().includes('token expired') ||
            msg.toLowerCase().includes('expired') ||
            msg.toLowerCase().includes('unauthorized')
          ) {
            localStorage.removeItem('token');
            setUser(null);
          }
        }
        return Promise.reject(error);
      }
    );

    checkUser();

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }

    // Attach token immediately for the first profile request
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const res = await axios.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  };

  /**
   * Login user and set authentication token
   * Note: Automatic redirect to role-based dashboard happens in App.jsx
   */
  const login = async (email, password, role) => {
    const res = await axios.post('/auth/login', { email, password, role });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData; // Return user data for caller to use for redirect
  };

  /**
   * Register new user and set authentication token
   * Note: Automatic redirect to role-based dashboard happens in App.jsx
   */
  const register = async (name, email, password, role = 'user', adminSecret = '', inviteCode = '') => {
    const res = await axios.post('/auth/register', { name, email, password, role, adminSecret, inviteCode });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData; // Return user data for caller to use for redirect
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getDashboardUrl }}>
      {children}
    </AuthContext.Provider>
  );
};
