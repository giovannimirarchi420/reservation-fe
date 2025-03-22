import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { ResourceStatus } from '../../services/resourceService';

const ResourceHierarchyItem = ({ resource, level = 0, onResourceSelect, children }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = children && children.length > 0;
  const { t } = useTranslation();

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case ResourceStatus.ACTIVE:
        return { label: t('resourceForm.active'), color: 'success' };
      case ResourceStatus.MAINTENANCE:
        return { label: t('resourceForm.maintenance'), color: 'warning' };
      case ResourceStatus.UNAVAILABLE:
        return { label: t('resourceForm.unavailable'), color: 'error' };
      default:
        return { label: t('resourceCard.unknown'), color: 'default' };
    }
  };
  
  const statusInfo = getStatusInfo(resource.status);

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };
  
  return (
    <>
      <ListItem 
        button 
        onClick={() => onResourceSelect(resource)}
        sx={{ pl: level * 4 + 2 }}
      >
        <ListItemIcon>
          {hasChildren ? (open ? <FolderOpenIcon /> : <FolderIcon />) : <StorageIcon />}
        </ListItemIcon>
        <ListItemText 
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {resource.name}
              <Chip 
                label={statusInfo.label} 
                color={statusInfo.color} 
                size="small" 
                sx={{ ml: 1 }}
              />
            </Box>
          }
          secondary={resource.specs}
        />
        
        {hasChildren && (
          <IconButton edge="end" onClick={handleToggle} size="small">
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </ListItem>
      
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children}
          </List>
        </Collapse>
      )}
    </>
  );
};

const ResourceHierarchyView = ({ resources, resourceTypes, onResourceSelect }) => {
  const { t } = useTranslation();
  
  // Build hierarchy
  const buildHierarchyTree = () => {
    const resourceMap = {};
    const topLevelResources = [];
    
    // First pass: create map of resources by ID
    resources.forEach(resource => {
      resourceMap[resource.id] = {
        resource,
        children: []
      };
    });
    
    // Second pass: build the tree structure
    resources.forEach(resource => {
      if (resource.parentId) {
        // This resource has a parent, add it as a child of its parent
        if (resourceMap[resource.parentId]) {
          resourceMap[resource.parentId].children.push(resourceMap[resource.id]);
        } else {
          // Parent not found, treat as top level
          topLevelResources.push(resourceMap[resource.id]);
        }
      } else {
        // No parent, add to top level
        topLevelResources.push(resourceMap[resource.id]);
      }
    });
    
    return { resourceMap, topLevelResources };
  };
  
  const { topLevelResources } = buildHierarchyTree();
  
  const renderResourceTree = (node, level = 0) => {
    return (
      <ResourceHierarchyItem 
        key={node.resource.id}
        resource={node.resource}
        level={level}
        onResourceSelect={onResourceSelect}
        children={node.children.length > 0 ? 
          node.children.map(childNode => renderResourceTree(childNode, level + 1)) : 
          null
        }
      />
    );
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('resourceHierarchy.title')}
        </Typography>
        
        {topLevelResources.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {t('resourceManagement.noResourcesFound')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {topLevelResources.map(node => renderResourceTree(node))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceHierarchyView;