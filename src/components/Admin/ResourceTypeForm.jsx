import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormHelperText
} from '@mui/material';
import { getRandomColor } from '../../utils/colorUtils';

/**
 * Form per la creazione/modifica di un tipo di risorsa
 */
const ResourceTypeForm = ({ open, onClose, resourceType, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: getRandomColor()
    });
    const [errors, setErrors] = useState({});

    // Popola il form quando viene selezionato un tipo di risorsa
    useEffect(() => {
        if (resourceType) {
            setFormData({
                id: resourceType.id,
                name: resourceType.name || '',
                description: resourceType.description || '',
                color: resourceType.color || getRandomColor()
            });
        } else {
            resetForm();
        }
    }, [resourceType]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: getRandomColor()
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

        if (!formData.color || !/^#[0-9A-F]{6}$/i.test(formData.color)) {
            newErrors.color = 'Il colore deve essere un codice esadecimale valido (es. #1976d2)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSave(formData);
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
            <DialogTitle>{formData.id ? 'Modifica Tipo Risorsa' : 'Nuovo Tipo Risorsa'}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <TextField
                        label="Nome Tipo"
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
                        label="Descrizione"
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
                            label="Colore"
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
                            Casuale
                        </Button>
                    </Box>

                    {errors.color && <FormHelperText error>{errors.color}</FormHelperText>}
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

export default ResourceTypeForm;