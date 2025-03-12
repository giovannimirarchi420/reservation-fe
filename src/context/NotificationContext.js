import React, {createContext, useEffect, useState, useCallback, useContext} from 'react';
import * as notificationService from '../services/notificationService';
import useApiError from '../hooks/useApiError';
import { AuthContext } from './AuthContext'; // Importa il contesto di autenticazione

// Creazione del contesto
export const NotificationContext = createContext();

// Provider del contesto
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { withErrorHandling } = useApiError();
  const { updateToken, isAuthorized } = useContext(AuthContext); // Ottieni le funzioni di autenticazione

  // Recupera le notifiche dal server
  const fetchNotifications = useCallback(async () => {
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
        showError: false, // Nasconde l'errore all'utente per non disturbare l'esperienza
        rethrowError: false
      });
    } catch (err) {
      console.error('Errore durante il recupero delle notifiche:', err);
      setError(err.message || 'Errore durante il recupero delle notifiche');
    } finally {
      setLoading(false);
    }
  }, [withErrorHandling, updateToken, isAuthorized]);

  // Carica le notifiche all'avvio e imposta il polling
  useEffect(() => {
    // Assicurati che l'utente sia autenticato prima di iniziare il polling
    if (isAuthorized()) {
      fetchNotifications();

      // Imposta un polling per aggiornare le notifiche ogni 30 secondi
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [fetchNotifications, isAuthorized]);

  // Recupera le notifiche non lette
  const unreadNotifications = notifications.filter(n => !n.read);

  // Aggiunge una nuova notifica
  const addNotification = useCallback(async (message, type = 'INFO', userId) => {
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
  }, [withErrorHandling, fetchNotifications, updateToken, isAuthorized]);

  // Marca una notifica come letta
  const markAsRead = useCallback(async (id) => {
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
  }, [withErrorHandling, updateToken, fetchNotifications, isAuthorized]);

  // Marca tutte le notifiche come lette
  const markAllAsRead = useCallback(async () => {
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
  }, [withErrorHandling, updateToken, fetchNotifications, isAuthorized]);

  // Rimuove una notifica
  const removeNotification = useCallback(async (id) => {
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
  }, [withErrorHandling, updateToken, fetchNotifications, isAuthorized]);

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