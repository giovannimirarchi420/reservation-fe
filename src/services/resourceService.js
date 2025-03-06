/**
 * Servizio per la gestione delle risorse
 */
import { apiRequest } from './api';

/**
 * Recupera tutte le risorse
 * @returns {Promise<Array>} Lista di risorse
 */
export const fetchResources = async () => {
  try {
    return await apiRequest('/api/resources');
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

/**
 * Recupera tutti i tipi di risorse
 * @returns {Promise<Array>} Lista di tipi di risorse
 */
export const fetchResourceTypes = async () => {
  try {
    return await apiRequest('/api/resource-types');
  } catch (error) {
    console.error('Error fetching resource types:', error);
    throw error;
  }
};

/**
 * Recupera una risorsa specifica
 * @param {number} id - ID della risorsa
 * @returns {Promise<Object>} Risorsa
 */
export const fetchResource = async (id) => {
  try {
    return await apiRequest(`/api/resources/${id}`);
  } catch (error) {
    console.error(`Error fetching resource ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nuova risorsa
 * @param {Object} resourceData - Dati della risorsa
 * @returns {Promise<Object>} Risorsa creata
 */
export const createResource = async (resourceData) => {
  try {
    return await apiRequest('/api/resources', 'POST', resourceData);
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

/**
 * Aggiorna una risorsa esistente
 * @param {number} id - ID della risorsa
 * @param {Object} resourceData - Dati aggiornati della risorsa
 * @returns {Promise<Object>} Risorsa aggiornata
 */
export const updateResource = async (id, resourceData) => {
  try {
    return await apiRequest(`/api/resources/${id}`, 'PUT', resourceData);
  } catch (error) {
    console.error(`Error updating resource ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una risorsa
 * @param {number} id - ID della risorsa
 * @returns {Promise<Object>} Risorsa eliminata
 */
export const deleteResource = async (id) => {
  try {
    return await apiRequest(`/api/resources/${id}`, 'DELETE');
  } catch (error) {
    console.error(`Error deleting resource ${id}:`, error);
    throw error;
  }
};

/**
 * Ottiene le risorse per tipo
 * @param {number} typeId - ID del tipo di risorsa
 * @returns {Promise<Array>} Risorse del tipo specificato
 */
export const getResourcesByType = async (typeId) => {
  try {
    const resources = await fetchResources();
    return resources.filter(resource => resource.type === typeId);
  } catch (error) {
    console.error(`Error fetching resources by type ${typeId}:`, error);
    throw error;
  }
};
