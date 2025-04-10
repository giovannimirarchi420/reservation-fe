/**
 * Service for resource type-related API operations
 */
import apiRequest from './apiCore';

/**
 * Get all resource types
 * @returns {Promise<Array>} List of resource types
 */
export const fetchResourceTypes = (filters = {}) => {
    const queryParams = [];
    
    if (filters.siteId) {
        queryParams.push(`siteId=${filters.siteId}`);
    }
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return apiRequest(`/resource-types${queryString}`);
}

/**
 * Get a resource type by ID
 * @param {number} id - Resource type ID
 * @returns {Promise<Object>} Resource type data
 */
export const fetchResourceType = (id) => apiRequest(`/resource-types/${id}`);

/**
 * Create a new resource type
 * @param {Object} typeData - New resource type data
 * @returns {Promise<Object>} Created resource type
 */
export const createResourceType = (typeData) => apiRequest('/resource-types', 'POST', typeData);

/**
 * Update an existing resource type
 * @param {number} id - Resource type ID
 * @param {Object} typeData - Updated resource type data
 * @returns {Promise<Object>} Updated resource type
 */
export const updateResourceType = (id, typeData) => apiRequest(`/resource-types/${id}`, 'PUT', typeData);

/**
 * Delete a resource type
 * @param {number} id - Resource type ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteResourceType = (id) => apiRequest(`/resource-types/${id}`, 'DELETE');