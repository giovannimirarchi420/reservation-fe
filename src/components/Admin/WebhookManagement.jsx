import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFederation } from '../../context/FederationContext';
import { fetchWebhooks } from '../../services/webhookService';
import useApiError from '../../hooks/useApiError';
import WebhookList from './Webhooks/WebhookList';
import WebhookForm from './Webhooks/WebhookForm';
import WebhookLogs from './Webhooks/WebhookLogs';

const WebhookManagement = () => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const { currentFederation } = useFederation();
  const [webhooks, setWebhooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [notification, setNotification] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Load webhooks
  useEffect(() => {
    const loadWebhooks = async () => {
      setIsLoading(true);
      try {
        await withErrorHandling(async () => {
          const webhooksData = await fetchWebhooks();
          setWebhooks(webhooksData);
        }, {
          errorMessage: t('webhooks.unableToLoadWebhooks'),
          showError: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWebhooks();
  }, [withErrorHandling, t, currentFederation, needsRefresh]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Show a notification
  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    setTimeout(() => setNotification(null), 6000);
  };

  // Handle add webhook
  const handleAddWebhook = () => {
    setSelectedWebhook(null);
    setIsFormOpen(true);
  };

  // Handle edit webhook
  const handleEditWebhook = (webhook) => {
    setSelectedWebhook(webhook);
    setIsFormOpen(true);
  };

  // Handle webhook saved
  const handleWebhookSaved = (webhook) => {
    setIsFormOpen(false);
    setNeedsRefresh(!needsRefresh); // Toggle to force refresh
    
    if (webhook.id) {
      showNotification(t('webhooks.webhookUpdatedSuccess', { name: webhook.name }));
    } else {
      showNotification(t('webhooks.webhookCreatedSuccess', { name: webhook.name }));
    }
  };

  // Handle webhook deleted
  const handleWebhookDeleted = (webhookName) => {
    setNeedsRefresh(!needsRefresh); // Toggle to force refresh
    showNotification(t('webhooks.webhookDeletedSuccess', { name: webhookName }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5">{t('webhooks.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddWebhook}
        >
          {t('webhooks.addWebhook')}
        </Button>
      </Box>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={t('webhooks.configurations')} />
          <Tab label={t('webhooks.logs')} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {currentTab === 0 && (
                <WebhookList 
                  webhooks={webhooks} 
                  onEdit={handleEditWebhook} 
                  onDeleted={handleWebhookDeleted}
                  onShowNotification={showNotification} 
                  onSave={handleWebhookSaved}
                />
              )}

              {currentTab === 1 && <WebhookLogs webhooks={webhooks} />}
            </>
          )}
        </Box>
      </Paper>

      {/* Webhook form dialog */}
      <WebhookForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        webhook={selectedWebhook}
        onSaved={handleWebhookSaved}
      />

      {/* Notification for successful operations */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default WebhookManagement;