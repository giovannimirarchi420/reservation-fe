/**
 * Hook per la gestione delle notifiche
 */
import { useState, useEffect, useCallback, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification deve essere usato all\'interno di un NotificationProvider');
  }

  return context;
};

// Per l'implementazione interna del provider
export const useNotificationState = () => {
  // Simula un sistema di notifiche
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      message: 'Benvenuto nel sistema di prenotazione risorse!',
      read: false,
      createdAt: new Date()
    },
    {
      id: 2,
      type: 'warning',
      message: 'La risorsa "Switch P4 Alpha" entrerà in manutenzione il 10/03/2025',
      read: false,
      createdAt: new Date(Date.now() - 3600000) // 1 ora fa
    }
  ]);

  // Aggiunge una nuova notifica
  const addNotification = useCallback((message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      read: false,
      createdAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  // Marca una notifica come letta
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Marca tutte le notifiche come lette
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Rimuove una notifica
  const removeNotification = useCallback((id) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  // Recupera le notifiche non lette
  const unreadNotifications = notifications.filter(n => !n.read);

  // Funzione per simulare una notifica in tempo reale
  useEffect(() => {
    // Simula una notifica dopo 60 secondi (solo per scopi dimostrativi)
    const timer = setTimeout(() => {
      addNotification('Nuova prenotazione creata da Luigi Bianchi', 'success');
    }, 60000);

    return () => clearTimeout(timer);
  }, [addNotification]);

  return {
    notifications,
    unreadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
};
