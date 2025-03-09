import React, {useContext} from 'react';
import {AppBar, Avatar, Badge, IconButton, Menu, MenuItem, Toolbar, Typography} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import {useNotification} from '../../hooks/useNotification';
import {AuthContext} from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AppHeader = ({ onMenuClick }) => {
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
              Controllo Accesso Risorse Cloud
            </Typography>

            <IconButton color="inherit">
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

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
            Profilo
          </MenuItem>
          {currentUser?.role === 'admin' && (
              <MenuItem onClick={handleNavigateToAdmin}>
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                Amministrazione
              </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </>
  );
};

export default AppHeader;