import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Collapse,
  Chip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Storage as StorageIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { ResourceStatus } from '../../services/resourceService';

const ResourceHierarchyItem = ({ resource, level = 0, resourceType, childResources, onResourceSelect, expandAll }) => {
  const [open, setOpen] = useState(expandAll);
  const hasChildren = childResources && childResources.length > 0;
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
  
  const statusInfo = getStatusInfo(resource.status);

  const handleToggle = (event) => {
    event.stopPropagation();
    setOpen(!open);
  };

  useEffect(() => {
    setOpen(expandAll);
  }, [expandAll]);
  
  return (
    <>
      <ListItemButton 
        onClick={() => onResourceSelect(resource)}
        sx={{ 
          pl: level * 3 + 2,
          borderLeft: resourceType ? `4px solid ${resourceType.color}` : 'none',
          '&:hover': {
            backgroundColor: 'action.hover',
          }
        }}
        data-resource-id={resource.id}
      >
        <ListItemIcon>
          {hasChildren ? (open ? <FolderOpenIcon color="primary" /> : <FolderIcon color="primary" />) : <StorageIcon />}
        </ListItemIcon>
        <ListItemText 
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'medium', 
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {resource.name}
              </Typography>
              <Chip 
                label={statusInfo.label} 
                color={statusInfo.color} 
                size="small" 
                sx={{ ml: 1, minWidth: 100 }}
              />
            </Box>
          }
          secondary={
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                maxWidth: '90%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {resource.specs}
            </Typography>
          }
        />
        
        {hasChildren && (
          <Box onClick={handleToggle}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        )}
      </ListItemButton>
      
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {childResources.map(child => (
              <ResourceHierarchyItem 
                key={child.resource.id}
                resource={child.resource}
                resourceType={child.resourceType}
                childResources={child.children}
                level={level + 1}
                onResourceSelect={onResourceSelect}
                expandAll={expandAll}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const ResourceHierarchyView = ({ resources, resourceTypes, onResourceSelect }) => {
  const { t } = useTranslation();
  const [expandAll, setExpandAll] = useState(false);
  const [hierarchyData, setHierarchyData] = useState([]);
  
  // Build hierarchy tree from flat resources list
  useEffect(() => {
    // First, create a map for quick resource lookup
    const resourceMap = new Map();
    resources.forEach(resource => {
      const resourceType = resourceTypes.find(t => t.id === resource.typeId);
      resourceMap.set(resource.id, {
        resource,
        resourceType,
        children: []
      });
    });
    
    // Create hierarchy
    const rootItems = [];
    resources.forEach(resource => {
      const resourceNode = resourceMap.get(resource.id);
      
      if (resource.parentId && resourceMap.has(resource.parentId)) {
        // This is a child resource, add it to its parent
        const parentNode = resourceMap.get(resource.parentId);
        parentNode.children.push(resourceNode);
      } else {
        // This is a root resource
        rootItems.push(resourceNode);
      }
    });
    
    // Sort root items alphabetically
    rootItems.sort((a, b) => a.resource.name.localeCompare(b.resource.name));
    
    // Sort children for each node
    const sortChildren = (node) => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => a.resource.name.localeCompare(b.resource.name));
        node.children.forEach(sortChildren);
      }
    };
    
    rootItems.forEach(sortChildren);
    
    setHierarchyData(rootItems);
  }, [resources, resourceTypes]);
  
  return (
    <Paper elevation={1} sx={{ width: '100%', height: '100%', minHeight: 500, overflow: 'auto' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6">
          {t('resourceExplorer.resourceHierarchy')}
        </Typography>
        <Box>
          <Chip
            label={expandAll ? t('resourceExplorer.collapseAll') : t('resourceExplorer.expandAll')}
            onClick={() => setExpandAll(!expandAll)}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper', pt: 0 }}>
        {hierarchyData.length > 0 ? (
          hierarchyData.map(item => (
            <ResourceHierarchyItem 
              key={item.resource.id}
              resource={item.resource}
              resourceType={item.resourceType}
              childResources={item.children}
              onResourceSelect={onResourceSelect}
              expandAll={expandAll}
            />
          ))
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {t('resourceExplorer.noResourcesFound')}
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default ResourceHierarchyView;