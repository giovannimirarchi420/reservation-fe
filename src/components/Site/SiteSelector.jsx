import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Tooltip
} from '@mui/material';
import DomainIcon from '@mui/icons-material/Domain';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../context/SiteContext';

const SiteSelector = () => {
  const { t } = useTranslation();
  const { 
    sites,
    currentSite, 
    setCurrentSite,
    isGlobalAdmin,
    STARTER_FEDERATION
  } = useSite();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (federation) => {
    console.log(federation)
    setCurrentSite(federation);
    handleClose();
  };

  // Check if we should show this component at all
  if (sites.length <= 1 && !isGlobalAdmin()) {
    return null; // Don't show selector if user has only one federation and is not a global admin
  }

  return (
    <Box sx={{ ml: 1, mr: 1 }}>
      <Tooltip title={t('federationSelector.selectFederation')}>
        <Button
          color="inherit"
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 'medium',
            bgcolor: open ? 'action.selected' : 'transparent',
            px: 1.5
          }}
        >
          <DomainIcon sx={{ mr: 1 }} />
          <Typography 
            variant="body1" 
            noWrap 
            sx={{ 
              maxWidth: { xs: 100, sm: 160 }, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis'
            }}
          >
            {currentSite?.name || t('federationSelector.allSites')}
          </Typography>
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: { minWidth: 220 }
        }}
      >
        
        <MenuItem 
          onClick={() => handleSelect(STARTER_FEDERATION)}
          selected={!currentSite}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {currentSite == STARTER_FEDERATION && <CheckIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={t('federationSelector.allSites')} />
        </MenuItem>
      

        {sites.map((federation) => (
          <MenuItem 
            key={federation.id} 
            onClick={() => handleSelect(federation)}
            selected={currentSite?.id === federation.id}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {currentSite?.id === federation.id && <CheckIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText 
              primary={federation.name} 
              secondary={federation.description || ''}
              secondaryTypographyProps={{ 
                sx: { 
                  maxWidth: 200, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                } 
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default SiteSelector;