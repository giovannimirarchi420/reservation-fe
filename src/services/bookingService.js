/**
 * Service for event/booking-related API operations
 */
import apiRequest from './apiCore';

/**
 * Get all events/bookings
 * @param {Object} filters - Optional filters (resourceId, startDate, endDate, federationId)
 * @returns {Promise<Array>} List of events
 */
export const fetchEvents = (filters = {}) => {
  const queryParams = [];
  
  if (filters.federationId) {
    queryParams.push(`federationId=${filters.federationId}`);
  }

  if (filters.resourceId) {
    queryParams.push(`resourceId=${filters.resourceId}`);
  }
  
  if (filters.startDate) {
    const startDateStr = filters.startDate instanceof Date 
      ? filters.startDate.toISOString() 
      : filters.startDate;
    queryParams.push(`startDate=${encodeURIComponent(startDateStr)}`);
  }
  
  if (filters.endDate) {
    const endDateStr = filters.endDate instanceof Date 
      ? filters.endDate.toISOString() 
      : filters.endDate;
    queryParams.push(`endDate=${encodeURIComponent(endDateStr)}`);
  }
  
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  return apiRequest(`/events${queryString}`);
};

/**
 * Get events for the current user
 * @returns {Promise<Array>} List of user's events
 */
export const fetchMyEvents = () => apiRequest('/events/my-events');

/**
 * Get an event by ID
 * @param {number} id - Event ID
 * @returns {Promise<Object>} Event data
 */
export const fetchEvent = (id) => apiRequest(`/events/${id}`);

/**
 * Create a new event
 * @param {Object} eventData - New event data
 * @returns {Promise<Object>} Created event
 */
export const createEvent = (eventData) => apiRequest('/events', 'POST', eventData);

/**
 * Update an existing event
 * @param {number} id - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = (id, eventData) => apiRequest(`/events/${id}`, 'PUT', eventData);

/**
 * Delete an event
 * @param {number} id - Event ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteEvent = (id) => apiRequest(`/events/${id}`, 'DELETE');

/**
 * Check for conflicts for an event
 * @param {number} resourceId - Resource ID
 * @param {Date|string} start - Start date and time
 * @param {Date|string} end - End date and time
 * @param {number} eventId - Event ID (optional, to exclude from checks)
 * @returns {Promise<Object>} Response with conflict info
 */
export const checkEventConflicts = (resourceId, start, end, eventId = null) => {
  const startStr = start instanceof Date ? start.toISOString() : start;
  const endStr = end instanceof Date ? end.toISOString() : end;
  
  const queryParams = [
    `resourceId=${resourceId}`,
    `start=${encodeURIComponent(startStr)}`,
    `end=${encodeURIComponent(endStr)}`
  ];
  
  if (eventId) {
    queryParams.push(`eventId=${eventId}`);
  }
  
  return apiRequest(`/events/check-conflicts?${queryParams.join('&')}`);
};