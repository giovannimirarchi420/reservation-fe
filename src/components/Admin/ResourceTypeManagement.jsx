import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    InputAdornment,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    TextField,
    Typography,
    Snackbar,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    fetchResourceTypes,
    createResourceType,
    updateResourceType,
    deleteResourceType
} from '../../services/resourceTypeService';
import ResourceTypeForm from './ResourceTypeForm';
import { getContrastTextColor } from '../../utils/colorUtils';
import useApiError from '../../hooks/useApiError';

const ResourceTypeManagement = ({ openFormOnMount, resetOpenFormFlag }) => {
    const { t } = useTranslation();
    const { withErrorHandling } = useApiError();
    const [resourceTypes, setResourceTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedResourceType, setSelectedResourceType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [activeResourceTypeId, setActiveResourceTypeId] = useState(null);
    const [notification, setNotification] = useState(null);

    // Show a notification
    const showNotification = (message, severity = 'success') => {
        setNotification({ message, severity });
        
        // Remove the notification after 6 seconds
        setTimeout(() => {
            setNotification(null);
        }, 6000);
    };

    // Load resource types
    useEffect(() => {
        const loadResourceTypes = async () => {
            setIsLoading(true);
            try {
                await withErrorHandling(async () => {
                    const data = await fetchResourceTypes();
                    setResourceTypes(data);
                }, {
                    errorMessage: t('errors.unableToLoadResourceTypes'),
                    showError: true
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadResourceTypes();
    }, [withErrorHandling, t]);

    // Effect to handle opening the form when directed from another component
    useEffect(() => {
        if (openFormOnMount) {
            setSelectedResourceType(null);
            setIsFormOpen(true);
            // Reset the flag after opening
            resetOpenFormFlag();
        }
    }, [openFormOnMount, resetOpenFormFlag]);

    // Filter resource types based on search
    const filteredResourceTypes = resourceTypes.filter(type => {
        return searchTerm === '' ||
            type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const handleOpenMenu = (event, resourceTypeId) => {
        setMenuAnchorEl(event.currentTarget);
        setActiveResourceTypeId(resourceTypeId);
    };

    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
        setActiveResourceTypeId(null);
    };

    const handleAddResourceType = () => {
        setSelectedResourceType(null);
        setIsFormOpen(true);
    };

    const handleEditResourceType = (resourceType) => {
        setSelectedResourceType(resourceType);
        setIsFormOpen(true);
        handleCloseMenu();
    };

    const handleSaveResourceType = async (resourceTypeData) => {
        const result = await withErrorHandling(async () => {
            if (resourceTypeData.id) {
                // Update an existing resource type
                const updatedResourceType = await updateResourceType(resourceTypeData.id, resourceTypeData);
                return { updated: true, resourceType: updatedResourceType };
            } else {
                // Create a new resource type
                const newResourceType = await createResourceType(resourceTypeData);
                return { updated: false, resourceType: newResourceType };
            }
        }, {
            errorMessage: resourceTypeData.id 
                ? t('resourceType.unableToUpdateResourceType', {name: resourceTypeData.name}) 
                : t('resourceType.unableToCreateResourceType', {name: resourceTypeData.name}),
            showError: true
        });

        if (result) {
            if (result.updated) {
                // Update existing resource types
                setResourceTypes(resourceTypes.map(type =>
                    type.id === result.resourceType.id ? result.resourceType : type
                ));
                showNotification(t('resourceType.resourceTypeUpdatedSuccess', {name: result.resourceType.name}));
            } else {
                // Add new resource type
                setResourceTypes([...resourceTypes, result.resourceType]);
                showNotification(t('resourceType.resourceTypeCreatedSuccess', {name: result.resourceType.name}));
            }
            setIsFormOpen(false);
        }
    };

    const handleDeleteResourceType = async (resourceTypeId) => {
        // Find the resource type name before deleting it
        const typeToDelete = resourceTypes.find(t => t.id === resourceTypeId);
        const typeName = typeToDelete ? typeToDelete.name : t('resourceType.selected');
    
        const confirmation = window.confirm(
            `${t('resourceType.confirmDeleteResourceType')} "${typeName}"? ${t('resourceType.actionCannotBeUndone')}`
        );
        
        if (!confirmation) {
            handleCloseMenu();
            return;
        }
    
        try {
            // Chiudi il menu prima di iniziare l'operazione
            handleCloseMenu();
            
            const response = await withErrorHandling(async () => {
                return await deleteResourceType(resourceTypeId);
            }, {
                errorMessage: t('resourceType.unableToDeleteResourceType', {name: typeName}),
                showError: true
            });
    
            // Check if response exists and has success property set to true
            // or if response is truthy (for backward compatibility)
            if ((response && response.success === true) || response === true) {
                setResourceTypes(resourceTypes.filter(type => type.id !== resourceTypeId));
                setIsFormOpen(false);
                showNotification(t('resourceType.resourceTypeDeletedSuccess', {name: typeName}));
            }
        } catch (error) {
            // In caso di errore non gestito, assicurati che il menu sia chiuso
            handleCloseMenu();
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h6">{t('resourceType.title')}</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddResourceType}
                >
                    {t('resourceType.addType')}
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    placeholder={t('resourceType.searchResourceTypes')}
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { 
                        xs: '1fr', 
                        md: 'repeat(2, 1fr)', 
                        lg: 'repeat(3, 1fr)' 
                    }, 
                    gap: 3 
                }}>
                    {filteredResourceTypes.length === 0 ? (
                        <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                {t('resourceType.noResourceTypesFound')}
                            </Typography>
                        </Box>
                    ) : (
                        filteredResourceTypes.map(resourceType => (
                            <Card key={resourceType.id}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Box
                                            sx={{
                                                backgroundColor: resourceType.color,
                                                color: getContrastTextColor(resourceType.color),
                                                borderRadius: 2,
                                                px: 2,
                                                py: 1,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {resourceType.name}
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleOpenMenu(e, resourceType.id)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>

                                    {resourceType.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {resourceType.description}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('resourceType.id')} {resourceType.id}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('resourceType.color')} {resourceType.color}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>
            )}

            {/* Context menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleCloseMenu}
            >
                <MenuItem
                    onClick={() => {
                        const resourceType = resourceTypes.find(t => t.id === activeResourceTypeId);
                        if (resourceType) {
                            handleEditResourceType(resourceType);
                        }
                    }}
                >
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('resourceType.edit')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleDeleteResourceType(activeResourceTypeId)}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary={t('resourceType.delete')} primaryTypographyProps={{ color: 'error' }} />
                </MenuItem>
            </Menu>

            {/* Form for creating/editing */}
            <ResourceTypeForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                resourceType={selectedResourceType}
                onSave={handleSaveResourceType}
                onDelete={handleDeleteResourceType}
            />

            {/* Notification for successful operations */}
            <Snackbar
                open={!!notification}
                autoHideDuration={6000}
                onClose={() => setNotification(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                {notification && (
                    <Alert
                        onClose={() => setNotification(null)}
                        severity={notification.severity}
                        sx={{ width: '100%' }}
                    >
                        {notification.message}
                    </Alert>
                )}
            </Snackbar>
        </Box>
    );
};

export default ResourceTypeManagement;