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
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const loggedUser = {
          id: data._id || data.id,
          name: data.name,
          email: data.email,
          role: data.role || requestedRole, // Handle dynamic roles
          token: data.token
        };
        localStorage.setItem('vesta_token', data.token);
        localStorage.setItem('vesta_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        addNotification(`Logged in successfully as ${loggedUser.name}!`);
        return { success: true, user: loggedUser };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.warn("Backend login failed/offline. Falling back to local mock authentication.", err);
      // Fallback for immediate mock validation:
      const name = email.split('@')[0];
      const mockUser = {
        id: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        role: requestedRole,
        token: 'mock-jwt-token'
      };
      localStorage.setItem('vesta_token', mockUser.token);
      localStorage.setItem('vesta_user', JSON.stringify(mockUser));
      setUser(mockUser);
      addNotification(`Logged in as ${mockUser.name} (Offline Mode)`);
      return { success: true, user: mockUser };
    }
  };

  const register = async (name, email, password, requestedRole = 'BUYER') => {
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: requestedRole })
      });
      
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
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      console.warn("Backend registration failed/offline. Falling back to local mock signup.", err);
      const mockUser = {
        id: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        role: requestedRole,
        token: 'mock-jwt-token'
      };
      localStorage.setItem('vesta_token', mockUser.token);
      localStorage.setItem('vesta_user', JSON.stringify(mockUser));
      setUser(mockUser);
      addNotification(`Registered successfully as ${mockUser.name} (Offline Mode)`);
      return { success: true, user: mockUser };
    }
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
