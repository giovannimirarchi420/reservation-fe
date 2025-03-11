/**
 * Utility per la gestione dei colori
 */


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
  const hex = backgroundColor?.replace('#', '') || '';

  // Controllo di sicurezza
  if (hex.length !== 6) {
    return 'black';
  }

  // Converti hex in RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calcola la luminosità percepita (formula approssimata)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Restituisci 'white' se il colore di sfondo è scuro, altrimenti 'black'
  return brightness > 128 ? 'black' : 'white';
};

export const RESOURCE_COLORS = [
  '#8E24AA', // Purple
  '#1E88E5', // Blue
  '#43A047', // Green 
  '#E53935', // Red
  '#FB8C00', // Orange
  '#00ACC1', // Cyan
  '#3949AB', // Indigo
  '#7CB342', // Light Green
  '#C0CA33', // Lime
  '#FDD835', // Yellow
  '#6D4C41', // Brown
  '#546E7A', // Blue Grey
  '#D81B60', // Pink
  '#5E35B1', // Deep Purple
  '#039BE5', // Light Blue
  '#00897B', // Teal
  '#F4511E', // Deep Orange
];