import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
  Chip,
  Snackbar,
  Alert,
  Stack,
  useTheme,
  Fade,
  Divider,
  Tooltip,
  Skeleton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import DomainIcon from '@mui/icons-material/Domain';
import InfoIcon from '@mui/icons-material/Info';
import { fetchFederations, deleteFederation } from '../../services/federationService';
import FederationForm from './FederationForm';
import FederationDetailsDrawer from './FederationDetailsDrawer';
import useApiError from '../../hooks/useApiError';

const FederationList = () => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const theme = useTheme();
  const [federations, setFederations] = useState([]);
  const [filteredFederations, setFilteredFederations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFederation, setSelectedFederation] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filter federations when search term changes
  useEffect(() => {
    const filtered = federations.filter(federation => 
      federation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (federation.description && federation.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredFederations(filtered);
  }, [federations, searchTerm]);

  // Load federations from API with useCallback to avoid ESLint dependency warnings
  const loadFederations = useCallback(async () => {
    setIsLoading(true);
    try {
      await withErrorHandling(async () => {
        const federationsData = await fetchFederations();
        setFederations(federationsData);
        setFilteredFederations(federationsData);
      }, {
        errorMessage: t('federations.unableToLoadFederations'),
        showError: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [withErrorHandling, t]);

  // Load federations
  useEffect(() => {
    loadFederations();
  }, [loadFederations]);
  
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
      console.log(federation)
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

  // Federation card component
  const FederationCard = ({ federation }) => {
    return (
      <Fade in={true} timeout={300}>
        <Card 
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            },
            position: 'relative',
            overflow: 'visible'
          }} 
          onClick={() => handleViewFederationDetails(federation)}
        >

          
          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DomainIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                {federation.name}
              </Typography>
              <Box>
                <Tooltip title={t('common.edit')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditFederation(federation);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('common.delete')}>
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
                </Tooltip>
              </Box>
            </Box>

            {federation.description && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3,
                    lineHeight: '1.5em',
                    maxHeight: '4.5em'
                  }}
                >
                  {federation.description}
                </Typography>
              </>
            )}

            <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
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
      </Fade>
    );
  };

  // Rendering the skeleton loader
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <Box key={index} sx={{ width: '100%', height: '100%' }}>
        <Skeleton variant="rectangular" height={180} animation="wave" />
      </Box>
    ));
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

      <Box sx={{ position: 'relative', mb: 3 }}>
        <Box sx={{ position: 'absolute', left: 10, top: 8, zIndex: 1 }}>
          <SearchIcon color="action" />
        </Box>
        <TextField
          placeholder={t('federations.searchFederations')}
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              paddingLeft: '36px' 
            }
          }}
        />
        {searchTerm && (
          <Box sx={{ position: 'absolute', right: 10, top: 8, zIndex: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => setSearchTerm('')} 
              aria-label="clear search"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3
        }}>
          {renderSkeletons()}
        </Box>
      ) : (
        <>
          {filteredFederations.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 8,
              textAlign: 'center'
            }}>
              <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary" variant="h6">
                {t('federations.noFederationsFound')}
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleAddFederation}
                sx={{ mt: 2 }}
              >
                {t('federations.addFederation')}
              </Button>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 3
            }}>
              {filteredFederations.map((federation) => (
                <FederationCard key={federation.id} federation={federation} />
              ))}
            </Box>
          )}
        </>
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