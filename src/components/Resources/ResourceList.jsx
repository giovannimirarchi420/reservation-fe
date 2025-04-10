import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Info as InfoIcon,
  Storage as StorageIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { ResourceStatus } from '../../services/resourceService';
import DomainIcon from '@mui/icons-material/Domain';

const ResourceList = ({ resources, resourceTypes, onResourceSelect }) => {
  const { t } = useTranslation();

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case ResourceStatus.ACTIVE:
        return { label: t('resourceExplorer.active'), color: 'success' };
      case ResourceStatus.MAINTENANCE:
        return { label: t('resourceExplorer.maintenance'), color: 'warning' };
      case ResourceStatus.UNAVAILABLE:
        return { label: t('resourceExplorer.unavailable'), color: 'error' };
      default:
        return { label: t('resourceExplorer.unknown'), color: 'default' };
    }
  };

  // Get resource type name and color
  const getResourceTypeInfo = (typeId) => {
    const type = resourceTypes.find(t => t.id === typeId);
    return type ? { name: type.name, color: type.color } : { name: t('resourceExplorer.unknownType'), color: '#808080' };
  };

  // Check if resource has relationships
  const hasRelationships = (resource) => {
    return resource.parentId || (resource.subResourceIds && resource.subResourceIds.length > 0);
  };

  return (
    <Grid container spacing={3}>
      {resources.map(resource => {
        const statusInfo = getStatusInfo(resource.status);
        const typeInfo = getResourceTypeInfo(resource.typeId);
        const relationships = hasRelationships(resource);
        
        return (
          <Grid item xs={12} md={6} lg={4} key={resource.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
              onClick={() => onResourceSelect(resource)}
            >
              {/* Resource type indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 15,
                  height: '100%',
                  backgroundColor: typeInfo.color,
                  zIndex: 1
                }}
              />
              
              <CardContent sx={{ flexGrow: 1, pr: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }} gutterBottom>
                    {resource.name}
                  </Typography>
                  <Tooltip title={t('resourceExplorer.viewDetails')}>
                    <IconButton 
                      size="small" 
                      sx={{ position: 'absolute', top: 8, right: 20 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onResourceSelect(resource);
                      }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CategoryIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {typeInfo.name}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StorageIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {resource.specs}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {resource.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DomainIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {resource.siteName}
                  </Typography>
                </Box>
                
                {relationships && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountTreeIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {resource.parentId 
                        ? t('resourceExplorer.hasParent')
                        : t('resourceExplorer.hasChildren')}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={statusInfo.label}
                    size="small"
                    color={statusInfo.color}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ID: {resource.id}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ResourceList;