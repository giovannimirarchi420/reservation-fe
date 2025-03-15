import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../../theme/ThemeProvider';

const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const { mode, toggleColorMode } = useColorMode();
  
  return (
    <Tooltip title={mode === 'dark' ? t('themeToggler.lightMode') : t('themeToggler.darkMode')}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        aria-label={mode === 'dark' ? t('themeToggler.lightMode') : t('themeToggler.darkMode')}
      >
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;