import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  TableSortLabel,
  Typography
} from '@mui/material';
import {
  Info as InfoIcon,
  Storage as StorageIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  AccountTree as AccountTreeIcon,
  Domain as DomainIcon
} from '@mui/icons-material';
import { ResourceStatus } from '../../services/resourceService';

const ResourceTable = ({ resources, resourceTypes, onResourceSelect }) => {
  const { t } = useTranslation();
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

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

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort resources
  const sortedResources = React.useMemo(() => {
    return [...resources].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle special cases
      if (orderBy === 'type') {
        aValue = getResourceTypeInfo(a.typeId).name;
        bValue = getResourceTypeInfo(b.typeId).name;
      } else if (orderBy === 'status') {
        aValue = getStatusInfo(a.status).label;
        bValue = getStatusInfo(b.status).label;
      }

      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [resources, orderBy, order, resourceTypes, getResourceTypeInfo, getStatusInfo]);

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={createSortHandler('name')}
              >
                {t('resourceForm.resourceName')}
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'type'}
                direction={orderBy === 'type' ? order : 'asc'}
                onClick={createSortHandler('type')}
              >
                {t('resourceExplorer.type')}
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'status'}
                direction={orderBy === 'status' ? order : 'asc'}
                onClick={createSortHandler('status')}
              >
                {t('resourceExplorer.status')}
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'specs'}
                direction={orderBy === 'specs' ? order : 'asc'}
                onClick={createSortHandler('specs')}
              >
                {t('resourceExplorer.specifications')}
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'location'}
                direction={orderBy === 'location' ? order : 'asc'}
                onClick={createSortHandler('location')}
              >
                {t('resourceExplorer.location')}
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'siteName'}
                direction={orderBy === 'siteName' ? order : 'asc'}
                onClick={createSortHandler('siteName')}
              >
                {t('resourceForm.site')}
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">
              {t('resourceExplorer.hierarchy')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedResources.map((resource) => {
            const statusInfo = getStatusInfo(resource.status);
            const typeInfo = getResourceTypeInfo(resource.typeId);
            const relationships = hasRelationships(resource);

            return (
              <TableRow
                key={resource.id}
                hover
                onClick={() => onResourceSelect(resource)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 4,
                        height: 32,
                        backgroundColor: typeInfo.color,
                        borderRadius: 1,
                        mr: 2
                      }}
                    />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {resource.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {resource.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={typeInfo.name}
                    size="small"
                    sx={{ 
                      bgcolor: typeInfo.color,
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={statusInfo.label}
                    size="small"
                    color={statusInfo.color}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StorageIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {resource.specs || '-'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {resource.location || '-'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DomainIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {resource.siteName || '-'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {relationships ? (
                    <Tooltip title={
                      resource.parentId 
                        ? t('resourceExplorer.hasParent')
                        : t('resourceExplorer.hasChildren')
                    }>
                      <AccountTreeIcon color="primary" fontSize="small" />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {resources.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {t('resourceExplorer.noResourcesFound')}
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default ResourceTable;
