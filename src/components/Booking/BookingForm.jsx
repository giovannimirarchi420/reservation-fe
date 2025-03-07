import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Box, FormHelperText
} from '@mui/material';
import { fetchUsers } from '../../services/userService';
import { formatDateForInput } from '../../utils/dateUtils';

const BookingForm = ({ open, onClose, booking, onSave, onDelete, resources }) => {
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

  // Carica utenti
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    
    loadUsers();
  }, []);

  // Popola il form quando viene selezionato un evento
  useEffect(() => {
    if (booking) {
      setFormData({
        id: booking.id,
        title: booking.title || '',
        resourceId: booking.resourceId || '',
        start: booking.start,
        end: booking.end,
        description: booking.description || '',
        userId: booking.userId || (users.length > 0 ? users[0].id : '')
      });
    } else {
      resetForm();
    }
  }, [booking, users]);

  const resetForm = () => {
    setFormData({
      title: '',
      resourceId: '',
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000),
      description: '',
      userId: users.length > 0 ? users[0].id : ''
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

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: new Date(value)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title) {
      newErrors.title = 'Il titolo è obbligatorio';
    }
    
    if (!formData.resourceId) {
      newErrors.resourceId = 'La risorsa è obbligatoria';
    }
    
    if (!formData.start) {
      newErrors.start = 'La data di inizio è obbligatoria';
    }
    
    if (!formData.end) {
      newErrors.end = 'La data di fine è obbligatoria';
    } else if (formData.end <= formData.start) {
      newErrors.end = 'La data di fine deve essere successiva alla data di inizio';
    }
    
    if (!formData.userId) {
      newErrors.userId = 'L\'utente è obbligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{formData.id ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            label="Titolo"
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
            <InputLabel id="resource-select-label">Risorsa</InputLabel>
            <Select
              labelId="resource-select-label"
              name="resourceId"
              value={formData.resourceId || ''}
              label="Risorsa"
              onChange={handleChange}
            >
              <MenuItem value="">Seleziona risorsa</MenuItem>
              {resources.map(resource => (
                <MenuItem key={resource.id} value={resource.id}>
                  {resource.name} - {resource.specs}
                </MenuItem>
              ))}
            </Select>
            {errors.resourceId && <FormHelperText>{errors.resourceId}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth margin="normal" required error={!!errors.userId}>
            <InputLabel id="user-select-label">Utente</InputLabel>
            <Select
              labelId="user-select-label"
              name="userId"
              value={formData.userId || ''}
              label="Utente"
              onChange={handleChange}
            >
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
            {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
          </FormControl>
          
          {/* Sostituito Grid con Box utilizzando CSS Grid */}
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: 2, 
              mt: 1 
            }}
          >
            <TextField
              label="Data/Ora Inizio"
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
              label="Data/Ora Fine"
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
          
          <TextField
            label="Descrizione"
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

export default BookingForm;
