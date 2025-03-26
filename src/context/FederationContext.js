import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchFederations } from '../services/federationService';
import { AuthContext } from './AuthContext';
import useApiError from '../hooks/useApiError';

export const FederationContext = createContext();

export const FederationProvider = ({ children }) => {
  const { currentUser, isAuthorized } = useContext(AuthContext);
  const { withErrorHandling } = useApiError();
  const [federations, setFederations] = useState([]);
  const [currentFederation, setCurrentFederation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user's federations
  useEffect(() => {
    const loadFederations = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await withErrorHandling(async () => {
          const federationsData = await fetchFederations();
          setFederations(federationsData);
          
          // Set the first federation as current if none is already selected
          if (federationsData.length > 0 && !currentFederation) {
            setCurrentFederation(federationsData[0]);
          }
        }, {
          errorMessage: 'Unable to load federations',
          showError: true
        });
      } finally {
        setLoading(false);
      }
    };

    loadFederations();
  }, [currentUser, withErrorHandling]);

  // Reset state when user changes
  useEffect(() => {
    if (!currentUser) {
      setCurrentFederation(null);
    }
  }, [currentUser]);

  // Helper function to check if user is a global admin
  const isGlobalAdmin = () => {
    if (!currentUser) return false;
    
    if (Array.isArray(currentUser.roles)) {
      return currentUser.roles.includes('GLOBAL_ADMIN');
    }
    
    return false;
  };

  // Helper function to check if user is admin for a specific federation
  const isFederationAdmin = (federationId) => {
    if (!currentUser || !federationId) return false;
    
    // If user is global admin, they have admin rights to all federations
    if (isGlobalAdmin()) return true;
    
    // If user has the FEDERATION_ADMIN role and the federation is in their admin list
    if (Array.isArray(currentUser.roles) && currentUser.roles.includes('FEDERATION_ADMIN')) {
      // Check if the federation is in the user's admin list (if available)
      if (Array.isArray(currentUser.adminFederations)) {
        return currentUser.adminFederations.includes(federationId);
      }
      
      // If adminFederations is not available but federation admins are listed in the federation object
      const federation = federations.find(f => f.id === federationId);
      if (federation && Array.isArray(federation.adminIds)) {
        return federation.adminIds.includes(currentUser.id);
      }
    }
    
    return false;
  };

  // Check if user has access to a specific federation
  const hasFederationAccess = (federationName) => {
    if (!currentUser || !federationName) return false;
    
    // Global admins have access to all federations
    if (isGlobalAdmin()) return true;
    
    // Federation admins have access to their assigned federations
    if (isFederationAdmin(federationName)) return true;
    
    if (Array.isArray(currentUser.federations)) {
      return currentUser.federations.some(f => f === federationName);
    }
    
    return false;
  };

  return (
    <FederationContext.Provider
      value={{
        federations,
        currentFederation,
        setCurrentFederation,
        loading,
        isGlobalAdmin,
        isFederationAdmin,
        hasFederationAccess
      }}
    >
      {children}
    </FederationContext.Provider>
  );
};

// Custom hook to use the federation context
export const useFederation = () => {
  const context = useContext(FederationContext);
  if (!context) {
    throw new Error('useFederation must be used within a FederationProvider');
  }
  return context;
};