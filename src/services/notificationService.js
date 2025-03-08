/**
 * Service for notification-related API operations
 */
import apiRequest from './apiCore';

/**
 * Get notifications for the current user
 * @param {boolean} unreadOnly - Only get unread notifications
 * @returns {Promise<Array>} List of notifications
 */
export const fetchNotifications = (unreadOnly = false) => 
  apiRequest(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`);

/**
 * Get the count of unread notifications
 * @returns {Promise<number>} Number of unread notifications
 */
export const getUnreadCount = () => apiRequest('/notifications/unread-count');

/**
 * Mark a notification as read
 * @param {number} id - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = (id) => apiRequest(`/notifications/${id}/mark-read`, 'PATCH');

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Operation response
 */
export const markAllAsRead = () => apiRequest('/notifications/mark-all-read', 'PATCH');

/**
 * Delete a notification
 * @param {number} id - Notification ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteNotification = (id) => apiRequest(`/notifications/${id}`, 'DELETE');

/**
 * Send a notification to a user (admin only)
 * @param {number} userId - Recipient user ID
 * @param {string} message - Notification message
 * @param {string} type - Notification type (INFO, SUCCESS, WARNING, ERROR)
 * @returns {Promise<Object>} Created notification
 */
export const sendNotification = (userId, message, type = 'INFO') => 
  apiRequest(`/notifications/send?userId=${userId}&message=${encodeURIComponent(message)}&type=${type}`, 'POST');