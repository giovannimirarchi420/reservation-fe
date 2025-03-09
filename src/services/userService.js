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
 * @param {Object} userData - New user data (username, email, firstName, lastName, password, roles, avatar)
 * @returns {Promise<Object>} Created user
 */
export const createUser = (userData) => {
    // Prepare data for backend
    const preparedData = {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        roles: userData.roles || ['USER'],
        avatar: userData.avatar || ''
    };

    return apiRequest('/users', 'POST', preparedData);
};

/**
 * Update an existing user
 * @param {number} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = (id, userData) => {
    // Prepare data for backend, exclude empty properties
    const preparedData = {};

    if (userData.username) preparedData.username = userData.username;
    if (userData.email) preparedData.email = userData.email;
    if (userData.firstName) preparedData.firstName = userData.firstName;
    if (userData.lastName) preparedData.lastName = userData.lastName;
    if (userData.password) preparedData.password = userData.password;
    if (userData.roles) preparedData.roles = userData.roles;
    if (userData.avatar) preparedData.avatar = userData.avatar;

    return apiRequest(`/users/${id}`, 'PUT', preparedData);
};

/**
 * Update current user profile
 * @param {Object} userData - Updated profile data
 * @returns {Promise<Object>} Updated profile
 */
export const updateProfile = (userData) => {
    // Prepare data for backend
    const preparedData = {};

    if (userData.username) preparedData.username = userData.username;
    if (userData.email) preparedData.email = userData.email;
    if (userData.firstName) preparedData.firstName = userData.firstName;
    if (userData.lastName) preparedData.lastName = userData.lastName;
    if (userData.password) preparedData.password = userData.password;
    if (userData.avatar) preparedData.avatar = userData.avatar;

    return apiRequest('/users/me', 'PUT', preparedData);
};

/**
 * Delete a user
 * @param {number} id - User ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteUser = (id) => apiRequest(`/users/${id}`, 'DELETE');

/**
 * Get users by role
 * @param {string} role - Role (ADMIN, USER, etc.)
 * @returns {Promise<Array>} List of users with the specified role
 */
export const getUsersByRole = (role) => apiRequest(`/users/by-role/${role}`);