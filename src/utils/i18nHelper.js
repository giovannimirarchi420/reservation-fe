/**
 * Helper functions for i18n
 */
import i18n from 'i18next';
import moment from 'moment';

/**
 * Changes application language
 * @param {string} lang - Language code (e.g., 'en', 'it')
 */
export const changeLanguage = (lang) => {
  // Change i18next language
  i18n.changeLanguage(lang);
  
  // Update moment locale
  if (lang.startsWith('en')) {
    moment.locale('en-gb');
  } else {
    moment.locale('it');
  }
  
  // Store in localStorage for persistence
  localStorage.setItem('i18nextLng', lang);
};

/**
 * Gets the current application language
 * @returns {string} Current language code
 */
export const getCurrentLanguage = () => {
  return i18n.language?.substring(0, 2) || 'it';
};

/**
 * Checks if the application is using English
 * @returns {boolean} True if English is the current language
 */
export const isEnglish = () => {
  const lang = getCurrentLanguage();
  return lang === 'en';
};

/**
 * Checks if the application is using Italian
 * @returns {boolean} True if Italian is the current language
 */
export const isItalian = () => {
  const lang = getCurrentLanguage();
  return lang === 'it';
};

/**
 * Formats a date based on the current language
 * @param {Date|string} date - Date to format
 * @param {string} format - Format pattern
 * @returns {string} Formatted date string
 */
export const formatLocalizedDate = (date, format) => {
  if (!date) return '';
  
  // Set moment locale to current language
  if (isEnglish()) {
    moment.locale('en-gb');
  } else {
    moment.locale('it');
  }
  
  return moment(date).format(format);
};