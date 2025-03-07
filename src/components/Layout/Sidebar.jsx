import React from 'react';
import {
  Drawer, Toolbar, List, ListItem, ListItemIcon,
  ListItemText, Divider, Box
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

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
            <ListItem
                button
                selected={currentSection === 'dashboard'}
                onClick={() => onSectionChange('dashboard')}
                sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
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