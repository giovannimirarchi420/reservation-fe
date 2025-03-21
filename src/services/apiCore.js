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



/**
 * Generic function for making API requests
 * @param {string} endpoint - API endpoint (without the /api prefix)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} data - Data to send (for POST/PUT/PATCH)
 * @param {Object} options - Additional options for the fetch request
 * @returns {Promise<any>} - API response
 */
export const apiRequest = async (endpoint, method = 'GET', data = null, options = {}) => {
  // La funzione per gestire gli errori verrà iniettata dall'esterno quando questo modulo verrà utilizzato
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
          
          // Crea un errore strutturato per la sessione scaduta
          const sessionError = new Error('Sessione scaduta, effettua nuovamente il login');
          sessionError.status = 401;
          sessionError.details = refreshError.message;
          return errorHandler(sessionError);
        }
      }

      // Clona la risposta per evitare "Body has already been consumed"
      const responseClone = response.clone();
      
      let errorData;
      try {
        // Try to read response body as JSON
        errorData = await response.json();
      } catch (e) {
        try {
          // Se non è un JSON, prova a leggere come testo dalla risposta clonata
          const textContent = await responseClone.text();
          errorData = { message: textContent || `Errore ${response.status}: ${response.statusText}` };
        } catch (textError) {
          // Se anche la lettura del testo fallisce, usa il messaggio di stato HTTP
          errorData = { message: `Errore ${response.status}: ${response.statusText}` };
        }
      }

      // Crea un errore strutturato con i dettagli della risposta HTTP
      const apiError = new Error(errorData.message || `Errore ${response.status}: ${response.statusText}`);
      apiError.status = response.status;
      apiError.statusText = response.statusText;
      apiError.details = errorData;
      apiError.endpoint = endpoint;
      
      // Gestisci l'errore attraverso il gestore centralizzato
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
    
    // Crea un errore strutturato per problemi di connessione
    const networkError = new Error(error.message || 'Errore di connessione al server');
    networkError.originalError = error;
    networkError.endpoint = endpoint;
    
    // Gestisci l'errore attraverso il gestore centralizzato
    return errorHandler(networkError);
  }
};

export default apiRequest;