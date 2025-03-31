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
  CircularProgress,
  Alert,
  Stack,
  Typography,
  Divider,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox
} from '@mui/material';
import {
  Info as InfoIcon,
} from '@mui/icons-material';
import { useFederation } from '../../../context/FederationContext';
import { WebhookEventTypes, defaultWebhookConfig } from '../../../models/webhook';
import { createWebhook, updateWebhook } from '../../../services/webhookService';
import { fetchResources } from '../../../services/resourceService';
import { fetchResourceTypes } from '../../../services/resourceTypeService';
import useApiError from '../../../hooks/useApiError';

const WebhookForm = ({ open, onClose, webhook, onSaved }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const { federations, currentFederation } = useFederation();
  const [formData, setFormData] = useState({
    ...defaultWebhookConfig,
    resourceSelectionType: 'all', // 'all', 'resource', or 'resourceType'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resources, setResources] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load resources and resource types
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await withErrorHandling(async () => {
          const [resourcesData, resourceTypesData] = await Promise.all([
            fetchResources(currentFederation?.id ? {federationId: currentFederation.id} : {}),
            fetchResourceTypes(currentFederation?.id ? {federationId: currentFederation.id} : {})
          ]);
          setResources(resourcesData);
          setResourceTypes(resourceTypesData);
        }, {
          errorMessage: t('webhooks.unableToLoadResourceData'),
          showError: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open, withErrorHandling, t, currentFederation]);

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
      // Determine the resource selection type
      let resourceSelectionType = 'all';
      if (webhook.resourceId) {
        resourceSelectionType = 'resource';
      } else if (webhook.resourceTypeId) {
        resourceSelectionType = 'resourceType';
      }

      setFormData({
        ...webhook,
        resourceSelectionType
      });
    } else {
      setFormData({
        ...defaultWebhookConfig,
        resourceSelectionType: 'all',
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

  // Handle resource selection type change
  const handleResourceSelectionTypeChange = (e) => {
    const selectionType = e.target.value;
    
    // Update the form data with the new selection type and reset related fields
    const updatedData = {
      ...formData,
      resourceSelectionType: selectionType,
      resourceId: null,
      resourceName: null,
      resourceTypeId: null,
      resourceTypeName: null
    };
    
    setFormData(updatedData);
  };

  // Handle resource selection
  const handleResourceSelect = (e) => {
    const resourceId = e.target.value;
    const selectedResource = resources.find(r => r.id === resourceId);
    
    setFormData({
      ...formData,
      resourceId,
      resourceName: selectedResource ? selectedResource.name : null
    });
  };

  // Handle resource type selection
  const handleResourceTypeSelect = (e) => {
    const resourceTypeId = e.target.value;
    const selectedType = resourceTypes.find(t => t.id === resourceTypeId);
    
    setFormData({
      ...formData,
      resourceTypeId,
      resourceTypeName: selectedType ? selectedType.name : null
    });
  };

  const handleToggleEnabled = () => {
    setFormData({
      ...formData,
      enabled: !formData.enabled
    });
  };

  const handleToggleIncludeSubResources = () => {
    setFormData({
      ...formData,
      includeSubResources: !formData.includeSubResources
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

    // Validate resource selection based on selection type
    if (formData.resourceSelectionType === 'resource' && !formData.resourceId) {
      newErrors.resourceId = t('webhooks.resourceRequired');
    }

    if (formData.resourceSelectionType === 'resourceType' && !formData.resourceTypeId) {
      newErrors.resourceTypeId = t('webhooks.resourceTypeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await withErrorHandling(async () => {
        // Prepare data based on resource selection type
        const webhookData = { ...formData };
        
        // Remove fields not needed based on selection type
        if (formData.resourceSelectionType === 'all') {
          delete webhookData.resourceId;
          delete webhookData.resourceName;
          delete webhookData.resourceTypeId;
          delete webhookData.resourceTypeName;
          delete webhookData.includeSubResources;
        } else if (formData.resourceSelectionType === 'resource') {
          delete webhookData.resourceTypeId;
          delete webhookData.resourceTypeName;
        } else if (formData.resourceSelectionType === 'resourceType') {
          delete webhookData.resourceId;
          delete webhookData.resourceName;
        }
        
        // Remove the resourceSelectionType property as it's not needed in the API
        delete webhookData.resourceSelectionType;
        
        if (formData.id) {
          // Update existing webhook
          const updated = await updateWebhook(formData.id, webhookData);
          onSaved(updated);
        } else {
          // Create new webhook
          const created = await createWebhook(webhookData);
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
          <Stack spacing={3}>
            {/* Basic Information */}
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('webhooks.basicInformation')}
              </Typography>
              
              <TextField
                label={t('webhooks.name')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
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
                required
                error={!!errors.url}
                helperText={errors.url || t('webhooks.urlHelp')}
                placeholder="https://example.com/webhook"
              />
              
              <FormControl fullWidth required error={!!errors.eventType}>
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
              
              <FormControl fullWidth required error={!!errors.federationId}>
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
            </Stack>
            
            <Divider />
            
            {/* Resource Selection */}
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('webhooks.resourceSelection')}
              </Typography>
              
              <FormControl component="fieldset">
                <FormLabel component="legend">{t('webhooks.selectResourceScope')}</FormLabel>
                <RadioGroup
                  name="resourceSelectionType"
                  value={formData.resourceSelectionType}
                  onChange={handleResourceSelectionTypeChange}
                >
                  <FormControlLabel 
                    value="all" 
                    control={<Radio />} 
                    label={t('webhooks.allResources')} 
                  />
                  <FormControlLabel 
                    value="resource" 
                    control={<Radio />} 
                    label={t('webhooks.specificResource')} 
                  />
                  <FormControlLabel 
                    value="resourceType" 
                    control={<Radio />} 
                    label={t('webhooks.resourcesByType')} 
                  />
                </RadioGroup>
              </FormControl>
              
              {/* Resource Selection */}
              {formData.resourceSelectionType === 'resource' && (
                <FormControl fullWidth required error={!!errors.resourceId}>
                  <InputLabel>{t('webhooks.selectResource')}</InputLabel>
                  <Select
                    value={formData.resourceId || ''}
                    label={t('webhooks.selectResource')}
                    onChange={handleResourceSelect}
                  >
                    <MenuItem value="">{t('webhooks.pleaseSelectResource')}</MenuItem>
                    {resources.map(resource => (
                      <MenuItem key={resource.id} value={resource.id}>
                        {resource.name} - {resource.specs}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.resourceId && <FormHelperText>{errors.resourceId}</FormHelperText>}
                  {formData.resourceId && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.includeSubResources}
                          onChange={handleToggleIncludeSubResources}
                        />
                      }
                      label={t('webhooks.includeSubResources')}
                    />
                  )}
                </FormControl>
              )}
              
              {/* Resource Type Selection */}
              {formData.resourceSelectionType === 'resourceType' && (
                <FormControl fullWidth required error={!!errors.resourceTypeId}>
                  <InputLabel>{t('webhooks.selectResourceType')}</InputLabel>
                  <Select
                    value={formData.resourceTypeId || ''}
                    label={t('webhooks.selectResourceType')}
                    onChange={handleResourceTypeSelect}
                  >
                    <MenuItem value="">{t('webhooks.pleaseSelectResourceType')}</MenuItem>
                    {resourceTypes.map(type => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.resourceTypeId && <FormHelperText>{errors.resourceTypeId}</FormHelperText>}
                </FormControl>
              )}
            </Stack>
            
            <Divider />
            
            {/* Advanced Configuration */}
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('webhooks.advancedConfiguration')}
              </Typography>
              
              <TextField
                label={t('webhooks.maxRetries')}
                name="maxRetries"
                value={formData.maxRetries}
                onChange={handleChange}
                type="number"
                fullWidth
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
              />
            </Stack>
            
            <Alert severity="info" icon={<InfoIcon />}>
              {t('webhooks.secretGeneratedByServer')}
            </Alert>
          </Stack>
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