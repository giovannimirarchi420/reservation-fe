/**
 * Core API service for making HTTP requests to the backend
 */
import * as authService from './authService';

// Base URL for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Generic function for making API requests
 * @param {string} endpoint - API endpoint (without the /api prefix)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} data - Data to send (for POST/PUT/PATCH)
 * @param {Object} options - Additional options for the fetch request
 * @returns {Promise<any>} - API response
 */
export const apiRequest = async (endpoint, method = 'GET', data = null, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authentication token if user is logged in
    if (authService.isAuthenticated()) {
      // Update token if necessary
      await authService.updateToken(); // Update if expires within 30 seconds
      headers['Authorization'] = authService.getAuthHeader();
    }

    // Options for fetch request
    const fetchOptions = {
      method,
      headers,
      ...options,
    };

    // Add body for non-GET methods
    if (data && method !== 'GET') {
      fetchOptions.body = JSON.stringify(data);
    }

    // Execute request
    const response = await fetch(url, fetchOptions);

    // Handle HTTP errors
    if (!response.ok) {
      // If token has expired (401), try to refresh and retry the request
      if (response.status === 401) {
        try {
          const refreshed = await authService.updateToken();
          if (refreshed) {
            // Retry request with new token
            return apiRequest(endpoint, method, data, options);
          }
        } catch (refreshError) {
          console.error('Error refreshing token', refreshError);
          authService.logout(); // Logout if refresh fails
          throw new Error('Session expired, please log in again');
        }
      }

      let errorData;
      try {
        // Try to read response body as JSON
        errorData = await response.json();
      } catch (e) {
        // If not JSON, use an object with response text
        errorData = { message: await response.text() };
      }

      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error(`Error in API request to ${endpoint}:`, error);
    throw error;
  }
};

export default apiRequest;