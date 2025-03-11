import React, { useContext, useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon 
} from '@mui/icons-material';
import { updateProfile } from '../../services/userService';
import useApiError from '../../hooks/useApiError';

const ProfileManagement = () => {
  const { currentUser, setCurrentUser, loading } = useContext(AuthContext);
  const { withErrorHandling } = useApiError();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

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

  // Mostra una notifica
  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    
    // Rimuovi la notifica dopo 6 secondi
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Prepare data for API
      const updatedData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        username: profileData.username
      };

      // Only include password if it was modified
      if (profileData.password) {
        updatedData.password = profileData.password;
      }

      // Only include avatar if it was modified
      if (profileData.avatar !== currentUser.avatar) {
        updatedData.avatar = profileData.avatar;
      }

      // Utilizzo di withErrorHandling
      const user = await withErrorHandling(async () => {
        return await updateProfile(updatedData);
      }, {
        errorMessage: 'Impossibile aggiornare il profilo',
        showError: true
      });
      
      if(user && user.id) {
        showNotification('Profilo aggiornato con successo');
        setIsEditing(false);
        setCurrentUser(user);
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
          Utente non autenticato
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Il Mio Profilo</Typography>
          <Button
            variant={isEditing ? "outlined" : "contained"}
            color={isEditing ? "error" : "primary"}
            startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
            onClick={handleToggleEdit}
            disabled={isSaving}
          >
            {isEditing ? "Annulla" : "Modifica Profilo"}
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3}
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                width: { xs: '100%', md: '30%' }, 
                maxWidth: '300px'
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
                  label="Iniziali Avatar"
                  name="avatar"
                  value={profileData.avatar}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Massimo 2 caratteri"
                  inputProps={{ maxLength: 2 }}
                />
              )}

              <Card sx={{ width: '100%', mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Ruolo:</strong> {currentUser.role === 'admin' ? 'Amministratore' : 'Utente'}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>ID Utente:</strong> {currentUser.id}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Nome"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    required={isEditing}
                    margin="normal"
                  />
                  <TextField
                    label="Cognome"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    required={isEditing}
                  />
                </Stack>
                
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                  required={isEditing}
                />
                
                <TextField
                  label="Nome Utente"
                  name="username"
                  value={profileData.username}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                  required={isEditing}
                />

                {isEditing && (
                  <TextField
                    label="Nuova Password (lascia vuoto per mantenere attuale)"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={profileData.password}
                    onChange={handleChange}
                    fullWidth
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </form>
      </Paper>
      
      {/* Notifica per le operazioni completate con successo */}
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