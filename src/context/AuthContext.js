import React, {createContext, useCallback, useEffect, useRef, useState} from 'react';
import keycloak from '../config/keycloak';

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

    const initKeycloak = async () => {
      try {
        // Check if Keycloak is already authenticated to avoid re-initialization
        if (keycloak.authenticated) {
          console.log('Keycloak already authenticated, skipping initialization');
          setKeycloakInitialized(true);
          setLoading(false);

          // Set user info from existing token
          const userInfo = {
            id: keycloak.subject,
            name: keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username,
            email: keycloak.tokenParsed.email,
            role: keycloak.hasRealmRole('admin') ? 'admin' : 'user',
            avatar: generateInitialsFromName(keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username)
          };

          setCurrentUser(userInfo);
          return;
        }

        // Initialize only if not already initialized
        const initialized = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256', // Recommended for better security
          checkLoginIframe: false // Disable iframe checking which can cause issues
        });

        if (initialized) {
          // If user is authenticated, create user object
          if (keycloak.authenticated) {
            // Get user details from token
            const userInfo = {
              id: keycloak.subject, // Subject identifier from token
              name: keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username,
              email: keycloak.tokenParsed.email,
              role: keycloak.hasRealmRole('admin') ? 'admin' : 'user',
              // Generate avatar from initials if not present
              avatar: generateInitialsFromName(keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username)
            };

            setCurrentUser(userInfo);
          }
          setError(null);
        } else {
          setError('Unable to initialize authentication system');
        }
      } catch (err) {
        console.error('Keycloak initialization error:', err);
        setError('Error during authentication system initialization');
      } finally {
        setKeycloakInitialized(true);
        setLoading(false);
      }
    };

    initKeycloak();

    // Setup token refresh
    const refreshInterval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak.updateToken(70)
            .catch(() => {
              console.warn('Failed to refresh token, logging out');
              keycloak.logout();
            });
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, []);

  // Function to generate initials from name
  const generateInitialsFromName = (name) => {
    if (!name) return '';

    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    } else if (nameParts.length === 1) {
      return `${nameParts[0][0]}`;
    }
    return '';
  };

  // Login function
  const login = useCallback(() => {
    keycloak.login();
  }, []);

  // Logout function
  const logout = useCallback(() => {
    keycloak.logout();
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
    if (!keycloak.authenticated) return false;

    try {
      return await keycloak.updateToken(minValidity);
    } catch (error) {
      console.error('Error updating token:', error);
      logout(); // Logout if refresh token has expired
      return false;
    }
  }, [logout]);

  // Get current access token
  const getAccessToken = useCallback(() => {
    return keycloak.token;
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