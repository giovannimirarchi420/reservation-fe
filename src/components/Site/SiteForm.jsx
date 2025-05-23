import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { createSite, updateSite } from '../../services/siteService';
import useApiError from '../../hooks/useApiError';

const SiteForm = ({ open, onClose, federation, onSave }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // Initialize form data when site changes
  useEffect(() => {
    if (federation) {
      setFormData({
        id: federation.id,
        name: federation.name || '',
        description: federation.description || '',
        isPrivate: false
      });
    } else {
      resetForm();
    }
  }, [federation]);

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setErrors({});
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = t('sites.nameRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await withErrorHandling(async () => {
        let savedFederation;
        
        if (formData.id) {
          // Update existing site
          savedFederation = await updateSite(formData.id, formData);
        } else {
          // Create new site
          savedFederation = await createSite(formData, isPrivate);
        }
        
        if (savedFederation) {
          onSave(savedFederation);
        }
      }, {
        errorMessage: formData.id 
          ? t('sites.unableToUpdateSite', { name: formData.name }) 
          : t('sites.unableToCreateSite', { name: formData.name }),
        showError: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {t('sites.newSite')}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isPrivate}
              name="isPrivate"
              value={isPrivate}
              onChange={() => setIsPrivate((isPrivate) => !isPrivate)}
            />
          }
          label={t('sites.privateSite')}
        />
          <TextField
            label={t('sites.name')}
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.name}
            helperText={errors.name}
            autoFocus
          />
          
          <TextField
            label={t('sites.description')}
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
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
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? t('common.saving') : (formData.id ? t('common.update') : t('common.save'))}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SiteForm;