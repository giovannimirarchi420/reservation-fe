import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, TextField, 
  InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ResourceCard from '../Resources/ResourceCard';
import ResourceForm from '../Resources/ResourceForm';
import { fetchResources, createResource, updateResource, deleteResource } from '../../services/resourceService';
import { fetchResourceTypes } from '../../services/resourceService';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Carica risorse e tipi di risorsa
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [resourcesData, resourceTypesData] = await Promise.all([
          fetchResources(),
          fetchResourceTypes()
        ]);
        setResources(resourcesData);
        setResourceTypes(resourceTypesData);
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filtra risorse in base alla ricerca e al tipo
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.specs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.location.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = filterType === '' || resource.type === parseInt(filterType);
    
    return matchesSearch && matchesType;
  });

  const handleAddResource = () => {
    setSelectedResource(null);
    setIsResourceModalOpen(true);
  };

  const handleEditResource = (resource) => {
    setSelectedResource(resource);
    setIsResourceModalOpen(true);
  };

  const handleSaveResource = async (resourceData) => {
    try {
      if (resourceData.id) {
        // Aggiorna una risorsa esistente
        const updatedResource = await updateResource(resourceData.id, resourceData);
        setResources(resources.map(resource => 
          resource.id === updatedResource.id ? updatedResource : resource
        ));
      } else {
        // Crea una nuova risorsa
        const newResource = await createResource(resourceData);
        setResources([...resources, newResource]);
      }
      setIsResourceModalOpen(false);
    } catch (error) {
      console.error('Error saving resource:', error);
      // Qui potrebbe essere visualizzato un messaggio di errore
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await deleteResource(resourceId);
      setResources(resources.filter(resource => resource.id !== resourceId));
      setIsResourceModalOpen(false);
    } catch (error) {
      console.error('Error deleting resource:', error);
      // Qui potrebbe essere visualizzato un messaggio di errore
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h6">Risorse Disponibili</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddResource}
        >
          Aggiungi Risorsa
        </Button>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Cerca risorse..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          select
          label="Tipo"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          SelectProps={{
            native: true,
          }}
          size="small"
          sx={{ minWidth: 150 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterListIcon />
              </InputAdornment>
            ),
          }}
        >
          <option value="">Tutti i tipi</option>
          {resourceTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </TextField>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredResources.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nessuna risorsa trovata.
              </Typography>
            </Box>
          ) : (
            filteredResources.map(resource => (
              <Grid item xs={12} md={6} lg={4} key={resource.id}>
                <ResourceCard
                  resource={resource}
                  resourceType={resourceTypes.find(t => t.id === resource.type)}
                  onEdit={() => handleEditResource(resource)}
                  onDelete={() => handleDeleteResource(resource.id)}
                />
              </Grid>
            ))
          )}
        </Grid>
      )}
      
      <ResourceForm
        open={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        resource={selectedResource}
        resourceTypes={resourceTypes}
        onSave={handleSaveResource}
        onDelete={handleDeleteResource}
      />
    </Box>
  );
};

export default ResourceManagement;
