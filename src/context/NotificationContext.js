import React, {createContext, useEffect, useState, useCallback, useContext, useRef} from 'react';
import * as notificationService from '../services/notificationService';
import useApiError from '../hooks/useApiError';
import { AuthContext } from './AuthContext';

// Creazione del contesto
export const NotificationContext = createContext();

// Provider del contesto
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { withErrorHandling } = useApiError();
  const { updateToken, isAuthorized } = useContext(AuthContext);
  
  // Usa useRef per memorizzare lo stato dell'intervallo
  const intervalRef = useRef(null);
  // Usa useRef per memorizzare un riferimento stabile a withErrorHandling e updateToken
  const apiHandlersRef = useRef({ withErrorHandling, updateToken });
  
  // Aggiorna il riferimento quando le funzioni cambiano
  useEffect(() => {
    apiHandlersRef.current = { withErrorHandling, updateToken };
  }, [withErrorHandling, updateToken]);

  // Recupera le notifiche dal server
  const fetchNotifications = useCallback(async () => {
    // Usa le funzioni dal ref per evitare dipendenze che causano re-render
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    // Se l'utente non è autenticato, non effettuare la chiamata
    if (!isAuthorized()) return;
    
    setLoading(true);
    try {
      // Tenta di aggiornare il token prima della chiamata API
      await updateToken();
      
      await withErrorHandling(async () => {
        const fetchedNotifications = await notificationService.fetchNotifications();
        setNotifications(fetchedNotifications);
      }, {
        errorMessage: 'Impossibile caricare le notifiche',
        showError: false,
        rethrowError: false
      });
    } catch (err) {
      console.error('Errore durante il recupero delle notifiche:', err);
      setError(err.message || 'Errore durante il recupero delle notifiche');
    } finally {
      setLoading(false);
    }
  }, [isAuthorized]); // Dipende solo da isAuthorized

  // Imposta il polling solo quando l'autorizzazione cambia
  useEffect(() => {
    const setupPolling = () => {
      // Pulisci qualsiasi intervallo esistente
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Se l'utente è autenticato, configura il polling
      if (isAuthorized()) {
        // Carica le notifiche iniziali
        fetchNotifications();
        
        // Imposta l'intervallo di polling
        intervalRef.current = setInterval(() => {
          fetchNotifications();
        }, 30000);
      }
    };
    
    // Avvia il polling
    setupPolling();
    
    // Pulisci l'intervallo quando il componente viene smontato
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthorized, fetchNotifications]);

  // Recupera le notifiche non lette
  const unreadNotifications = notifications.filter(n => !n.read);

  // Aggiunge una nuova notifica
  const addNotification = useCallback(async (message, type = 'INFO', userId) => {
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    if (!isAuthorized()) return null;
    
    try {
      // Aggiorna il token prima della chiamata API
      await updateToken();
      
      await withErrorHandling(async () => {
        const newNotification = await notificationService.sendNotification(
          userId, 
          message, 
          type.toUpperCase()
        );
        // Aggiorna la lista delle notifiche dopo l'aggiunta
        fetchNotifications();
        return newNotification.id;
      }, {
        errorMessage: 'Impossibile inviare la notifica',
        showError: true
      });
    } catch (error) {
      console.error('Errore nell\'invio della notifica:', error);
      return null;
    }
  }, [isAuthorized, fetchNotifications]);

  // Marca una notifica come letta
  const markAsRead = useCallback(async (id) => {
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    if (!isAuthorized()) return;
    
    try {
      // Aggiorna il token prima della chiamata API
      await updateToken();
      
      // Prima aggiorna lo stato locale per una UX più reattiva
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Poi effettua la chiamata API
      await withErrorHandling(async () => {
        await notificationService.markAsRead(id);
      }, {
        errorMessage: 'Impossibile segnare la notifica come letta',
        showError: false
      });
    } catch (error) {
      console.error('Errore nel marcare la notifica come letta:', error);
      // In caso di errore, ripristina lo stato locale
      fetchNotifications();
    }
  }, [isAuthorized, fetchNotifications]);

  // Marca tutte le notifiche come lette
  const markAllAsRead = useCallback(async () => {
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    if (!isAuthorized()) return;
    
    try {
      // Aggiorna il token prima della chiamata API
      await updateToken();
      
      // Prima aggiorna lo stato locale per una UX più reattiva
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Poi effettua la chiamata API
      await withErrorHandling(async () => {
        await notificationService.markAllAsRead();
      }, {
        errorMessage: 'Impossibile segnare tutte le notifiche come lette',
        showError: false
      });
    } catch (error) {
      console.error('Errore nel marcare tutte le notifiche come lette:', error);
      // In caso di errore, ripristina lo stato locale
      fetchNotifications();
    }
  }, [isAuthorized, fetchNotifications]);

  // Rimuove una notifica
  const removeNotification = useCallback(async (id) => {
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    if (!isAuthorized()) return;
    
    try {
      // Aggiorna il token prima della chiamata API
      await updateToken();
      
      // Prima aggiorna lo stato locale per una UX più reattiva
      setNotifications(prev =>
        prev.filter(notification => notification.id !== id)
      );
      
      // Poi effettua la chiamata API
      await withErrorHandling(async () => {
        await notificationService.deleteNotification(id);
      }, {
        errorMessage: 'Impossibile eliminare la notifica',
        showError: false
      });
    } catch (error) {
      console.error('Errore nella rimozione della notifica:', error);
      // In caso di errore, ripristina lo stato locale
      fetchNotifications();
    }
  }, [isAuthorized, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadNotifications,
      loading,
      error,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      refresh: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};