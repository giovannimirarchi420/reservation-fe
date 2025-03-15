import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { deDE, enUS, itIT } from '@mui/material/locale';
import { useTranslation } from 'react-i18next';

// Create the context
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const ThemeProvider = ({ children }) => {
  const { i18n } = useTranslation();
  
  // Check if dark mode is saved in localStorage, otherwise use the system preference
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedThemeMode = localStorage.getItem('themeMode');
  const [mode, setMode] = useState(storedThemeMode || (prefersDarkMode ? 'dark' : 'light'));

  // Get the appropriate locale based on the current language
  const getLocale = (language) => {
    if (language?.startsWith('en')) return enUS;
    if (language?.startsWith('it')) return itIT;
    if (language?.startsWith('de')) return deDE;
    return enUS; // Default
  };

  // Define the colorMode object with the toggle function
  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
    }),
    [mode],
  );

  // Create the theme
  const theme = useMemo(() => {
    // Get current locale to apply to MUI components
    const currentLocale = getLocale(i18n.language);

    return createTheme(
      {
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode palette
                primary: {
                  main: '#1976d2',
                  light: '#42a5f5',
                  dark: '#1565c0',
                },
                secondary: {
                  main: '#dc004e',
                  light: '#ff4081',
                  dark: '#c51162',
                },
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
              }
            : {
                // Dark mode palette
                primary: {
                  main: '#90caf9',
                  light: '#e3f2fd',
                  dark: '#42a5f5',
                },
                secondary: {
                  main: '#f48fb1',
                  light: '#f8bbd0',
                  dark: '#ec407a',
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
              }),
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h6: {
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: mode === 'light' 
                  ? '0 2px 8px rgba(0,0,0,0.1)' 
                  : '0 2px 8px rgba(0,0,0,0.4)',
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(224, 29, 29, 0.05)',
              }
            }
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              }
            }
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                color: mode === 'light' ? '#fff' : '#000',
              }
            }
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              }
            }
          }
        },
      },
      currentLocale
    );
  }, [mode, i18n.language]);

  // Save the mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useColorMode = () => {
  return useContext(ColorModeContext);
};