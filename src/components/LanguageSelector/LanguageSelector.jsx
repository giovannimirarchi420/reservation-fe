import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Box
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';

/**
 * Language Selector component with country flags
 * Allows users to switch between available languages
 */
const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    handleClose();
  };

  const currentLanguage = i18n.language?.startsWith('it') ? 'it' : 'en';

  // SVG flags inline (small and optimized)
  const flags = {
    en: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="22" height="16">
        <clipPath id="a">
          <path d="M0 0v30h60V0z"/>
        </clipPath>
        <clipPath id="b">
          <path d="M30 15h30v15zv15H0zH0V0zV0h30z"/>
        </clipPath>
        <g clipPath="url(#a)">
          <path d="M0 0v30h60V0z" fill="#012169"/>
          <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
          <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
          <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
        </g>
      </svg>
    ),
    it: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="22" height="16">
        <rect width="1" height="2" fill="#009246" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#ce2b37" />
      </svg>
    )
  };

  return (
    <>
      <Tooltip title={t('languageSelector.language')}>
        <Button
          color="inherit"
          onClick={handleClick}
          sx={{
            minWidth: 'auto',
            px: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            {flags[currentLanguage]}
          </Box>
          <TranslateIcon sx={{ ml: 0.5, fontSize: '1.2rem' }} />
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
      >
        <MenuItem onClick={() => changeLanguage('en')} selected={currentLanguage === 'en'}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            {flags.en}
          </ListItemIcon>
          <ListItemText primary={t('languageSelector.english')} />
          {currentLanguage === 'en' && (
            <CheckIcon fontSize="small" sx={{ ml: 1 }} />
          )}
        </MenuItem>
        
        <MenuItem onClick={() => changeLanguage('it')} selected={currentLanguage === 'it'}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            {flags.it}
          </ListItemIcon>
          <ListItemText primary={t('languageSelector.italian')} />
          {currentLanguage === 'it' && (
            <CheckIcon fontSize="small" sx={{ ml: 1 }} />
          )}
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelector;