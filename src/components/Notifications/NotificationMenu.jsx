import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
  Avatar,
  Button
} from '@mui/material';
import {
  NotificationsOutlined as NotificationsIcon,
  InfoOutlined as InfoIcon,
  WarningOutlined as WarningIcon,
  CheckCircleOutlined as SuccessIcon,
  ErrorOutlined as ErrorIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { useNotification } from '../../hooks/useNotification';

const NotificationMenu = () => {
  const { t } = useTranslation();
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
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const handleRemoveNotification = (id, event) => {
    event.stopPropagation();
    removeNotification(id);
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    if (!type) return <InfoIcon color="info" />;
    
    // Normalize the type by converting to lowercase
    const normalizedType = String(type).toLowerCase();
    
    switch (normalizedType) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  // Format timestamp to relative time (e.g., "2 hours ago")
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return t('notificationMenu.unknownDate');
    
    try {
      const now = new Date();
      // Handle timestamp as Date objects, ISO strings or numbers
      const notificationTime = new Date(timestamp);
      
      // Check if the date is valid
      if (isNaN(notificationTime.getTime())) {
        return t('notificationMenu.invalidDate');
      }
      
      const diffMs = now - notificationTime;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 0) {
        return `${diffDay} ${diffDay === 1 ? t('notificationMenu.dayAgo') : t('notificationMenu.daysAgo')}`;
      } else if (diffHour > 0) {
        return `${diffHour} ${diffHour === 1 ? t('notificationMenu.hourAgo') : t('notificationMenu.hoursAgo')}`;
      } else if (diffMin > 0) {
        return `${diffMin} ${diffMin === 1 ? t('notificationMenu.minuteAgo') : t('notificationMenu.minutesAgo')}`;
      } else {
        return t('notificationMenu.justNow');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('notificationMenu.invalidDate');
    }
  };
  
  return (
    <>
      <Tooltip title={t('notificationMenu.notifications')}>
        <IconButton
          color="inherit"
          onClick={handleOpenMenu}
          size="large"
        >
          <Badge badgeContent={unreadNotifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: 360,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{t('notificationMenu.notifications')}</Typography>
          {unreadNotifications.length > 0 && (
            <Button 
              size="small" 
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
            >
              {t('notificationMenu.markAllAsRead')}
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('notificationMenu.loadingNotifications')}</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">{t('notificationMenu.errorLoadingNotifications')}</Typography>
            <Button size="small" sx={{ mt: 1 }} onClick={refresh}>
              {t('notificationMenu.tryAgain')}
            </Button>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('notificationMenu.noNotifications')}</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{ 
                  px: 2, 
                  py: 1.5,
                  bgcolor: notification.read ? 'inherit' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  },
                  cursor: notification.read ? 'default' : 'pointer'
                }}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={(e) => handleRemoveNotification(notification.id, e)}
                    aria-label="delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'background.paper' }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body1"
                      sx={{ 
                        fontWeight: notification.read ? 'normal' : 'bold',
                        pr: 4 // Make space for the delete button
                      }}
                    >
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeAgo(notification.createdAt)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                component="a"
                href="/notifications"
                onClick={() => {
                  handleCloseMenu();
                }}
              >
                {t('notificationMenu.viewAllNotifications')}
              </Button>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
};

export default NotificationMenu;