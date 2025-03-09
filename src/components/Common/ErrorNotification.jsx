import React from 'react';
import { Alert, Snackbar, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useError } from '../../context/ErrorContext';

/**
 * Componente che visualizza le notifiche di errore
 * Le notifiche vengono mostrate come Snackbar che appaiono nella parte inferiore dello schermo
 */
const ErrorNotification = () => {
  const { errors, removeError } = useError();

  // Massimo 3 errori mostrati contemporaneamente per non riempire lo schermo
  const visibleErrors = errors.slice(0, 3);

  const handleClose = (errorId) => {
    removeError(errorId);
  };

  return (
    <Stack spacing={2} sx={{ width: '100%', position: 'fixed', bottom: 24, left: 0, zIndex: 2000 }}>
      {visibleErrors.map((error) => (
        <Snackbar
          key={error.id}
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ position: 'relative', transform: 'none', width: '100%', maxWidth: 'lg', mx: 'auto', mb: 1 }}
        >
          <Alert
            severity={error.severity || 'error'}
            sx={{ width: '100%' }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => handleClose(error.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {error.message}
          </Alert>
        </Snackbar>
      ))}
      
      {/* Se ci sono più di 3 errori, mostra il numero totale nel primo */}
      {errors.length > 3 && (
        <Snackbar
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ position: 'relative', transform: 'none', width: '100%', maxWidth: 'lg', mx: 'auto' }}
        >
          <Alert severity="info">
            Ci sono altri {errors.length - 3} errori non visualizzati
          </Alert>
        </Snackbar>
      )}
    </Stack>
  );
};

export default ErrorNotification;