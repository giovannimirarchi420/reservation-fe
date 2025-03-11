import React, { createContext, useCallback, useEffect, useState } from 'react';
import keycloak from '../config/keycloak';
import * as authService from '../services/authService';

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detect authentication state changes and update user info
  useEffect(() => {
    // Initialize Keycloak without authentication
    if (!keycloak.didInitialize) {
      keycloak.init({
        onLoad: 'login-required',
        pkceMethod: 'S256', // For better security
        enableLogging: process.env.NODE_ENV !== 'production', // Log only in development
        checkLoginIframe: false // Disable iframe checking to prevent issues with redirects
      }).then(authenticated => {
        if (authenticated) {
          console.log('User is already authenticated');
          const userInfo = authService.getUserInfo();
          setCurrentUser(userInfo);
          setLoading(false);
          
          // Set up token refresh
          keycloak.onTokenExpired = () => {
            console.log('Token expired, attempting refresh...');
            keycloak.updateToken(70)
              .then(refreshed => {
                if (refreshed) {
                  console.log('Token successfully refreshed');
                } else {
                  console.log('Token still valid');
                }
              })
              .catch(error => {
                console.error('Error during token refresh', error);
              });
          };
        } else {
          console.log('Not authenticated');
          setLoading(false);
        }
      }).catch(error => {
        console.error('Failed to initialize Keycloak', error);
        setLoading(false);
        setError('Failed to initialize authentication system');
      });
    }

    // Set up a listener for auth state changes if needed
    const handleTokenExpired = () => {
      console.log('Token expired event received');
    };

    keycloak.onTokenExpired = handleTokenExpired;
  }, []);

  // Login function
  const login = useCallback((option) => {
    setLoading(true);
    try {
      authService.login(option);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please try again.');
      setLoading(false);
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setLoading(true);
    try {
      authService.logout();
      setCurrentUser(null);
      setLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
      setLoading(false);
    }
  }, []);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    if (!currentUser) return false;
    return currentUser.role === 'admin';
  }, [currentUser]);

  // Check if user is authorized for a given action
  const isAuthorized = useCallback((requiredRole = 'user') => {
    if (!currentUser) return false;

    if (requiredRole === 'admin') {
      return currentUser.role === 'admin';
    }

    return true; // All authenticated users are basic users
  }, [currentUser]);

  // Update token (to call before API requests)
  const updateToken = useCallback(async () => {
    try {
      return await authService.updateToken();
    } catch (error) {
      console.error('Error updating token:', error);
      logout(); // Logout if refresh token has expired
      return false;
    }
  }, [logout]);

  // Get current access token
  const getAccessToken = useCallback(() => {
    return authService.getToken();
  }, []);

  // Context value
  const value = {
    currentUser,
    setCurrentUser,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isAuthorized,
    updateToken,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};