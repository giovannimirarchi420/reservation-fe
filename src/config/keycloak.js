import Keycloak from 'keycloak-js';

// Fallback configuration to prevent errors if window.ENV isn't defined yet
const getConfig = () => {

  // Default values (used during development)
  const defaults = {
    KEYCLOAK_URL: process.env.REACT_APP_KEYCLOAK_URL,
    KEYCLOAK_REALM: process.env.REACT_APP_KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID: process.env.REACT_APP_KEYCLOAK_CLIENT_ID
  };
  
  // Use window.ENV if available, otherwise use defaults
  if (window.ENV) {
    return {
      url: window.ENV.KEYCLOAK_URL || defaults.KEYCLOAK_URL,
      realm: window.ENV.KEYCLOAK_REALM || defaults.KEYCLOAK_REALM,
      clientId: window.ENV.KEYCLOAK_CLIENT_ID || defaults.KEYCLOAK_CLIENT_ID
    };
  }
  
  console.warn('Environment configuration not found, using defaults');
  return {
    url: defaults.KEYCLOAK_URL,
    realm: defaults.KEYCLOAK_REALM,
    clientId: defaults.KEYCLOAK_CLIENT_ID
  };
};

// Create Keycloak instance
const keycloak = new Keycloak(getConfig());

export default keycloak;