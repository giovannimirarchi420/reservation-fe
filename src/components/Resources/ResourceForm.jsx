import React, { useEffect, useState } from 'react';
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
  TextField
} from '@mui/material';

const ResourceForm = ({ open, onClose, resource, resourceTypes, onSave, onDelete }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    specs: '',
    location: '',
    status: 0 // 0 = active (default)
  });
  const [errors, setErrors] = useState({});

  // Populate the form when a resource is selected
  useEffect(() => {
    if (resource) {
      setFormData({
        id: resource.id,
        name: resource.name || '',
        typeId: resource.typeId || resource.type || '',
        specs: resource.specs || '',
        location: resource.location || '',
        status: resource.status !== undefined ? resource.status : 0
      });
    } else {
      resetForm();
    }
  }, [resource]);

  const resetForm = () => {
    setFormData({
      name: '',
      typeId: '',
      specs: '',
      location: '',
      status: 0
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Remove errors when the user modifies the field
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
      newErrors.name = t('resourceForm.nameRequired');
    }

    if (!formData.typeId) {
      newErrors.typeId = t('resourceForm.typeRequired');
    }

    if (!formData.specs) {
      newErrors.specs = t('resourceForm.specificationsRequired');
    }

    if (!formData.location) {
      newErrors.location = t('resourceForm.locationRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Convert string values to numbers where appropriate
      const preparedData = {
        ...formData,
        typeId: formData.typeId ? parseInt(formData.typeId) : null,
        status: typeof formData.status === 'string' ? parseInt(formData.status) : formData.status
      };
      onSave(preparedData);
    }
  };

  return (
      <Dialog
          open={open}
          onClose={onClose}
          maxWidth="sm"
          fullWidth
      >
        <DialogTitle>{formData.id ? t('resourceForm.editResource') : t('resourceForm.newResource')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
                label={t('resourceForm.resourceName')}
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.name}
                helperText={errors.name}
            />

            <FormControl fullWidth margin="normal" required error={!!errors.typeId}>
              <InputLabel id="resource-type-label">{t('resourceForm.resourceType')}</InputLabel>
              <Select
                  labelId="resource-type-label"
                  name="typeId"
                  value={formData.typeId || ''}
                  label={t('resourceForm.resourceType')}
                  onChange={handleChange}
              >
                <MenuItem value="">{t('resourceForm.selectType')}</MenuItem>
                {resourceTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                ))}
              </Select>
              {errors.typeId && <FormHelperText>{errors.typeId}</FormHelperText>}
            </FormControl>

            <TextField
                label={t('resourceForm.specifications')}
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
                label={t('resourceForm.location')}
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
              <InputLabel id="resource-status-label">{t('resourceForm.status')}</InputLabel>
              <Select
                  labelId="resource-status-label"
                  name="status"
                  value={formData.status}
                  label={t('resourceForm.status')}
                  onChange={handleChange}
              >
                <MenuItem value={0}>{t('resourceForm.active')}</MenuItem>
                <MenuItem value={1}>{t('resourceForm.maintenance')}</MenuItem>
                <MenuItem value={2}>{t('resourceForm.unavailable')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            {t('resourceForm.cancel')}
          </Button>
          <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
          >
            {formData.id ? t('resourceForm.update') : t('resourceForm.confirm')}
          </Button>
          {formData.id && (
              <Button
                  variant="contained"
                  color="error"
                  onClick={() => onDelete(formData.id)}
              >
                {t('resourceForm.delete')}
              </Button>
          )}
        </DialogActions>
      </Dialog>
  );
};

export default ResourceForm;