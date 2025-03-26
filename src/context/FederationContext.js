import React, { createContext, useState, useContext, useEffect } from 'react';
import { FederationRoles, fetchFederations } from '../services/federationService';
import { AuthContext } from './AuthContext';
import useApiError from '../hooks/useApiError';

export const FederationContext = createContext();

export const FederationProvider = ({ children }) => {
  const { currentUser, isAuthorized, isGlobalAdmin, isFederationAdmin } = useContext(AuthContext);
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
          if (currentUser.federations.length > 0 && !currentFederation) {
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