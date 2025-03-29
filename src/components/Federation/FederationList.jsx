import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import DomainIcon from '@mui/icons-material/Domain';
import { fetchFederations, deleteFederation } from '../../services/federationService';
import FederationForm from './FederationForm';
import FederationDetailsDrawer from './FederationDetailsDrawer';
import useApiError from '../../hooks/useApiError';

const FederationList = () => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const [federations, setFederations] = useState([]);
  const [filteredFederations, setFilteredFederations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFederation, setSelectedFederation] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load federations
  useEffect(() => {
    loadFederations();
  }, []);

  // Filter federations when search term changes
  useEffect(() => {
    const filtered = federations.filter(federation => 
      federation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (federation.description && federation.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredFederations(filtered);
  }, [federations, searchTerm]);

  // Load federations from API
  const loadFederations = async () => {
    setIsLoading(true);
    try {
      await withErrorHandling(async () => {
        const federationsData = await fetchFederations();
        console.log(federationsData)
        setFederations(federationsData);
        setFilteredFederations(federationsData);
      }, {
        errorMessage: t('federations.unableToLoadFederations'),
        showError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show a notification
  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    setTimeout(() => setNotification(null), 6000);
  };

  // Handle add federation
  const handleAddFederation = () => {
    setSelectedFederation(null);
    setIsFormOpen(true);
  };

  // Handle edit federation
  const handleEditFederation = (federation) => {
    setSelectedFederation(federation);
    setIsFormOpen(true);
  };

  // Handle view federation details
  const handleViewFederationDetails = (federation) => {
    setSelectedFederation(federation);
    setIsDetailDrawerOpen(true);
  };

  // Handle delete federation
  const handleDeleteFederation = async (federation) => {
    const confirmed = window.confirm(
      t('federations.confirmDeleteFederation', { name: federation.name })
    );

    if (!confirmed) return;

    try {
      await withErrorHandling(async () => {
        await deleteFederation(federation.id);
        setFederations(federations.filter(f => f.id !== federation.id));
        showNotification(
          t('federations.federationDeletedSuccess', { name: federation.name }),
          'success'
        );
      }, {
        errorMessage: t('federations.unableToDeleteFederation', { name: federation.name }),
        showError: true
      });
    } catch (error) {
      console.error('Error deleting federation:', error);
    }
  };

  // Handle federation form save
  const handleSaveFederation = (federation) => {
    if (federation.id) {
      // Update existing federation
      setFederations(
        federations.map(f => (f.id === federation.id ? federation : f))
      );
      showNotification(
        t('federations.federationUpdatedSuccess', { name: federation.name }),
        'success'
      );
    } else {
      // Add new federation
      setFederations([...federations, federation]);
      showNotification(
        t('federations.federationCreatedSuccess', { name: federation.name }),
        'success'
      );
    }
    setIsFormOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5">{t('federations.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddFederation}
        >
          {t('federations.addFederation')}
        </Button>
      </Box>

      <TextField
        placeholder={t('federations.searchFederations')}
        variant="outlined"
        size="small"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredFederations.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {t('federations.noFederationsFound')}
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredFederations.map((federation) => (
              <Grid item xs={12} md={6} lg={4} key={federation.id}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }} onClick={() => handleViewFederationDetails(federation)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DomainIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {federation.name}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFederation(federation);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFederation(federation);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {federation.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {federation.description}
                      </Typography>
                    )}

                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        icon={<GroupIcon />}
                        label={t('federations.members', { count: federation.memberCount || 0 })}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Typography variant="caption" color="text.secondary">
                        ID: {federation.id}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Federation Form Dialog */}
      <FederationForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        federation={selectedFederation}
        onSave={handleSaveFederation}
      />

      {/* Federation Details Drawer */}
      <FederationDetailsDrawer
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        federation={selectedFederation}
        onEdit={() => {
          setIsDetailDrawerOpen(false);
          setIsFormOpen(true);
        }}
        onDelete={() => {
          setIsDetailDrawerOpen(false);
          handleDeleteFederation(selectedFederation);
        }}
        onFederationChanged={() => loadFederations()}
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

export default FederationList;