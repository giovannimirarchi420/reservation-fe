import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
  Alert,
  MenuItem,
  Menu
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  InfoOutlined as InfoIcon,
  WarningOutlined as WarningIcon,
  CheckCircleOutlined as SuccessIcon,
  ErrorOutlined as ErrorIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useNotification } from '../../hooks/useNotification';

const NotificationsPage = () => {
  const theme = useTheme();
  const { 
    notifications, 
    unreadNotifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    loading,
    error,
    refresh
  } = useNotification();
  
  const [activeTab, setActiveTab] = useState(0); // 0 = all, 1 = unread
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleOpenFilterMenu = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
  };
  
  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
    handleCloseFilterMenu();
  };
  
  // Apply filters
  const filteredNotifications = notifications
    .filter(notification => {
      // Tab filter
      if (activeTab === 1 && notification.read) {
        return false;
      }
      
      // Type filter
      if (typeFilter !== 'all' && notification.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by unread first, then by date (newest first)
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    if (!type) return <InfoIcon color="info" />;
    
    // Normalizza il tipo convertendolo in lowercase
    const normalizedType = String(type).toLowerCase();
    
    switch (normalizedType) {
      case 'success':
        return <SuccessIcon fontSize="medium" color="success" />;
      case 'warning':
        return <WarningIcon fontSize="medium" color="warning" />;
      case 'error':
        return <ErrorIcon fontSize="medium" color="error" />;
      case 'info':
      default:
        return <InfoIcon fontSize="medium" color="info" />;
    }
  };
  
  // Format timestamp to readable date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Data sconosciuta';
    
    try {
      const date = new Date(timestamp);
      
      // Verifica se la data è valida
      if (isNaN(date.getTime())) {
        return 'Data non valida';
      }
      
      return date.toLocaleString('it-IT', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Errore nella formattazione della data:', error);
      return 'Data non valida';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Centro Notifiche</Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={`Tutte (${notifications.length})`} />
            <Tab label={`Non lette (${unreadNotifications.length})`} />
          </Tabs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={handleOpenFilterMenu}
              sx={{ mr: 1 }}
            >
              {typeFilter === 'all' ? 'Tutti i tipi' : `Tipo: ${typeFilter}`}
            </Button>
            
            {unreadNotifications.length > 0 && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={markAllAsRead}
              >
                Segna tutte come lette
              </Button>
            )}
          </Box>
          
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleCloseFilterMenu}
          >
            <MenuItem 
              onClick={() => handleTypeFilterChange('all')}
              selected={typeFilter === 'all'}
            >
              Tutti i tipi
            </MenuItem>
            <MenuItem 
              onClick={() => handleTypeFilterChange('info')}
              selected={typeFilter === 'info'}
            >
              <InfoIcon color="info" sx={{ mr: 1 }} />
              Informazioni
            </MenuItem>
            <MenuItem 
              onClick={() => handleTypeFilterChange('success')}
              selected={typeFilter === 'success'}
            >
              <SuccessIcon color="success" sx={{ mr: 1 }} />
              Successo
            </MenuItem>
            <MenuItem 
              onClick={() => handleTypeFilterChange('warning')}
              selected={typeFilter === 'warning'}
            >
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              Avvisi
            </MenuItem>
            <MenuItem 
              onClick={() => handleTypeFilterChange('error')}
              selected={typeFilter === 'error'}
            >
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              Errori
            </MenuItem>
          </Menu>
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Caricamento notifiche...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ my: 3 }}>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={refresh}>
                Riprova
              </Button>
            }
          >
            Errore nel caricamento delle notifiche: {error}
          </Alert>
        </Box>
      ) : filteredNotifications.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Nessuna notifica da visualizzare
        </Alert>
      ) : (
        <Stack spacing={2}>
          {filteredNotifications.map(notification => (
            <Card 
              key={notification.id} 
              sx={{ 
                borderLeft: notification.read ? `4px solid ${theme.palette.divider}` : `4px solid ${theme.palette.primary.main}`,
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
                transition: 'background-color 0.3s'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="div" 
                      sx={{ 
                        fontWeight: notification.read ? 'normal' : 'bold',
                        mb: 1
                      }}
                    >
                      {notification.message}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={notification.type ? notification.type.toUpperCase() : 'INFO'} 
                          size="small"
                          color={
                            notification.type && notification.type.toLowerCase() === 'success' ? 'success' :
                            notification.type && notification.type.toLowerCase() === 'error' ? 'error' :
                            notification.type && notification.type.toLowerCase() === 'warning' ? 'warning' : 'info'
                          }
                          variant="outlined"
                        />
                        
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(notification.createdAt)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        {!notification.read && (
                          <Button 
                            size="small" 
                            onClick={() => markAsRead(notification.id)}
                            sx={{ mr: 1 }}
                          >
                            Segna come letta
                          </Button>
                        )}
                        
                        <IconButton 
                          size="small" 
                          onClick={() => removeNotification(notification.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default NotificationsPage;