import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/it';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  Box, Paper, Button, FormControl, InputLabel, 
  Select, MenuItem, IconButton, Typography
} from '@mui/material';
import {
  CalendarViewDay, CalendarViewWeek, CalendarViewMonth,
  ArrowBack, ArrowForward, Add as AddIcon
} from '@mui/icons-material';
import BookingForm from './BookingForm';
import EventItem from './EventItem';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../../services/bookingService';
import { fetchResources } from '../../services/resourceService';
import { getResourceTypeColor } from '../../utils/colorUtils';

// Configura moment.js per l'italiano
moment.locale('it');
const localizer = momentLocalizer(moment);

const BookingCalendar = () => {
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
        setEvents(eventsData);
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
      userId: 1
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
      if (bookingData.id) {
        // Aggiorna un evento esistente
        const updatedEvent = await updateEvent(bookingData.id, bookingData);
        setEvents(events.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ));
      } else {
        // Crea un nuovo evento
        const newEvent = await createEvent(bookingData);
        setEvents([...events, newEvent]);
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

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 64px)' }}>
      <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant={currentView === 'day' ? 'contained' : 'outlined'} 
              size="small"
              onClick={() => setCurrentView('day')}
              startIcon={<CalendarViewDay />}
            >
              Giorno
            </Button>
            <Button 
              variant={currentView === 'week' ? 'contained' : 'outlined'} 
              size="small"
              onClick={() => setCurrentView('week')}
              startIcon={<CalendarViewWeek />}
            >
              Settimana
            </Button>
            <Button 
              variant={currentView === 'month' ? 'contained' : 'outlined'} 
              size="small"
              onClick={() => setCurrentView('month')}
              startIcon={<CalendarViewMonth />}
            >
              Mese
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                setSelectedEvent(null);
                setIsBookingModalOpen(true);
              }}
              startIcon={<AddIcon />}
            >
              Nuova Prenotazione
            </Button>
            
            <IconButton onClick={() => setSelectedDate(moment(selectedDate).subtract(1, currentView).toDate())}>
              <ArrowBack />
            </IconButton>
            
            <Button onClick={() => setSelectedDate(new Date())}>
              Oggi
            </Button>
            
            <IconButton onClick={() => setSelectedDate(moment(selectedDate).add(1, currentView).toDate())}>
              <ArrowForward />
            </IconButton>
          </Box>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="resource-filter-label">Filtra Risorsa</InputLabel>
            <Select
              labelId="resource-filter-label"
              value={selectedResource || ''}
              label="Filtra Risorsa"
              onChange={(e) => setSelectedResource(e.target.value ? parseInt(e.target.value) : null)}
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
        
        <Box sx={{ height: 'calc(100% - 50px)' }}>
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
              onView={(view) => setCurrentView(view)}
              date={selectedDate}
              onNavigate={(date) => setSelectedDate(date)}
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
                event: EventItem
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
