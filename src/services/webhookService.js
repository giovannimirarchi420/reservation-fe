/**
 * Service for webhook-related API operations
 */
import apiRequest from './apiCore';

/**
 * Get all webhooks
 * @returns {Promise<Array>} List of webhooks
 */
export const fetchWebhooks = () => apiRequest('/webhooks');

/**
 * Get a webhook by ID
 * @param {number} id - Webhook ID
 * @returns {Promise<Object>} Webhook data
 */
export const fetchWebhook = (id) => apiRequest(`/webhooks/${id}`);

/**
 * Create a new webhook
 * @param {Object} webhookData - New webhook configuration
 * @returns {Promise<Object>} Created webhook
 */
export const createWebhook = (webhookData) => apiRequest('/webhooks', 'POST', webhookData);

/**
 * Update an existing webhook
 * @param {number} id - Webhook ID
 * @param {Object} webhookData - Updated webhook data
 * @returns {Promise<Object>} Updated webhook
 */
export const updateWebhook = (id, webhookData) => apiRequest(`/webhooks/${id}`, 'PUT', webhookData);

/**
 * Delete a webhook
 * @param {number} id - Webhook ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteWebhook = (id) => apiRequest(`/webhooks/${id}`, 'DELETE');

/**
 * Test a webhook by sending a test event
 * @param {number} id - Webhook ID to test
 * @returns {Promise<Object>} Test result
 */
export const testWebhook = (id) => apiRequest(`/webhooks/test?webhookId=${id}`, 'POST');

/**
 * Get webhook logs
 * @param {Object} filters - Optional filters (webhookId, success)
 * @returns {Promise<Array>} List of webhook logs
 */
export const fetchWebhookLogs = (filters = {}) => {
  const queryParams = [];
  
  if (filters.webhookId) {
    queryParams.push(`webhookId=${filters.webhookId}`);
  }
  
  if (filters.success !== undefined) {
    queryParams.push(`success=${filters.success}`);
  }
  
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  return apiRequest(`/webhooks/logs${queryString}`);
};