import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Drawer,
  Typography,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Avatar,
  Divider,
  Tooltip,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Badge
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonRemove as PersonRemoveIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  fetchSiteUsers,
  fetchSiteAdmins,
  addUserToSite,
  removeUserFromSite,
  addSiteAdmin,
  removeSiteAdmin
} from '../../services/siteService';
import { fetchUsers } from '../../services/userService';
import { AuthContext } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import useApiError from '../../hooks/useApiError';
import UserSelectionDialog from './UserSelectionDialog';

const SiteDetailsDrawer = ({ open, onClose, federation, onEdit, onDelete, onFederationChanged }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const { currentUser, isGlobalAdmin } = useContext(AuthContext);
  const { canManageSite } = useSite();
  const [activeTab, setActiveTab] = useState(0);
  const [members, setMembers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [hasPermissionToEdit, setHasPermissionToEdit] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show a notification function
  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    
    // Remove the notification after 6 seconds
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Load sites data when site changes
  useEffect(() => {
    if (federation && open) {
      loadFederationData();
      
      // Check if user has permission to edit this site
      const canEdit = isGlobalAdmin() || canManageSite(federation.id);
      setHasPermissionToEdit(canEdit);
    }
  }, [federation, open, isGlobalAdmin, canManageSite]);

  // Load site members and admins
  const loadFederationData = async () => {
    if (!federation) return;

    // Load members
    setIsLoadingMembers(true);
    try {
      await withErrorHandling(async () => {
        const membersData = await fetchSiteUsers(federation.id);
        setMembers(membersData);
      }, {
        errorMessage: t('sites.unableToLoadMembers'),
        showError: true
      });
    } finally {
      setIsLoadingMembers(false);
    }

    // Load admins
    setIsLoadingAdmins(true);
    try {
      await withErrorHandling(async () => {
        const adminsData = await fetchSiteAdmins(federation.id);
        setAdmins(adminsData);
      }, {
        errorMessage: t('sites.unableToLoadAdmins'),
        showError: true
      });
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  // Handle refreshing data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFederationData();
    setIsRefreshing(false);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Add user to site
  const handleAddUser = async (user) => {
    if (!federation) return;

    try {
      await withErrorHandling(async () => {
        await addUserToSite(federation.id, user.id);
        // Notify parent component
        if (onFederationChanged) onFederationChanged();
        
        return true; // Return success status
      }, {
        errorMessage: t('sites.unableToAddUser', { name: user.username || `${user.firstName} ${user.lastName}` }),
        showError: true
      });
    } catch (error) {
      console.error('Error adding user to site:', error);
      return false;
    }
  };

  // Remove user from site
  const handleRemoveUser = async (user) => {
    if (!federation) return;

    const userName = user.username || `${user.firstName} ${user.lastName}`;
    const confirmed = window.confirm(
      t('sites.confirmRemoveUser', { name: userName, federation: federation.name })
    );

    if (!confirmed) return;

    try {
      await withErrorHandling(async () => {
        await removeUserFromSite(federation.id, user.id);
        // Update members list
        setMembers(members.filter(m => m.id !== user.id));
        // Notify parent component
        if (onFederationChanged) onFederationChanged();
        
        // Show success notification
        showNotification(t('sites.userRemovedSuccess', { name: userName, site: federation.name }));
      }, {
        errorMessage: t('sites.unableToRemoveUser', { name: userName }),
        showError: true
      });
    } catch (error) {
      console.error('Error removing user from site:', error);
    }
  };

  // Add site admin
  const handleAddAdmin = async (user) => {
    if (!federation) return;

    try {
      await withErrorHandling(async () => {
        await addSiteAdmin(federation.id, user.id);
        // Notify parent component
        if (onFederationChanged) onFederationChanged();
        
        return true; // Return success status
      }, {
        errorMessage: t('sites.unableToAddAdmin', { name: user.username || `${user.firstName} ${user.lastName}` }),
        showError: true
      });
    } catch (error) {
      console.error('Error adding admin to site:', error);
      return false;
    }
  };

  // Remove site admin
  const handleRemoveAdmin = async (user) => {
    if (!federation) return;

    const userName = user.username || `${user.firstName} ${user.lastName}`;
    const confirmed = window.confirm(
      t('sites.confirmRemoveAdmin', { name: userName, federation: federation.name })
    );

    if (!confirmed) return;

    try {
      await withErrorHandling(async () => {
        await removeSiteAdmin(federation.id, user.id);
        // Update admins list
        setAdmins(admins.filter(a => a.id !== user.id));
        // Notify parent component
        if (onFederationChanged) onFederationChanged();
        
        // Show success notification
        showNotification(t('sites.adminRemovedSuccess', { name: userName, site: federation.name }));
      }, {
        errorMessage: t('sites.unableToRemoveAdmin', { name: userName }),
        showError: true
      });
    } catch (error) {
      console.error('Error removing admin from site:', error);
    }
  };

  // Handle dialog close and refresh data
  const handleDialogClose = () => {
    setIsAddUserDialogOpen(false);
    setIsAddAdminDialogOpen(false);
    // Refresh member and admin lists
    loadFederationData();
  };

  // Get filtered members based on search term
  const getFilteredMembers = () => {
    if (!searchTerm) return members;
    
    return members.filter(user => 
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Get filtered admins based on search term
  const getFilteredAdmins = () => {
    if (!searchTerm) return admins;
    
    return admins.filter(user => 
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  if (!federation) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100%' }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">
          {federation.name}
        </Typography>
        <Box>
          {hasPermissionToEdit && (
            <>
              <Tooltip title={t('common.edit')}>
                <IconButton onClick={onEdit} size="small" sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.delete')}>
                <IconButton onClick={() => onDelete(federation)} size="small" color="error" sx={{ mr: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {federation.description && (
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {federation.description}
          </Typography>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab 
            label={
              <Badge badgeContent={members.length} color="primary">
                {t('sites.membersHeader')}
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={admins.length} color="secondary">
                {t('sites.admins')}
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder={t('sites.searchUsers')}
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, mr: 1 }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('sites.refresh')}>
              <IconButton 
                size="small" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            
            {hasPermissionToEdit && activeTab === 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => setIsAddUserDialogOpen(true)}
              >
                {t('sites.addUser')}
              </Button>
            )}
            
            {hasPermissionToEdit && activeTab === 1 && 
              (<Button
                startIcon={<AdminPanelSettingsIcon />}
                variant="outlined"
                size="small"
                onClick={() => setIsAddAdminDialogOpen(true)}
              >
                {t('sites.addAdmin')}
              </Button>
            )}
          </Box>
        </Box>

        {!hasPermissionToEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('sites.viewOnlyMode')}
          </Alert>
        )}

        {activeTab === 0 ? (
          // Members tab
          isLoadingMembers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : getFilteredMembers().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {searchTerm 
                  ? t('sites.noUsersMatchingSearch') 
                  : t('sites.noMembersInSite')}
              </Typography>
            </Box>
          ) : (
            <List>
              {getFilteredMembers().map(user => (
                <React.Fragment key={user.id}>
                  <ListItem>
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
                    <ListItemSecondaryAction>
                      {currentUser.id !== user.id && hasPermissionToEdit && (
                        <Tooltip title={t('sites.removeFromSite')}>
                          <IconButton edge="end" onClick={() => handleRemoveUser(user)}>
                            <PersonRemoveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )
        ) : (
          // Admins tab
          isLoadingAdmins ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : getFilteredAdmins().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {searchTerm 
                  ? t('sites.noAdminsMatchingSearch') 
                  : t('sites.noAdminsInSite')}
              </Typography>
            </Box>
          ) : (
            <List>
              {getFilteredAdmins().map(user => (
                <React.Fragment key={user.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
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
                    <ListItemSecondaryAction>
                      {currentUser.id !== user.id && hasPermissionToEdit && (
                        <Tooltip title={t('sites.removeAdminRole')}>
                          <IconButton edge="end" onClick={() => handleRemoveAdmin(user)}>
                            <PersonRemoveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )
        )}
      </Box>

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
    
      {/* Dialog for adding users to site */}
      <UserSelectionDialog
        open={isAddUserDialogOpen}
        onClose={handleDialogClose}
        onSelect={handleAddUser}
        excludeUserIds={members.map(m => m.id)}
      />
    
      {/* Dialog for adding admins to site */}
      <UserSelectionDialog
        open={isAddAdminDialogOpen}
        onClose={handleDialogClose}
        onSelect={handleAddAdmin}
        excludeUserIds={admins.map(a => a.id)}
        isAdminSelection={true}
      />
    </Drawer>
  );
};
    
export default SiteDetailsDrawer;