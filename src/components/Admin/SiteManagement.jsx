import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Alert } from '@mui/material';
import SiteList from '../Site/SiteList';
import { AuthContext } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

const SiteManagement = () => {
  const { t } = useTranslation();
  const { isGlobalAdmin } = useContext(AuthContext);
  const { canManageSites } = useSite();

  // Display informative notice to site admins about limited capabilities
  const renderInfoAlert = () => {
    if (isGlobalAdmin()) return null;
    
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        {t('sites.siteAdminLimitedPermissions')}
      </Alert>
    );
  };

  if (!canManageSites()) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>{t('sites.management')}</Typography>
        <Alert severity="error">
          {t('sites.noManagementPermissions')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{t('sites.management')}</Typography>
      
      {renderInfoAlert()}
      
      <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
        <SiteList />
      </Paper>
    </Box>
  );
};

export default SiteManagement;