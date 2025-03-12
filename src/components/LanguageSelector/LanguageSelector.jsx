import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';

/**
 * Language Selector component
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

  return (
    <>
      <Tooltip title={t('languageSelector.language')}>
        <Button
          color="inherit"
          onClick={handleClick}
          startIcon={<TranslateIcon />}
          size="small"
        >
          {currentLanguage === 'en' ? 'EN' : 'IT'}
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
          {currentLanguage === 'en' && (
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
          )}
          <ListItemText>{t('languageSelector.english')}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => changeLanguage('it')} selected={currentLanguage === 'it'}>
          {currentLanguage === 'it' && (
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
          )}
          <ListItemText>{t('languageSelector.italian')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelector;