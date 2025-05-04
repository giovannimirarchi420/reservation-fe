import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormHelperText,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress // Import CircularProgress
} from '@mui/material';
import { getRandomColor } from '../../utils/colorUtils';
import { useSite } from '../../context/SiteContext';

/**
 * Form for creating/editing a resource type
 */
const ResourceTypeForm = ({ open, onClose, resourceType, onSave, onDelete }) => {
    const { t } = useTranslation();
    const { sites, currentSite, isGlobalAdmin, isSiteAdmin } = useSite();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: getRandomColor(),
        siteId: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

    // Populate the form when a resource type is selected
    useEffect(() => {
        if (resourceType) {
            setFormData({
                id: resourceType.id,
                name: resourceType.name || '',
                description: resourceType.description || '',
                color: resourceType.color || getRandomColor(),
                siteId: resourceType.siteId || ''
            });
        } else {
            resetForm();
        }
    }, [resourceType, currentSite]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: getRandomColor(),
            // If user is in a site context or is a site admin, pre-select their site
            siteId: currentSite ? currentSite.id : ''
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
            newErrors.name = t('resourceType.nameRequired');
        }

        if (!formData.color || !/^#[0-9A-F]{6}$/i.test(formData.color)) {
            newErrors.color = t('resourceType.invalidColorCode');
        }

        if (!formData.siteId) {
            newErrors.siteId = t('resourceType.siteRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => { // Make handleSubmit async
        if (validateForm()) {
            setIsSubmitting(true); // Set submitting to true
            try {
                await onSave(formData); // Wait for save operation
            } catch (error) {
                console.error("Error saving resource type:", error);
                // Optionally show an error message to the user
            } finally {
                setIsSubmitting(false); // Set submitting to false
            }
        }
    };

    const generateRandomColor = () => {
        const newColor = getRandomColor();
        setFormData({
            ...formData,
            color: newColor
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{formData.id ? t('resourceType.editResourceType') : t('resourceType.newResourceType')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <TextField
                        label={t('resourceType.typeName')}
                        name="name"
                        fullWidth
                        value={formData.name}
                        onChange={handleChange}
                        margin="normal"
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    {/* Site selector */}
                    <FormControl fullWidth margin="normal" required error={!!errors.siteId}>
                        <InputLabel id="site-label">{t('resourceType.site')}</InputLabel>
                        <Select
                            labelId="site-label"
                            name="siteId"
                            value={formData.siteId || ''}
                            label={t('resourceType.site')}
                            onChange={handleChange}
                            disabled={!isGlobalAdmin()} // Only global admins can change the site
                        >
                            <MenuItem value="">{t('resourceType.selectSite')}</MenuItem>
                            {sites.map(site => (
                                <MenuItem 
                                    key={site.id}
                                    value={site.id}
                                    disabled={!isGlobalAdmin() && !isSiteAdmin(site.id)}
                                >
                                    {site.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.siteId && <FormHelperText>{errors.siteId}</FormHelperText>}
                    </FormControl>

                    <TextField
                        label={t('resourceType.description')}
                        name="description"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                    />

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2, gap: 2 }}>
                        <TextField
                            label={t('resourceType.color')}
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            margin="normal"
                            required
                            error={!!errors.color}
                            helperText={errors.color}
                            sx={{ flexGrow: 1 }}
                            inputProps={{
                                maxLength: 7
                            }}
                        />

                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                backgroundColor: formData.color || '#cccccc',
                                border: '1px solid #ccc',
                                mt: 3
                            }}
                        />

                        <Button
                            variant="outlined"
                            size="small"
                            onClick={generateRandomColor}
                            sx={{ mt: 3 }}
                        >
                            {t('resourceType.random')}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}> {/* Disable cancel button */}
                    {t('resourceType.cancel')}
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting} // Disable submit button
                    sx={{ minWidth: 100 }} // Ensure button width doesn't jump too much
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (formData.id ? t('resourceType.update') : t('resourceType.confirm'))} {/* Show progress */}
                </Button>
                {formData.id && (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => onDelete(formData.id)}
                        disabled={isSubmitting} // Disable delete button
                    >
                        {t('resourceType.delete')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ResourceTypeForm;