import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
  Switch,
  Tooltip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { testWebhook, deleteWebhook, updateWebhook } from '../../../services/webhookService';
import { getEventTypeName } from '../../../models/webhook';
import useApiError from '../../../hooks/useApiError';

const WebhookList = ({ webhooks, onEdit, onSave, onDeleted, onShowNotification }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const [confirmDeleteWebhook, setConfirmDeleteWebhook] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(null);
  const [togglingWebhook, setTogglingWebhook] = useState(null);

  const handleDeleteWebhook = async () => {
    if (!confirmDeleteWebhook) return;
    
    setIsDeleting(true);
    try {
      await withErrorHandling(async () => {
        const result = await deleteWebhook(confirmDeleteWebhook.id);
        if (result.success) {
          onDeleted(confirmDeleteWebhook.name);
        }
        setConfirmDeleteWebhook(null);
      }, {
        errorMessage: t('webhooks.unableToDeleteWebhook', { name: confirmDeleteWebhook.name }),
        showError: true
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTestWebhook = async (webhook) => {
    setTestingWebhook(webhook);
    try {
      await withErrorHandling(async () => {
        const result = await testWebhook(webhook.id);
        if(result.success){
          onShowNotification(t('webhooks.testWebhookSuccess', { name: webhook.name }), 'success');
        }
      }, {
        errorMessage: t('webhooks.testWebhookError', { name: webhook.name }),
        showError: true
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const handleToggleEnabled = async (webhook) => {
    setTogglingWebhook(webhook);
    try {
      await withErrorHandling(async () => {
        const updatedWebhook = {
          ...webhook,
          enabled: !webhook.enabled
        };
        
        
        const result = await updateWebhook(webhook.id, updatedWebhook);
        
        if(result?.id) {
          onShowNotification(
            webhook.enabled 
              ? t('webhooks.webhookDisabled', { name: webhook.name })
              : t('webhooks.webhookEnabled', { name: webhook.name }),
            'success'
          );
        }

        
        onSave(webhook);
      }, {
        errorMessage: t('webhooks.unableToUpdateWebhook', { name: webhook.name }),
        showError: true
      });
    } finally {
      setTogglingWebhook(null);
    }
  };

  return (
    <>
      {webhooks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {t('webhooks.noWebhooksFound')}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {webhooks.map((webhook) => (
            <Grid item key={webhook.id} xs={12} md={6} lg={4}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                      {webhook.name}
                    </Typography>
                    <Tooltip title={webhook.enabled ? t('webhooks.enabled') : t('webhooks.disabled')}>
                      {togglingWebhook?.id === webhook.id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Switch
                          checked={webhook.enabled}
                          size="small"
                          color="primary"
                          onChange={() => handleToggleEnabled(webhook)}
                        />
                      )}
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={webhook.url}>
                      <LinkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    </Tooltip>
                    <Typography variant="body2" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '90%'
                    }}>
                      {webhook.url}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={getEventTypeName(webhook.eventType)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('webhooks.siteName')}: {webhook.siteName || webhook.siteId}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title={t('webhooks.testWebhook')}>
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handleTestWebhook(webhook)}
                        disabled={testingWebhook?.id === webhook.id}
                      >
                        {testingWebhook?.id === webhook.id ? <CircularProgress size={24} /> : <PlayArrowIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('webhooks.editWebhook')}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => onEdit(webhook)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('webhooks.deleteWebhook')}>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => setConfirmDeleteWebhook(webhook)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!confirmDeleteWebhook}
        onClose={() => setConfirmDeleteWebhook(null)}
      >
        <DialogTitle>{t('webhooks.confirmDeleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('webhooks.confirmDeleteMessage', { name: confirmDeleteWebhook?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDeleteWebhook(null)} 
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteWebhook}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? t('webhooks.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WebhookList;