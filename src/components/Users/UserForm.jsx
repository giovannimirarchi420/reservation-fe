import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';

const UserForm = ({ open, onClose, user, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    avatar: '',
    roles: ['USER']
  });
  const [errors, setErrors] = useState({});

  // Popola il form quando viene selezionato un utente
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        username: user.username || user.name || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        password: '',  // Per motivi di sicurezza, non precompilare la password
        avatar: user.avatar || '',
        roles: user.roles || (user.role === 'admin' ? ['ADMIN'] : ['USER'])
      });
    } else {
      resetForm();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      avatar: '',
      roles: ['USER']
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Rimuovi errori quando l'utente modifica il campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    // Garantisci che roles sia sempre un array
    const roles = Array.isArray(value) ? value : [value];
    setFormData({
      ...formData,
      roles
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Il nome utente è obbligatorio';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Il nome è obbligatorio';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Il cognome è obbligatorio';
    }

    // Richiedi la password solo per i nuovi utenti
    if (!formData.id && !formData.password) {
      newErrors.password = 'La password è obbligatoria per i nuovi utenti';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Genera avatar dalle iniziali se non specificato
      let userData = { ...formData };

      if (!userData.avatar) {
        const firstInitial = userData.firstName ? userData.firstName[0] : '';
        const lastInitial = userData.lastName ? userData.lastName[0] : '';
        userData.avatar = `${firstInitial}${lastInitial}`.toUpperCase();
      }

      // Se è un aggiornamento e la password è vuota, rimuovila
      if (userData.id && !userData.password) {
        const { password, ...dataWithoutPassword } = userData;
        userData = dataWithoutPassword;
      }

      onSave(userData);
    }
  };

  return (
      <Dialog
          open={open}
          onClose={onClose}
          maxWidth="sm"
          fullWidth
      >
        <DialogTitle>{formData.id ? 'Modifica Utente' : 'Nuovo Utente'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
                label="Nome Utente"
                name="username"
                fullWidth
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.username}
                helperText={errors.username}
            />

            <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.email}
                helperText={errors.email}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                  label="Nome"
                  name="firstName"
                  fullWidth
                  value={formData.firstName}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!errors.firstName}
                  helperText={errors.firstName}
              />

              <TextField
                  label="Cognome"
                  name="lastName"
                  fullWidth
                  value={formData.lastName}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!errors.lastName}
                  helperText={errors.lastName}
              />
            </Box>

            <TextField
                label={formData.id ? "Password (lascia vuoto per non modificare)" : "Password"}
                name="password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required={!formData.id}
                error={!!errors.password}
                helperText={errors.password}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="user-role-label">Ruolo</InputLabel>
              <Select
                  labelId="user-role-label"
                  name="roles"
                  value={formData.roles || ['USER']}
                  label="Ruolo"
                  onChange={handleRoleChange}
                  multiple
              >
                <MenuItem value="USER">Utente</MenuItem>
                <MenuItem value="ADMIN">Amministratore</MenuItem>
              </Select>
            </FormControl>

            <TextField
                label="Iniziali Avatar (opzionale)"
                name="avatar"
                fullWidth
                value={formData.avatar}
                onChange={handleChange}
                margin="normal"
                helperText="Lascia vuoto per generare automaticamente dalle iniziali del nome e cognome"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Annulla
          </Button>
          <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
          >
            {formData.id ? 'Aggiorna' : 'Conferma'}
          </Button>
          {formData.id && (
              <Button
                  variant="contained"
                  color="error"
                  onClick={() => onDelete(formData.id)}
              >
                Elimina
              </Button>
          )}
        </DialogActions>
      </Dialog>
  );
};

export default UserForm;