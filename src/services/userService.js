/**
 * Service for user-related API operations
 */
import apiRequest from './apiCore';

/**
 * Get all users
 * @returns {Promise<Array>} List of users
 */
export const fetchUsers = (filters = {}) => {
    const queryParams = [];
  
    if (filters.federationId) {
      queryParams.push(`federationId=${filters.federationId}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return apiRequest(`/users${queryString}`);
};

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
 * Get the current user's SSH public key
 * @returns {Promise<Object>} SSH key data
 */
export const getUserSshKey = () => apiRequest('/users/me/ssh-key');

/**
 * Update the current user's SSH public key
 * @param {string} sshPublicKey - SSH public key string
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserSshKey = (sshPublicKey) => 
  apiRequest('/users/me/ssh-key', 'PUT', { sshPublicKey });

/**
 * Delete the current user's SSH public key
 * @returns {Promise<Object>} Deletion response
 */
export const deleteUserSshKey = () => apiRequest('/users/me/ssh-key', 'DELETE');

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
        avatar: userData.avatar || '',
        federationId: userData.federationId || '',
        sshPublicKey: userData.sshPublicKey || ''
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
    if (userData.sshPublicKey !== undefined) preparedData.sshPublicKey = userData.sshPublicKey;

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
    if (userData.sshPublicKey !== undefined) preparedData.sshPublicKey = userData.sshPublicKey;

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