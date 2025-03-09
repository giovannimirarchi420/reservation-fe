import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CategoryIcon from '@mui/icons-material/Category';
import ResourceCard from '../Resources/ResourceCard';
import ResourceForm from '../Resources/ResourceForm';
import {
  createResource,
  deleteResource,
  fetchResources,
  updateResource,
  ResourceStatus
} from '../../services/resourceService';
import {createResourceType, fetchResourceTypes} from '../../services/resourceTypeService';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [needsRefresh, setNeedsRefresh] = useState(false);

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
  }, [needsRefresh]);

  // Filtra risorse in base alla ricerca, al tipo e allo stato
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' ||
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.specs.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === '' || resource.typeId === parseInt(filterType);

    const matchesStatus = filterStatus === '' ||
        resource.status === parseInt(filterStatus);

    return matchesSearch && matchesType && matchesStatus;
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
      // Assicurati che status e typeId siano numeri
      const preparedData = {
        ...resourceData,
        status: Number(resourceData.status),
        typeId: Number(resourceData.typeId)
      };

      if (preparedData.id) {
        // Aggiorna una risorsa esistente
        const updatedResource = await updateResource(preparedData.id, preparedData);
        setResources(resources.map(resource =>
            resource.id === updatedResource.id ? updatedResource : resource
        ));
      } else {
        // Crea una nuova risorsa
        const newResource = await createResource(preparedData);
        setResources([...resources, newResource]);
      }
      setIsResourceModalOpen(false);
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Errore nel salvataggio della risorsa: ' + (error.message || 'Controlla i dati inseriti'));
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await deleteResource(resourceId);
      setResources(resources.filter(resource => resource.id !== resourceId));
      setIsResourceModalOpen(false);
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Errore nell\'eliminazione della risorsa');
    }
  };

  // Funzione per aggiungere rapidamente un nuovo tipo di risorsa
  const handleAddResourceType = async () => {
    try {
      const name = prompt('Inserisci il nome del nuovo tipo di risorsa:');
      if (!name) return; // Annullato dall'utente

      const newType = await createResourceType({
        name,
        description: '',
        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') // Colore casuale
      });

      setResourceTypes([...resourceTypes, newType]);
      setFilterType(newType.id.toString());
      setNeedsRefresh(prev => !prev); // Forza un aggiornamento
    } catch (error) {
      console.error('Error creating resource type:', error);
      alert('Errore nella creazione del tipo di risorsa. Riprova.');
    }
  };

  // Label per gli stati
  const getStatusLabel = (statusCode) => {
    switch (Number(statusCode)) {
      case ResourceStatus.ACTIVE:
        return 'Attivo';
      case ResourceStatus.MAINTENANCE:
        return 'Manutenzione';
      case ResourceStatus.UNAVAILABLE:
        return 'Non disponibile';
      default:
        return 'Sconosciuto';
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

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
              placeholder="Cerca risorse..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: '200px' }}
              InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                ),
              }}
          />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
                select
                label="Tipo"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
              <MenuItem value="">Tutti i tipi</MenuItem>
              {resourceTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
              ))}
            </TextField>

            <TextField
                select
                label="Stato"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Tutti gli stati</MenuItem>
              <MenuItem value={ResourceStatus.ACTIVE}>Attivo</MenuItem>
              <MenuItem value={ResourceStatus.MAINTENANCE}>Manutenzione</MenuItem>
              <MenuItem value={ResourceStatus.UNAVAILABLE}>Non disponibile</MenuItem>
            </TextField>

            <Tooltip title="Aggiungi nuovo tipo">
              <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddResourceType}
                  sx={{ minWidth: 'auto', height: 40 }}
              >
                <CategoryIcon />
              </Button>
            </Tooltip>
          </Box>
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