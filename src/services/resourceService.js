/**
 * Service for resource-related API operations
 */
import apiRequest from './apiCore';

/**
 * Stati delle risorse come enumerazione
 */
export const ResourceStatus = {
  ACTIVE: "ACTIVE",
  MAINTENANCE: "MAINTENANCE",
  UNAVAILABLE: "UNAVAILABLE"
};

/**
 * Get all resources
 * @param {Object} filters - Optional filters (status, typeId)
 * @returns {Promise<Array>} List of resources
 */
export const fetchResources = (filters = {}) => {
  const queryParams = [];

  if (filters.federationId) {
    queryParams.push(`federationId=${filters.federationId}`);
  }
  
  if (filters.status !== undefined) {
    queryParams.push(`status=${filters.status}`);
  }
  
  if (filters.typeId) {
    queryParams.push(`typeId=${filters.typeId}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  return apiRequest(`/resources${queryString}`);
};

/**
 * Get a resource by ID
 * @param {number} id - Resource ID
 * @returns {Promise<Object>} Resource data
 */
export const fetchResource = (id) => apiRequest(`/resources/${id}`);

/**
 * Create a new resource
 * @param {Object} resourceData - New resource data
 * @returns {Promise<Object>} Created resource
 */
export const createResource = (resourceData) => {
  return apiRequest('/resources', 'POST', resourceData);
};

/**
 * Update an existing resource
 * @param {number} id - Resource ID
 * @param {Object} resourceData - Updated resource data
 * @returns {Promise<Object>} Updated resource
 */
export const updateResource = (id, resourceData) => {
  return apiRequest(`/resources/${id}`, 'PUT', resourceData);
};

/**
 * Update resource status
 * @param {number} id - Resource ID
 * @param {string} status - New status (ACTIVE, MAINTENANCE, UNAVAILABLE)
 * @returns {Promise<Object>} Updated resource
 */
export const updateResourceStatus = (id, status) =>
  apiRequest(`/resources/${id}/status?status=${status}`, 'PATCH');

/**
 * Delete a resource
 * @param {number} id - Resource ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteResource = (id) => apiRequest(`/resources/${id}`, 'DELETE');

/**
 * Search resources
 * @param {string} query - Search term
 * @returns {Promise<Array>} Found resources
 */
export const searchResources = (query) =>
apiRequest(`/resources/search?query=${encodeURIComponent(query)}`);