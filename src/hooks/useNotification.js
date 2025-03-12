/**
 * Hook per la gestione delle notifiche
 */
import {useContext} from 'react';
import {NotificationContext} from '../context/NotificationContext';

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification deve essere usato all\'interno di un NotificationProvider');
  }

  return context;
};