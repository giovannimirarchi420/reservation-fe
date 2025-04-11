import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExploreIcon from '@mui/icons-material/Explore';
import DomainIcon from '@mui/icons-material/Domain';
import { AuthContext } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

const Sidebar = ({ open, onClose, currentSection, onSectionChange }) => {
  const { t } = useTranslation();
  const { 
    currentUser, 
    logout, 
    isGlobalAdmin, 
    isSiteAdmin 
  } = useContext(AuthContext);
  const { canManageSites } = useSite();
  
  // Check if user has admin rights (either global or site)
  const isAdmin = isGlobalAdmin() || isSiteAdmin();

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {isAdmin && (
            <ListItem
              button
              selected={currentSection === 'dashboard'}
              onClick={() => onSectionChange('dashboard')}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary={t('sidebar.dashboard')} />
            </ListItem>
          )}
          <ListItem
            button
            selected={currentSection === 'calendar'}
            onClick={() => onSectionChange('calendar')}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary={t('sidebar.calendar')} />
          </ListItem>
          <ListItem
            button
            selected={currentSection === 'resources'}
            onClick={() => onSectionChange('resources')}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>
              <ExploreIcon />
            </ListItemIcon>
            <ListItemText primary={t('sidebar.resources')} />
          </ListItem>
          <ListItem
            button
            selected={currentSection === 'mybookings'}
            onClick={() => onSectionChange('mybookings')}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>
              <ListAltIcon />
            </ListItemIcon>
            <ListItemText primary={t('sidebar.myBookings')} />
          </ListItem>
          <ListItem
            button
            selected={currentSection === 'profile'}
            onClick={() => onSectionChange('profile')}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={t('sidebar.myProfile')} />
          </ListItem>
          <ListItem
            button
            selected={currentSection === 'notifications'}
            onClick={() => onSectionChange('notifications')}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText primary={t('sidebar.notifications')} />
          </ListItem>
        </List>
        <Divider />
        <List>
          {isAdmin && (
            <ListItem
              button
              selected={currentSection === 'admin'}
              onClick={() => onSectionChange('admin')}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={t('sidebar.administration')} />
            </ListItem>
          )}
          
          {canManageSites() && (
            <ListItem
              button
              selected={currentSection === 'sites'}
              onClick={() => onSectionChange('sites')}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>
                <DomainIcon />
              </ListItemIcon>
              <ListItemText primary={t('sidebar.federations')} />
            </ListItem>
          )}
          <ListItem
            button
            onClick={logout}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('sidebar.logout')} />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;