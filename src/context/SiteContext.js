import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchSites } from '../services/siteService';
import { AuthContext } from './AuthContext';
import useApiError from '../hooks/useApiError';

export const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const { currentUser, isAuthorized, isGlobalAdmin, isSiteAdmin, getAdminSites } = useContext(AuthContext);
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

  // Check if the user can manage site (create/edit/delete)
  const canManageSites = () => {
    // Global admins can manage all sites
    if (isGlobalAdmin()) return true;
    
    // Site admins can now create and manage their own sites
    if (isSiteAdmin()) return true;
    
    return false;
  };

  // Check if the user can manage specific site
  const canManageSite = (siteId) => {
    // Global admins can manage all sites
    if (isGlobalAdmin()) return true;
    
    // Find the site by ID
    const site = sites.find(s => s.id === siteId);
    if (!site) return false;
    
    // Site admins can manage their own sites
    return isSiteAdmin(site.name);
  };

  // Get sites that the user can administer
  const getManageableSites = () => {
    if (isGlobalAdmin()) return sites; // Global admins can manage all sites
    
    const adminSiteNames = getAdminSites();
    return sites.filter(site => adminSiteNames.includes(site.name));
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
        hasSiteAccess,
        canManageSites,
        canManageSite,
        getManageableSites
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