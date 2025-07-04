import React, {createContext, useEffect, useState, useCallback, useContext, useRef} from 'react';
import * as notificationService from '../services/notificationService';
import useApiError from '../hooks/useApiError';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { withErrorHandling } = useApiError();
  const { updateToken, isAuthorized } = useContext(AuthContext);
  
  const intervalRef = useRef(null);
  const apiHandlersRef = useRef({ withErrorHandling, updateToken });
  
  useEffect(() => {
    apiHandlersRef.current = { withErrorHandling, updateToken };
  }, [withErrorHandling, updateToken]);

  // Fetch notifications from server
  const fetchNotifications = useCallback(async () => {
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    if (!isAuthorized()) return;
    
    setLoading(true);
    
    try {
      await updateToken();
      
      const result = await withErrorHandling(async () => {
        const fetchedNotifications = await notificationService.fetchNotifications();
        return fetchedNotifications;
      }, {
        errorMessage: 'Impossibile caricare le notifiche',
        showError: false,
        rethrowError: false
      });
      
      if (result !== undefined && Array.isArray(result)) {
        setNotifications(result);
        setError(null);
      } else {
        console.warn('Notification API call failed, maintaining previous state');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthorized]);

  // Setup polling when authorization changes
  useEffect(() => {
    const setupPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (isAuthorized()) {
        fetchNotifications();
        
        intervalRef.current = setInterval(() => {
          fetchNotifications();
        }, 30000);
      }
    };
    
    setupPolling();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthorized, fetchNotifications]);

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter(n => !n.read) : [];

  const addNotification = useCallback(async (message, type = 'INFO', userId) => {
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    if (!isAuthorized()) return null;
    
    try {
      await updateToken();
      
      await withErrorHandling(async () => {
        const newNotification = await notificationService.sendNotification(
          userId, 
          message, 
          type.toUpperCase()
        );
        fetchNotifications();
        return newNotification.id;
      }, {
        errorMessage: 'Impossibile inviare la notifica',
        showError: true
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }, [isAuthorized, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    if (!isAuthorized()) return;
    
    try {
      await updateToken();
      
      // Update local state for better UX
      setNotifications(prev => {
        if (!Array.isArray(prev)) return prev;
        return prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        );
      });
      
      await withErrorHandling(async () => {
        await notificationService.markAsRead(id);
      }, {
        errorMessage: 'Impossibile segnare la notifica come letta',
        showError: false
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      fetchNotifications();
    }
  }, [isAuthorized, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    if (!isAuthorized()) return;
    
    try {
      await updateToken();
      
      // Update local state for better UX
      setNotifications(prev => {
        if (!Array.isArray(prev)) return prev;
        return prev.map(notification => ({ ...notification, read: true }));
      });
      
      await withErrorHandling(async () => {
        await notificationService.markAllAsRead();
      }, {
        errorMessage: 'Impossibile segnare tutte le notifiche come lette',
        showError: false
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      fetchNotifications();
    }
  }, [isAuthorized, fetchNotifications]);

  const removeNotification = useCallback(async (id) => {
    const { withErrorHandling, updateToken } = apiHandlersRef.current;
    
    if (!isAuthorized()) return;
    
    try {
      await updateToken();
      
      // Update local state for better UX
      setNotifications(prev => {
        if (!Array.isArray(prev)) return prev;
        return prev.filter(notification => notification.id !== id);
      });
      
      await withErrorHandling(async () => {
        await notificationService.deleteNotification(id);
      }, {
        errorMessage: 'Impossibile eliminare la notifica',
        showError: false
      });
    } catch (error) {
      console.error('Error removing notification:', error);
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