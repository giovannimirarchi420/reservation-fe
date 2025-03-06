/**
 * Utility per la gestione delle date
 */
import moment from 'moment';
import 'moment/locale/it';

// Imposta la località italiana per moment
moment.locale('it');

/**
 * Formatta una data per gli input datetime-local
 * @param {Date} date - Data da formattare
 * @returns {string} Data formattata nel formato YYYY-MM-DDTHH:mm
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DDTHH:mm');
};

/**
 * Formatta una data in formato leggibile
 * @param {Date} date - Data da formattare
 * @param {string} format - Formato della data (opzionale)
 * @returns {string} Data formattata
 */
export const formatDate = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Ottiene la differenza in ore tra due date
 * @param {Date} startDate - Data di inizio
 * @param {Date} endDate - Data di fine
 * @returns {number} Differenza in ore
 */
export const getHoursDifference = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = moment(startDate);
  const end = moment(endDate);
  return end.diff(start, 'hours', true);
};

/**
 * Verifica se due intervalli temporali si sovrappongono
 * @param {Date} start1 - Inizio primo intervallo
 * @param {Date} end1 - Fine primo intervallo
 * @param {Date} start2 - Inizio secondo intervallo
 * @param {Date} end2 - Fine secondo intervallo
 * @returns {boolean} true se si sovrappongono, false altrimenti
 */
export const timePeriodsOverlap = (start1, end1, start2, end2) => {
  const s1 = moment(start1).valueOf();
  const e1 = moment(end1).valueOf();
  const s2 = moment(start2).valueOf();
  const e2 = moment(end2).valueOf();
  
  return (s1 < e2 && e1 > s2);
};

/**
 * Ottiene l'inizio della settimana dalla data specificata
 * @param {Date} date - Data di riferimento
 * @returns {Date} Inizio della settimana (lunedì)
 */
export const getWeekStart = (date) => {
  return moment(date).startOf('isoWeek').toDate();
};

/**
 * Ottiene la fine della settimana dalla data specificata
 * @param {Date} date - Data di riferimento
 * @returns {Date} Fine della settimana (domenica)
 */
export const getWeekEnd = (date) => {
  return moment(date).endOf('isoWeek').toDate();
};

/**
 * Ottiene l'inizio del mese dalla data specificata
 * @param {Date} date - Data di riferimento
 * @returns {Date} Inizio del mese
 */
export const getMonthStart = (date) => {
  return moment(date).startOf('month').toDate();
};

/**
 * Ottiene la fine del mese dalla data specificata
 * @param {Date} date - Data di riferimento
 * @returns {Date} Fine del mese
 */
export const getMonthEnd = (date) => {
  return moment(date).endOf('month').toDate();
};
