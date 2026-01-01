import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG, api } from '../utils/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const adminStatus = localStorage.getItem("isAdmin") === "true";
        
        if (storedToken) {
          // For stored tokens, trust them immediately without validation
          // This prevents race condition and keeps users logged in on page reload
          setToken(storedToken);
          setIsAdmin(adminStatus);
          setIsAuthLoading(false);
          
          // Optional: Background validation for security (but don't clear auth data on failure)
          setTimeout(async () => {
            try {
              const response = await api.get('/api/auth/validate');
              if (response) {
                setUser(response.userId);
              }
            } catch (error) {
              console.log('Background validation failed, keeping user logged in');
            }
          }, 2000); // Longer delay to prevent interference
        } else {
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError(error);
        // Only clear auth data if it's clearly an initialization error, not validation failure
        if (!localStorage.getItem("token")) {
          clearAuthData();
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userId");
  };

  const login = (newToken, adminStatus = false) => {
    localStorage.setItem("token", newToken);
    if (adminStatus) {
      localStorage.setItem("isAdmin", "true");
    } else {
      localStorage.removeItem("isAdmin");
    }
    setToken(newToken);
    setIsAdmin(adminStatus);
    setAuthError(null);
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setIsAdmin(false);
    setUser(null);
    setAuthError(null);
  };

  // Listen for auth events from other tabs and expired tokens
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // Token was cleared from another tab
          logout();
        } else {
          // Token was updated from another tab
          login(e.newValue, localStorage.getItem("isAdmin") === "true");
        }
      }
    };

    const handleAuthExpired = () => {
      console.log('Auth expired event received, logging out');
      logout();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      token,
      isAdmin,
      isAuthLoading,
      authError,
      user,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}