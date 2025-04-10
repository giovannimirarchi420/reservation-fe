import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  Chip,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as ContentCopyIcon,
  Key as KeyIcon,
  ExpandMore as ExpandMoreIcon,
  DeleteOutline as DeleteOutlineIcon,
  Security,
  SupervisorAccount,
  Person
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { updateProfile, fetchCurrentUser, getUserSshKey, updateUserSshKey, deleteUserSshKey } from '../../services/userService';
import useApiError from '../../hooks/useApiError';
import { SiteRoles } from '../../services/siteService';

const ProfileManagement = () => {
  const { t } = useTranslation();
  const { currentUser, setCurrentUser, loading, getUserHighestRole } = useContext(AuthContext);
  const { withErrorHandling } = useApiError();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Create a translation object with the new keys
  const profileTranslations = {
    userIdCopied: t('profile.userIdCopied') || 'User ID copied to clipboard',
    copyUserId: t('profile.copyUserId') || 'Copy User ID'
  }

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    sshPublicKey: ''
  });
  const [sshKeyExpanded, setSshKeyExpanded] = useState(false);
  const [loadingSshKey, setLoadingSshKey] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        username: currentUser.username || currentUser.name || '',
        password: '',
        sshPublicKey: currentUser.sshPublicKey || ''
      });
    }
  }, [currentUser]);

  // Get user highest role
  const userHighestRole = currentUser ? getUserHighestRole() : SiteRoles.USER;

  // Get role info based on role
  const getRoleInfo = (role) => {
    switch (role) {
      case SiteRoles.GLOBAL_ADMIN:
        return { 
          color: 'gold', 
          label: t('userManagement.globalAdministrator'),
          icon: <Security fontSize="small" />
        };
      case SiteRoles.FEDERATION_ADMIN:
        return { 
          color: '#f44336', 
          label: t('userManagement.federationAdministrator'),
          icon: <SupervisorAccount fontSize="small" />
        };
      default:
        return { 
          color: 'primary.main', 
          label: t('userManagement.user'),
          icon: <Person fontSize="small" />
        };
    }
  };

  // Get role information
  const roleInfo = getRoleInfo(userHighestRole);

