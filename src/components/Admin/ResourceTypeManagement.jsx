import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    TextField,
    Typography
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

const ResourceTypeManagement = ({ openFormOnMount, resetOpenFormFlag }) => {
    const [resourceTypes, setResourceTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedResourceType, setSelectedResourceType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [activeResourceTypeId, setActiveResourceTypeId] = useState(null);

    // Effect to handle opening the form when directed from another component
    useEffect(() => {
        if (openFormOnMount) {
            setSelectedResourceType(null);
            setIsFormOpen(true);
            // Reset the flag after opening
            resetOpenFormFlag();
        }
    }, [openFormOnMount, resetOpenFormFlag]);

    // Carica tipi di risorsa
    useEffect(() => {
        const loadResourceTypes = async () => {
            setIsLoading(true);
            try {
                const data = await fetchResourceTypes();
                setResourceTypes(data);
            } catch (error) {
                console.error('Error loading resource types:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadResourceTypes();
    }, []);

    // Filtra tipi di risorsa in base alla ricerca
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
        try {
            if (resourceTypeData.id) {
                // Aggiorna un tipo di risorsa esistente
                const updatedResourceType = await updateResourceType(resourceTypeData.id, resourceTypeData);
                setResourceTypes(resourceTypes.map(type =>
                    type.id === updatedResourceType.id ? updatedResourceType : type
                ));
            } else {
                // Crea un nuovo tipo di risorsa
                const newResourceType = await createResourceType(resourceTypeData);
                setResourceTypes([...resourceTypes, newResourceType]);
            }
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error saving resource type:', error);
            // Qui potrebbe essere visualizzato un messaggio di errore
        }
    };

    const handleDeleteResourceType = async (resourceTypeId) => {
        try {
            await deleteResourceType(resourceTypeId);
            setResourceTypes(resourceTypes.filter(type => type.id !== resourceTypeId));
            setIsFormOpen(false);
            handleCloseMenu();
        } catch (error) {
            console.error('Error deleting resource type:', error);
            // Qui potrebbe essere visualizzato un messaggio di errore
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h6">Tipi di Risorse</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddResourceType}
                >
                    Aggiungi Tipo
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    placeholder="Cerca tipi di risorsa..."
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
                <Grid container spacing={3}>
                    {filteredResourceTypes.length === 0 ? (
                        <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                Nessun tipo di risorsa trovato.
                            </Typography>
                        </Box>
                    ) : (
                        filteredResourceTypes.map(resourceType => (
                            <Grid item xs={12} md={6} lg={4} key={resourceType.id}>
                                <Card>
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
                                                ID: {resourceType.id}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Colore: {resourceType.color}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Menu contestuale */}
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
                    <ListItemText>Modifica</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleDeleteResourceType(activeResourceTypeId)}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Elimina" primaryTypographyProps={{ color: 'error' }} />
                </MenuItem>
            </Menu>

            {/* Form per creazione/modifica */}
            <ResourceTypeForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                resourceType={selectedResourceType}
                onSave={handleSaveResourceType}
                onDelete={handleDeleteResourceType}
            />
        </Box>
    );
};

export default ResourceTypeManagement;