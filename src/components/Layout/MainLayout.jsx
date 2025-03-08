import React, {useState} from 'react';
import {Box} from '@mui/material';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';

const MainLayout = ({ children, currentSection, onSectionChange }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleSectionChange = (section) => {
    onSectionChange(section);
    setIsDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppHeader 
        onMenuClick={handleDrawerToggle} 
      />
      
      <Sidebar 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
      />
      
      <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
