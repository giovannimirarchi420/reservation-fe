import React, {useContext} from 'react';
import {Box, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import {AuthContext} from '../../context/AuthContext';

const Sidebar = ({ open, onClose, currentSection, onSectionChange }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const isAdmin = currentUser?.role === 'admin';

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
                  <ListItemText primary="Dashboard" />
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
              <ListItemText primary="Calendario" />
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
              <ListItemText primary="Il Mio Profilo" />
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
                  <ListItemText primary="Amministrazione" />
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
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
  );
};

export default Sidebar;