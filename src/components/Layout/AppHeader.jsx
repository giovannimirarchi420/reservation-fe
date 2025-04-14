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
import { useSite } from '../../context/SiteContext';
import { useNavigate } from 'react-router-dom';
import NotificationMenu from '../Notifications/NotificationMenu';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import SiteSelector from '../Site/SiteSelector';
import { SiteRoles } from '../../services/siteService';

const AppHeader = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { notifications } = useNotification();
  const { currentUser, logout, isGlobalAdmin, isSiteAdmin, getUserHighestRole } = useContext(AuthContext);
  const { canManageSites } = useSite();
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

  const handleNavigateToSites = () => {
    navigate('/sites');
    handleProfileMenuClose();
  };

  // Get the appropriate color based on user role
  const getRoleColor = () => {
    const highestRole = getUserHighestRole();
    switch(highestRole) {
      case SiteRoles.GLOBAL_ADMIN:
        return 'gold'; // Gold for global admins
      case SiteRoles.SITE_ADMIN:
        return '#f44336'; // Red for site admins
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
            {/* Site Selector */}
            <SiteSelector />
            
            <LanguageSelector />
            <ThemeSwitcher />
            <NotificationMenu />

            <Tooltip title={currentUser && isGlobalAdmin() ? "Global Admin" : (isSiteAdmin() ? "Site Admin" : "User")}>
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
        
        {/* Show Admin menu item if user is either global or site admin */}
        {(isGlobalAdmin() || isSiteAdmin()) && (
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
        
        {/* Show Sites menu item for both global admins and site admins now */}
        {canManageSites() && (
          <MenuItem onClick={handleNavigateToSites}>
            <DomainIcon fontSize="small" sx={{ mr: 1, color: isGlobalAdmin() ? 'gold' : '#f44336' }} />
            {t('appHeader.siteManagement')}
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