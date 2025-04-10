import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  InputAdornment,
  TextField,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
  Button
} from '@mui/material';
import {
  SearchOutlined as SearchIcon,
  ViewListOutlined as ListView,
  FilterListOutlined as FilterIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { fetchResources } from '../../services/resourceService';
import { fetchResourceTypes } from '../../services/resourceTypeService';
import ResourceList from './ResourceList';
import { SiteContext } from '../../context/SiteContext';
import ResourceHierarchyView from './ResourceHierarchyView';
import ResourceDetailDrawer from './ResourceDetailDrawer';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import useApiError from '../../hooks/useApiError';
import { ResourceStatus } from '../../services/resourceService';

const ResourceExplorer = () => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const { currentSite } = useContext(SiteContext);
  const [resources, setResources] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'hierarchy'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load resources and resource types
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await withErrorHandling(async () => {
          const [resourcesData, resourceTypesData] = await Promise.all([
            fetchResources(currentSite?.id ? {siteId: currentSite.id} : {}),
            fetchResourceTypes(currentSite?.id ? {siteId: currentSite.id} : {})
          ]);
          setResources(resourcesData);
          setResourceTypes(resourceTypesData);
          setFilteredResources(resourcesData);
        }, {
          errorMessage: t('errors.unableToLoadResources'),
          showError: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [withErrorHandling, t, currentSite]);

  // Apply filters when search, filter type, filter status, or status tab changes
  useEffect(() => {
    const filtered = resources.filter(resource => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
          resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.specs?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.location?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = filterType === '' || resource.typeId === parseInt(filterType);

      // Status filter
      const matchesStatus = filterStatus === '' || resource.status === filterStatus;

      // Tab filter
      const matchesTab = statusTab === 'all' || 
        (statusTab === 'active' && resource.status === ResourceStatus.ACTIVE) ||
        (statusTab === 'maintenance' && resource.status === ResourceStatus.MAINTENANCE) ||
        (statusTab === 'unavailable' && resource.status === ResourceStatus.UNAVAILABLE);

      return matchesSearch && matchesType && matchesStatus && matchesTab;
    });

    setFilteredResources(filtered);
  }, [resources, searchTerm, filterType, filterStatus, statusTab]);

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleStatusTabChange = (event, newValue) => {
    if (newValue !== null) {
      setStatusTab(newValue);
      // Reset status filter when changing tabs
      setFilterStatus('');
    }
  };

  const handleResourceSelect = (resource) => {
    setSelectedResource(resource);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
  };

  // Get resource type name
  const getResourceTypeName = (typeId) => {
    const type = resourceTypes.find(t => t.id === typeId);
    return type ? type.name : t('resourceExplorer.unknownType');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{t('resourceExplorer.title')}</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 2, 
          gap: 2 
        }}>
          {/* Search input */}
          <TextField
            placeholder={t('resourceExplorer.searchResources')}
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
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Type filter */}
            <TextField
              select
              label={t('resourceExplorer.type')}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">{t('resourceExplorer.allTypes')}</MenuItem>
              {resourceTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
            
            {/* View mode toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="list" aria-label="list view">
                <Tooltip title={t('resourceExplorer.listView')}>
                  <ListView />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="hierarchy" aria-label="hierarchy view">
                <Tooltip title={t('resourceExplorer.hierarchyView')}>
                    <AccountTreeIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Info button */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<InfoIcon />}
              onClick={() => {
                // Show a resource that has relationships as an example
                const resourceWithRelations = resources.find(r => 
                  r.parentId || (r.subResourceIds && r.subResourceIds.length > 0)
                ) || resources[0];
                
                if (resourceWithRelations) {
                  handleResourceSelect(resourceWithRelations);
                }
              }}
            >
              {t('resourceExplorer.howToUse')}
            </Button>
          </Box>
        </Box>
        
        {/* Status tabs */}
        <Tabs
          value={statusTab}
          onChange={handleStatusTabChange}
          aria-label="resource status tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab value="all" label={t('resourceExplorer.allResources')} />
          <Tab value="active" label={t('resourceExplorer.activeResources')} />
          <Tab value="maintenance" label={t('resourceExplorer.maintenanceResources')} />
          <Tab value="unavailable" label={t('resourceExplorer.unavailableResources')} />
        </Tabs>
      </Paper>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ minHeight: 500 }}>
          {filteredResources.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {t('resourceExplorer.noResourcesFound')}
              </Typography>
            </Paper>
          ) : (
            viewMode === 'list' ? (
              <ResourceList 
                resources={filteredResources} 
                resourceTypes={resourceTypes}
                onResourceSelect={handleResourceSelect}
              />
            ) : (
              <ResourceHierarchyView 
                resources={filteredResources}
                resourceTypes={resourceTypes}
                onResourceSelect={handleResourceSelect}
              />
            )
          )}
        </Box>
      )}
      
      {/* Resource detail drawer */}
      <ResourceDetailDrawer
        open={isDetailOpen}
        resource={selectedResource}
        resourceTypes={resourceTypes}
        allResources={resources}
        getResourceTypeName={getResourceTypeName}
        onClose={closeDetail}
        onResourceSelect={handleResourceSelect}
      />
    </Box>
  );
};

export default ResourceExplorer;