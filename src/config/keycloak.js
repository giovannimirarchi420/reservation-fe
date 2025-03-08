import Keycloak from 'keycloak-js';

// Read environment variables from React process
const keycloakConfig = {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8180',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'resource-management',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'resource-management-app'
};

// Create and export a single Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;