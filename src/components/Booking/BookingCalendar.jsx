import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/it';
import 'moment/locale/en-gb';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendarStyles.css';
import '../../styles/calendarDarkStyles.css';
import {
    Box,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    Snackbar,
    Alert,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    CalendarViewDay,
    CalendarViewMonth,
    CalendarViewWeek,
    ChevronLeft,
    ChevronRight,
    FilterList,
    Today as TodayIcon
} from '@mui/icons-material';
import BookingForm from './BookingForm';
import { createEvent, deleteEvent, fetchEvents, updateEvent } from '../../services/bookingService';
import { fetchResources } from '../../services/resourceService';
import { AuthContext } from '../../context/AuthContext';
import useApiError from '../../hooks/useApiError';
import { RESOURCE_COLORS } from '../../utils/colorUtils';
import { useColorMode } from '../../theme/ThemeProvider';
import { FederationContext } from '../../context/FederationContext';

// Configure moment.js for localization
const localizer = momentLocalizer(moment);

const BookingCalendar = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const { currentFederation } = useContext(FederationContext)
  const { withErrorHandling } = useApiError();
  const theme = useTheme();
  const { mode } = useColorMode();
  const [currentView, setCurrentView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState(null);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [resourceColors, setResourceColors] = useState({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarHeight, setCalendarHeight] = useState('100%');
  const [bookingToHighlight, setBookingToHighlight] = useState(null);
  // State for notification
  const [notification, setNotification] = useState(null);

  // Update moment locale based on current language
  useEffect(() => {
    const language = i18n.language || 'it';
    if (language.startsWith('en')) {
      moment.locale('en-gb');
    } else {
      moment.locale('it');
    }
  }, [i18n.language]);

  // Show a notification
  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    
    // Remove the notification after 6 seconds
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Check if there is a booking to display from localStorage
  useEffect(() => {
    const bookingData = localStorage.getItem('viewBookingInCalendar');
    if (bookingData) {
      try {
        const parsedData = JSON.parse(bookingData);
        // Set the selected date from the booking
        if (parsedData.date) {
          const bookingDate = new Date(parsedData.date);
          setSelectedDate(bookingDate);
          // Set the day view for better booking visualization
          setCurrentView('day');
        }
        // Save the booking ID to highlight it
        if (parsedData.id) {
          setBookingToHighlight(parsedData.id);
        }
        // Set the resource filter if present
        if (parsedData.resourceId) {
          setSelectedResource(parsedData.resourceId);
        }
        // Remove data from localStorage after using it
        localStorage.removeItem('viewBookingInCalendar');
      } catch (error) {
        console.error('Error parsing booking data:', error);
        localStorage.removeItem('viewBookingInCalendar');
      }
    }
  }, []);

  // Load events and resources
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await withErrorHandling(async () => {

          const [eventsData, resourcesData] = await Promise.all([
            fetchEvents(currentFederation?.id ? {federationId: currentFederation.id} : {}),
            fetchResources(currentFederation?.id ? {federationId: currentFederation.id} : {})
          ]);
          
          // Assign colors to resources
          const colors = {};
          resourcesData.forEach((resource, index) => {
            // Use cyclic colors to have distinct colors for each resource
            colors[resource.id] = RESOURCE_COLORS[index % RESOURCE_COLORS.length];
          });
          setResourceColors(colors);
          
          const processedEvents = eventsData.map(event => {
            const resource = resourcesData.find(r => r.id === event.resourceId);
            return {
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
              resourceName: resource ? resource.name : t('bookingForm.unknownResource')
            };
          });
          
          setEvents(processedEvents);
          setResources(resourcesData);
          
          // If there is a booking to highlight, open the details modal
          if (bookingToHighlight) {
            const bookingToShow = processedEvents.find(event => event.id === bookingToHighlight);
            if (bookingToShow) {
              setSelectedEvent(bookingToShow);
              setIsBookingModalOpen(true);
              // Reset after opening
              setBookingToHighlight(null);
            }
          }
        }, {
          errorMessage: t('errors.unableToLoadCalendarData'),
          showError: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [withErrorHandling, bookingToHighlight, t, currentFederation]);

  // Update calendar height based on current view
  useEffect(() => {
    // In month view, use a fixed height to avoid overlaps with the footer
    if (currentView === 'month') {
      // Calculated height to avoid overlaps with the footer
      setCalendarHeight('calc(100vh - 220px)');
    } else {
      // For other views, use the available container height
      setCalendarHeight('calc(100% - 70px)');
    }
  }, [currentView]);

  // Filter events based on selected resource
  const filteredEvents = selectedResource
      ? events.filter(event => event.resourceId === selectedResource)
      : events;

  // Handler to open booking modal with selected slot
  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent({
      title: '',
      resourceId: '',
      start: slotInfo.start,
      end: slotInfo.end,
      description: '',
      userId: currentUser?.id // Use current user ID as default
    });
    setIsBookingModalOpen(true);
  };

  // Handler to display details of a selected event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  // Save a booking
  const handleSaveBooking = async (bookingData) => {
    // Ensure bookingData.start and bookingData.end are Date objects
    const processedBookingData = {
      ...bookingData,
      start: bookingData.start instanceof Date ? bookingData.start : new Date(bookingData.start),
      end: bookingData.end instanceof Date ? bookingData.end : new Date(bookingData.end),
    };
    
    const result = await withErrorHandling(async () => {
      if (processedBookingData.id) {
        // Update an existing event
        const updatedEvent = await updateEvent(processedBookingData.id, processedBookingData);
        // Ensure dates in the response are Date objects
        return {
          ...updatedEvent,
          start: new Date(updatedEvent.start),
          end: new Date(updatedEvent.end)
        };
      } else {
        // Create a new event
        const newEvent = await createEvent(processedBookingData);
        // Ensure dates in the response are Date objects
        return {
          ...newEvent,
          start: new Date(newEvent.start),
          end: new Date(newEvent.end)
        };
      }
    }, {
      errorMessage: processedBookingData.id
        ? t('bookingCalendar.unableToUpdateBooking')
        : t('bookingCalendar.unableToCreateBooking'),
      showError: true
    });
    
    // The BE does not return any status field if the call went good and the new/updated event has been returned.
    if (result && !result.status) {
      // Add the resource name to the result
      const resourceName = resources.find(r => r.id === result.resourceId)?.name || t('bookingForm.unknownResource');
      const enrichedResult = { ...result, resourceName };
    
      if (processedBookingData.id) {
        // Update the event in the list
        setEvents(events.map(event => event.id === enrichedResult.id ? enrichedResult : event));
        showNotification(t('bookingCalendar.bookingUpdatedSuccess', { title: enrichedResult.title }));
      } else {
        // Add the new event to the list
        setEvents([...events, enrichedResult]);
        showNotification(t('bookingCalendar.bookingCreatedSuccess', { title: enrichedResult.title }));
      }
      setIsBookingModalOpen(false);
      setSelectedEvent(null);
    }
  };

  // Delete a booking
  const handleDeleteBooking = async (eventId) => {
    // Find the event before deleting it to show the title in the notification
    const eventToDelete = events.find(e => e.id === eventId);
    const eventTitle = eventToDelete ? eventToDelete.title : t('bookingCalendar.selected');
    
    const success = await withErrorHandling(async () => {
      await deleteEvent(eventId);
      return true;
    }, {
      errorMessage: t('bookingCalendar.unableToDeleteBooking'),
      showError: true
    });
    
    if (success) {
      setEvents(events.filter(event => event.id !== eventId));
      setIsBookingModalOpen(false);
      setSelectedEvent(null);
      showNotification(t('bookingCalendar.bookingDeletedSuccess', { title: eventTitle }), 'info');
    }
  };

  // Function to find overlapping events
  const findOverlappingEvents = (targetEvent) => {
    // Function that checks if two events overlap in time
    const eventsOverlap = (event1, event2) => {
      return (
        event1.start < event2.end && 
        event1.end > event2.start
      );
    };
    
    // Count how many events overlap with this one
    return filteredEvents.filter(event => 
      event.id !== targetEvent.id && 
      eventsOverlap(event, targetEvent)
    ).length;
  };

  // Style for events in the calendar
  const eventStyleGetter = (event) => {
    // Use color based on the resource
    let backgroundColor = resourceColors[event.resourceId] || '#1976d2';
    
    // In dark mode, adjust colors for better visibility if needed
    if (mode === 'dark' && backgroundColor.startsWith('#')) {
      // This is a simple brightening for dark colors in dark mode
      // You could use a more sophisticated color manipulation if needed
      if (backgroundColor.match(/^#[0-9A-F]{6}$/i)) {
        const rgb = parseInt(backgroundColor.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        
        // If the color is too dark, brighten it
        if (r + g + b < 300) {
          // Brighten dark colors for better visibility in dark mode
          const brightenedColor = `rgba(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, ${Math.min(b + 50, 255)}, 0.9)`;
          backgroundColor = brightenedColor;
        }
      }
    }
    
    // Count how many events overlap with this one
    const overlappingCount = findOverlappingEvents(event);
    
    // Adjust style based on the number of overlapping events
    const compactMode = overlappingCount >= 2;
    const extremeCompactMode = overlappingCount >= 4;
    
    // Check if it's the event that needs to be highlighted
    const isHighlighted = bookingToHighlight === event.id;
    
    return {
      style: {
        backgroundColor,
        borderRadius: '3px',
        opacity: 0.9,
        color: 'white',
        border: isHighlighted ? '2px solid #ff5722' : '1px solid ' + backgroundColor, // More noticeable border for highlighted events
        display: 'block',
        overflow: 'hidden',
        fontSize: extremeCompactMode ? '0.65rem' : (compactMode ? '0.7rem' : '0.75rem'),
        padding: extremeCompactMode ? '0px 1px' : '1px 2px',
        whiteSpace: 'nowrap', 
        textOverflow: 'ellipsis',
        marginTop: '1px',
        marginBottom: '1px',
        boxShadow: isHighlighted ? '0 0 8px rgba(255, 87, 34, 0.8)' : '0 1px 2px rgba(0,0,0,0.2)', // More noticeable shadow for highlighted events
        // Set a minimum height based on the number of overlapping events
        minHeight: extremeCompactMode ? '16px' : (compactMode ? '18px' : '20px'),
        // Add a data- attribute that the EventItem component can read
        '--overlapping-count': overlappingCount,
        '--compact-mode': compactMode ? 'true' : 'false',
        '--extreme-compact-mode': extremeCompactMode ? 'true' : 'false',
        '--is-highlighted': isHighlighted ? 'true' : 'false'
      }
    };
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setCurrentView(newView);
    }
  };

  // Component to display events in the calendar
  const EventItem = ({ event }) => {
    // Access style properties passed from eventStyleGetter
    const style = event.style || {};
    const compactMode = style['--compact-mode'] === 'true';
    const extremeCompactMode = style['--extreme-compact-mode'] === 'true';
    const isHighlighted = style['--is-highlighted'] === 'true';
    const isParentResource = event.isParentResource;
    
    // In extreme compact mode, show everything in a single line
    if (extremeCompactMode) {
      return (
        <Box sx={{ 
          p: 0.5, 
          minHeight: '100%',
          fontSize: 'inherit',
          lineHeight: 1.1,
          fontWeight: isHighlighted ? 'bold' : 'normal',
          backgroundColor: isHighlighted ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          borderLeft: isParentResource ? '3px solid yellow' : 
                    (event.isChildResource ? '3px solid orange' : 'none'),
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: isHighlighted ? 'bold' : 'bold',
              fontSize: 'inherit',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1
            }}
          >
            {`${event.title} (${event.resourceName})`}
          </Typography>
          {(isParentResource || event.isChildResource) && (
            <Box 
              sx={{ 
                position: 'absolute', 
                right: 2, 
                top: 2, 
                width: 8, 
                height: 8, 
                borderRadius: '50%',
                backgroundColor: isParentResource ? 'yellow' : 'orange',
              }} 
            />
          )}
        </Box>
      );
    }
    
    // In compact mode, show title and resource on a single line
    if (compactMode) {
      return (
        <Box sx={{ 
          p: 0.25, 
          minHeight: '100%',
          fontSize: 'inherit',
          lineHeight: 1,
          fontWeight: isHighlighted ? 'bold' : 'normal',
          backgroundColor: isHighlighted ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'bold',
              display: 'inline',
              fontSize: 'inherit',
              lineHeight: 1
            }}
          >
            {event.title}
          </Typography>
          {' • '}
          <Typography 
            variant="caption" 
            sx={{ 
              fontStyle: 'italic',
              display: 'inline',
              fontSize: '0.9em',
              lineHeight: 1
            }}
          >
            {event.resourceName}
          </Typography>
        </Box>
      );
    }
    
    // Normal mode, show on two lines
    return (
      <Box sx={{ 
        p: 0.5, 
        minHeight: '100%',
        fontSize: 'inherit',
        lineHeight: 1.1,
        fontWeight: isHighlighted ? 'bold' : 'normal',
        backgroundColor: isHighlighted ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 'bold',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.1
          }}
        >
          {event.title}
        </Typography>
        
        <Typography 
          variant="caption" 
          sx={{ 
            fontStyle: 'italic',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.1,
            fontSize: '0.85em'
          }}
        >
          {event.resourceName}
        </Typography>
      </Box>
    );
  };

  return (
      <Box sx={{ p: 3, height: 'calc(100vh - 64px)' }}>
        <Paper
          elevation={2}
          sx={{
            height: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'  // Prevent content from overflowing the Paper
          }}
        >
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 2,
            flexShrink: 0  // Prevent controls from shrinking
          }}>
            {/* First row (or column on mobile): display controls */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              {/* Toggle buttons for calendar view - replace single buttons */}
              <ToggleButtonGroup
                  value={currentView}
                  exclusive
                  onChange={handleViewChange}
                  aria-label="calendar view"
                  size="small"
              >
                <ToggleButton value="day" aria-label="day view">
                  <Tooltip title={t('bookingCalendar.dayView')}>
                    <CalendarViewDay />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="week" aria-label="week view">
                  <Tooltip title={t('bookingCalendar.weekView')}>
                    <CalendarViewWeek />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="month" aria-label="month view">
                  <Tooltip title={t('bookingCalendar.monthView')}>
                    <CalendarViewMonth />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Navigation controls */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={t('bookingCalendar.previous')}>
                  <IconButton
                      onClick={() => setSelectedDate(moment(selectedDate).subtract(1, currentView).toDate())}
                      size="small"
                  >
                    <ChevronLeft />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('bookingCalendar.today')}>
                  <Button
                      onClick={() => setSelectedDate(new Date())}
                      variant="outlined"
                      size="small"
                      startIcon={<TodayIcon />}
                      sx={{ mx: 1 }}
                  >
                    {t('bookingCalendar.today')}
                  </Button>
                </Tooltip>

                <Tooltip title={t('bookingCalendar.next')}>
                  <IconButton
                      onClick={() => setSelectedDate(moment(selectedDate).add(1, currentView).toDate())}
                      size="small"
                  >
                    <ChevronRight />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Second row (or column on mobile): actions and filters */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' }
            }}>
              <Tooltip title={t('bookingCalendar.newBooking')}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSelectedEvent({
                        title: '',
                        resourceId: '',
                        start: new Date(),
                        end: new Date(new Date().getTime() + 60 * 60 * 1000),
                        description: '',
                        userId: currentUser?.id // Set current user ID as default
                      });
                      setIsBookingModalOpen(true);
                    }}
                    startIcon={<AddIcon />}
                    fullWidth={false}
                >
                  {t('bookingCalendar.newBooking')}
                </Button>
              </Tooltip>

              <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 200 },
                    flexGrow: { xs: 1, md: 0 }
                  }}
              >
                <InputLabel id="resource-filter-label">{t('bookingCalendar.resource')}</InputLabel>
                <Select
                    labelId="resource-filter-label"
                    value={selectedResource || ''}
                    label={t('bookingCalendar.resource')}
                    onChange={(e) => setSelectedResource(e.target.value ? parseInt(e.target.value) : null)}
                    startAdornment={<FilterList fontSize="small" sx={{ mr: 1, ml: -0.5 }} />}
                >
                  <MenuItem value="">{t('bookingCalendar.allResources')}</MenuItem>
                  {resources.map(resource => (
                      <MenuItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box
            sx={{
              height: calendarHeight,
              flex: 1,
              overflow: 'hidden',  // Contain the calendar in case of overflow
              display: 'flex',
              flexDirection: 'column'
            }}
            className={mode === 'dark' ? 'dark-theme' : ''}
          >
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>{t('bookingCalendar.loadingCalendar')}</Typography>
                </Box>
            ) : (
                <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ 
                      height: '100%', 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                    views={['day', 'week', 'month']}
                    view={currentView}
                    date={selectedDate}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    dayLayoutAlgorithm={'no-overlap'}
                    showMultiDayTimes={true}
                    slotGroupEventLimit={16}
                    timeslots={4}
                    step={15}
                    min={moment().hour(0).minute(0).toDate()}
                    max={moment().hour(23).minute(59).toDate()}
                    messages={{
                      today: t('bookingCalendar.today'),
                      previous: t('bookingCalendar.previous'),
                      next: t('bookingCalendar.next'),
                      month: t('bookingCalendar.month'),
                      week: t('bookingCalendar.week'),
                      day: t('bookingCalendar.day'),
                      agenda: 'Agenda',
                      date: t('bookingCalendar.date'),
                      time: t('bookingCalendar.time'),
                      event: t('bookingCalendar.event'),
                      noEventsInRange: t('bookingCalendar.noBookingsInPeriod'),
                      showMore: (total) => `+ ${total} ${t('common.more')}`
                    }}
                    popup
                    components={{
                      event: EventItem,
                      toolbar: () => null // Disable the default calendar toolbar
                    }}
                />
            )}
          </Box>
        </Paper>

        {/* Booking dialog */}
        <BookingForm
            open={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedEvent(null);
            }}
            booking={selectedEvent}
            onSave={handleSaveBooking}
            onDelete={handleDeleteBooking}
            resources={resources}
        />

        {/* Notification for successful operations */}
        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {notification && (
            <Alert
              onClose={() => setNotification(null)}
              severity={notification.severity}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          )}
        </Snackbar>
      </Box>
  );
};

export default BookingCalendar;