import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import {
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createEvent, fetchMyEvents } from '../../services/bookingService';
import { fetchResources } from '../../services/resourceService';
import useApiError from '../../hooks/useApiError';
import moment from 'moment';
import 'moment/locale/it';
import { formatDate } from '../../utils/dateUtils';
import BookingForm from './BookingForm';

// Component to show the user's booking summary
const MyBookingsPage = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { withErrorHandling } = useApiError();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1); // 0 = current, 1 = future, 2 = past
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    future: 0,
    past: 0,
    thisMonth: 0,
    lastMonth: 0,
    current: 0,
  });

  const loadUserBookings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const eventsData = await withErrorHandling(async () => {
        return await fetchMyEvents();
      }, {
        errorMessage: t('errors.unableToLoadYourBookings'),
        showError: true,
        rethrowError: false
      }) || [];

      const resourcesData = await withErrorHandling(async () => {
        return await fetchResources();
      }, {
        errorMessage: t('errors.unableToLoadResourceData'),
        showError: true,
        rethrowError: false
      }) || [];
        
      const processedEvents = eventsData.map(event => {
        const resource = resourcesData.find(r => r.id === event.resourceId);
        return {
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          resourceName: resource ? resource.name : t('bookingForm.unknownResource')
        };
      });
      
      setBookings(processedEvents);
      setResources(resourcesData);
      
      calculateStats(processedEvents);
    } finally {
      setIsLoading(false);
    }
  }, [withErrorHandling, currentUser, t, i18n.language]);

  // Update moment locale based on current language
  useEffect(() => {
    const language = i18n.language || 'it';
    if (language.startsWith('en')) {
      moment.locale('en-gb');
    } else {
      moment.locale('it');
    }
  }, [i18n.language]);

  // Load user bookings
  useEffect(() => {
    loadUserBookings();
  }, [loadUserBookings]);

  // Calculate booking statistics
  const calculateStats = (events) => {
    const now = new Date();
    const thisMonth = moment().startOf('month');
    const lastMonth = moment().subtract(1, 'month').startOf('month');
    
    // Current bookings
    const currentEvents = events.filter(event => new Date(event.start) <= now && new Date(event.end) > now);

    // Future bookings
    const futureEvents = events.filter(event => new Date(event.start) > now);
    
    // Past bookings
    const pastEvents = events.filter(event => new Date(event.end) < now);
    
    // This month's bookings
    const thisMonthEvents = events.filter(event => 
      moment(event.start).isSameOrAfter(thisMonth) && 
      moment(event.start).isBefore(moment(thisMonth).add(1, 'month'))
    );
    
    // Last month's bookings
    const lastMonthEvents = events.filter(event => 
      moment(event.start).isSameOrAfter(lastMonth) && 
      moment(event.start).isBefore(thisMonth)
    );
    
    setStats({
      total: events.length,
      future: futureEvents.length,
      past: pastEvents.length,
      thisMonth: thisMonthEvents.length,
      lastMonth: lastMonthEvents.length,
      current: currentEvents.length,
    });
  };

  const handleNewBooking = () => {
    setIsBookingFormOpen(true);
  };

  const handleCloseBookingForm = () => {
    setIsBookingFormOpen(false);
  };

  const handleSaveBooking = async (bookingData) => {
    await withErrorHandling(async () => {
      await createEvent(bookingData);
      setIsBookingFormOpen(false);
      await loadUserBookings();
    }, {
      successMessage: t('myBookings.bookingCreatedSuccess'),
      errorMessage: t('errors.errorCreatingBooking'),
    });
  };

  // Change active tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    if (activeTab === 0) { // Current
      return new Date(booking.start) <= now && new Date(booking.end) > now;
    } else if (activeTab === 1) { // Future
      return new Date(booking.start) > now;
    } else { // Past
      return new Date(booking.end) < now;
    }
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (activeTab === 2) { // Past
      // Past: sort by descending date (most recent first)
      return new Date(b.end) - new Date(a.end);
    } else { // Current and Future
      // Current and Future: sort by ascending date (closest first)
      return new Date(a.start) - new Date(b.start);
    }
  });

  // Calculate booking duration in hours
  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const diffHrs = diffMs / (1000 * 60 * 60);
    return diffHrs.toFixed(1);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{t('myBookings.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNewBooking}
        >
          {t('myBookings.newBooking')}
        </Button>
      </Box>
      
      {/* Main statistics */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={3} 
        sx={{ mb: 3 }}
      >
        <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white', flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{t('myBookings.total')}</Typography>
              <CalendarTodayIcon />
            </Box>
            <Typography variant="h3">{stats.total}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.warning.main, color: 'white', flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{t('myBookings.current')}</Typography>
              <AccessTimeIcon />
            </Box>
            <Typography variant="h3">{stats.current}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.success.main, color: 'white', flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{t('myBookings.future')}</Typography>
              <EventAvailableIcon />
            </Box>
            <Typography variant="h3">{stats.future}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.secondary.main, color: 'white', flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{t('myBookings.completed')}</Typography>
              <EventBusyIcon />
            </Box>
            <Typography variant="h3">{stats.past}</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Tabs to choose between future and past bookings */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`${t('myBookings.currentBookings')} (${stats.current})`} />
          <Tab label={`${t('myBookings.futureBookings')} (${stats.future})`} />
          <Tab label={`${t('myBookings.pastBookings')} (${stats.past})`} />
        </Tabs>
      </Paper>
      
      {/* Booking list */}
      <Paper sx={{ p: 0 }}>
        {sortedBookings.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {activeTab === 0
                ? t('myBookings.noCurrentBookings')
                : activeTab === 1
                ? t('myBookings.noFutureBookings')
                : t('myBookings.noPastBookings')}
            </Typography>
            {activeTab !== 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {activeTab === 1
                  ? t('myBookings.upcomingBookingsWillAppear')
                  : t('myBookings.bookingHistoryWillAppear')}
              </Typography>
            )}
          </Box>
        ) : (
          sortedBookings.map((booking, index) => (
            <React.Fragment key={booking.id}>
              {index > 0 && <Divider />}
              <Box sx={{ p: 3 }}>
                <Stack 
                  direction={{ xs: 'column', md: 'row' }} 
                  spacing={2}
                >
                  {/* Date and time */}
                  <Box sx={{ width: { xs: '100%', md: '25%' } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {formatDate(booking.start, 'dddd D MMMM YYYY')}
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(booking.start, 'HH:mm')} - {formatDate(booking.end, 'HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('myBookings.duration')} {calculateDuration(booking.start, booking.end)} {t('myBookings.hours')}
                    </Typography>
                  </Box>
                  
                  {/* Title and resource */}
                  <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="h6">{booking.title}</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>{t('myBookings.resource')}</strong> {booking.resourceName}
                    </Typography>
                    {booking.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {booking.description}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Status */}
                  <Box 
                    sx={{ 
                      width: { xs: '100%', md: '25%' },
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: { xs: 'flex-start', md: 'flex-end' } 
                    }}
                  >
                    <Chip
                      label={
                        activeTab === 0 ? t('myBookings.inProgress') :
                        activeTab === 1 ? t('myBookings.future') :
                        t('myBookings.completed')
                      }
                      color={
                        activeTab === 0 ? 'warning' :
                        activeTab === 1 ? 'primary' :
                        'default'
                      }
                      variant={
                        activeTab === 0 || activeTab === 1 ? 'filled' : 'outlined'
                      }
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ mt: 'auto' }}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => {
                          // Store booking data in localStorage for passing between pages
                          localStorage.setItem('viewBookingInCalendar', JSON.stringify({
                            date: booking.start,
                            id: booking.id,
                            resourceId: booking.resourceId
                          }));
                          window.open('/calendar', '_self');
                        }}
                      >
                        {t('myBookings.viewInCalendar')}
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </React.Fragment>
          ))
        )}
      </Paper>

      <BookingForm
        open={isBookingFormOpen}
        onClose={handleCloseBookingForm}
        onSave={handleSaveBooking}
        resources={resources}
      />
    </Box>
  );
};

export default MyBookingsPage;