/**
 * Core API service for making HTTP requests to the backend
 */
import * as authService from './authService';

// Base URL for API
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

if (window.ENV){
  //If window.ENV exists (e.g. running in k8s cluster, to get the value from the config map) 
   API_BASE_URL = window.ENV.API_URL
}

// Map of default error messages by status code
const defaultErrorMessages = {
  400: "Invalid request. Please check your input data.",
  401: "Session expired. Please login again.",
  403: "You don't have permission to perform this action.",
  404: "Resource not found.",
  405: "Method not allowed.",
  408: "Request timeout. Please try again later.",
  409: "Conflict with the current state of the resource.",
  429: "Too many requests. Please try again later.",
  500: "Internal server error. Please contact the administrator.",
  502: "Bad gateway. Please try again later.",
  503: "Service unavailable. Please try again later.",
  504: "Gateway timeout. Please try again later."
};

/**
 * Generic function for making API requests
 * @param {string} endpoint - API endpoint (without the /api prefix)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} data - Data to send (for POST/PUT/PATCH)
 * @param {Object} options - Additional options for the fetch request
 * @returns {Promise<any>} - API response
 */
export const apiRequest = async (endpoint, method = 'GET', data = null, options = {}) => {
  // The error handling function will be injected from outside when this module is used
  const errorHandler = window.__errorHandler || ((error) => { throw error; });
  
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
          
          // Create a structured error for the expired session
          const sessionError = new Error('Session expired, please login again');
          sessionError.status = 401;
          sessionError.details = refreshError.message;
          return errorHandler(sessionError);
        }
      }

      // Clone response to avoid "Body has already been consumed"
      const responseClone = response.clone();
      
      let errorData;
      try {
        // Try to read response body as JSON
        errorData = await response.json();
      } catch (e) {
        try {
          // If not JSON, try to read as text from the cloned response
          const textContent = await responseClone.text();
          
          // If there's text content, use it
          if (textContent && textContent.trim()) {
            errorData = { message: textContent };
          } else {
            // If no content or empty, use a default message based on status code
            const defaultMessage = defaultErrorMessages[response.status] || 
                                 `Error ${response.status}: Operation failed`;
            errorData = { message: defaultMessage };
          }
        } catch (textError) {
          // If even text reading fails, use the default message
          const defaultMessage = defaultErrorMessages[response.status] || 
                               `Error ${response.status}: ${response.statusText}`;
          errorData = { message: defaultMessage };
        }
      }

      // Create a structured error with HTTP response details
      const apiError = new Error(errorData.message || defaultErrorMessages[response.status] || 
                               `Error ${response.status}: ${response.statusText}`);
      apiError.status = response.status;
      apiError.statusText = response.statusText;
      apiError.details = errorData;
      apiError.endpoint = endpoint;
      
      // Handle the error through the centralized handler
      return errorHandler(apiError);
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
    
    // Create a structured error for connection problems
    const networkError = new Error(error.message || 'NetworkError when attempting to fetch resource');
    networkError.originalError = error;
    networkError.endpoint = endpoint;
    networkError.type = 'NetworkError';
    
    // Handle the error through the centralized handler
    return errorHandler(networkError);
  }
};

export default apiRequest;