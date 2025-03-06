import React, { createContext } from 'react';
import { createNotificationState } from '../hooks/useNotification';

// Creazione del contesto
export const NotificationContext = createContext();

// Provider del contesto
export const NotificationProvider = ({ children }) => {
  const notificationState = createNotificationState();

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
};
