import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper } from '@mui/material';
import SiteList from '../Site/SiteList';

const SiteManagement = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{t('federations.management')}</Typography>
      
      <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
        <SiteList />
      </Paper>
    </Box>
  );
};

export default SiteManagement;