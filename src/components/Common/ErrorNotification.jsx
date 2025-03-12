import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Snackbar, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useError } from '../../context/ErrorContext';

/**
 * Component that displays error notifications
 * Notifications appear as Snackbars at the bottom of the screen
 */
const ErrorNotification = () => {
  const { t } = useTranslation();
  const { errors, removeError } = useError();

  // Maximum 3 errors shown simultaneously to avoid filling the screen
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
      
      {/* If there are more than 3 errors, show the total number in the first one */}
      {errors.length > 3 && (
        <Snackbar
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ position: 'relative', transform: 'none', width: '100%', maxWidth: 'lg', mx: 'auto' }}
        >
          <Alert severity="info">
            {t('errors.moreErrorsNotDisplayed', { count: errors.length - 3 })}
          </Alert>
        </Snackbar>
      )}
    </Stack>
  );
};

export default ErrorNotification;