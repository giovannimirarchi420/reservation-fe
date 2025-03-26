import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Box,
  Divider,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DomainIcon from '@mui/icons-material/Domain';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useNotification } from '../../hooks/useNotification';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationMenu from '../Notifications/NotificationMenu';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import FederationSelector from '../Federation/FederationSelector';
import { FederationRoles } from '../../services/federationService';

const AppHeader = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { notifications } = useNotification();
  const { currentUser, logout, isGlobalAdmin, isFederationAdmin, getUserHighestRole } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleNavigateToAdmin = () => {
    navigate('/admin');
    handleProfileMenuClose();
  };

  const handleNavigateToFederations = () => {
    navigate('/federations');
    handleProfileMenuClose();
  };

  // Get the appropriate color based on user role
  const getRoleColor = () => {
    const highestRole = getUserHighestRole();
    switch(highestRole) {
      case FederationRoles.GLOBAL_ADMIN:
        return 'gold'; // Gold for global admins
      case FederationRoles.FEDERATION_ADMIN:
        return '#f44336'; // Red for federation admins
      default:
        return 'primary.main'; // Default blue for regular users
    }
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t('appHeader.title')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Federation Selector */}
            <FederationSelector />
            
            <LanguageSelector />
            <ThemeSwitcher />
            <NotificationMenu />

            <Tooltip title={currentUser && isGlobalAdmin() ? "Global Admin" : (isFederationAdmin() ? "Federation Admin" : "User")}>
              <IconButton
                color="inherit"
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                {currentUser?.avatar ? (
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: getRoleColor(),
                  }}>
                    {currentUser.avatar}
                  </Avatar>
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleNavigateToProfile}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          {t('appHeader.profile')}
        </MenuItem>
        
        {/* Show Admin menu item if user is either global or federation admin */}
        {(isGlobalAdmin() || isFederationAdmin()) && (
          <MenuItem onClick={handleNavigateToAdmin}>
            {isGlobalAdmin() ? (
              <>
                <SecurityIcon fontSize="small" sx={{ mr: 1, color: 'gold' }} />
                {t('appHeader.administration')}
              </>
            ) : (
              <>
                <SupervisorAccountIcon fontSize="small" sx={{ mr: 1, color: '#f44336' }} />
                {t('appHeader.administration')}
              </>
            )}
          </MenuItem>
        )}
        
        {/* Show Federations menu item only for global admins */}
        {isGlobalAdmin() && (
          <MenuItem onClick={handleNavigateToFederations}>
            <DomainIcon fontSize="small" sx={{ mr: 1, color: 'gold' }} />
            {t('appHeader.federationManagement')}
          </MenuItem>
        )}
        
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          {t('appHeader.logout')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default AppHeader;