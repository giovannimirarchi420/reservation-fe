import React, { createContext } from 'react';
import { useNotificationState } from '../hooks/useNotification';

// Creazione del contesto
export const NotificationContext = createContext();

// Provider del contesto
export const NotificationProvider = ({ children }) => {
  const notificationState = useNotificationState();

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
};
