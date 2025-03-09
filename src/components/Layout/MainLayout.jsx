import React, {useState} from 'react';
import {Box} from '@mui/material';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import Footer from './Footer';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader 
        onMenuClick={handleDrawerToggle} 
      />
      
      <Sidebar 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
      />
      
      <Box component="main" sx={{ flexGrow: 1, pt: 8, pb: 3 }}>
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
};

export default MainLayout;