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
import { useFederation } from '../../context/FederationContext';

const ResourceForm = ({ open, onClose, resource, resourceTypes, allResources, onSave, onDelete }) => {
  const { t } = useTranslation();
  const { federations, currentFederation, isGlobalAdmin, isFederationAdmin } = useFederation();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    specs: '',
    location: '',
    status: 0, // 0 = active (default)
    parentId: '', // null or empty string means no parent
    federationId: ''
  });
  const [errors, setErrors] = useState({});

  // Populate the form when a resource is selected
  useEffect(() => {
    if (resource) {
      // Convert string status to numeric value if needed
      let statusValue = 0; // Default to ACTIVE
      
      // Handle string status
      switch(resource.status) {
        case "ACTIVE": statusValue = 0; break;
        case "MAINTENANCE": statusValue = 1; break;
        case "UNAVAILABLE": statusValue = 2; break;
        default: statusValue = resource.status !== undefined ? resource.status : 0; // Default to ACTIVE
      }
      
      setFormData({
        id: resource.id,
        name: resource.name || '',
        typeId: resource.typeId || resource.type || '',
        specs: resource.specs || '',
        location: resource.location || '',
        status: statusValue,
        parentId: resource.parentId || '',
        federationId: resource.federationId || ''
      });
    } else {
      resetForm();
    }
  }, [resource, currentFederation]);

  const resetForm = () => {
    setFormData({
      name: '',
      typeId: '',
      specs: '',
      location: '',
      status: 0,
      parentId: '',
      // If user is in a federation context or is a federation admin, pre-select their federation
      federationId: currentFederation ? currentFederation.id : ''
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

    if (!formData.federationId) {
      newErrors.federationId = t('resourceForm.federationRequired');
    }

    // Check for circular reference in parent-child relationship
    if (formData.parentId && formData.id) {
      let currentParentId = formData.parentId;
      const visited = new Set([formData.id]);
      
      while (currentParentId) {
        if (visited.has(currentParentId)) {
          newErrors.parentId = t('resourceForm.circularReference');
          break;
        }
        
        visited.add(currentParentId);
        const parentResource = allResources.find(r => r.id === currentParentId);
        currentParentId = parentResource ? parentResource.parentId : null;
      }
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
        status: typeof formData.status === 'string' ? parseInt(formData.status) : formData.status,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        federationId: formData.federationId
      };
      onSave(preparedData);
    }
  };

  // Filter parent resources to only show those from the same federation
  const getFilteredParentResources = () => {
    if (!formData.federationId) return [];
    
    return allResources.filter(r => 
      r.id !== formData.id && // Cannot be its own parent
      r.federationId === formData.federationId // Must be in the same federation
    );
  };

  // Filter resource types to only show those from the same federation
  const getFilteredResourceTypes = () => {
    const federationIdToUse = formData.federationId || (currentFederation ? currentFederation.id : '');
    console.log(federationIdToUse)
    if (!federationIdToUse) return [];
    
    return resourceTypes.filter(type => 
      type.federationId === formData.federationId
    );
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

            {/* Federation selector */}
            <FormControl fullWidth margin="normal" required error={!!errors.federationId}>
              <InputLabel id="federation-label">{t('resourceForm.federation')}</InputLabel>
              <Select
                  labelId="federation-label"
                  name="federationId"
                  value={formData.federationId || ''}
                  label={t('resourceForm.federation')}
                  onChange={handleChange}
                  disabled={!isGlobalAdmin()} // Only global admins can change the federation
              >
                <MenuItem value="">{t('resourceForm.selectFederation')}</MenuItem>
                {federations.map(federation => (
                    <MenuItem 
                      key={federation.id} 
                      value={federation.id}
                      disabled={!isGlobalAdmin() && !isFederationAdmin(federation.id)}
                    >
                      {federation.name}
                    </MenuItem>
                ))}
              </Select>
              {errors.federationId && <FormHelperText>{errors.federationId}</FormHelperText>}
            </FormControl>

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
                {getFilteredResourceTypes().map(type => (
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

            <FormControl fullWidth margin="normal" error={!!errors.parentId}>
              <InputLabel id="parent-resource-label">{t('resourceForm.parentResource')}</InputLabel>
              <Select
                labelId="parent-resource-label"
                name="parentId"
                value={formData.parentId || ''}
                label={t('resourceForm.parentResource')}
                onChange={handleChange}
              >
                <MenuItem value="">{t('resourceForm.noParent')}</MenuItem>
                {getFilteredParentResources().map(r => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.parentId || t('resourceForm.parentResourceHelp')}
              </FormHelperText>
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