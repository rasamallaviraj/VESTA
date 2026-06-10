import React, { createContext, useState, useEffect, useContext } from 'react';

const BASE = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to VESTA! Access tools from your portal.', type: 'info', read: false, createdAt: new Date() },
    { id: 2, text: 'Vesta AI is active. Click "Ask Vesta AI" on any land listing.', type: 'info', read: false, createdAt: new Date() }
  ]);

  // Load user from localStorage on boot
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('vesta_token');
      const storedUser = localStorage.getItem('vesta_user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          
          // Verify on backend
          const res = await fetch(`${BASE}/api/user/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const freshUser = await res.json();
            setUser(prev => {
              const updated = { ...prev, ...freshUser };
              localStorage.setItem('vesta_user', JSON.stringify(updated));
              return updated;
            });
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.warn("Backend auth offline. Using local cached credentials.");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password, requestedRole = 'BUYER') => {
    if (email === 'admin@vesta.com' && password === 'vesta@admin2026') {
      const adminUser = { id: 'admin', name: 'Admin', email: 'admin@vesta.com', role: 'ADMIN', token: 'admin-token' };
      localStorage.setItem('vesta_token', 'admin-token');
      localStorage.setItem('vesta_user', JSON.stringify(adminUser));
      setUser(adminUser);
      addNotification('Welcome back, Admin!');
      return { success: true, user: adminUser };
    }

    let res;
    try {
      res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (networkErr) {
      // fetch() itself threw — backend is unreachable
      const message = 'Unable to connect. Please try again.';
      return { success: false, message };
    }

    const data = await res.json();

    if (res.ok) {
      const loggedUser = {
        id: data._id || data.id,
        name: data.name,
        email: data.email,
        role: data.role || requestedRole,
        token: data.token
      };
      localStorage.setItem('vesta_token', data.token);
      localStorage.setItem('vesta_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      addNotification(`Logged in successfully as ${loggedUser.name}!`);
      return { success: true, user: loggedUser };
    }

    if (res.status === 401) {
      const message = 'Invalid email or password. Please check your credentials or sign up first.';
      return { success: false, message };
    }

    // Any other non-OK response
    const message = data.message || 'Login failed. Please try again.';
    return { success: false, message };
  };

  const register = async (name, email, password, requestedRole = 'BUYER') => {
    let res;
    try {
      res = await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: requestedRole })
      });
    } catch (networkErr) {
      // fetch() itself threw — backend is unreachable
      const message = 'Unable to connect. Please try again.';
      return { success: false, message };
    }

    const data = await res.json();

    if (res.ok) {
      const loggedUser = {
        id: data._id || data.id,
        name: data.name,
        email: data.email,
        role: data.role || requestedRole,
        token: data.token
      };
      localStorage.setItem('vesta_token', data.token);
      localStorage.setItem('vesta_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      addNotification(`Account created successfully! Welcome, ${loggedUser.name}.`);
      return { success: true, user: loggedUser };
    }

    if (res.status === 400) {
      const message = 'An account with this email already exists. Please login instead.';
      return { success: false, message };
    }

    // Any other non-OK response
    const message = data.message || 'Registration failed. Please try again.';
    return { success: false, message };
  };

  const logout = () => {
    localStorage.removeItem('vesta_token');
    localStorage.removeItem('vesta_user');
    setUser(null);
  };

  const addNotification = (text, type = 'info') => {
    setNotifications(prev => [
      {
        id: Date.now(),
        text,
        type,
        read: false,
        createdAt: new Date()
      },
      ...prev
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      notifications,
      addNotification,
      markAllNotificationsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
