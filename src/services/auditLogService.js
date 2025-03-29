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

/**
 * Get audit logs for a specific user
 * @param {string} username - Username to filter by
 * @param {Object} params - Additional parameters (page, size)
 * @returns {Promise<Object>} Paginated audit logs for the user
 */
export const fetchAuditLogsByUser = (username, params = {}) => {
  const queryParams = [];
  
  if (params.page !== undefined) {
    queryParams.push(`page=${params.page}`);
  }
  
  if (params.size !== undefined) {
    queryParams.push(`size=${params.size}`);
  }
  
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
  return apiRequest(`/audit-logs/user/${encodeURIComponent(username)}${queryString}`);
};

/**
 * Get audit logs for a specific entity
 * @param {string} entityType - Entity type (RESOURCE, USER, etc.)
 * @param {string} entityId - Entity ID
 * @param {Object} params - Additional parameters (page, size)
 * @returns {Promise<Object>} Paginated audit logs for the entity
 */
export const fetchAuditLogsByEntity = (entityType, entityId, params = {}) => {
  const queryParams = [
    `entityType=${encodeURIComponent(entityType)}`,
    `entityId=${encodeURIComponent(entityId)}`
  ];
  
  if (params.page !== undefined) {
    queryParams.push(`page=${params.page}`);
  }
  
  if (params.size !== undefined) {
    queryParams.push(`size=${params.size}`);
  }
  
  return apiRequest(`/audit-logs/entity?${queryParams.join('&')}`);
};

/**
 * Get audit logs by log type
 * @param {string} logType - Log type (ADMIN, USER)
 * @param {Object} params - Additional parameters (page, size)
 * @returns {Promise<Object>} Paginated audit logs by type
 */
export const fetchAuditLogsByType = (logType, params = {}) => {
  const queryParams = [];
  
  if (params.page !== undefined) {
    queryParams.push(`page=${params.page}`);
  }
  
  if (params.size !== undefined) {
    queryParams.push(`size=${params.size}`);
  }
  
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
  return apiRequest(`/audit-logs/type/${encodeURIComponent(logType)}${queryString}`);
};

/**
 * Get audit logs by action
 * @param {string} action - Action (CREATE, UPDATE, DELETE)
 * @param {Object} params - Additional parameters (page, size)
 * @returns {Promise<Object>} Paginated audit logs by action
 */
export const fetchAuditLogsByAction = (action, params = {}) => {
  const queryParams = [];
  
  if (params.page !== undefined) {
    queryParams.push(`page=${params.page}`);
  }
  
  if (params.size !== undefined) {
    queryParams.push(`size=${params.size}`);
  }
  
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
  return apiRequest(`/audit-logs/action/${encodeURIComponent(action)}${queryString}`);
};

/**
 * Get audit logs by severity
 * @param {string} severity - Severity (INFO, WARNING, ERROR)
 * @param {Object} params - Additional parameters (page, size)
 * @returns {Promise<Object>} Paginated audit logs by severity
 */
export const fetchAuditLogsBySeverity = (severity, params = {}) => {
  const queryParams = [];
  
  if (params.page !== undefined) {
    queryParams.push(`page=${params.page}`);
  }
  
  if (params.size !== undefined) {
    queryParams.push(`size=${params.size}`);
  }
  
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
  return apiRequest(`/audit-logs/severity/${encodeURIComponent(severity)}${queryString}`);
};

/**
 * Get audit logs by date range
 * @param {string} startDate - Start date (ISO 8601 format)
 * @param {string} endDate - End date (ISO 8601 format)
 * @param {Object} params - Additional parameters (page, size)
 * @returns {Promise<Object>} Paginated audit logs within the date range
 */
export const fetchAuditLogsByDateRange = (startDate, endDate, params = {}) => {
  const queryParams = [
    `startDate=${encodeURIComponent(startDate)}`,
    `endDate=${encodeURIComponent(endDate)}`
  ];
  
  if (params.page !== undefined) {
    queryParams.push(`page=${params.page}`);
  }
  
  if (params.size !== undefined) {
    queryParams.push(`size=${params.size}`);
  }
  
  return apiRequest(`/audit-logs/date-range?${queryParams.join('&')}`);
};

/**
 * Search audit logs by query
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @returns {Promise<Object>} Paginated search results
 */
export const searchAuditLogs = (params = {}) => {
  const queryParams = [];
  
  if (params.query) {
    queryParams.push(`query=${encodeURIComponent(params.query)}`);
  }
  
  if (params.page !== undefined) {
    queryParams.push(`page=${params.page}`);
  }
  
  if (params.size !== undefined) {
    queryParams.push(`size=${params.size}`);
  }
  
  return apiRequest(`/audit-logs/search?${queryParams.join('&')}`);
};