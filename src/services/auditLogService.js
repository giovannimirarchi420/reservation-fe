/**
 * Service for audit log-related API operations
 */
import apiRequest from './apiCore';

/**
 * Get all audit logs with pagination and optional filters
 * @param {Object} params - Request parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @param {string} params.username - Filter logs by username
 * @param {string} params.entityType - Filter logs by entity type
 * @param {string} params.entityId - Filter logs by entity ID
 * @param {string} params.logType - Filter logs by log type (ADMIN, USER)
 * @param {string} params.action - Filter logs by action (CREATE, UPDATE, DELETE)
 * @param {string} params.severity - Filter logs by severity (INFO, WARNING, ERROR)
 * @param {string} params.startDate - Filter logs by start date (ISO 8601 format)
 * @param {string} params.endDate - Filter logs by end date (ISO 8601 format)
 * @returns {Promise<Object>} Paginated audit logs response
 */
export const fetchAuditLogs = (params = {}) => {
  const queryParams = [];
  
  // Add pagination parameters
  if (params.page !== undefined) {
    queryParams.push(`page=${params.page}`);
  }
  
  if (params.size !== undefined) {
    queryParams.push(`size=${params.size}`);
  }
  
  // Add filter parameters
  if (params.username) {
    queryParams.push(`username=${encodeURIComponent(params.username)}`);
  }
  
  if (params.entityType) {
    queryParams.push(`entityType=${encodeURIComponent(params.entityType)}`);
  }
  
  if (params.entityId) {
    queryParams.push(`entityId=${encodeURIComponent(params.entityId)}`);
  }
  
  if (params.logType) {
    queryParams.push(`logType=${encodeURIComponent(params.logType)}`);
  }
  
  if (params.action) {
    queryParams.push(`action=${encodeURIComponent(params.action)}`);
  }
  
  if (params.severity) {
    queryParams.push(`severity=${encodeURIComponent(params.severity)}`);
  }
  
  // Handle date range filter
  if (params.startDate && params.endDate) {
    queryParams.push(`startDate=${encodeURIComponent(params.startDate)}`);
    queryParams.push(`endDate=${encodeURIComponent(params.endDate)}`);
  }
    
  if (params.searchQuery) {
    queryParams.push(`query=${encodeURIComponent(params.searchQuery)}`);
  }
  
  // Build the query string
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
  return apiRequest(`/audit-logs${queryString}`);
};

/**
 * Get a specific audit log by ID
 * @param {number} id - Audit log ID
 * @returns {Promise<Object>} Audit log details
 */
export const fetchAuditLogById = (id) => {
  return apiRequest(`/audit-logs/${id}`);
};