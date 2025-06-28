import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Chip,
} from '@mui/material';
import { fetchUsers } from '../../services/userService';
import { fetchResourceTypes } from '../../services/resourceTypeService';
import { formatDateForInput, formatDate } from '../../utils/dateUtils';
import { AuthContext } from '../../context/AuthContext';
import useApiError from '../../hooks/useApiError';
import { checkEventConflicts } from '../../services/bookingService';
import { ResourceStatus } from '../../services/resourceService';

const BookingForm = ({ open, onClose, booking, onSave, onDelete, resources }) => {
  const { t } = useTranslation();
  const { currentUser, isSiteAdmin } = useContext(AuthContext);
  const { withErrorHandling, notifyFormError } = useApiError();
  const [formData, setFormData] = useState({
    title: '',
    resourceId: '',
    start: null,
    end: null,
    description: '',
    userId: '',
    customParameters: ''
  });
  const [users, setUsers] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [customParameterValues, setCustomParameterValues] = useState({});
  const [errors, setErrors] = useState({});
  const [useCurrentUser, setUseCurrentUser] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [validationMessage, setValidationMessage] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [affectedResources, setAffectedResources] = useState([]);

  // Filter available resources (only ACTIVE ones)
  const activeResources = resources.filter(resource => resource.status === ResourceStatus.ACTIVE);

  // Load users only if current user is admin
  useEffect(() => {
    const loadUsers = async () => {
      if (isSiteAdmin()) {
        await withErrorHandling(async () => {
          const usersData = await fetchUsers();
          setUsers(usersData);
        }, {
          errorMessage: t('errors.unableToLoadUserList'),
          showError: true
        });
      }
    };
    
    loadUsers();
  }, [isSiteAdmin, withErrorHandling, t]);

  // Load resource types
  useEffect(() => {
    const loadResourceTypes = async () => {
      await withErrorHandling(async () => {
        const resourceTypesData = await fetchResourceTypes();
        setResourceTypes(resourceTypesData);
      }, {
        errorMessage: t('errors.unableToLoadResourceTypes'),
        showError: true
      });
    };
    
    loadResourceTypes();
  }, [withErrorHandling, t]);

  // Populate form when an event is selected
  useEffect(() => {
    if (booking) {
      // Determine if user has rights to modify this booking
      const isOwnBooking = booking.userId === currentUser?.id;
      const canEdit = isOwnBooking || isSiteAdmin();
      setIsReadOnly(!canEdit);
      
      // If user is admin and the booking's user ID is not the current user,
      // set useCurrentUser to false
      const bookingForOtherUser = isSiteAdmin() && booking.userId && booking.userId !== currentUser?.id;
      setUseCurrentUser(!bookingForOtherUser);
      
      setFormData({
        id: booking.id,
        title: booking.title || '',
        resourceId: booking.resourceId || '',
        start: booking.start,
        end: booking.end,
        description: booking.description || '',
        userId: booking.userId || currentUser?.id || '',
        customParameters: booking.customParameters || ''
      });

      // Parse custom parameters if they exist
      if (booking.customParameters) {
        try {
          const customParams = JSON.parse(booking.customParameters);
          setCustomParameterValues(customParams);
        } catch (e) {
          console.error('Error parsing custom parameters:', e);
          setCustomParameterValues({});
        }
      } else {
        setCustomParameterValues({});
      }
    } else {
      resetForm();
    }
  }, [booking, currentUser, isSiteAdmin]);

  // Update affected resources when resourceId changes
  useEffect(() => {
    if (formData.resourceId) {
      // Find current resource
      const selectedResource = resources.find(r => r.id === formData.resourceId);
      if (!selectedResource) {
        setAffectedResources([]);
        return;
      }

      // If it's a parent resource, find its children
      if (selectedResource.subResourceIds && selectedResource.subResourceIds.length > 0) {
        const childResources = resources.filter(r => 
          selectedResource.subResourceIds.includes(r.id)
        );
        setAffectedResources(childResources);
      } 
      // If it's a child resource, find its parent and siblings
      else if (selectedResource.parentId) {
        const parentResource = resources.find(r => r.id === selectedResource.parentId);
        if (parentResource) {
          // Get parent and its other children (siblings of current resource)
          const siblingResources = resources.filter(r => 
            r.id !== selectedResource.id && 
            r.parentId === parentResource.id
          );
          
          setAffectedResources([parentResource, ...siblingResources]);
        } else {
          setAffectedResources([]);
        }
      } else {
        setAffectedResources([]);
      }
    } else {
      setAffectedResources([]);
    }
  }, [formData.resourceId, resources]);

  const resetForm = () => {
    setFormData({
      title: '',
      resourceId: '',
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000),
      description: '',
      userId: currentUser?.id || '',
      customParameters: ''
    });
    setUseCurrentUser(true);
    setCustomParameterValues({});
    setErrors({});
    setValidationMessage(null);
    setIsReadOnly(false);
    setAffectedResources([]);
  };

  // Get custom parameters for selected resource
  const getResourceCustomParameters = () => {
    if (!formData.resourceId) return [];
    
    const selectedResource = resources.find(r => r.id === formData.resourceId);
    if (!selectedResource || !selectedResource.typeId) return [];
    
    const resourceType = resourceTypes.find(rt => rt.id === selectedResource.typeId);
    if (!resourceType || !resourceType.customParameters) return [];
    
    try {
      return JSON.parse(resourceType.customParameters);
    } catch (e) {
      console.error('Error parsing custom parameters:', e);
      return [];
    }
  };

  // Handle custom parameter value changes
  const handleCustomParameterChange = (parameterId, value) => {
    if (isReadOnly || isSubmitting) return;
    
    setCustomParameterValues({
      ...customParameterValues,
      [parameterId]: value
    });
    
    // Remove error for this parameter if it exists
    if (errors[`customParam_${parameterId}`]) {
      setErrors({
        ...errors,
        [`customParam_${parameterId}`]: undefined
      });
    }
  };

  const handleChange = (e) => {
    if (isReadOnly || isSubmitting) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Reset custom parameters when resource changes
    if (name === 'resourceId') {
      setCustomParameterValues({});
    }
    
    // Remove errors when user modifies the field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    
    // Reset validation message when user changes something
    setValidationMessage(null);
  };

  const handleDateChange = (e) => {
    if (isReadOnly || isSubmitting) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: new Date(value)
    });
    
    // Reset validation message when user changes dates
    setValidationMessage(null);
  };

  const handleUserSelectionChange = (useCurrentUserValue) => {
    if (isReadOnly || isSubmitting) return;
    
    setUseCurrentUser(useCurrentUserValue);
    
    if (useCurrentUserValue) {
      // If the user decides to use their own account, set userId to currentUser.id
      setFormData({
        ...formData,
        userId: currentUser?.id || ''
      });
    } else {
      // Otherwise, reset userId to empty or keep current value if not empty
      setFormData({
        ...formData,
        userId: formData.userId !== currentUser?.id ? formData.userId : ''
      });
    }
    
    // Reset validation message
    setValidationMessage(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title) {
      newErrors.title = t('bookingForm.titleRequired');
    }
    
    if (!formData.resourceId) {
      newErrors.resourceId = t('bookingForm.resourceRequired');
    }
    
    if (!formData.start) {
      newErrors.start = t('bookingForm.startDateRequired');
    }
    
    if (!formData.end) {
      newErrors.end = t('bookingForm.endDateRequired');
    } else if (formData.end <= formData.start) {
      newErrors.end = t('bookingForm.endDateAfterStart');
    }
    
    if (!formData.userId) {
      newErrors.userId = t('bookingForm.userRequired');
    }

    // Validate custom parameters
    const customParams = getResourceCustomParameters();
    customParams.forEach(param => {
      if (param.required) {
        const value = customParameterValues[param.id];
        if (!value || value.trim() === '') {
          newErrors[`customParam_${param.id}`] = t('bookingForm.customParameterRequired', { label: param.label });
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check for booking conflicts
  const checkConflicts = async () => {
    if(!validateForm()) {
      return;
    }

    if (!formData.resourceId || !formData.start || !formData.end) {
      return false;
    }
    
    setIsChecking(true);
    
    try {
      const result = await withErrorHandling(async () => {
        return await checkEventConflicts(
          formData.resourceId,
          formData.start,
          formData.end,
          formData.id
        );
      }, {
        errorMessage: t('bookingForm.unableToCheckAvailability'),
        showError: true,
        rethrowError: true
      });
      
      if (result) {
        // Check the format of the server response
        if (result.data === false) {
          // If data is false, there's a conflict
          setValidationMessage({
            type: 'error',
            text: result.message || t('bookingForm.resourceUnavailable')
          });
          return false;
        } else if (result.success === false) {
          setValidationMessage({
            type: 'error',
            text: result.message || t('bookingForm.checkConflictsError')
          });
          return false;
        } else {
          // If success is true or undefined (compatibility with previous versions)
          setValidationMessage({
            type: 'success',
            text: t('bookingForm.resourceAvailable')
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    // Make sure userId is set correctly before validating
    if (useCurrentUser && currentUser) {
      formData.userId = currentUser.id;
    }

    if (validateForm()) {
      setIsSubmitting(true);
      setValidationMessage(null);
      try {
        // If validation message is not set or not a success, check for conflicts
        if (!validationMessage || validationMessage.type !== 'success') {
          const noConflicts = await checkConflicts();

          if (!noConflicts) {
            // If there are conflicts, ask for confirmation
            if (!window.confirm(t('bookingForm.confirmConflictContinue'))) {
              setIsSubmitting(false);
              return; // User cancelled the operation
            }
          }
        }

        // Serialize custom parameters before saving
        const customParams = getResourceCustomParameters();
        let customParametersJson = '';
        
        if (customParams.length > 0) {
          // Only include parameters that have values
          const filledParams = {};
          customParams.forEach(param => {
            const value = customParameterValues[param.id];
            if (value && value.trim() !== '') {
              filledParams[param.id] = value.trim();
            }
          });
          
          if (Object.keys(filledParams).length > 0) {
            customParametersJson = JSON.stringify(filledParams);
          }
        }

        // Prepare form data with serialized custom parameters
        const dataToSave = {
          ...formData,
          customParameters: customParametersJson
        };

        // Proceed with saving
        await onSave(dataToSave);
      } catch (error) {
        console.error("Error during save:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Notify form errors
      const errorFields = Object.keys(errors).map(field => t(`bookingForm.${field}`));
      if (errorFields.length > 0) {
        notifyFormError(`${t('bookingForm.correctErrorFields')} ${errorFields.join(', ')}`);
      }
    }
  };

  const handleDeleteClick = async () => {
    if (formData.id) {
      setIsSubmitting(true);
      try {
        await onDelete(formData.id);
      } catch (error) {
        console.error("Error during delete:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Find resource name by ID
  const getResourceName = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.name : t('bookingForm.unknownResource');
  };

  // Find user name by ID
  const getUserName = (userId) => {
    if (userId === currentUser?.id) {
      return `${currentUser.firstName} ${currentUser.lastName}` || currentUser.username || t('bookingForm.you');
    }
    
    const user = users.find(u => u.id === userId);
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.username || user.name || t('userManagement.user');
    }
    
    return t('bookingForm.unknownUser');
  };

  // Render affected resources section with clear hierarchy explanation
  const renderAffectedResources = () => {
    if (affectedResources.length === 0) return null;
    
    const selectedResource = resources.find(r => r.id === formData.resourceId);
    if (!selectedResource) return null;
    
    // Determine if we're showing parent or children
    const isParent = selectedResource.subResourceIds && selectedResource.subResourceIds.length > 0;
    
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mt: 2, mb: 1, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ mr: 1 }}>⚠️</Box>
          {isParent 
            ? t('bookingForm.parentResourceExplanation') 
            : t('bookingForm.childResourceExplanation')
          }
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="body2" gutterBottom>
          {isParent
            ? t('bookingForm.parentResourceDetail') 
            : t('bookingForm.childResourceDetail')
          }
        </Typography>
        
        <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 2, mb: 1 }}>
          {isParent 
            ? t('bookingForm.dependentResources') 
            : t('bookingForm.hierarchyStructure')
          }:
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1, 
          mt: 1,
          pl: 2
        }}>
          {!isParent && selectedResource.parentId && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ mr: 1 }}>📂</Box>
                {t('bookingForm.parentResourceLabel')}: {' '}
                <Chip
                  label={affectedResources.find(r => r.id === selectedResource.parentId)?.name}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
          )}
          
          {isParent ? (
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              {affectedResources.map(resource => (
                <Chip
                  key={resource.id}
                  label={resource.name}
                  size="small"
                  variant="outlined"
                  sx={{ my: 0.5 }}
                />
              ))}
            </Typography>
          ) : (
            <Box>
              {affectedResources
                .filter(r => r.id !== selectedResource.parentId)
                .length > 0 && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 1 }}>🔄</Box>
                  {t('bookingForm.siblingResourcesLabel')}: {' '}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1 }}>
                    {affectedResources
                      .filter(r => r.id !== selectedResource.parentId)
                      .map(resource => (
                        <Chip
                          key={resource.id}
                          label={resource.name}
                          size="small"
                          variant="outlined"
                          sx={{ my: 0.5 }}
                        />
                      ))}
                  </Box>
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    );
  };

  const renderReadOnlyView = () => {
    const resourceName = getResourceName(formData.resourceId);
    const userName = getUserName(formData.userId);
    
    const selectedResource = resources.find(r => r.id === formData.resourceId);
    const isHierarchical = selectedResource && 
      (selectedResource.parentId || (selectedResource.subResourceIds && selectedResource.subResourceIds.length > 0));
    
    return (
      <>
        <DialogTitle>{t('bookingForm.bookingDetails')}</DialogTitle>
        <DialogContent>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 2, mt: 1 }}>
            <Typography variant="h6" gutterBottom>{formData.title}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">{t('bookingForm.resource')}</Typography>
              <Typography variant="body1">{resourceName}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">{t('bookingForm.period')}</Typography>
              <Typography variant="body1">
                {formatDate(formData.start, 'dddd D MMMM YYYY')}
              </Typography>
              <Typography variant="body2">
                {formatDate(formData.start, 'HH:mm')} - {formatDate(formData.end, 'HH:mm')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">{t('bookingForm.bookedBy')}</Typography>
              <Typography variant="body1">{userName}</Typography>
            </Box>
            
            {formData.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">{t('bookingForm.description')}</Typography>
                <Typography variant="body1">{formData.description}</Typography>
              </Box>
            )}

            {/* Custom Parameters Section - Read Only */}
            {(() => {
              const customParams = getResourceCustomParameters();
              if (customParams.length === 0 || Object.keys(customParameterValues).length === 0) return null;
              
              return (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('bookingForm.customParameters')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    {customParams.map((param, index) => {
                      const value = customParameterValues[param.id];
                      if (!value) return null;
                      
                      return (
                        <Box key={param.id} sx={{ mb: index < customParams.length - 1 ? 2 : 0 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {param.label}
                          </Typography>
                          <Typography variant="body1">{value}</Typography>
                        </Box>
                      );
                    })}
                  </Paper>
                </Box>
              );
            })()}

            {renderAffectedResources()}
          </Paper>
          
          <Alert severity="info">
            {t('bookingForm.viewingOtherBooking')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </>
    );
  };

  const renderEditForm = () => {
    const selectedResource = resources.find(r => r.id === formData.resourceId);
    const isHierarchical = selectedResource && 
      (selectedResource.parentId || (selectedResource.subResourceIds && selectedResource.subResourceIds.length > 0));
    
    return (
      <>
        <DialogTitle>
          {formData.id ? t('bookingForm.editBooking') : t('bookingForm.newBooking')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
              {t('bookingForm.bookingDetails')}
            </Typography>

            <TextField
              label={t('bookingForm.title')}
              name="title"
              fullWidth
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.title}
              helperText={errors.title}
              disabled={isSubmitting || isReadOnly}
            />

            <FormControl fullWidth margin="normal" required error={!!errors.resourceId} disabled={isSubmitting || isReadOnly}>
              <InputLabel id="resource-select-label">{t('bookingForm.resource')}</InputLabel>
              <Select
                labelId="resource-select-label"
                name="resourceId"
                value={formData.resourceId || ''}
                label={t('bookingForm.resource')}
                onChange={handleChange}
                disabled={isSubmitting || isReadOnly}
              >
                <MenuItem value="">{t('bookingForm.selectResource')}</MenuItem>
                {activeResources.map(resource => {
                  const isParent = resource.subResourceIds && resource.subResourceIds.length > 0;
                  const isChild = resource.parentId;
                  
                  return (
                    <MenuItem key={resource.id} value={resource.id} sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {(isParent || isChild) && (
                          <Box 
                            component="span" 
                            sx={{ 
                              mr: 1, 
                              color: isParent ? 'primary.main' : 'info.main',
                              fontSize: '1.2rem' 
                            }}
                          >
                            {isParent ? '📂' : '📄'}
                          </Box>
                        )}
                        <Typography component="span" fontWeight="medium">
                          {resource.name}
                        </Typography>
                        {(isParent || isChild) && (
                          <Box 
                            component="span" 
                            sx={{ 
                              ml: 1,
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              backgroundColor: isParent ? 'primary.main' : 'info.main',
                              color: 'white'
                            }}
                          >
                            {isParent ? t('bookingForm.parent') : t('bookingForm.child')}
                          </Box>
                        )}
                      </Box>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {resource.specs} - {resource.location}
                      </Typography>
                    </MenuItem>
                  );
                })}
              </Select>
              {errors.resourceId && <FormHelperText>{errors.resourceId}</FormHelperText>}
              {activeResources.length === 0 && (
                <FormHelperText error>{t('bookingForm.noActiveResources')}</FormHelperText>
              )}
            </FormControl>

            {renderAffectedResources()}

            {isSiteAdmin() && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <Divider sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('bookingForm.bookingUser')}
                  </Typography>
                </Divider>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('bookingForm.adminBookingNote')}
                </Alert>
                
                <FormControl fullWidth disabled={isSubmitting || isReadOnly}>
                  <Select
                    value={useCurrentUser ? 'current' : 'other'}
                    onChange={(e) => handleUserSelectionChange(e.target.value === 'current')}
                    disabled={isSubmitting || isReadOnly}
                  >
                    <MenuItem value="current">
                      {t('bookingForm.bookInMyName')} ({currentUser?.name || currentUser?.username})
                    </MenuItem>
                    <MenuItem value="other">{t('bookingForm.bookForAnotherUser')}</MenuItem>
                  </Select>
                </FormControl>

                {!useCurrentUser && (
                  <FormControl fullWidth margin="normal" required error={!!errors.userId} disabled={isSubmitting || isReadOnly}>
                    <InputLabel id="user-select-label">{t('bookingForm.selectUser')}</InputLabel>
                    <Select
                      labelId="user-select-label"
                      name="userId"
                      value={formData.userId || ''}
                      label={t('bookingForm.selectUser')}
                      onChange={handleChange}
                      disabled={isSubmitting || isReadOnly}
                    >
                      <MenuItem value="">{t('bookingForm.selectUser')}</MenuItem>
                      {users.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name || user.username || `${user.firstName} ${user.lastName}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
                  </FormControl>
                )}
              </Box>
            )}
            
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 'medium' }}>
              {t('bookingForm.period')}
            </Typography>
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: 2
              }}
            >
              <TextField
                label={t('bookingForm.startDateTime')}
                name="start"
                type="datetime-local"
                fullWidth
                value={formatDateForInput(formData.start)}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.start}
                helperText={errors.start}
                disabled={isSubmitting || isReadOnly}
              />
              <TextField
                label={t('bookingForm.endDateTime')}
                name="end"
                type="datetime-local"
                fullWidth
                value={formatDateForInput(formData.end)}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.end}
                helperText={errors.end}
                disabled={isSubmitting || isReadOnly}
              />
            </Box>
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={checkConflicts}
                disabled={isChecking || isSubmitting || !formData.resourceId || !formData.start || !formData.end || 
                  (errors.resourceId || errors.start || errors.end)}
                fullWidth
                startIcon={isChecking ? <CircularProgress size={20} /> : null}
                sx={{ py: 1 }}
              >
                {isChecking ? t('bookingForm.checking') : t('bookingForm.checkAvailability')}
              </Button>
            </Box>
            
            {validationMessage && (
              <Alert 
                severity={validationMessage.type} 
                sx={{ mt: 1, mb: 2 }}
              >
                {validationMessage.text}
              </Alert>
            )}

            {/* Custom Parameters Section */}
            {(() => {
              const customParams = getResourceCustomParameters();
              if (customParams.length === 0) return null;
              
              return (
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'medium' }}>
                    {t('bookingForm.customParameters')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                    {customParams.map((param, index) => (
                      <TextField
                        key={param.id}
                        label={`${param.label}${param.required ? ' *' : ''}`}
                        fullWidth
                        value={customParameterValues[param.id] || ''}
                        onChange={(e) => handleCustomParameterChange(param.id, e.target.value)}
                        margin={index === 0 ? "none" : "normal"}
                        required={param.required}
                        error={!!errors[`customParam_${param.id}`]}
                        helperText={errors[`customParam_${param.id}`]}
                        disabled={isSubmitting || isReadOnly}
                        multiline
                        rows={2}
                      />
                    ))}
                  </Paper>
                </Box>
              );
            })()}
            
            <TextField
              label={t('bookingForm.description')}
              name="description"
              fullWidth
              multiline
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting || isReadOnly}
            />
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
            disabled={isChecking || isSubmitting || activeResources.length === 0}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? t('common.saving') : (formData.id ? t('common.update') : t('common.confirm'))}
          </Button>
          {formData.id && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleDeleteClick}
              disabled={isChecking || isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? t('common.deleting') : t('common.delete')}
            </Button>
          )}
        </DialogActions>
      </>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={isSubmitting ? () => {} : onClose}
      maxWidth={isReadOnly ? "sm" : "md"}
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
    >
      {isReadOnly ? renderReadOnlyView() : renderEditForm()}
    </Dialog>
  );
};

export default BookingForm;