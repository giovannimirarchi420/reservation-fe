import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import * as authService from '../services/authService';

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keycloakInitialized, setKeycloakInitialized] = useState(false);

  // Use a ref to track initialization attempts
  const initializationAttempted = useRef(false);

  // Initialize Keycloak on mount
  useEffect(() => {
    // Only try to initialize if not already attempted
    if (initializationAttempted.current) {
      return;
    }

    initializationAttempted.current = true;

    const initAuth = async () => {
      try {
        await authService.initKeycloak(
            // Success callback
            (token, tokenParsed) => {
              // Get user details from authService
              const userInfo = authService.getUserInfo();
              if (userInfo) {
                setCurrentUser(userInfo);
              }
              setError(null);
            },
            // Error callback
            (errorMsg) => {
              console.error('Keycloak initialization error:', errorMsg);
              setError('Error during authentication system initialization');
            },
            // Token expired callback
            (refreshed) => {
              console.log('Token refresh status:', refreshed);
              // Optional: you could update some state here if needed
            }
        );
      } catch (err) {
        console.error('Keycloak initialization error:', err);
        setError('Error during authentication system initialization');
      } finally {
        setKeycloakInitialized(true);
        setLoading(false);
      }
    };

    initAuth();

    // Setup token refresh
    const refreshInterval = setInterval(() => {
      if (authService.isAuthenticated()) {
        authService.updateToken()
            .catch((error) => {
              console.warn('Failed to refresh token, logging out', error);
              authService.logout();
            });
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, []);

  // Login function
  const login = useCallback(() => {
    authService.login();
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
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
  const updateToken = useCallback(async (minValidity = 30) => {
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
    loading,
    error,
    keycloakInitialized,
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