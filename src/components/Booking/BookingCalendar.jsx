// This fix applies to your src/components/Booking/BookingCalendar.jsx file

import React, { useContext, useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/it';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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
    Typography
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
import EventItem from './EventItem';
import { createEvent, deleteEvent, fetchEvents, updateEvent } from '../../services/bookingService';
import { fetchResources } from '../../services/resourceService';
import { getResourceTypeColor } from '../../utils/colorUtils';
import { AuthContext } from '../../context/AuthContext';

// Configura moment.js per l'italiano
moment.locale('it');
const localizer = momentLocalizer(moment);

const BookingCalendar = () => {
  const { currentUser } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState(null);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carica eventi e risorse
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [eventsData, resourcesData] = await Promise.all([
          fetchEvents(),
          fetchResources()
        ]);
        
        const processedEvents = eventsData.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        
        setEvents(processedEvents);
        setResources(resourcesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtra gli eventi in base alla risorsa selezionata
  const filteredEvents = selectedResource
      ? events.filter(event => event.resourceId === selectedResource)
      : events;

  // Handler per aprire il modal di prenotazione con slot selezionato
  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent({
      title: '',
      resourceId: '',
      start: slotInfo.start,
      end: slotInfo.end,
      description: '',
      userId: currentUser?.id // Usa l'ID dell'utente corrente come default
    });
    setIsBookingModalOpen(true);
  };

  // Handler per visualizzare i dettagli di un evento selezionato
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  // Salva una prenotazione
  const handleSaveBooking = async (bookingData) => {
    try {
      // Assicurati che bookingData.start e bookingData.end siano oggetti Date
      const processedBookingData = {
        ...bookingData,
        start: bookingData.start instanceof Date ? bookingData.start : new Date(bookingData.start),
        end: bookingData.end instanceof Date ? bookingData.end : new Date(bookingData.end),
      };
      
      if (processedBookingData.id) {
        // Aggiorna un evento esistente
        const updatedEvent = await updateEvent(processedBookingData.id, processedBookingData);
        // Assicurati che le date nella risposta siano oggetti Date
        const processedUpdatedEvent = {
          ...updatedEvent,
          start: new Date(updatedEvent.start),
          end: new Date(updatedEvent.end)
        };
        
        setEvents(events.map(event =>
            event.id === processedUpdatedEvent.id ? processedUpdatedEvent : event
        ));
      } else {
        // Crea un nuovo evento
        const newEvent = await createEvent(processedBookingData);
        // Assicurati che le date nella risposta siano oggetti Date
        const processedNewEvent = {
          ...newEvent,
          start: new Date(newEvent.start),
          end: new Date(newEvent.end)
        };
        
        setEvents([...events, processedNewEvent]);
      }
      setIsBookingModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving booking:', error);
      // Qui potrebbe essere visualizzato un messaggio di errore
    }
  };

  // Elimina una prenotazione
  const handleDeleteBooking = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
      setIsBookingModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      // Qui potrebbe essere visualizzato un messaggio di errore
    }
  };

  // Stile per gli eventi nel calendario
  const eventStyleGetter = (event) => {
    const resource = resources.find(r => r.id === event.resourceId);
    const backgroundColor = resource ? getResourceTypeColor(resource.type) : '#1976d2';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setCurrentView(newView);
    }
  };

  return (
      <Box sx={{ p: 3, height: 'calc(100vh - 64px)' }}>
        <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 2
          }}>
            {/* Prima riga (o colonna su mobile): controlli di visualizzazione */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              {/* Toggle buttons per vista calendario - sostituiscono i bottoni singoli */}
              <ToggleButtonGroup
                  value={currentView}
                  exclusive
                  onChange={handleViewChange}
                  aria-label="vista calendario"
                  size="small"
              >
                <ToggleButton value="day" aria-label="vista giornaliera">
                  <Tooltip title="Vista giornaliera">
                    <CalendarViewDay />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="week" aria-label="vista settimanale">
                  <Tooltip title="Vista settimanale">
                    <CalendarViewWeek />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="month" aria-label="vista mensile">
                  <Tooltip title="Vista mensile">
                    <CalendarViewMonth />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Controlli navigazione */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Precedente">
                  <IconButton
                      onClick={() => setSelectedDate(moment(selectedDate).subtract(1, currentView).toDate())}
                      size="small"
                  >
                    <ChevronLeft />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Oggi">
                  <Button
                      onClick={() => setSelectedDate(new Date())}
                      variant="outlined"
                      size="small"
                      startIcon={<TodayIcon />}
                      sx={{ mx: 1 }}
                  >
                    Oggi
                  </Button>
                </Tooltip>

                <Tooltip title="Successivo">
                  <IconButton
                      onClick={() => setSelectedDate(moment(selectedDate).add(1, currentView).toDate())}
                      size="small"
                  >
                    <ChevronRight />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Seconda riga (o colonna su mobile): azioni e filtri */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' }
            }}>
              <Tooltip title="Crea nuova prenotazione">
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
                        userId: currentUser?.id // Imposta l'ID dell'utente corrente come default
                      });
                      setIsBookingModalOpen(true);
                    }}
                    startIcon={<AddIcon />}
                    fullWidth={false}
                >
                  Nuova Prenotazione
                </Button>
              </Tooltip>

              <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 200 },
                    flexGrow: { xs: 1, md: 0 }
                  }}
              >
                <InputLabel id="resource-filter-label">Risorsa</InputLabel>
                <Select
                    labelId="resource-filter-label"
                    value={selectedResource || ''}
                    label="Risorsa"
                    onChange={(e) => setSelectedResource(e.target.value ? parseInt(e.target.value) : null)}
                    startAdornment={<FilterList fontSize="small" sx={{ mr: 1, ml: -0.5 }} />}
                >
                  <MenuItem value="">Tutte le risorse</MenuItem>
                  {resources.map(resource => (
                      <MenuItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ height: 'calc(100% - 70px)' }}>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>Caricamento calendario...</Typography>
                </Box>
            ) : (
                <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    views={['day', 'week', 'month']}
                    view={currentView}
                    date={selectedDate}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    messages={{
                      today: 'Oggi',
                      previous: 'Precedente',
                      next: 'Successivo',
                      month: 'Mese',
                      week: 'Settimana',
                      day: 'Giorno',
                      agenda: 'Agenda',
                      date: 'Data',
                      time: 'Ora',
                      event: 'Evento',
                      noEventsInRange: 'Nessuna prenotazione in questo periodo'
                    }}
                    popup
                    components={{
                      event: EventItem,
                      toolbar: () => null // Disabilita la toolbar predefinita del calendario
                    }}
                />
            )}
          </Box>
        </Paper>

        {/* Dialog prenotazione */}
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
      </Box>
  );
};

export default BookingCalendar;