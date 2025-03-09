import React, { createContext, useReducer, useContext } from 'react';

// Definizione delle azioni
const ERROR_ACTIONS = {
  ADD_ERROR: 'ADD_ERROR',
  REMOVE_ERROR: 'REMOVE_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
};

// Stato iniziale
const initialState = {
  errors: [],
};

// Reducer per la gestione degli errori
const errorReducer = (state, action) => {
  switch (action.type) {
    case ERROR_ACTIONS.ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, { id: Date.now(), ...action.payload }],
      };
    case ERROR_ACTIONS.REMOVE_ERROR:
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };
    case ERROR_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
      };
    default:
      return state;
  }
};

// Creazione del contesto
export const ErrorContext = createContext();

// Provider del contesto
export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Aggiunge un errore
  const addError = (error) => {
    const errorMessage = error.message || 'Si è verificato un errore';
    
    // Determina la severità in base allo status code, se disponibile
    let severity = 'error';
    if (error.status) {
      if (error.status >= 400 && error.status < 500) {
        severity = 'warning'; // Client errors
      } else if (error.status >= 500) {
        severity = 'error'; // Server errors
      }
    }
    
    dispatch({
      type: ERROR_ACTIONS.ADD_ERROR,
      payload: {
        message: errorMessage,
        severity,
        details: error.details || null,
        timestamp: new Date(),
      },
    });
    
    // Ritorna l'errore per consentire la gestione a cascata
    return error;
  };

  // Rimuove un errore specificato dall'ID
  const removeError = (errorId) => {
    dispatch({
      type: ERROR_ACTIONS.REMOVE_ERROR,
      payload: errorId,
    });
  };

  // Pulisce tutti gli errori
  const clearErrors = () => {
    dispatch({
      type: ERROR_ACTIONS.CLEAR_ERRORS,
    });
  };

  // Helper per gestire errori delle API
  const handleApiError = (error, customMessage = null) => {
    console.error('API Error:', error);
    
    // Crea un oggetto errore strutturato
    const errorObj = {
      message: customMessage || error.message || 'Errore durante la comunicazione con il server',
      status: error.status || null,
      details: error.stack || null,
    };
    
    return addError(errorObj);
  };

  return (
    <ErrorContext.Provider
      value={{
        errors: state.errors,
        addError,
        removeError,
        clearErrors,
        handleApiError,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

// Hook personalizzato per utilizzare il contesto degli errori
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError deve essere utilizzato all\'interno di un ErrorProvider');
  }
  return context;
};