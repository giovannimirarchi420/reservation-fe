/**
 * Authentication service for Keycloak
 */
import keycloak from '../config/keycloak.js';

/**
 * Initiates the login process
 * @param {Object} options - Login options
 * @returns {Promise} Promise with the login outcome
 */
export const login = (options = {}) => {
    return new Promise((resolve, reject) => {
        try {
            keycloak.login(options)
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    console.error('Error during login:', error);
                    reject(new Error('Unable to complete login. Please check your credentials and try again.'));
                });
        } catch (error) {
            console.error('Critical error during login:', error);
            reject(new Error('An error occurred during access. Please try again.'));
        }
    });
};

/**
 * Performs logout
 * @param {Object} options - Logout options
 * @returns {Promise} Promise with the logout outcome
 */
export const logout = (options = {}) => {
    return new Promise((resolve, reject) => {
        try {
            // Remove saved tokens
            clearTokens();

            keycloak.logout(options)
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    console.error('Error during logout:', error);
                    reject(new Error('Unable to complete logout. Please try again later.'));
                });
        } catch (error) {
            console.error('Critical error during logout:', error);
            reject(new Error('An error occurred during disconnection. Please close the browser.'));
        }
    });
};

/**
 * Checks if the user is authenticated
 * @returns {boolean} true if the user is authenticated
 */
export const isAuthenticated = () => {
    return !!keycloak.token;
};

/**
 * Gets the current user's token
 * @returns {string} JWT Token
 */
export const getToken = () => {
    return keycloak.token;
};

/**
 * Gets user information from the token
 * @returns {Object} User information
 */
export const getUserInfo = () => {
    if (keycloak.tokenParsed) {
        return {
            id: keycloak.tokenParsed.sub,
            name: keycloak.tokenParsed.preferred_username,
            email: keycloak.tokenParsed.email,
            firstName: keycloak.tokenParsed.given_name,
            lastName: keycloak.tokenParsed.family_name,
            roles: keycloak.tokenParsed.realm_access.roles,
            sites: keycloak.tokenParsed.group,
            sshPublicKey: keycloak.tokenParsed.ssh_key,
            avatar: createAvatarFromName(keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username)
        };
    }
    return null;
};

/**
 * Checks if the user has a specific role
 * @param {string} role - Role to check
 * @returns {boolean} true if the user has the specified role
 */
export const hasRole = (role) => {
    if (!keycloak.tokenParsed || !keycloak.tokenParsed.realm_access) {
        return false;
    }

    return keycloak.tokenParsed.realm_access.roles.includes(role);
};

/**
 * Gets the token for API requests
 * @returns {string} Token for the Authorization header
 */
export const getAuthHeader = () => {
    return `Bearer ${keycloak.token}`;
};

/**
 * Forces token refresh
 * @returns {Promise} Promise with the refresh outcome
 */
export const updateToken = () => {
    return new Promise((resolve, reject) => {
        keycloak.updateToken(70)
            .then(refreshed => {
                if (refreshed) {
                    console.log('Token successfully updated');
                    // Save the new token
                    saveTokens(keycloak.token, keycloak.refreshToken);
                }
                resolve(keycloak.token);
            })
            .catch(error => {
                console.error('Error during token update', error);
                const authError = new Error('Session has expired. Please log in again.');
                authError.type = 'session_expired';
                reject(authError);
            });
    });
};

// Utility functions for token management

/**
 * Saves tokens in localStorage
 * @param {string} token - JWT Token
 * @param {string} refreshToken - Refresh token
 */
const saveTokens = (token, refreshToken) => {
    if (token) {
        try {
            localStorage.setItem('token', token);
        } catch (e) {
            console.error('Unable to save token in localStorage:', e);
        }
    }
    if (refreshToken) {
        try {
            localStorage.setItem('refreshToken', refreshToken);
        } catch (e) {
            console.error('Unable to save refresh token in localStorage:', e);
        }
    }
};

/**
 * Removes tokens from localStorage
 */
const clearTokens = () => {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    } catch (e) {
        console.error('Unable to remove tokens from localStorage:', e);
    }
};

/**
 * Creates an avatar from the name initials
 * @param {string} name - Full name
 * @returns {string} Name initials
 */
const createAvatarFromName = (name) => {
    if (!name) return '';

    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    } else if (nameParts.length === 1) {
        return `${nameParts[0][0]}`.toUpperCase();
    }

    return '';
};

/**
 * Checks the validity of the current token
 * @returns {boolean} true if the token is valid, false otherwise
 */
export const isTokenValid = () => {
    try {
        return keycloak.isTokenExpired() === false;
    } catch (error) {
        console.error('Error checking token validity:', error);
        return false;
    }
};

export default {
    login,
    logout,
    isAuthenticated,
    getToken,
    getUserInfo,
    hasRole,
    getAuthHeader,
    updateToken,
    isTokenValid
};