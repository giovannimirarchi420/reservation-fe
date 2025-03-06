/**
 * Servizio per la gestione delle prenotazioni (eventi)
 */
import { apiRequest } from './api';

/**
 * Recupera tutte le prenotazioni
 * @returns {Promise<Array>} Lista di prenotazioni
 */
export const fetchEvents = async () => {
  try {
    return await apiRequest('/api/events');
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Recupera una prenotazione specifica
 * @param {number} id - ID della prenotazione
 * @returns {Promise<Object>} Prenotazione
 */
export const fetchEvent = async (id) => {
  try {
    return await apiRequest(`/api/events/${id}`);
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nuova prenotazione
 * @param {Object} eventData - Dati della prenotazione
 * @returns {Promise<Object>} Prenotazione creata
 */
export const createEvent = async (eventData) => {
  try {
    return await apiRequest('/api/events', 'POST', eventData);
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Aggiorna una prenotazione esistente
 * @param {number} id - ID della prenotazione
 * @param {Object} eventData - Dati aggiornati della prenotazione
 * @returns {Promise<Object>} Prenotazione aggiornata
 */
export const updateEvent = async (id, eventData) => {
  try {
    return await apiRequest(`/api/events/${id}`, 'PUT', eventData);
  } catch (error) {
    console.error(`Error updating event ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una prenotazione
 * @param {number} id - ID della prenotazione
 * @returns {Promise<Object>} Prenotazione eliminata
 */
export const deleteEvent = async (id) => {
  try {
    return await apiRequest(`/api/events/${id}`, 'DELETE');
  } catch (error) {
    console.error(`Error deleting event ${id}:`, error);
    throw error;
  }
};

/**
 * Controlla se una prenotazione è in conflitto con altre
 * @param {Object} eventData - Dati della prenotazione
 * @returns {Promise<boolean>} true se c'è conflitto, false altrimenti
 */
export const checkEventConflicts = async (eventData) => {
  try {
    const events = await fetchEvents();
    
    // Filtra gli eventi per la stessa risorsa, escludendo l'evento corrente se ha un ID
    const resourceEvents = events.filter(event => 
      event.resourceId === eventData.resourceId && 
      (!eventData.id || event.id !== eventData.id)
    );
    
    // Verifica sovrapposizioni
    const newStart = new Date(eventData.start).getTime();
    const newEnd = new Date(eventData.end).getTime();
    
    return resourceEvents.some(event => {
      const existingStart = new Date(event.start).getTime();
      const existingEnd = new Date(event.end).getTime();
      
      // Verifica se c'è sovrapposizione
      return (
        (newStart >= existingStart && newStart < existingEnd) || // Inizio nuovo durante esistente
        (newEnd > existingStart && newEnd <= existingEnd) || // Fine nuovo durante esistente
        (newStart <= existingStart && newEnd >= existingEnd) // Nuovo copre esistente
      );
    });
  } catch (error) {
    console.error('Error checking event conflicts:', error);
    throw error;
  }
};
