import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ResourceCard = ({ resource, resourceType, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleCloseMenu();
    onEdit();
  };

  const handleDelete = () => {
    handleCloseMenu();
    onDelete();
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">{resource.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {resourceType && (
              <Chip 
                label={resourceType.name} 
                size="small"
                sx={{ 
                  mr: 1, 
                  backgroundColor: resourceType.color, 
                  color: 'white',
                  fontWeight: 'bold' 
                }}
              />
            )}
            <IconButton size="small" onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <b>Specifiche:</b> {resource.specs}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <b>Ubicazione:</b> {resource.location}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
          <Chip 
            label={resource.status === 'active' ? 'Attivo' : 'Manutenzione'} 
            color={resource.status === 'active' ? 'success' : 'warning'}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            ID: {resource.id}
          </Typography>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifica</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Elimina" primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ResourceCard;
