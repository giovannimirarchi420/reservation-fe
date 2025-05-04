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
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Storage as StorageIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import { ResourceStatus, updateResource } from '../../services/resourceService';
import useApiError from '../../hooks/useApiError';

// DraggableResourceItem component - for individual resources that can be dragged and dropped
const DraggableResourceItem = ({ 
  resource, 
  level = 0, 
  resourceType, 
  childResources, 
  onResourceSelect, 
  expandAll, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  handleParentUpdate, 
  isAdminView = false
}) => {
  const [open, setOpen] = useState(expandAll);
  const hasChildren = childResources && childResources.length > 0;
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);

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
  
  // Drag functions only enabled in admin view
  const handleDragStart = (e) => {
    if (!isAdminView) return;
    
    setIsDragging(true);
    e.dataTransfer.setData('resourceId', resource.id);
    onDragStart && onDragStart(e, resource);
  };
  
  const handleDragOver = (e) => {
    if (!isAdminView) return;
    
    e.preventDefault();
    setIsDropTarget(true);
    onDragOver && onDragOver(e, resource);
  };
  
  const handleDragLeave = (e) => {
    if (!isAdminView) return;
    
    setIsDropTarget(false);
  };
  
  const handleDrop = (e) => {
    if (!isAdminView) return;
    
    e.preventDefault();
    setIsDropTarget(false);
    
    const draggedResourceId = e.dataTransfer.getData('resourceId');
    // Don't allow dropping on itself
    if (draggedResourceId === resource.id.toString()) return;
    
    onDrop && onDrop(e, resource, draggedResourceId);
  };
  
  const handleDragEnd = (e) => {
    if (!isAdminView) return;
    
    setIsDragging(false);
  };
  
  return (
    <>
      <ListItemButton 
        onClick={() => onResourceSelect(resource)}
        sx={{ 
          pl: level * 3 + 2,
          borderLeft: resourceType ? `4px solid ${resourceType.color}` : 'none',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          ...(isAdminView && {
            cursor: 'grab',
          }),
          ...(isDragging && {
            opacity: 0.5,
          }),
          ...(isDropTarget && {
            backgroundColor: 'action.selected',
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: 'primary.main',
          })
        }}
        data-resource-id={resource.id}
        draggable={isAdminView}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        {isAdminView && <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary', cursor: 'grab' }} />}
        
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
              <DraggableResourceItem 
                key={child.resource.id}
                resource={child.resource}
                resourceType={child.resourceType}
                childResources={child.children}
                level={level + 1}
                onResourceSelect={onResourceSelect}
                expandAll={expandAll}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                handleParentUpdate={handleParentUpdate}
                isAdminView={isAdminView}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const ResourceHierarchyView = ({ 
  resources, 
  resourceTypes, 
  onResourceSelect, 
  isAdminView = false, 
  onResourceHierarchyUpdated 
}) => {
  const { t } = useTranslation();
  const [expandAll, setExpandAll] = useState(false);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [notification, setNotification] = useState(null);
  const { withErrorHandling } = useApiError();
  
  // Show a notification
  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };
  
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
  
  // Check for circular references
  const hasCircularReference = (dragged, target) => {
    // Check if target is a child of dragged (would create circular reference)
    const isChildOf = (parentId, potentialChild) => {
      if (!parentId) return false;
      if (parentId === potentialChild) return true;
      
      const childResource = resources.find(r => r.id === potentialChild);
      if (!childResource || !childResource.parentId) return false;
      
      return isChildOf(parentId, childResource.parentId);
    };
    
    return isChildOf(dragged, target.id);
  };
  
  // Handle resource drag start (optional - could add effects here)
  const handleDragStart = (e, resource) => {
    // Custom drag image or effects could be added here
  };
  
  // Handle hovering over a drop target
  const handleDragOver = (e, resource) => {
    e.preventDefault();
    // You could add additional checks here to prevent certain drop scenarios
  };
  
  // Handle dropping a resource onto another using the general resource update API
  const handleDrop = async (e, targetResource, draggedResourceId) => {
    e.preventDefault();
    
    // Convert to number if needed
    const draggedId = parseInt(draggedResourceId);
    
    // Find the dragged resource
    const draggedResource = resources.find(r => r.id === draggedId);
    if (!draggedResource) {
      showNotification(t('resourceHierarchy.resourceNotFound'), 'error');
      return;
    }
    
    // Check for circular reference
    if (hasCircularReference(draggedId, targetResource)) {
      showNotification(t('resourceHierarchy.circularReferenceError'), 'error');
      return;
    }
    
    // Prevent moving a resource to its current parent
    if (draggedResource.parentId === targetResource.id) {
      showNotification(t('resourceHierarchy.alreadyParent'), 'info');
      return;
    }
    
    // Update the parent relationship using the main resource update API
    try {
      // Prepare resource data for update (keeping all existing properties)
      const resourceData = {
        ...draggedResource,
        parentId: targetResource.id,
      };
      
      await withErrorHandling(async () => {
        // Use the main resource update API (PUT /api/resources/<id>)
        await updateResource(draggedId, resourceData);
        
        // Show success notification
        showNotification(
          t('resourceHierarchy.parentUpdated', {
            name: draggedResource.name, 
            parent: targetResource.name
          }), 
          'success'
        );
        
        // Notify parent component to refresh the resources
        if (onResourceHierarchyUpdated) {
          onResourceHierarchyUpdated();
        }
      }, {
        errorMessage: t('resourceHierarchy.unableToUpdateParent'),
        showError: true
      });
    } catch (error) {
      console.error('Error updating parent-child relationship:', error);
    }
  };
  
  // Handle removing a parent (dropping to the root level)
  const handleRemoveParent = async (resourceId) => {
    try {
      // Find the resource to update
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) {
        showNotification(t('resourceHierarchy.resourceNotFound'), 'error');
        return;
      }
      
      // Prepare resource data for update (keeping all existing properties, but removing parentId)
      const resourceData = {
        ...resource,
        parentId: null,  // Set to null to remove parent relationship
        status: resource.status, // Ensure status is explicitly included
        typeId: resource.typeId // Ensure typeId is explicitly included
      };
      
      await withErrorHandling(async () => {
        // Use the main resource update API (PUT /api/resources/<id>)
        await updateResource(resourceId, resourceData);
        
        // Show success notification
        showNotification(
          t('resourceHierarchy.parentRemoved', { name: resource.name }), 
          'success'
        );
        
        // Notify parent component to refresh the resources
        if (onResourceHierarchyUpdated) {
          onResourceHierarchyUpdated();
        }
      }, {
        errorMessage: t('resourceHierarchy.unableToRemoveParent'),
        showError: true
      });
    } catch (error) {
      console.error('Error removing parent relationship:', error);
    }
  };
  
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
      
      {isAdminView && (
        <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
          <Alert severity="info" sx={{ mb: 1 }}>
            {t('resourceHierarchy.dragDropInstructions')}
          </Alert>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 1,
              border: '2px dashed',
              borderColor: 'primary.light',
              bgcolor: 'action.selected',
              textAlign: 'center'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const draggedResourceId = e.dataTransfer.getData('resourceId');
              if (draggedResourceId) {
                handleRemoveParent(parseInt(draggedResourceId));
              }
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('resourceHierarchy.dropToRemoveParent')}
            </Typography>
          </Box>
        </Box>
      )}
      
      <List sx={{ width: '100%', bgcolor: 'background.paper', pt: 0 }}>
        {hierarchyData.length > 0 ? (
          hierarchyData.map(item => (
            <DraggableResourceItem 
              key={item.resource.id}
              resource={item.resource}
              resourceType={item.resourceType}
              childResources={item.children}
              onResourceSelect={onResourceSelect}
              expandAll={expandAll}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isAdminView={isAdminView}
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
    </Paper>
  );
};

export default ResourceHierarchyView;