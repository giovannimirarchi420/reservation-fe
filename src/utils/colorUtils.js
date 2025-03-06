/**
 * Utility per la gestione dei colori
 */

// Mappa di colori per tipi di risorse
const resourceTypeColors = {
  1: '#1976d2', // Server - Blu
  2: '#4caf50', // GPU - Verde
  3: '#ff9800'  // Switch P4 - Arancione
};

// Colore di fallback
const defaultColor = '#9c27b0'; // Viola

/**
 * Ottiene il colore associato a un tipo di risorsa
 * @param {number} typeId - ID del tipo di risorsa
 * @returns {string} Codice colore esadecimale
 */
export const getResourceTypeColor = (typeId) => {
  return resourceTypeColors[typeId] || defaultColor;
};

/**
 * Genera un colore casuale
 * @returns {string} Codice colore esadecimale
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Determina se un colore di sfondo richiede testo chiaro o scuro
 * @param {string} backgroundColor - Colore di sfondo in formato esadecimale
 * @returns {string} 'white' per testo chiaro, 'black' per testo scuro
 */
export const getContrastTextColor = (backgroundColor) => {
  // Rimuovi il carattere # se presente
  const hex = backgroundColor.replace('#', '');
  
  // Converti hex in RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calcola la luminosità percepita (formula approssimata)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Restituisci 'white' se il colore di sfondo è scuro, altrimenti 'black'
  return brightness > 128 ? 'black' : 'white';
};

/**
 * Determina se una risorsa è disponibile in base allo stato
 * @param {string} status - Stato della risorsa
 * @returns {string} Colore che rappresenta lo stato
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return '#4caf50'; // Verde
    case 'maintenance':
      return '#ff9800'; // Arancione
    case 'unavailable':
      return '#f44336'; // Rosso
    default:
      return '#9e9e9e'; // Grigio
  }
};
