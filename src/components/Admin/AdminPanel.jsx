import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import ResourceManagement from './ResourceManagement';
import UserManagement from './UserManagement';
import ResourceTypeManagement from './ResourceTypeManagement';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState(0);
  const [openResourceTypeForm, setOpenResourceTypeForm] = useState(false);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Function to switch to resource type tab and open the form
  const handleSwitchToResourceType = () => {
    setCurrentTab(1); // Switch to the "Resource Types" tab (index 1)
    setOpenResourceTypeForm(true); // Set the flag to open the form
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
          <Tab 
            label={t('adminPanel.resourceManagement')} 
            icon={<StorageIcon />} 
          />
          <Tab 
            label={t('adminPanel.resourceTypes')} 
            icon={<CategoryIcon />} 
          />
          <Tab 
            label={t('adminPanel.userManagement')} 
            icon={<PeopleIcon />} 
          />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {currentTab === 0 && (
            <ResourceManagement
              onSwitchToResourceType={handleSwitchToResourceType}
            />
          )}
          {currentTab === 1 && (
            <ResourceTypeManagement
              openFormOnMount={openResourceTypeForm}
              resetOpenFormFlag={() => setOpenResourceTypeForm(false)}
            />
          )}
          {currentTab === 2 && <UserManagement />}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPanel;