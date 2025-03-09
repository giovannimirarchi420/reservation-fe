import React, { useContext, useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { updateProfile } from '../../services/userService';

const ProfileManagement = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
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
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

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

      // Call API to update profile
      await updateProfile(updatedData);
      
      setSuccessMessage('Profilo aggiornato con successo!');
      setIsEditing(false);

      // In un'app reale, qui dovremmo aggiornare il contesto dell'utente
      // con i nuovi dati, ma poiché stiamo lavorando con un mock,
      // questo passaggio viene omesso

    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Errore durante l\'aggiornamento del profilo: ' + (error.message || 'Si prega di riprovare'));
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

        {successMessage && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography color="success.dark">{successMessage}</Typography>
          </Box>
        )}

        {errorMessage && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error.dark">{errorMessage}</Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
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
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Cognome"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    required={isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    required={isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Nome Utente"
                    name="username"
                    value={profileData.username}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    required={isEditing}
                    margin="normal"
                  />
                </Grid>

                {isEditing && (
                  <Grid item xs={12}>
                    <TextField
                      label="Nuova Password (lascia vuoto per mantenere attuale)"
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
                  </Grid>
                )}

                {isEditing && (
                  <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProfileManagement;