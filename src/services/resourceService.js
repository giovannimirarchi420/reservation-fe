/**
 * Service for resource-related API operations
 */
import apiRequest from './apiCore';

/**
 * Mappa di valori numerici per gli stati delle risorse
 * 0 = ACTIVE
 * 1 = MAINTENANCE
 * 2 = UNAVAILABLE
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
  let queryParams = '';
  if (filters.status !== undefined) queryParams += `status=${filters.status}`;
  if (filters.typeId) queryParams += `${queryParams ? '&' : ''}typeId=${filters.typeId}`;

  return apiRequest(`/resources${queryParams ? '?' + queryParams : ''}`);
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
  // Assicurati che lo stato sia un numero
  const preparedData = {
    ...resourceData,
    status: Number(resourceData.status)
  };

  return apiRequest('/resources', 'POST', preparedData);
};

/**
 * Update an existing resource
 * @param {number} id - Resource ID
 * @param {Object} resourceData - Updated resource data
 * @returns {Promise<Object>} Updated resource
 */
export const updateResource = (id, resourceData) => {
  // Assicurati che lo stato sia un numero
  const preparedData = {
    ...resourceData,
    status: Number(resourceData.status)
  };

  return apiRequest(`/resources/${id}`, 'PUT', preparedData);
};

/**
 * Update resource status
 * @param {number} id - Resource ID
 * @param {number} status - New status (0=ACTIVE, 1=MAINTENANCE, 2=UNAVAILABLE)
 * @returns {Promise<Object>} Updated resource
 */
export const updateResourceStatus = (id, status) =>
    apiRequest(`/resources/${id}/status?status=${Number(status)}`, 'PATCH');

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