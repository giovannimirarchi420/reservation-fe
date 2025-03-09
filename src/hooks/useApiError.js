import { useCallback } from 'react';
import { useError } from '../context/ErrorContext';

/**
 * Hook personalizzato per gestire gli errori delle API nei componenti React
 * Fornisce funzioni di utilità per una gestione semplificata degli errori
 */
const useApiError = () => {
  const { addError, handleApiError } = useError();

  /**
   * Funzione per eseguire un'operazione API con gestione degli errori integrata
   * @param {Function} apiCall - La funzione API da eseguire
   * @param {Object} options - Opzioni di configurazione
   * @returns {Promise} Risultato dell'operazione API o undefined in caso di errore
   */
  const withErrorHandling = useCallback(
    async (apiCall, options = {}) => {
      const {
        errorMessage = 'Si è verificato un errore durante l\'operazione',
        showError = true,
        rethrowError = false,
      } = options;

      try {
        return await apiCall();
      } catch (error) {
        console.error('API Error:', error);
        
        if (showError) {
          // Personalizza il messaggio di errore se necessario
          const customizedError = new Error(
            error.message || errorMessage
          );
          customizedError.status = error.status;
          customizedError.details = error.details;
          
          handleApiError(customizedError);
        }
        
        if (rethrowError) {
          throw error;
        }
        
        return undefined;
      }
    },
    [handleApiError]
  );

  /**
   * Funzione per notificare un errore specifico di un form
   * @param {String} message - Messaggio di errore
   * @param {String} field - Campo del form a cui si riferisce l'errore
   */
  const notifyFormError = useCallback(
    (message, field = null) => {
      const errorObj = {
        message,
        severity: 'warning',
        field,
      };
      addError(errorObj);
    },
    [addError]
  );

  return {
    withErrorHandling,
    notifyFormError,
    handleApiError,
  };
};

export default useApiError;