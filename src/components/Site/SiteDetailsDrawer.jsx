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
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Avatar,
  Divider,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonRemove as PersonRemoveIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
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

// User selection dialog component
const UserSelectionDialog = ({ open, onClose, onSelect, excludeUserIds = [] }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load users when dialog opens
  useEffect(() => {
    if (open) {
      loadUsers();
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
  }, [users, searchTerm, excludeUserIds]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      await withErrorHandling(async () => {
        const usersData = await fetchUsers();
        setUsers(usersData);
        setFilteredUsers(usersData.filter(user => !excludeUserIds.includes(user.id)));
      }, {
        errorMessage: t('federations.unableToLoadUsers'),
        showError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('federations.selectUser')}</DialogTitle>
      <DialogContent>
        <TextField
          placeholder={t('federations.searchUsers')}
          fullWidth
          variant="outlined"
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {t('federations.noUsersFound')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ mt: 2 }}>
            {filteredUsers.map(user => (
              <ListItem 
                key={user.id} 
                button
                onClick={() => onSelect(user)}
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
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('common.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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

  // Load federation data when federation changes
  useEffect(() => {
    if (federation && open) {
      loadFederationData();
      
      // Check if user has permission to edit this site
      const canEdit = isGlobalAdmin() || canManageSite(federation.id);
      setHasPermissionToEdit(canEdit);
    }
  }, [federation, open, isGlobalAdmin, canManageSite]);

  // Load federation members and admins
  const loadFederationData = async () => {
    if (!federation) return;

    // Load members
    setIsLoadingMembers(true);
    try {
      await withErrorHandling(async () => {
        const membersData = await fetchSiteUsers(federation.id);
        setMembers(membersData);
      }, {
        errorMessage: t('federations.unableToLoadMembers'),
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
        errorMessage: t('federations.unableToLoadAdmins'),
        showError: true
      });
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Add user to federation
  const handleAddUser = async (user) => {
    if (!federation) return;

    try {
      await withErrorHandling(async () => {
        await addUserToSite(federation.id, user.id);
        // Reload members
        const membersData = await fetchSiteUsers(federation.id);
        setMembers(membersData);
        // Close dialog
        setIsAddUserDialogOpen(false);
        // Notify parent component
        if (onFederationChanged) onFederationChanged();
      }, {
        errorMessage: t('federations.unableToAddUser', { name: user.username || `${user.firstName} ${user.lastName}` }),
        showError: true
      });
    } catch (error) {
      console.error('Error adding user to federation:', error);
    }
  };

  // Remove user from federation
  const handleRemoveUser = async (user) => {
    if (!federation) return;

    const userName = user.username || `${user.firstName} ${user.lastName}`;
    const confirmed = window.confirm(
      t('federations.confirmRemoveUser', { name: userName, federation: federation.name })
    );

    if (!confirmed) return;

    try {
      await withErrorHandling(async () => {
        await removeUserFromSite(federation.id, user.id);
        // Update members list
        setMembers(members.filter(m => m.id !== user.id));
        // Notify parent component
        if (onFederationChanged) onFederationChanged();
      }, {
        errorMessage: t('federations.unableToRemoveUser', { name: userName }),
        showError: true
      });
    } catch (error) {
      console.error('Error removing user from federation:', error);
    }
  };

  // Add federation admin
  const handleAddAdmin = async (user) => {
    if (!federation) return;

    try {
      await withErrorHandling(async () => {
        await addSiteAdmin(federation.id, user.id);
        // Reload admins
        const adminsData = await fetchSiteAdmins(federation.id);
        setAdmins(adminsData);
        // Close dialog
        setIsAddAdminDialogOpen(false);
        // Notify parent component
        if (onFederationChanged) onFederationChanged();
      }, {
        errorMessage: t('federations.unableToAddAdmin', { name: user.username || `${user.firstName} ${user.lastName}` }),
        showError: true
      });
    } catch (error) {
      console.error('Error adding admin to federation:', error);
    }
  };

  // Remove federation admin
  const handleRemoveAdmin = async (user) => {
    if (!federation) return;

    const userName = user.username || `${user.firstName} ${user.lastName}`;
    const confirmed = window.confirm(
      t('federations.confirmRemoveAdmin', { name: userName, federation: federation.name })
    );

    if (!confirmed) return;

    try {
      await withErrorHandling(async () => {
        await removeSiteAdmin(federation.id, user.id);
        // Update admins list
        setAdmins(admins.filter(a => a.id !== user.id));
        // Notify parent component
        if (onFederationChanged) onFederationChanged();
      }, {
        errorMessage: t('federations.unableToRemoveAdmin', { name: userName }),
        showError: true
      });
    } catch (error) {
      console.error('Error removing admin from federation:', error);
    }
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
          <Tab label={t('federations.members', {count: members.length })} />
          <Tab label={t('federations.admins')} />
        </Tabs>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder={t('federations.searchUsers')}
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
          
          {hasPermissionToEdit && activeTab === 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsAddUserDialogOpen(true)}
            >
              {t('federations.addUser')}
            </Button>
          )}
          
          {hasPermissionToEdit && activeTab === 1 && 
            (<Button
              startIcon={<AdminPanelSettingsIcon />}
              variant="outlined"
              size="small"
              onClick={() => setIsAddAdminDialogOpen(true)}
            >
              {t('federations.addAdmin')}
            </Button>
          )}
        </Box>

        {!hasPermissionToEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('federations.viewOnlyMode')}
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
                  ? t('federations.noUsersMatchingSearch') 
                  : t('federations.noMembersInFederation')}
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
                        {currentUser.id === user.id ? '' : 
                          hasPermissionToEdit && (
                            <Tooltip title={t('federations.removeFromFederation')}>
                              <IconButton edge="end" onClick={() => handleRemoveUser(user)}>
                                <PersonRemoveIcon />
                              </IconButton>
                            </Tooltip>
                          )
                        }
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
                      ? t('federations.noAdminsMatchingSearch') 
                      : t('federations.noAdminsInFederation')}
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
                        {currentUser.id === user.id ? '' : 
                          hasPermissionToEdit && (
                            <Tooltip title={t('federations.removeAdminRole')}>
                              <IconButton edge="end" onClick={() => handleRemoveAdmin(user)}>
                                <PersonRemoveIcon />
                              </IconButton>
                            </Tooltip>
                          )
                        }
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )
            )}
          </Box>
    
          {/* Dialog for adding users to federation */}
          <UserSelectionDialog
            open={isAddUserDialogOpen}
            onClose={() => setIsAddUserDialogOpen(false)}
            onSelect={handleAddUser}
            excludeUserIds={members.map(m => m.id)}
          />
    
          {/* Dialog for adding admins to federation */}
          <UserSelectionDialog
            open={isAddAdminDialogOpen}
            onClose={() => setIsAddAdminDialogOpen(false)}
            onSelect={handleAddAdmin}
            excludeUserIds={admins.map(a => a.id)}
          />
        </Drawer>
      );
    };
    
    export default SiteDetailsDrawer;