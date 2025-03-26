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
import { formatDateForInput, formatDate } from '../../utils/dateUtils';
import { AuthContext } from '../../context/AuthContext';
import useApiError from '../../hooks/useApiError';
import { checkEventConflicts } from '../../services/bookingService';
import { ResourceStatus } from '../../services/resourceService';

const BookingForm = ({ open, onClose, booking, onSave, onDelete, resources }) => {
  const { t } = useTranslation();
  const { currentUser, isFederationAdmin } = useContext(AuthContext);
  const { withErrorHandling, notifyFormError } = useApiError();
  const [formData, setFormData] = useState({
    title: '',
    resourceId: '',
    start: null,
    end: null,
    description: '',
    userId: ''
  });
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [useCurrentUser, setUseCurrentUser] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [validationMessage, setValidationMessage] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [affectedResources, setAffectedResources] = useState([]);

  // Filter available resources (only ACTIVE ones)
  const activeResources = resources.filter(resource => resource.status === ResourceStatus.ACTIVE);

  // Load users only if current user is admin
  useEffect(() => {
    const loadUsers = async () => {
      if (isFederationAdmin()) {
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
  }, [isFederationAdmin, withErrorHandling, t]);

  // Populate form when an event is selected
  useEffect(() => {
    if (booking) {
      // Determine if user has rights to modify this booking
      const isOwnBooking = booking.userId === currentUser?.id;
      const canEdit = isOwnBooking || isFederationAdmin();
      setIsReadOnly(!canEdit);
      
      // If user is admin and the booking's user ID is not the current user,
      // set useCurrentUser to false
      const bookingForOtherUser = isFederationAdmin() && booking.userId && booking.userId !== currentUser?.id;
      setUseCurrentUser(!bookingForOtherUser);
      
      setFormData({
        id: booking.id,
        title: booking.title || '',
        resourceId: booking.resourceId || '',
        start: booking.start,
        end: booking.end,
        description: booking.description || '',
        userId: booking.userId || currentUser?.id || ''
      });
    } else {
      resetForm();
    }
  }, [booking, currentUser, isFederationAdmin]);

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
      userId: currentUser?.id || ''
    });
    setUseCurrentUser(true);
    setErrors({});
    setValidationMessage(null);
    setIsReadOnly(false);
    setAffectedResources([]);
  };

  const handleChange = (e) => {
    if (isReadOnly) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
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
    if (isReadOnly) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: new Date(value)
    });
    
    // Reset validation message when user changes dates
    setValidationMessage(null);
  };

  const handleUserSelectionChange = (useCurrentUserValue) => {
    if (isReadOnly) return;
    
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
      // If validation message is not set or not a success, check for conflicts
      if (!validationMessage || validationMessage.type !== 'success') {
        const noConflicts = await checkConflicts();
        
        if (!noConflicts) {
          // If there are conflicts, ask for confirmation
          if (!window.confirm(t('bookingForm.confirmConflictContinue'))) {
            return; // User cancelled the operation
          }
        }
      }
      
      // Proceed with saving
      onSave(formData);
    } else {
      // Notify form errors
      const errorFields = Object.keys(errors).map(field => t(`bookingForm.${field}`));
      if (errorFields.length > 0) {
        notifyFormError(`${t('bookingForm.correctErrorFields')} ${errorFields.join(', ')}`);
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
        {/* Clear heading explaining the hierarchy implication */}
        <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ mr: 1 }}>⚠️</Box>
          {isParent 
            ? t('bookingForm.parentResourceExplanation') 
            : t('bookingForm.childResourceExplanation')
          }
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Clarified explanation of the relationship */}
        <Typography variant="body2" gutterBottom>
          {isParent
            ? t('bookingForm.parentResourceDetail') 
            : t('bookingForm.childResourceDetail')
          }
        </Typography>
        
        {/* Clarified label for the resources list */}
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
          {/* For child resources, first show the parent explicitly */}
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
          
          {/* Show resource list with appropriate labeling */}
          {isParent ? (
            // For parent resources, show the child resources that will be affected
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
            // For child resources, show sibling resources (other children of same parent)
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

  // Render read-only view with improved UI
  const renderReadOnlyView = () => {
    // Get resource name
    const resourceName = getResourceName(formData.resourceId);
    // Get user name
    const userName = getUserName(formData.userId);
    
    // Check if this resource is part of a hierarchy
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

  // Render edit form with improved structure and UI
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
            {/* Basic booking information section */}
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
            />
            
            <FormControl fullWidth margin="normal" required error={!!errors.resourceId}>
              <InputLabel id="resource-select-label">{t('bookingForm.resource')}</InputLabel>
              <Select
                labelId="resource-select-label"
                name="resourceId"
                value={formData.resourceId || ''}
                label={t('bookingForm.resource')}
                onChange={handleChange}
              >
                <MenuItem value="">{t('bookingForm.selectResource')}</MenuItem>
                {activeResources.map(resource => {
                  // Identify if this is a parent or child resource
                  const isParent = resource.subResourceIds && resource.subResourceIds.length > 0;
                  const isChild = resource.parentId;
                  
                  return (
                    <MenuItem key={resource.id} value={resource.id} sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {/* Show hierarchy indicator icon */}
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
                        
                        {/* Badge for hierarchical resources */}
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

            {/* Display affected resources */}
            {renderAffectedResources()}

            {/* Section for user selection - only available for admins */}
            {isFederationAdmin() && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <Divider sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('bookingForm.bookingUser')}
                  </Typography>
                </Divider>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('bookingForm.adminBookingNote')}
                </Alert>
                
                <FormControl fullWidth>
                  <Select
                    value={useCurrentUser ? 'current' : 'other'}
                    onChange={(e) => handleUserSelectionChange(e.target.value === 'current')}
                  >
                    <MenuItem value="current">
                      {t('bookingForm.bookInMyName')} ({currentUser?.name || currentUser?.username})
                    </MenuItem>
                    <MenuItem value="other">{t('bookingForm.bookForAnotherUser')}</MenuItem>
                  </Select>
                </FormControl>
                
                {!useCurrentUser && (
                  <FormControl fullWidth margin="normal" required error={!!errors.userId}>
                    <InputLabel id="user-select-label">{t('bookingForm.selectUser')}</InputLabel>
                    <Select
                      labelId="user-select-label"
                      name="userId"
                      value={formData.userId || ''}
                      label={t('bookingForm.selectUser')}
                      onChange={handleChange}
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
            
            {/* Date/time selection with improved labeling */}
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
              />
            </Box>
            
            {/* Button to check for conflicts with improved UI */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={checkConflicts}
                disabled={isChecking || !formData.resourceId || !formData.start || !formData.end || 
                  (errors.resourceId || errors.start || errors.end)}
                fullWidth
                startIcon={isChecking ? <CircularProgress size={20} /> : null}
                sx={{ py: 1 }}
              >
                {isChecking ? t('bookingForm.checking') : t('bookingForm.checkAvailability')}
              </Button>
            </Box>
            
            {/* Validation message */}
            {validationMessage && (
              <Alert 
                severity={validationMessage.type} 
                sx={{ mt: 1, mb: 2 }}
              >
                {validationMessage.text}
              </Alert>
            )}
            
            <TextField
              label={t('bookingForm.description')}
              name="description"
              fullWidth
              multiline
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={isChecking || activeResources.length === 0}
          >
            {formData.id ? t('common.update') : t('common.confirm')}
          </Button>
          {formData.id && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => onDelete(formData.id)}
              disabled={isChecking}
            >
              {t('common.delete')}
            </Button>
          )}
        </DialogActions>
      </>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={isReadOnly ? "sm" : "md"}
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh', // Ensure dialog doesn't get too tall on small screens
          overflowY: 'auto'  // Enable scrolling when content is too large
        }
      }}
    >
      {isReadOnly ? renderReadOnlyView() : renderEditForm()}
    </Dialog>
  );
};

export default BookingForm;