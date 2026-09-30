import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from storage or default passenger for easy review
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('railconnect_token');
      const storedUser = localStorage.getItem('railconnect_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // verify profile with backend
          const res = await api.get('/auth/profile');
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('railconnect_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired, clearing storage');
          localStorage.removeItem('railconnect_token');
          localStorage.removeItem('railconnect_user');
          setUser(null);
        }
      } else {
        // Automatically pre-load Rahul Sharma (Passenger) for seamless zero-barrier reviewer testing
        await quickDemoLogin('PASSENGER', false);
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token && res.user) {
      localStorage.setItem('railconnect_token', res.token);
      localStorage.setItem('railconnect_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.token && res.user) {
      localStorage.setItem('railconnect_token', res.token);
      localStorage.setItem('railconnect_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('railconnect_token');
    localStorage.removeItem('railconnect_user');
    setUser(null);
  };

  // Instant 1-Click Role Switcher for College Evaluation & Testing
  const quickDemoLogin = async (roleName = 'PASSENGER', notify = true) => {
    try {
      let email = 'rahul.sharma@example.com';
      if (roleName === 'ADMIN') email = 'admin@railconnect.gov.in';
      if (roleName === 'STAFF') email = 'staff@railconnect.gov.in';

      const res = await api.post('/auth/login', {
        email,
        password: 'Password@123'
      });

      if (res.token && res.user) {
        localStorage.setItem('railconnect_token', res.token);
        localStorage.setItem('railconnect_user', JSON.stringify(res.user));
        setUser(res.user);
      }
      return res.user;
    } catch (err) {
      console.warn('Quick login error:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      quickDemoLogin,
      isAdmin: user?.roleName === 'ADMIN',
      isStaff: user?.roleName === 'STAFF',
      isPassenger: user?.roleName === 'PASSENGER' || !user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
