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
  Snackbar
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { updateProfile } from '../../services/userService';
import useApiError from '../../hooks/useApiError';

const ProfileManagement = () => {
  const { t } = useTranslation();
  const { currentUser, setCurrentUser, loading } = useContext(AuthContext);
  const { withErrorHandling } = useApiError();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Create a translation object with the new keys
  const profileTranslations = {
    userIdCopied: t('profile.userIdCopied') || 'User ID copied to clipboard',
    copyUserId: t('profile.copyUserId') || 'Copy User ID'
  };

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    avatar: ''
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        username: currentUser.username || currentUser.name || '',
        password: '',
        avatar: currentUser.avatar || ''
      });
    }
  }, [currentUser]);

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
          avatar: currentUser.avatar || ''
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
        username: profileData.username,
        avatar: profileData.avatar
      };

      if (profileData.password) {
        updatedData.password = profileData.password;
      }

      if (profileData.avatar !== currentUser.avatar) {
        updatedData.avatar = profileData.avatar;
      }

      const user = await withErrorHandling(async () => {
        return await updateProfile(updatedData);
      }, {
        errorMessage: t('profile.unableToUpdateProfile'),
        showError: true
      });
      
      if(user && user.id) {
        // Aggiorna solo l'utente corrente con i nuovi dati mantenendo gli altri campi
        const updatedUser = {
          ...currentUser,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          username: profileData.username,
          avatar: profileData.avatar,
          // Altri campi che potrebbero essere stati aggiornati dal backend
          ...user
        };
        
        showNotification(t('profile.profileUpdatedSuccess'));
        setIsEditing(false);
        setCurrentUser(updatedUser);
        
        // Aggiorna anche i dati del form con i valori aggiornati
        setProfileData({
          ...profileData,
          password: '' // Resetta la password nel form
        });
      }
    } finally {
      setIsSaving(false);
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
                  bgcolor: currentUser.role === 'admin' ? 'secondary.main' : 'primary.main'
                }}
              >
                {profileData.avatar || currentUser.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>

              {isEditing && (
                <TextField
                  label={t('profile.avatarInitials')}
                  name="avatar"
                  value={profileData.avatar}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText={t('profile.maxTwoCharacters')}
                  inputProps={{ maxLength: 2 }}
                />
              )}

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
                        label={currentUser.role === 'admin' 
                          ? t('profile.administrator') 
                          : t('profile.user')}
                        color={currentUser.role === 'admin' ? 'secondary' : 'primary'}
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
                
                <TextField
                  label={t('profile.username')}
                  name="username"
                  value={profileData.username}
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