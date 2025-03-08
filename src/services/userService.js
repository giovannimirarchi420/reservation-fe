/**
 * Service for user-related API operations
 */
import apiRequest from './apiCore';

/**
 * Get all users
 * @returns {Promise<Array>} List of users
 */
export const fetchUsers = () => apiRequest('/users');

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} User data
 */
export const fetchUser = (id) => apiRequest(`/users/${id}`);

/**
 * Get current user profile
 * @returns {Promise<Object>} Current user profile
 */
export const fetchCurrentUser = () => apiRequest('/users/me');

/**
 * Create a new user
 * @param {Object} userData - New user data
 * @returns {Promise<Object>} Created user
 */
export const createUser = (userData) => apiRequest('/users', 'POST', userData);

/**
 * Update an existing user
 * @param {number} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = (id, userData) => apiRequest(`/users/${id}`, 'PUT', userData);

/**
 * Update current user profile
 * @param {Object} userData - Updated profile data
 * @returns {Promise<Object>} Updated profile
 */
export const updateProfile = (userData) => apiRequest('/users/me', 'PUT', userData);

/**
 * Delete a user
 * @param {number} id - User ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteUser = (id) => apiRequest(`/users/${id}`, 'DELETE');

/**
 * Get users by role
 * @param {string} role - Role (admin, user, etc.)
 * @returns {Promise<Array>} List of users with the specified role
 */
export const getUsersByRole = (role) => apiRequest(`/users/by-role/${role}`);