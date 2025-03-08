/**
 * Servizio per l'autenticazione tramite Keycloak
 */
import keycloak from '../config/keycloak.js';

/**
 * Avvia il processo di login
 * @param {Object} options - Opzioni di login
 * @returns {Promise} Promessa con l'esito del login
 */
export const login = (options = {}) => {
    return keycloak.login(options);
};

/**
 * Effettua il logout
 * @param {Object} options - Opzioni di logout
 * @returns {Promise} Promessa con l'esito del logout
 */
export const logout = (options = {}) => {
    // Rimuovi i token salvati
    clearTokens();
    return keycloak.logout(options);
};

/**
 * Controlla se l'utente è autenticato
 * @returns {boolean} true se l'utente è autenticato
 */
export const isAuthenticated = () => {
    return !!keycloak.token;
};

/**
 * Ottiene il token dell'utente corrente
 * @returns {string} Token JWT
 */
export const getToken = () => {
    return keycloak.token;
};

/**
 * Ottiene le informazioni dell'utente dal token
 * @returns {Object} Informazioni dell'utente
 */
export const getUserInfo = () => {
    if (keycloak.tokenParsed) {
        return {
            id: keycloak.tokenParsed.sub,
            name: keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username,
            email: keycloak.tokenParsed.email,
            // Alcune implementazioni Keycloak potrebbero avere il ruolo in formati diversi
            role: keycloak.tokenParsed.realm_access?.roles?.includes('admin') ? 'admin' : 'user',
            // Crea un avatar dalle iniziali del nome
            avatar: createAvatarFromName(keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username)
        };
    }
    return null;
};

/**
 * Verifica se l'utente ha un determinato ruolo
 * @param {string} role - Ruolo da verificare
 * @returns {boolean} true se l'utente ha il ruolo specificato
 */
export const hasRole = (role) => {
    if (!keycloak.tokenParsed || !keycloak.tokenParsed.realm_access) {
        return false;
    }

    return keycloak.tokenParsed.realm_access.roles.includes(role);
};

/**
 * Ottiene il token per le richieste API
 * @returns {string} Token per l'header Authorization
 */
export const getAuthHeader = () => {
    return `Bearer ${keycloak.token}`;
};

/**
 * Forza l'aggiornamento del token
 * @returns {Promise} Promessa con l'esito dell'aggiornamento
 */
export const updateToken = () => {
    return new Promise((resolve, reject) => {
        keycloak.updateToken(70)
            .then(refreshed => {
                if (refreshed) {
                    console.log('Token aggiornato con successo');
                    // Salva il nuovo token
                    saveTokens(keycloak.token, keycloak.refreshToken);
                }
                resolve(keycloak.token);
            })
            .catch(error => {
                console.error('Errore durante l\'aggiornamento del token', error);
                reject(error);
            });
    });
};

// Funzioni di utilità per la gestione dei token

/**
 * Salva i token nel localStorage
 * @param {string} token - Token JWT
 * @param {string} refreshToken - Token di refresh
 */
const saveTokens = (token, refreshToken) => {
    if (token) {
        localStorage.setItem('token', token);
    }
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    }
};

/**
 * Rimuove i token dal localStorage
 */
const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};

/**
 * Crea un avatar dalle iniziali del nome
 * @param {string} name - Nome completo
 * @returns {string} Iniziali del nome
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

export default {
    login,
    logout,
    isAuthenticated,
    getToken,
    getUserInfo,
    hasRole,
    getAuthHeader,
    updateToken
};