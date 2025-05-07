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
  Checkbox,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Info as InfoIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useSite } from '../../../context/SiteContext';
import { WebhookEventTypes, defaultWebhookConfig } from '../../../models/webhook';
import { createWebhook, updateWebhook } from '../../../services/webhookService';
import { fetchResources } from '../../../services/resourceService';
import { fetchResourceTypes } from '../../../services/resourceTypeService';
import useApiError from '../../../hooks/useApiError';

// Secret display dialog component
const ClientSecretDialog = ({ open, secret, onClose }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      
      // Reset copied status after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy secret:', err);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        {t('webhooks.clientSecretTitle')}
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            {t('webhooks.clientSecretWarning')}
          </Typography>
        </Alert>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('webhooks.clientSecretDescription')}
        </Typography>
        
        <Paper
          variant="outlined"
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography 
            variant="mono" 
            component="div" 
            sx={{ 
              fontFamily: 'monospace', 
              wordBreak: 'break-all',
              flexGrow: 1,
              mr: 1
            }}
          >
            {secret}
          </Typography>
          <Tooltip title={copied ? t('webhooks.copied') : t('webhooks.copy')}>
            <IconButton onClick={handleCopySecret} color={copied ? "success" : "default"}>
              {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
            </IconButton>
          </Tooltip>
        </Paper>
        
        <Alert severity="info">
          <Typography variant="body2">
            {t('webhooks.clientSecretUsage')}
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WebhookForm = ({ open, onClose, webhook, onSaved }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const { sites, currentSite } = useSite();
  const [formData, setFormData] = useState({
    ...defaultWebhookConfig,
    resourceSelectionType: 'all', // 'all', 'resource', or 'resourceType'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resources, setResources] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // State for client secret dialog
  const [clientSecret, setClientSecret] = useState(null);
  const [isSecretDialogOpen, setIsSecretDialogOpen] = useState(false);

  // Load resources and resource types based on selected site
  useEffect(() => {
    const loadData = async () => {
      if (!open || !formData.siteId) {
        // Don't load resources or types if no site is selected
        setResources([]);
        setResourceTypes([]);
        return;
      }
      
      setIsLoading(true);
      try {
        await withErrorHandling(async () => {
          const [resourcesData, resourceTypesData] = await Promise.all([
            fetchResources({ siteId: formData.siteId }),
            fetchResourceTypes({ siteId: formData.siteId })
          ]);
          setResources(resourcesData || []);
          setResourceTypes(resourceTypesData || []);
        }, {
          errorMessage: t('webhooks.unableToLoadResourceData'),
          showError: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, withErrorHandling, t, formData.siteId]);

  // Use site context for default site
  useEffect(() => {
    if (currentSite && currentSite !== 'ALL') {
      setFormData(prev => ({
        ...prev,
        siteId: currentSite.id
      }));
    }
  }, [currentSite]);

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
        siteId: currentSite && currentSite !== 'ALL' ? currentSite.id : ''
      });
    }
  }, [webhook, currentSite]);

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
    
    // If site changes, reset resource selection data
    if (name === 'siteId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        resourceId: null,
        resourceName: null,
        resourceTypeId: null,
        resourceTypeName: null
      }));
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

    if (!formData.siteId) {
      newErrors.siteId = t('webhooks.siteRequired');
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
          
          // Check if the response contains a clientSecret
          if (created && created.clientSecret) {
            setClientSecret(created.clientSecret);
            setIsSecretDialogOpen(true);
          }
          
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

  const handleCloseSecretDialog = () => {
    setIsSecretDialogOpen(false);
    setClientSecret(null);
  };

  return (
    <>
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
                    <MenuItem value={WebhookEventTypes.EVENT_START}>{t('webhooks.eventStart')}</MenuItem>
                    <MenuItem value={WebhookEventTypes.EVENT_END}>{t('webhooks.eventEnd')}</MenuItem>
                    <MenuItem value={WebhookEventTypes.RESOURCE_CREATED}>{t('webhooks.resourceCreated')}</MenuItem>
                    <MenuItem value={WebhookEventTypes.RESOURCE_UPDATED}>{t('webhooks.resourceUpdated')}</MenuItem>
                    <MenuItem value={WebhookEventTypes.RESOURCE_STATUS_CHANGED}>{t('webhooks.resourceStatusChanged')}</MenuItem>
                    <MenuItem value={WebhookEventTypes.RESOURCE_DELETED}>{t('webhooks.resourceDeleted')}</MenuItem>
                  </Select>
                  {errors.eventType && <FormHelperText>{errors.eventType}</FormHelperText>}
                </FormControl>
                
                <FormControl fullWidth required error={!!errors.siteId}>
                  <InputLabel>{t('webhooks.site')}</InputLabel>
                  <Select
                    name="siteId"
                    value={formData.siteId}
                    label={t('webhooks.site')}
                    onChange={handleChange}
                  >
                    <MenuItem value="">{t('webhooks.selectSite')}</MenuItem>
                    {sites.map(federation => (
                      <MenuItem key={federation.id} value={federation.id}>
                        {federation.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.siteId && <FormHelperText>{errors.siteId}</FormHelperText>}
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
                      control={<Radio disabled={!formData.siteId} />} 
                      label={t('webhooks.specificResource')} 
                    />
                    <FormControlLabel 
                      value="resourceType" 
                      control={<Radio disabled={!formData.siteId} />} 
                      label={t('webhooks.resourcesByType')} 
                    />
                  </RadioGroup>
                </FormControl>
                
                {/* Resource Selection - only show if site is selected */}
                {formData.resourceSelectionType === 'resource' && (
                  <>
                    {!formData.siteId ? (
                      <Alert severity="info">
                        {t('webhooks.selectSiteFirst')}
                      </Alert>
                    ) : (
                      <FormControl fullWidth required error={!!errors.resourceId}>
                        <InputLabel>{t('webhooks.selectResource')}</InputLabel>
                        <Select
                          value={formData.resourceId || ''}
                          label={t('webhooks.selectResource')}
                          onChange={handleResourceSelect}
                        >
                          <MenuItem value="">{t('webhooks.pleaseSelectResource')}</MenuItem>
                          {isLoading ? (
                            <MenuItem disabled>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                {t('common.loading')}
                              </Box>
                            </MenuItem>
                          ) : resources.length === 0 ? (
                            <MenuItem disabled>{t('webhooks.noResourcesFound')}</MenuItem>
                          ) : (
                            resources.map(resource => (
                              <MenuItem key={resource.id} value={resource.id}>
                                {resource.name} - {resource.specs}
                              </MenuItem>
                            ))
                          )}
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
                  </>
                )}
                
                {/* Resource Type Selection - only show if site is selected */}
                {formData.resourceSelectionType === 'resourceType' && (
                  <>
                    {!formData.siteId ? (
                      <Alert severity="info">
                        {t('webhooks.selectSiteFirst')}
                      </Alert>
                    ) : (
                      <FormControl fullWidth required error={!!errors.resourceTypeId}>
                        <InputLabel>{t('webhooks.selectResourceType')}</InputLabel>
                        <Select
                          value={formData.resourceTypeId || ''}
                          label={t('webhooks.selectResourceType')}
                          onChange={handleResourceTypeSelect}
                        >
                          <MenuItem value="">{t('webhooks.pleaseSelectResourceType')}</MenuItem>
                          {isLoading ? (
                            <MenuItem disabled>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                {t('common.loading')}
                              </Box>
                            </MenuItem>
                          ) : resourceTypes.length === 0 ? (
                            <MenuItem disabled>{t('webhooks.noResourceTypesFound')}</MenuItem>
                          ) : (
                            resourceTypes.map(type => (
                              <MenuItem key={type.id} value={type.id}>
                                {type.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {errors.resourceTypeId && <FormHelperText>{errors.resourceTypeId}</FormHelperText>}
                      </FormControl>
                    )}
                  </>
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
            sx={{ minWidth: 100 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (formData.id ? t('common.update') : t('common.create'))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Client Secret Dialog */}
      <ClientSecretDialog 
        open={isSecretDialogOpen} 
        secret={(clientSecret)} 
        onClose={handleCloseSecretDialog} 
      />
    </>
  );
};

export default WebhookForm;