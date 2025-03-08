import React, {useState} from 'react';
import {Box, Paper, Tab, Tabs} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import PeopleIcon from '@mui/icons-material/People';
import ResourceManagement from './ResourceManagement';
import UserManagement from './UserManagement';

const AdminPanel = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Gestione Risorse" icon={<StorageIcon />} />
          <Tab label="Gestione Utenti" icon={<PeopleIcon />} />
        </Tabs>
        
        <Box sx={{ mt: 3 }}>
          {currentTab === 0 && <ResourceManagement />}
          {currentTab === 1 && <UserManagement />}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPanel;
