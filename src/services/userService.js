/**
 * Servizio per la gestione degli utenti
 */
import { apiRequest } from './api';

/**
 * Recupera tutti gli utenti
 * @returns {Promise<Array>} Lista di utenti
 */
export const fetchUsers = async () => {
  try {
    return await apiRequest('/api/users');
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Recupera un utente specifico
 * @param {number} id - ID dell'utente
 * @returns {Promise<Object>} Utente
 */
export const fetchUser = async (id) => {
  try {
    return await apiRequest(`/api/users/${id}`);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuovo utente
 * @param {Object} userData - Dati dell'utente
 * @returns {Promise<Object>} Utente creato
 */
export const createUser = async (userData) => {
  try {
    return await apiRequest('/api/users', 'POST', userData);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Aggiorna un utente esistente
 * @param {number} id - ID dell'utente
 * @param {Object} userData - Dati aggiornati dell'utente
 * @returns {Promise<Object>} Utente aggiornato
 */
export const updateUser = async (id, userData) => {
  try {
    return await apiRequest(`/api/users/${id}`, 'PUT', userData);
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un utente
 * @param {number} id - ID dell'utente
 * @returns {Promise<Object>} Utente eliminato
 */
export const deleteUser = async (id) => {
  try {
    return await apiRequest(`/api/users/${id}`, 'DELETE');
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

/**
 * Ottiene gli utenti per ruolo
 * @param {string} role - Ruolo degli utenti da recuperare
 * @returns {Promise<Array>} Utenti con il ruolo specificato
 */
export const getUsersByRole = async (role) => {
  try {
    const users = await fetchUsers();
    return users.filter(user => user.role === role);
  } catch (error) {
    console.error(`Error fetching users by role ${role}:`, error);
    throw error;
  }
};
