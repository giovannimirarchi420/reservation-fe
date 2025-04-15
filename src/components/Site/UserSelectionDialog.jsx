import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  Typography,
  Checkbox,
  Divider,
  Chip,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Search as SearchIcon,
  SelectAll as SelectAllIcon,
  SaveAlt as SaveAltIcon
} from '@mui/icons-material';
import { fetchUsers } from '../../services/userService';
import useApiError from '../../hooks/useApiError';

// User selection dialog component
const UserSelectionDialog = ({ open, onClose, onSelect, excludeUserIds = [], isAdminSelection = false }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  // Load users when dialog opens
  useEffect(() => {
    if (open) {
      loadUsers();
      setSelectedUsers([]);
      setSearchTerm('');
      setSelectAll(false);
      setProcessedCount(0);
    }
  }, [open]);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(user => 
      !excludeUserIds.includes(user.id) && (
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
    setFilteredUsers(filtered);

    // Update selectAll state if all available users are already selected
    if (filtered.length > 0) {
      const allSelected = filtered.every(user => selectedUsers.some(selectedUser => selectedUser.id === user.id));
      setSelectAll(allSelected);
    }
  }, [users, searchTerm, excludeUserIds, selectedUsers]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      await withErrorHandling(async () => {
        const usersData = await fetchUsers();
        setUsers(usersData);
        setFilteredUsers(usersData.filter(user => !excludeUserIds.includes(user.id)));
      }, {
        errorMessage: t('sites.unableToLoadUsers'),
        showError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUser = (user, event) => {
    // Se l'evento proviene dalla checkbox, stopPropagation per evitare che l'item venga cliccato due volte
    if (event) {
      event.stopPropagation();
    }

    setSelectedUsers(prev => {
      // Check if user is already selected
      const isSelected = prev.some(selectedUser => selectedUser.id === user.id);
      
      if (isSelected) {
        // Remove user from selected list
        return prev.filter(selectedUser => selectedUser.id !== user.id);
      } else {
        // Add user to selected list
        return [...prev, user];
      }
    });
  };

  const handleToggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      // Select all filtered users that aren't already selected
      const usersToAdd = filteredUsers.filter(user => 
        !selectedUsers.some(selectedUser => selectedUser.id === user.id)
      );
      setSelectedUsers([...selectedUsers, ...usersToAdd]);
    } else {
      // Deselect only the users that are in the current filtered list
      setSelectedUsers(selectedUsers.filter(selectedUser => 
        !filteredUsers.some(user => user.id === selectedUser.id)
      ));
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedUsers.length === 0) return;
    
    setProcessing(true);
    setProcessedCount(0);
    
    try {
      // Process users one by one
      for (let i = 0; i < selectedUsers.length; i++) {
        const user = selectedUsers[i];
        await onSelect(user);
        setProcessedCount(i + 1);
      }
    } finally {
      setProcessing(false);
      onClose();
    }
  };

  const handleRemoveSelected = (user) => {
    setSelectedUsers(prev => prev.filter(selectedUser => selectedUser.id !== user.id));
  };

  return (
    <Dialog open={open} onClose={!processing ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isAdminSelection ? t('sites.selectAdmins') : t('sites.selectUser')}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder={t('sites.searchUsers')}
            fullWidth
            variant="outlined"
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={processing}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={selectAll}
                  onChange={handleToggleSelectAll}
                  disabled={filteredUsers.length === 0 || processing}
                />
              }
              label={t('sites.selectAll')}
            />
            
            <Typography variant="body2" color="text.secondary">
              {t('sites.selectedCount', { count: selectedUsers.length })}
            </Typography>
          </Box>
        </Box>
        
        {selectedUsers.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('sites.selectedUsers')}:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedUsers.map(user => (
                <Chip
                  key={user.id}
                  avatar={
                    <Avatar>
                      {user.avatar || (user.firstName && user.lastName 
                        ? `${user.firstName[0]}${user.lastName[0]}` 
                        : (user.username ? user.username[0] : 'U')
                      )}
                    </Avatar>
                  }
                  label={user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username
                  }
                  onDelete={() => handleRemoveSelected(user)}
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {searchTerm 
                ? t('sites.noUsersMatchingSearch') 
                : t('sites.noAvailableUsers')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {filteredUsers.map(user => {
              const isSelected = selectedUsers.some(selectedUser => selectedUser.id === user.id);
              
              return (
                <ListItem 
                  key={user.id}
                  button
                  disabled={processing}
                  onClick={() => handleToggleUser(user)}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={isSelected}
                      onChange={(e) => handleToggleUser(user, e)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={processing}
                    />
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: user.role === 'ADMIN' ? 'secondary.main' : 'primary.main' }}>
                      {user.avatar || (user.firstName && user.lastName 
                        ? `${user.firstName[0]}${user.lastName[0]}` 
                        : (user.username ? user.username[0] : 'U')
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username
                    }
                    secondary={user.email}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
        
        {processing && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography variant="body2" component="span">
              {t('sites.processingUsers', { 
                current: processedCount, 
                total: selectedUsers.length 
              })}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={processing}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={processing ? <CircularProgress size={20} /> : <SaveAltIcon />}
          disabled={selectedUsers.length === 0 || processing}
          onClick={handleConfirmSelection}
        >
          {processing
            ? t('sites.adding', { count: selectedUsers.length })
            : t('sites.addSelected', { count: selectedUsers.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSelectionDialog;