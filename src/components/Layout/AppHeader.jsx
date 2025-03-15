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
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNotification } from '../../hooks/useNotification';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationMenu from '../Notifications/NotificationMenu';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';

const AppHeader = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { notifications } = useNotification();
  const { currentUser, logout } = useContext(AuthContext);
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
            <LanguageSelector />
            <ThemeSwitcher />
            <NotificationMenu />

            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              {currentUser?.avatar ? (
                <Avatar sx={{ width: 32, height: 32, bgcolor: currentUser.role === 'admin' ? 'secondary.main' : 'primary.main' }}>
                  {currentUser.avatar}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
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
        {currentUser?.role === 'admin' && (
          <MenuItem onClick={handleNavigateToAdmin}>
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
            {t('appHeader.administration')}
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