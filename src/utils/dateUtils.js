/**
 * Utility for date management
 */
import moment from 'moment';
import 'moment/locale/it';
import 'moment/locale/en-gb';
import i18next from 'i18next';

// Set the moment locale based on the current language
const updateMomentLocale = () => {
  const language = i18next.language || 'it';
  if (language.startsWith('en')) {
    moment.locale('en-gb');
  } else {
    moment.locale('it');
  }
};

// Listen for language changes
i18next.on('languageChanged', () => {
  updateMomentLocale();
});

// Initialize moment locale
updateMomentLocale();

/**
 * Format a date for datetime-local inputs
 * @param {Date} date - Date to format
 * @returns {string} Date formatted in YYYY-MM-DDTHH:mm format
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DDTHH:mm');
};

/**
 * Format a date in readable format
 * @param {Date} date - Date to format
 * @param {string} format - Date format (optional)
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Get the hour difference between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Hour difference
 */
export const getHoursDifference = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  return moment(endDate).diff(moment(startDate), 'hours', true);
};

/**
 * Check if two time periods overlap
 * @param {Date} start1 - First interval start
 * @param {Date} end1 - First interval end
 * @param {Date} start2 - Second interval start
 * @param {Date} end2 - Second interval end
 * @returns {boolean} true if they overlap, false otherwise
 */
export const timePeriodsOverlap = (start1, end1, start2, end2) => {
  const s1 = moment(start1).valueOf();
  const e1 = moment(end1).valueOf();
  const s2 = moment(start2).valueOf();
  const e2 = moment(end2).valueOf();
  
  return (s1 < e2 && e1 > s2);
};

/**
 * Get the start of the week from the specified date
 * @param {Date} date - Reference date
 * @returns {Date} Start of the week (Monday)
 */
export const getWeekStart = (date) => moment(date).startOf('isoWeek').toDate();

/**
 * Get the end of the week from the specified date
 * @param {Date} date - Reference date
 * @returns {Date} End of the week (Sunday)
 */
export const getWeekEnd = (date) => moment(date).endOf('isoWeek').toDate();

/**
 * Get the start of the month from the specified date
 * @param {Date} date - Reference date
 * @returns {Date} Start of the month
 */
export const getMonthStart = (date) => moment(date).startOf('month').toDate();

/**
 * Get the end of the month from the specified date
 * @param {Date} date - Reference date
 * @returns {Date} End of the month
 */
export const getMonthEnd = (date) => moment(date).endOf('month').toDate();