/*
  Removed because this info should be fetched with users/me endpoint
  // Load SSH key data if not present in user profile
  useEffect(() => {
    const loadSshKey = async () => {
      if (currentUser && !currentUser.sshPublicKey && isEditing) {
        setLoadingSshKey(true);
        try {
          await withErrorHandling(async () => {
            const response = await getUserSshKey();
            if (response && response.sshPublicKey) {
              setProfileData(prev => ({
                ...prev,
                sshPublicKey: response.sshPublicKey
              }));
            }
          }, {
            errorMessage: t('profile.unableToLoadSshKey'),
            showError: false
          });
        } finally {
          setLoadingSshKey(false);
        }
      }
    };

    loadSshKey();
  }, [currentUser, isEditing, withErrorHandling, t]); */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel editing, reset form
      if (currentUser) {
        setProfileData({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          username: currentUser.username || currentUser.name || '',
          password: '',
          sshPublicKey: currentUser.sshPublicKey || ''
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        sshPublicKey: profileData.sshPublicKey
      };

      if (profileData.password) {
        updatedData.password = profileData.password;
      }

      const user = await withErrorHandling(async () => {
        return await updateProfile(updatedData);
      }, {
        errorMessage: t('profile.unableToUpdateProfile'),
        showError: true
      });
      
      if(user && user.id) {
        // Update current user with new data while keeping other fields
        const updatedUser = {
          ...currentUser,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          sshPublicKey: profileData.sshPublicKey,
          ...user
        };
        
        showNotification(t('profile.profileUpdatedSuccess'));
        setIsEditing(false);
        setCurrentUser(updatedUser);
        
        // Update form data with updated values
        setProfileData({
          ...profileData,
          password: '' // Reset password in form
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSshKey = async () => {
    if (window.confirm(t('profile.confirmDeleteSshKey'))) {
      try {
        await withErrorHandling(async () => {
          await deleteUserSshKey();
          setProfileData({
            ...profileData,
            sshPublicKey: ''
          });
          
          // Update the current user state to reflect the change
          const updatedUser = {
            ...currentUser,
            sshPublicKey: ''
          };
          setCurrentUser(updatedUser);
          
          showNotification(t('profile.sshKeyDeleted'));
        }, {
          errorMessage: t('profile.unableToDeleteSshKey'),
          showError: true
        });
      } catch (error) {
        console.error('Error deleting SSH key:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          {t('profile.userNotAuthenticated')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h5">{t('profile.title')}</Typography>
          <Button
            variant={isEditing ? "outlined" : "contained"}
            color={isEditing ? "error" : "primary"}
            startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
            onClick={handleToggleEdit}
            disabled={isSaving}
          >
            {isEditing ? t('profile.cancel') : t('profile.editProfile')}
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3}
            alignItems="flex-start"
          >
            {/* Left Column: Avatar and User Details */}
            <Box 
              sx={{ 
                width: { xs: '100%', md: '30%' }, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  mb: 2,
                  bgcolor: roleInfo.color,
                  border: userHighestRole === SiteRoles.GLOBAL_ADMIN ? '2px solid white' : 'none'
                }}
              >
                {currentUser.avatar || 'U'}
              </Avatar>

              <Card sx={{ width: '100%', mt: 2 }}>
                <CardContent>
                  <Stack 
                    direction="column" 
                    spacing={2}
                    sx={{ width: '100%' }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('profile.role')}
                      </Typography>
                      <Chip
                        icon={roleInfo.icon}
                        label={roleInfo.label}
                        sx={{ 
                          bgcolor: userHighestRole === SiteRoles.GLOBAL_ADMIN ? 'rgba(255, 215, 0, 0.1)' :
                                  userHighestRole === SiteRoles.FEDERATION_ADMIN ? 'rgba(244, 67, 54, 0.1)' :
                                  'rgba(25, 118, 210, 0.1)',
                          color: roleInfo.color,
                          fontWeight: 'bold',
                          border: `1px solid ${roleInfo.color}`
                        }}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                      p: 1
                    }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {t('profile.userId')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {currentUser.keycloakId || currentUser.id}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText((currentUser.keycloakId || currentUser.id).toString());
                          showNotification(profileTranslations.userIdCopied, 'info');
                        }}
                        title={profileTranslations.copyUserId}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('profile.username')}
                      </Typography>
                      <Typography variant="body1">
                        {currentUser.username || currentUser.name || ''}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Right Column: Editable Profile Fields */}
            <Box sx={{ 
              flexGrow: 1, 
              width: { xs: '100%', md: '70%' } 
            }}>
              <Stack spacing={2}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                >
                  <TextField
                    label={t('profile.firstName')}
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    required={isEditing}
                    margin="normal"
                  />
                  <TextField
                    label={t('profile.lastName')}
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    required={isEditing}
                    margin="normal"
                  />
                </Stack>
                
                <TextField
                  label={t('profile.email')}
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                  required={isEditing}
                  margin="normal"
                />
                
                {isEditing && (
                  <TextField
                    label={t('profile.newPassword')}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={profileData.password}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}

                {/* SSH Key Management Section */}
                <Accordion 
                  expanded={sshKeyExpanded} 
                  onChange={() => setSshKeyExpanded(!sshKeyExpanded)}
                  sx={{ mt: 2, bgcolor: 'background.paper' }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="ssh-key-content"
                    id="ssh-key-header"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <KeyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle1">{t('profile.sshKeyManagement')}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {loadingSshKey ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t('profile.sshKeyDescription')}
                        </Typography>
                        
                        <TextField
                          label={t('profile.sshPublicKey')}
                          name="sshPublicKey"
                          value={profileData.sshPublicKey}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          minRows={3}
                          maxRows={6}
                          margin="normal"
                          placeholder={t('profile.sshKeyPlaceholder')}
                          disabled={!isEditing}
                          InputProps={{
                            endAdornment: isEditing && profileData.sshPublicKey ? (
                              <InputAdornment position="end">
                                <Tooltip title={t('profile.deleteSshKey')}>
                                  <IconButton
                                    edge="end"
                                    onClick={handleDeleteSshKey}
                                  >
                                    <DeleteOutlineIcon color="error" />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            ) : null
                          }}
                        />
                        
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t('profile.supportedSshKeyFormats')}: RSA (ssh-rsa), Ed25519 (ssh-ed25519), ECDSA
                          </Typography>
                        </Box>
                        
                        {profileData.sshPublicKey && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              <b>{t('profile.sshKeyUsage')}:</b> 
                              <code style={{ display: 'block', padding: '8px', margin: '8px 0', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px', overflowX: 'auto' }}>
                                ssh -i /path/to/private_key user@resource-hostname
                              </code>
                            </Typography>
                          </Box>
                        )}
                        
                        {!isEditing && profileData.sshPublicKey && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            {t('profile.editToChangeSshKey')}
                          </Alert>
                        )}
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>

                {isEditing && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    mt: 2 
                  }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={isSaving}
                    >
                      {isSaving ? t('profile.saving') : t('profile.saveChanges')}
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </form>
      </Paper>
      
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

export default ProfileManagement;