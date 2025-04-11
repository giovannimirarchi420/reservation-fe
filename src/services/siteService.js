/**
 * Service for site-related API operations
 */
import apiRequest from './apiCore';

// Define site types for clarity
export const SiteRoles = {
  GLOBAL_ADMIN: 'global_admin',
  SITE_ADMIN: 'site_admin',
  USER: 'user'
};

/**
 * Get all site (filtered based on user permissions)
 * @returns {Promise<Array>} List of site
 */
export const fetchSites = () => apiRequest('/sites');

/**
 * Get a site by ID
 * @param {string} id - Site ID
 * @returns {Promise<Object>} Site data
 */
export const fetchFederation = (id) => apiRequest(`/sites/${id}`);

/**
 * Create a new site (GLOBAL_ADMIN or SITE_ADMIN)
 * @param {Object} siteData - New site data
 * @returns {Promise<Object>} Created site
 */
export const createSite = (siteData) => apiRequest('/sites', 'POST', siteData);

/**
 * Update an existing site (GLOBAL_ADMIN or SITE_ADMIN for their sites)
 * @param {string} id - Site ID
 * @param {Object} siteData - Updated site data
 * @returns {Promise<Object>} Updated site
 */
export const updateSite = (id, siteData) => apiRequest(`/sites/${id}`, 'PUT', siteData);

/**
 * Delete a site (GLOBAL_ADMIN only)
 * @param {string} id - Site ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteSite = (id) => apiRequest(`/sites/${id}`, 'DELETE');

/**
 * Get users in a site
 * @param {string} siteId - Site ID
 * @returns {Promise<Array>} List of users in the federation
 */
export const fetchSiteUsers = (siteId) => apiRequest(`/sites/${siteId}/users`);

/**
 * Add a user to a site
 * @param {string} siteId - Site ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Operation response
 */
export const addUserToSite = (siteId, userId) =>
  apiRequest(`/sites/${siteId}/users/${userId}`, 'POST');

/**
 * Remove a user from a site
 * @param {string} siteId - Site ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Operation response
 */
export const removeUserFromSite = (siteId, userId) =>
  apiRequest(`/sites/${siteId}/users/${userId}`, 'DELETE');

/**
 * Get site admins
 * @param {string} siteId - Site ID
 * @returns {Promise<Array>} List of federation admins
 */
export const fetchSiteAdmins = (siteId) => apiRequest(`/sites/${siteId}/admins`);

/**
 * Add a site admin
 * @param {string} siteId - Site ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Operation response
 */
export const addSiteAdmin = (siteId, userId) =>
  apiRequest(`/sites/${siteId}/admins/${userId}`, 'POST');

/**
 * Remove a site admin
 * @param {string} siteId - Site ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Operation response
 */
export const removeSiteAdmin = (siteId, userId) =>
  apiRequest(`/sites/${siteId}/admins/${userId}`, 'DELETE');