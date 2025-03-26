/**
 * Service for federation-related API operations
 */
import apiRequest from './apiCore';

// Define federation types for clarity
export const FederationRoles = {
  GLOBAL_ADMIN: 'GLOBAL_ADMIN',
  FEDERATION_ADMIN: 'FEDERATION_ADMIN',
  USER: 'USER'
};

/**
 * Get all federations (filtered based on user permissions)
 * @returns {Promise<Array>} List of federations
 */
export const fetchFederations = () => apiRequest('/federations');

/**
 * Get a federation by ID
 * @param {string} id - Federation ID
 * @returns {Promise<Object>} Federation data
 */
export const fetchFederation = (id) => apiRequest(`/federations/${id}`);

/**
 * Create a new federation (GLOBAL_ADMIN only)
 * @param {Object} federationData - New federation data
 * @returns {Promise<Object>} Created federation
 */
export const createFederation = (federationData) => apiRequest('/federations', 'POST', federationData);

/**
 * Update an existing federation (GLOBAL_ADMIN only)
 * @param {string} id - Federation ID
 * @param {Object} federationData - Updated federation data
 * @returns {Promise<Object>} Updated federation
 */
export const updateFederation = (id, federationData) => apiRequest(`/federations/${id}`, 'PUT', federationData);

/**
 * Delete a federation (GLOBAL_ADMIN only)
 * @param {string} id - Federation ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteFederation = (id) => apiRequest(`/federations/${id}`, 'DELETE');

/**
 * Get users in a federation
 * @param {string} federationId - Federation ID
 * @returns {Promise<Array>} List of users in the federation
 */
export const fetchFederationUsers = (federationId) => apiRequest(`/federations/${federationId}/users`);

/**
 * Add a user to a federation
 * @param {string} federationId - Federation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Operation response
 */
export const addUserToFederation = (federationId, userId) => 
  apiRequest(`/federations/${federationId}/users/${userId}`, 'POST');

/**
 * Remove a user from a federation
 * @param {string} federationId - Federation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Operation response
 */
export const removeUserFromFederation = (federationId, userId) => 
  apiRequest(`/federations/${federationId}/users/${userId}`, 'DELETE');

/**
 * Get federation admins
 * @param {string} federationId - Federation ID
 * @returns {Promise<Array>} List of federation admins
 */
export const fetchFederationAdmins = (federationId) => apiRequest(`/federations/${federationId}/admins`);

/**
 * Add a federation admin
 * @param {string} federationId - Federation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Operation response
 */
export const addFederationAdmin = (federationId, userId) => 
  apiRequest(`/federations/${federationId}/admins/${userId}`, 'POST');

/**
 * Remove a federation admin
 * @param {string} federationId - Federation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Operation response
 */
export const removeFederationAdmin = (federationId, userId) => 
  apiRequest(`/federations/${federationId}/admins/${userId}`, 'DELETE');