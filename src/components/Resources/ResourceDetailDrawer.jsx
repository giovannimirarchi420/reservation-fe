import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Chip,
  Button,
  Paper,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  useMediaQuery // Import useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Storage as StorageIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Event as EventIcon,
  Folder as FolderIcon,
  Receipt as ReceiptIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { ResourceStatus } from '../../services/resourceService';
import { fetchEvents } from '../../services/bookingService';
import useApiError from '../../hooks/useApiError';
import { formatDate } from '../../utils/dateUtils';
import { useTheme } from '@mui/material/styles';

const ResourceDetailDrawer = ({ open, resource, resourceTypes, allResources, getResourceTypeName, onClose, onResourceSelect }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const theme = useTheme(); // Get the theme for breakpoint values
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check for mobile screen size
  const [parentResource, setParentResource] = useState(null);
  const [childResources, setChildResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loadingChildren, setLoadingChildren] = useState(false);

  useEffect(() => {
    // Reset state when resource changes
    if (resource) {
      setActiveTab(0);
      loadResourceRelationships();
      
      // Reset bookings data
      setBookings([]);
      setBookingsError(null);
    }
  }, [resource]);
  
  // Load bookings when the active tab changes to bookings tab (index 1)
  useEffect(() => {
    if (resource && activeTab === 1) {
      loadResourceBookings();
    }
  }, [resource, activeTab]);
  
  // Function to load resource bookings from the API
  const loadResourceBookings = async () => {
    if (!resource) return;
    
    setLoadingBookings(true);
    setBookingsError(null);
    
    try {
      await withErrorHandling(async () => {
        // Prepare date range filters (3 months in the past to 3 months in the future)
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3); // 3 months ago
        
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // 3 months in the future
        
        // Fetch events with resource filter
        const eventsData = await fetchEvents({
          resourceId: resource.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        
        // Process the events data
        const processedEvents = eventsData.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        
        // Sort by date (upcoming first, then past)
        processedEvents.sort((a, b) => {
          const now = new Date();
          const aIsFuture = a.start > now;
          const bIsFuture = b.start > now;
          
          // If both are future events or both are past events, sort by date
          if (aIsFuture === bIsFuture) {
            return a.start - b.start;
          }
          
          // Future events come first
          return aIsFuture ? -1 : 1;
        });
        
        setBookings(processedEvents);
      }, {
        errorMessage: t('resourceExplorer.unableToLoadBookings'),
        showError: true,
        rethrowError: true
      });
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookingsError(error.message || t('resourceExplorer.errorLoadingBookings'));
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadResourceRelationships = async () => {
    if (!resource) return;

    // Find parent resource
    if (resource.parentId) {
      const parent = allResources.find(r => r.id === resource.parentId);
      setParentResource(parent || null);
    } else {
      setParentResource(null);
    }

    // Load child resources
    if (resource.subResourceIds && resource.subResourceIds.length > 0) {
      setLoadingChildren(true);
      try {
        const children = allResources.filter(r => resource.subResourceIds.includes(r.id));
        setChildResources(children);
      } finally {
        setLoadingChildren(false);
      }
    } else {
      setChildResources([]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case ResourceStatus.ACTIVE:
        return { label: t('resourceExplorer.active'), color: 'success' };
      case ResourceStatus.MAINTENANCE:
        return { label: t('resourceExplorer.maintenance'), color: 'warning' };
      case ResourceStatus.UNAVAILABLE:
        return { label: t('resourceExplorer.unavailable'), color: 'error' };
      default:
        return { label: t('resourceExplorer.unknown'), color: 'default' };
    }
  };

  // Handle click on a resource in the hierarchy
  const handleResourceClick = (resourceId) => {
    const clickedResource = allResources.find(r => r.id === resourceId);
    if (clickedResource && onResourceSelect) {
      onClose();
      setTimeout(() => onResourceSelect(clickedResource), 300);
    }
  };

  // Open calendar with pre-selected resource
  const handleViewInCalendar = () => {
    if (!resource) return;
    
    // Store booking data in localStorage for passing between pages
    // Usa la data corrente, poiché stiamo solo selezionando la risorsa per una nuova prenotazione
    localStorage.setItem('viewBookingInCalendar', JSON.stringify({
      date: new Date().toISOString(),
      resourceId: resource.id
      // Non includiamo un ID prenotazione poiché stiamo solo visualizzando la risorsa
    }));
    
    // Navigate to calendar page
    window.open('/calendar', '_self');
  };

  // Render tabs for different information sections
  const renderTabs = () => {
    return (
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('resourceExplorer.details')} />
          <Tab label={t('resourceExplorer.bookings')} />
          <Tab label={t('resourceExplorer.hierarchy')} />
        </Tabs>
      </Box>
    );
  };

  // Render details tab
  const renderDetailsTab = () => {
    if (!resource) return null;
    
    const statusInfo = getStatusInfo(resource.status);
    const typeInfo = resourceTypes.find(t => t.id === resource.typeId);
    
    return (
      <Box sx={{ p: 2 }}>
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              {t('resourceExplorer.type')}
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                label={typeInfo ? typeInfo.name : t('resourceExplorer.unknownType')}
                size="small"
                sx={{ 
                  bgcolor: typeInfo ? typeInfo.color : '#808080',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StorageIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              {t('resourceExplorer.specifications')}
            </Typography>
            <Typography variant="body2" sx={{ ml: 'auto' }}>
              {resource.specs}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              {t('resourceExplorer.location')}
            </Typography>
            <Typography variant="body2" sx={{ ml: 'auto' }}>
              {resource.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              {t('resourceExplorer.status')}
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                label={statusInfo.label}
                size="small"
                color={statusInfo.color}
              />
            </Box>
          </Box>
        </Paper>
        
        <Typography variant="subtitle2" gutterBottom>
          {t('resourceExplorer.resourceInformation')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('resourceExplorer.resourceDescription')}
        </Typography>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CalendarMonthIcon />}
          fullWidth
          onClick={handleViewInCalendar}
          sx={{ mt: 2 }}
        >
          {t('resourceExplorer.viewInCalendar')}
        </Button>
      </Box>
    );
  };

  // Render bookings tab
  const renderBookingsTab = () => {
    // Separate upcoming and past bookings
    const now = new Date();
    const upcomingBookings = bookings.filter(booking => booking.start > now);
    const pastBookings = bookings.filter(booking => booking.start <= now);
    
    // Function to view specific booking in the calendar
    const viewBookingInCalendar = (booking) => {
      if (!resource || !booking) return;
      
      // Store booking data in localStorage for passing between pages
      // Passa esplicitamente la data di inizio della prenotazione
      localStorage.setItem('viewBookingInCalendar', JSON.stringify({
        date: booking.start.toISOString(), // Usa la data di inizio della prenotazione, non la data corrente
        resourceId: resource.id,
        id: booking.id
      }));
      
      // Navigate to calendar page
      window.open('/calendar', '_self');
    };
    
    return (
      <Box sx={{ p: 2 }}>
        {loadingBookings ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {t('resourceExplorer.loadingBookings')}
            </Typography>
          </Box>
        ) : bookingsError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {bookingsError}
          </Alert>
        ) : (
          <>
            <Typography variant="subtitle2" gutterBottom>
              {t('resourceExplorer.upcomingBookings')}
            </Typography>
            
            {upcomingBookings.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('resourceExplorer.noUpcomingBookings')}
              </Alert>
            ) : (
              <List sx={{ mb: 3 }}>
                {upcomingBookings.map(booking => (
                  <Paper
                    key={booking.id}
                    variant="outlined"
                    sx={{ mb: 2, overflow: 'hidden' }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2">{booking.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(booking.start, 'DD/MM/YYYY HH:mm')} - {formatDate(booking.end, 'HH:mm')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                          {booking.userName?.split(' ').map(n => n[0]).join('') || 'U'}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {booking.userName || t('resourceExplorer.unknownUser')}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="text"
                      size="small"
                      endIcon={<OpenInNewIcon />}
                      onClick={() => viewBookingInCalendar(booking)}
                      sx={{ ml: 'auto', display: 'block', width: '100%', bgcolor: 'action.hover' }}
                    >
                      {t('resourceExplorer.viewDetails')}
                    </Button>
                  </Paper>
                ))}
              </List>
            )}
            
            {pastBookings.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  {t('resourceExplorer.recentBookings')}
                </Typography>
                
                <List sx={{ mb: 3, opacity: 0.8 }}>
                  {pastBookings.slice(0, 3).map(booking => (
                    <Paper
                      key={booking.id}
                      variant="outlined"
                      sx={{ mb: 2, overflow: 'hidden' }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2">{booking.title}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(booking.start, 'DD/MM/YYYY HH:mm')} - {formatDate(booking.end, 'HH:mm')}
                          </Typography>
                        </Box>
                        <Chip 
                          size="small" 
                          color="default" 
                          label={t('resourceExplorer.completed')} 
                          sx={{ mt: 1 }} 
                        />
                      </Box>
                    </Paper>
                  ))}
                  
                  {pastBookings.length > 3 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                      {t('resourceExplorer.andMorePastBookings', { count: pastBookings.length - 3 })}
                    </Typography>
                  )}
                </List>
              </>
            )}
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EventIcon />}
              fullWidth
              onClick={handleViewInCalendar}
              sx={{ mt: 2 }}
            >
              {t('resourceExplorer.bookThisResource')}
            </Button>
          </>
        )}
      </Box>
    );
  };

  // Render hierarchy tab
  const renderHierarchyTab = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('resourceExplorer.resourceHierarchy')}
        </Typography>
        
        {parentResource && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('resourceExplorer.parentResource')}:
            </Typography>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <ListItemButton onClick={() => handleResourceClick(parentResource.id)}>
                <ListItemIcon>
                  <FolderIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={parentResource.name} 
                  secondary={getResourceTypeName(parentResource.typeId)}
                />
              </ListItemButton>
            </Paper>
          </Box>
        )}
        
        {(childResources.length > 0 || loadingChildren) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('resourceExplorer.childResources')}:
            </Typography>
            
            {loadingChildren ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('resourceExplorer.loadingChildResources')}
                </Typography>
              </Box>
            ) : (
              <Paper variant="outlined">
                <List component="div" disablePadding>
                  {childResources.map(child => (
                    <ListItemButton 
                      key={child.id}
                      onClick={() => handleResourceClick(child.id)}
                      sx={{ pl: 2 }}
                    >
                      <ListItemIcon>
                        <StorageIcon color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={child.name} 
                        secondary={getResourceTypeName(child.typeId)}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        )}
        
        {!parentResource && childResources.length === 0 && !loadingChildren && (
          <Alert severity="info">
            {t('resourceExplorer.noHierarchyRelationships')}
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 400, // Full width on mobile, 400px otherwise
          maxWidth: '100%', // Ensure it doesn't exceed screen width on mobile
          boxSizing: 'border-box'
        }
      }}
    >
      {resource ? (
        <>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {resource.name}
            </Typography>
            <IconButton edge="end" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {renderTabs()}
          
          {activeTab === 0 && renderDetailsTab()}
          {activeTab === 1 && renderBookingsTab()}
          {activeTab === 2 && renderHierarchyTab()}
        </>
      ) : null}
    </Drawer>
  );
};

export default ResourceDetailDrawer;