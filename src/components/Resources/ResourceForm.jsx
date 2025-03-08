import React, {useEffect, useState} from 'react';
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
    TextField
} from '@mui/material';

const ResourceForm = ({ open, onClose, resource, resourceTypes, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    specs: '',
    location: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

  // Popola il form quando viene selezionata una risorsa
  useEffect(() => {
    if (resource) {
      setFormData({
        id: resource.id,
        name: resource.name || '',
        type: resource.type || '',
        specs: resource.specs || '',
        location: resource.location || '',
        status: resource.status || 'active'
      });
    } else {
      resetForm();
    }
  }, [resource]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      specs: '',
      location: '',
      status: 'active'
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
    
    if (!formData.type) {
      newErrors.type = 'Il tipo è obbligatorio';
    }
    
    if (!formData.specs) {
      newErrors.specs = 'Le specifiche sono obbligatorie';
    }
    
    if (!formData.location) {
      newErrors.location = 'L\'ubicazione è obbligatoria';
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
      <DialogTitle>{formData.id ? 'Modifica Risorsa' : 'Nuova Risorsa'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            label="Nome Risorsa"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.name}
            helperText={errors.name}
          />
          
          <FormControl fullWidth margin="normal" required error={!!errors.type}>
            <InputLabel id="resource-type-label">Tipo Risorsa</InputLabel>
            <Select
              labelId="resource-type-label"
              name="type"
              value={formData.type || ''}
              label="Tipo Risorsa"
              onChange={handleChange}
            >
              <MenuItem value="">Seleziona tipo</MenuItem>
              {resourceTypes.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>
          
          <TextField
            label="Specifiche"
            name="specs"
            fullWidth
            value={formData.specs}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.specs}
            helperText={errors.specs}
          />
          
          <TextField
            label="Ubicazione"
            name="location"
            fullWidth
            value={formData.location}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.location}
            helperText={errors.location}
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="resource-status-label">Stato</InputLabel>
            <Select
              labelId="resource-status-label"
              name="status"
              value={formData.status || 'active'}
              label="Stato"
              onChange={handleChange}
            >
              <MenuItem value="active">Attivo</MenuItem>
              <MenuItem value="maintenance">Manutenzione</MenuItem>
            </Select>
          </FormControl>
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

export default ResourceForm;
