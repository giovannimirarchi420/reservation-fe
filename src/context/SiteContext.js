import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchSites } from '../services/siteService';
import { AuthContext } from './AuthContext';
import useApiError from '../hooks/useApiError';

export const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const { currentUser, isAuthorized, isGlobalAdmin, isSiteAdmin } = useContext(AuthContext);
  const { withErrorHandling } = useApiError();
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const STARTER_SITE = 'ALL';

  // Load user's sites
  useEffect(() => {
    const loadSites = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await withErrorHandling(async () => {
          const sitesData = await fetchSites();
          setSites(sitesData);
          setCurrentSite(STARTER_SITE)
        }, {
          errorMessage: 'Unable to load sites',
          showError: true
        });
      } finally {
        setLoading(false);
      }
    };

    loadSites();
  }, [currentUser, withErrorHandling]);



  // Check if user has access to a specific site
  const hasSiteAccess = (siteName) => {
    if (!currentUser || !siteName) return false;
    
    // Global admins have access to all sites
    if (isGlobalAdmin()) return true;
    
    // Site admins have access to their assigned sites
    if (isSiteAdmin(siteName)) return true;
    
    if (Array.isArray(currentUser.sites)) {
      return currentUser.sites.some(f => f === siteName);
    }
    
    return false;
  };

  return (
    <SiteContext.Provider
      value={{
        sites: sites,
        currentSite: currentSite,
        setCurrentSite: setCurrentSite,
        loading,
        STARTER_SITE: STARTER_SITE,
        isGlobalAdmin,
        isSiteAdmin,
        hasSiteAccess: hasSiteAccess
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

// Custom hook to use the site context
export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};