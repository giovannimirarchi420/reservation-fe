import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormHelperText, Box
} from '@mui/material';

const UserForm = ({ open, onClose, user, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    avatar: ''
  });
  const [errors, setErrors] = useState({});

  // Popola il form quando viene selezionato un utente
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        avatar: user.avatar || ''
      });
    } else {
      resetForm();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      avatar: ''
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Il nome è obbligatorio';
    }
    
    if (!formData.email) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Genera avatar dalle iniziali se non specificato
      let userData = { ...formData };
      
      if (!userData.avatar) {
        const nameParts = userData.name.split(' ');
        if (nameParts.length >= 2) {
          userData.avatar = `${nameParts[0][0]}${nameParts[1][0]}`;
        } else if (nameParts.length === 1) {
          userData.avatar = `${nameParts[0][0]}`;
        }
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
            label="Nome Completo"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.name}
            helperText={errors.name}
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
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="user-role-label">Ruolo</InputLabel>
            <Select
              labelId="user-role-label"
              name="role"
              value={formData.role || 'user'}
              label="Ruolo"
              onChange={handleChange}
            >
              <MenuItem value="user">Utente</MenuItem>
              <MenuItem value="admin">Amministratore</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Iniziali Avatar (opzionale)"
            name="avatar"
            fullWidth
            value={formData.avatar}
            onChange={handleChange}
            margin="normal"
            helperText="Lascia vuoto per generare automaticamente dalle iniziali del nome"
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
