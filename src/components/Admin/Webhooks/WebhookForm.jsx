import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Typography
} from '@mui/material';
import {
  Info as InfoIcon,
  Refresh as RefreshIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useFederation } from '../../../context/FederationContext';
import { WebhookEventTypes, defaultWebhookConfig } from '../../../models/webhook';
import { createWebhook, updateWebhook } from '../../../services/webhookService';
import useApiError from '../../../hooks/useApiError';

const WebhookForm = ({ open, onClose, webhook, onSaved }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const { federations, currentFederation } = useFederation();
  const [formData, setFormData] = useState({ ...defaultWebhookConfig });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Use federation context for default federation
  useEffect(() => {
    if (currentFederation && currentFederation !== 'ALL') {
      setFormData(prev => ({
        ...prev,
        federationId: currentFederation.id
      }));
    }
  }, [currentFederation]);

  // Initialize form with webhook data if editing
  useEffect(() => {
    if (webhook) {
      setFormData({
        ...webhook
      });
    } else {
      setFormData({
        ...defaultWebhookConfig,
        federationId: currentFederation && currentFederation !== 'ALL' ? currentFederation.id : ''
      });
    }
  }, [webhook, currentFederation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleToggleEnabled = () => {
    setFormData({
      ...formData,
      enabled: !formData.enabled
    });
  };

  const generateRandomSecret = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const secret = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    
    setFormData({
      ...formData,
      secret
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = t('webhooks.nameRequired');
    }

    if (!formData.url) {
      newErrors.url = t('webhooks.urlRequired');
    } else {
      try {
        new URL(formData.url);
      } catch (e) {
        newErrors.url = t('webhooks.invalidUrl');
      }
    }

    if (!formData.eventType) {
      newErrors.eventType = t('webhooks.eventTypeRequired');
    }

    if (!formData.federationId) {
      newErrors.federationId = t('webhooks.federationRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await withErrorHandling(async () => {
        if (formData.id) {
          // Update existing webhook
          const updated = await updateWebhook(formData.id, formData);
          onSaved(updated);
        } else {
          // Create new webhook
          const created = await createWebhook(formData);
          onSaved(created);
        }
      }, {
        errorMessage: formData.id 
          ? t('webhooks.updateFailed') 
          : t('webhooks.creationFailed'),
        showError: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {formData.id ? t('webhooks.editWebhook') : t('webhooks.newWebhook')}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('webhooks.name')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!errors.name}
                helperText={errors.name}
              />
              
              <TextField
                label={t('webhooks.url')}
                name="url"
                value={formData.url}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!errors.url}
                helperText={errors.url || t('webhooks.urlHelp')}
                placeholder="https://example.com/webhook"
              />
              
              <FormControl fullWidth margin="normal" required error={!!errors.eventType}>
                <InputLabel>{t('webhooks.eventType')}</InputLabel>
                <Select
                  name="eventType"
                  value={formData.eventType}
                  label={t('webhooks.eventType')}
                  onChange={handleChange}
                >
                  <MenuItem value={WebhookEventTypes.ALL}>{t('webhooks.allEvents')}</MenuItem>
                  <MenuItem value={WebhookEventTypes.EVENT_CREATED}>{t('webhooks.eventCreated')}</MenuItem>
                  <MenuItem value={WebhookEventTypes.EVENT_UPDATED}>{t('webhooks.eventUpdated')}</MenuItem>
                  <MenuItem value={WebhookEventTypes.EVENT_DELETED}>{t('webhooks.eventDeleted')}</MenuItem>
                  <MenuItem value={WebhookEventTypes.RESOURCE_CREATED}>{t('webhooks.resourceCreated')}</MenuItem>
                  <MenuItem value={WebhookEventTypes.RESOURCE_UPDATED}>{t('webhooks.resourceUpdated')}</MenuItem>
                  <MenuItem value={WebhookEventTypes.RESOURCE_DELETED}>{t('webhooks.resourceDeleted')}</MenuItem>
                </Select>
                {errors.eventType && <FormHelperText>{errors.eventType}</FormHelperText>}
              </FormControl>
              
              <FormControl fullWidth margin="normal" required error={!!errors.federationId}>
                <InputLabel>{t('webhooks.federation')}</InputLabel>
                <Select
                  name="federationId"
                  value={formData.federationId}
                  label={t('webhooks.federation')}
                  onChange={handleChange}
                >
                  <MenuItem value="">{t('webhooks.selectFederation')}</MenuItem>
                  {federations.map(federation => (
                    <MenuItem key={federation.id} value={federation.id}>
                      {federation.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.federationId && <FormHelperText>{errors.federationId}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {t('webhooks.webhookInfo')}
                </Typography>
              </Alert>
            </Box>
          </Grid>
        </Grid>
          
            <Grid item xs={12} md={6}>
              <TextField
                label={t('webhooks.secret')}
                name="secret"
                value={formData.secret || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
                type={showSecret ? 'text' : 'password'}
                helperText={t('webhooks.secretHelp')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('webhooks.generateSecret')}>
                        <IconButton
                          onClick={generateRandomSecret}
                          edge="end"
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={showSecret ? t('webhooks.hideSecret') : t('webhooks.showSecret')}>
                        <IconButton
                          onClick={() => setShowSecret(!showSecret)}
                          edge="end"
                        >
                          {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label={t('webhooks.maxRetries')}
                name="maxRetries"
                value={formData.maxRetries}
                onChange={handleChange}
                type="number"
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 10 } }}
                helperText={t('webhooks.maxRetriesHelp')}
              />
              
              <TextField
                label={t('webhooks.retryDelaySeconds')}
                name="retryDelaySeconds"
                value={formData.retryDelaySeconds}
                onChange={handleChange}
                type="number"
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 10, max: 3600 } }}
                helperText={t('webhooks.retryDelayHelp')}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={handleToggleEnabled}
                    color="primary"
                  />
                }
                label={t('webhooks.enabled')}
                sx={{ mt: 2 }}
              />
            </Grid>
      </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting
            ? formData.id ? t('webhooks.updating') : t('webhooks.creating')
            : formData.id ? t('common.update') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WebhookForm;