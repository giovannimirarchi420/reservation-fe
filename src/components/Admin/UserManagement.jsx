import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button, 
  CircularProgress,
  Stack,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import UserCard from '../Users/UserCard';
import UserForm from '../Users/UserForm';
import { createUser, deleteUser, fetchUsers, updateUser } from '../../services/userService';
import useApiError from '../../hooks/useApiError';
import { SiteRoles } from '../../services/siteService';
import { AuthContext } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

const UserManagement = () => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const { isGlobalAdmin } = useContext(AuthContext);
  const { currentSite } = useSite();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [notification, setNotification] = useState(null);

  // Check if user can manage Global Admins
  const canManageGlobalAdmins = isGlobalAdmin && isGlobalAdmin();

  // Show a notification
  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    
    // Remove the notification after 6 seconds
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        await withErrorHandling(async () => {
          const usersData = await fetchUsers(currentSite ? { siteId: currentSite.id } : {});
          setUsers(usersData);
        }, {
          errorMessage: t('errors.unableToLoadUserList'),
          showError: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [withErrorHandling, t, currentSite]);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    // Handle role filtering with the new role structure
    if (filterRole === '') return matchesSearch;
    
    // Handle array of roles
    if (Array.isArray(user.roles)) {
      return matchesSearch && 
             user.roles.some(role => role.toUpperCase() === filterRole.toUpperCase());
    }  
    return false;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    const result = await withErrorHandling(async () => {
      if (userData.id) {
        // Update an existing user
        const updatedUser = await updateUser(userData.id, userData);
        return { updated: true, user: updatedUser, success: true };
      } else {
        // Create a new user
        const newUser = await createUser(userData);
        return { updated: false, user: newUser, success: true };
      }
    }, {
      errorMessage: userData.id 
        ? t('userManagement.unableToUpdateUser', { username: userData.username }) 
        : t('userManagement.unableToCreateUser', { username: userData.username }),
      showError: true
    });

    if (result && result.success) {
      if (result.updated) {
        // Update existing users
        setUsers(users.map(user =>
            user.id === result.user.id ? result.user : user
        ));
        showNotification(t('userManagement.userUpdatedSuccess', { username: result.user.username }));
      } else {
        // Add new user
        setUsers([...users, result.user]);
        showNotification(t('userManagement.userCreatedSuccess', { username: result.user.username }));
      }
      setIsUserModalOpen(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Find the user's name before deleting
    const userToDelete = users.find(u => u.id === userId);
    const userName = userToDelete ? (userToDelete.username || `${userToDelete.firstName} ${userToDelete.lastName}`) : t('userManagement.selected');

    const confirmation = window.confirm(
      `${t('userManagement.confirmDeleteUser')} "${userName}"? ${t('userManagement.actionCannotBeUndone')}`
    );
    
    if (!confirmation) {
      return;
    }

    const success = await withErrorHandling(async () => {
      await deleteUser(userId);
      return true;
    }, {
      errorMessage: t('userManagement.unableToDeleteUser', { username: userName }),
      showError: true
    });

    if (success) {
      setUsers(users.filter(user => user.id !== userId));
      setIsUserModalOpen(false);
      showNotification(t('userManagement.userDeletedSuccess', { username: userName }));
    }
  };

  return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h6">{t('userManagement.title')}</Typography>
          <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
          >
            {t('userManagement.addUser')}
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
              placeholder={t('userManagement.searchUsers')}
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

          <TextField
              select
              label={t('userManagement.role')}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                ),
              }}
          >
            <MenuItem value="">{t('userManagement.allRoles')}</MenuItem>
            
            {/* Regular user option */}
            <MenuItem value={SiteRoles.USER}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon color="primary" />
                <Typography>{t('userManagement.user')}</Typography>
              </Stack>
            </MenuItem>
            
            {/* Site admin option */}
            <MenuItem value={SiteRoles.SITE_ADMIN}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SupervisorAccountIcon sx={{ color: '#f44336' }} />
                <Typography>{t('userManagement.siteAdministrator')}</Typography>
              </Stack>
            </MenuItem>
            
            {/* Global admin option - only visible to global admins */}
            {canManageGlobalAdmins && (
              <MenuItem value={SiteRoles.GLOBAL_ADMIN}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SecurityIcon sx={{ color: 'gold' }} />
                  <Typography>{t('userManagement.globalAdministrator')}</Typography>
                </Stack>
              </MenuItem>
            )}
          </TextField>
        </Stack>

        {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
        ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              {filteredUsers.length === 0 ? (
                  <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {t('userManagement.noUsersFound')}
                    </Typography>
                  </Box>
              ) : (
                  filteredUsers.map(user => (
                      <UserCard
                          key={user.id}
                          user={user}
                          onEdit={() => handleEditUser(user)}
                          onDelete={() => handleDeleteUser(user.id)}
                      />
                  ))
              )}
            </Box>
        )}

        <UserForm
            open={isUserModalOpen}
            onClose={() => setIsUserModalOpen(false)}
            user={selectedUser}
            onSave={handleSaveUser}
            onDelete={handleDeleteUser}
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

export default UserManagement;