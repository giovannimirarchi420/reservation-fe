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
    Typography,
    Snackbar,
    Alert
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

// Configura moment.js per l'italiano
moment.locale('it');
const localizer = momentLocalizer(moment);

// Colori per le risorse - usiamo un set di colori distinti
const RESOURCE_COLORS = [
  '#8E24AA', // Purple
  '#1E88E5', // Blue
  '#43A047', // Green 
  '#E53935', // Red
  '#FB8C00', // Orange
  '#00ACC1', // Cyan
  '#3949AB', // Indigo
  '#7CB342', // Light Green
  '#C0CA33', // Lime
  '#FDD835', // Yellow
  '#6D4C41', // Brown
  '#546E7A', // Blue Grey
  '#D81B60', // Pink
  '#5E35B1', // Deep Purple
  '#039BE5', // Light Blue
  '#00897B', // Teal
  '#F4511E', // Deep Orange
];

const BookingCalendar = () => {
  const { currentUser } = useContext(AuthContext);
  const { withErrorHandling } = useApiError();
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
  // Stato per la notifica
  const [notification, setNotification] = useState(null);

  // Mostra una notifica
  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    
    // Rimuovi la notifica dopo 6 secondi
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Controlla se c'è una prenotazione da visualizzare dal localStorage
  useEffect(() => {
    const bookingData = localStorage.getItem('viewBookingInCalendar');
    if (bookingData) {
      try {
        const parsedData = JSON.parse(bookingData);
        // Imposta la data selezionata dalla prenotazione
        if (parsedData.date) {
          const bookingDate = new Date(parsedData.date);
          setSelectedDate(bookingDate);
          // Imposta la vista giornaliera per una migliore visualizzazione della prenotazione
          setCurrentView('day');
        }
        // Salva l'ID della prenotazione per evidenziarla
        if (parsedData.id) {
          setBookingToHighlight(parsedData.id);
        }
        // Imposta il filtro sulla risorsa se è presente
        if (parsedData.resourceId) {
          setSelectedResource(parsedData.resourceId);
        }
        // Rimuovi i dati dal localStorage dopo averli utilizzati
        localStorage.removeItem('viewBookingInCalendar');
      } catch (error) {
        console.error('Errore nel parsing dei dati della prenotazione:', error);
        localStorage.removeItem('viewBookingInCalendar');
      }
    }
  }, []);

  // Carica eventi e risorse
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await withErrorHandling(async () => {
          const [eventsData, resourcesData] = await Promise.all([
            fetchEvents(),
            fetchResources()
          ]);
          
          // Assegna colori alle risorse
          const colors = {};
          resourcesData.forEach((resource, index) => {
            // Usa colori ciclici per avere colori distinti per ogni risorsa
            colors[resource.id] = RESOURCE_COLORS[index % RESOURCE_COLORS.length];
          });
          setResourceColors(colors);
          
          const processedEvents = eventsData.map(event => {
            const resource = resourcesData.find(r => r.id === event.resourceId);
            return {
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
              resourceName: resource ? resource.name : 'Risorsa sconosciuta'
            };
          });
          
          setEvents(processedEvents);
          setResources(resourcesData);
          
          // Se c'è una prenotazione da evidenziare, apri il modal dei dettagli
          if (bookingToHighlight) {
            const bookingToShow = processedEvents.find(event => event.id === bookingToHighlight);
            if (bookingToShow) {
              setSelectedEvent(bookingToShow);
              setIsBookingModalOpen(true);
              // Resetta dopo l'apertura
              setBookingToHighlight(null);
            }
          }
        }, {
          errorMessage: 'Impossibile caricare i dati del calendario',
          showError: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [withErrorHandling, bookingToHighlight]);

  // Aggiorna l'altezza del calendario in base alla vista corrente
  useEffect(() => {
    // In vista mensile, usiamo un'altezza fissa per evitare sovrapposizioni con il footer
    if (currentView === 'month') {
      // Altezza calcolata per evitare sovrapposizioni con il footer
      setCalendarHeight('calc(100vh - 220px)');
    } else {
      // Per le altre viste, usiamo l'altezza disponibile del contenitore
      setCalendarHeight('calc(100% - 70px)');
    }
  }, [currentView]);

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
    // Assicurati che bookingData.start e bookingData.end siano oggetti Date
    const processedBookingData = {
      ...bookingData,
      start: bookingData.start instanceof Date ? bookingData.start : new Date(bookingData.start),
      end: bookingData.end instanceof Date ? bookingData.end : new Date(bookingData.end),
    };
    
    const result = await withErrorHandling(async () => {
      if (processedBookingData.id) {
        // Aggiorna un evento esistente
        const updatedEvent = await updateEvent(processedBookingData.id, processedBookingData);
        // Assicurati che le date nella risposta siano oggetti Date
        return {
          ...updatedEvent,
          start: new Date(updatedEvent.start),
          end: new Date(updatedEvent.end)
        };
      } else {
        // Crea un nuovo evento
        const newEvent = await createEvent(processedBookingData);
        console.log(newEvent)
        // Assicurati che le date nella risposta siano oggetti Date
        return {
          ...newEvent,
          start: new Date(newEvent.start),
          end: new Date(newEvent.end)
        };
      }
    }, {
      errorMessage: processedBookingData.id
        ? 'Impossibile aggiornare la prenotazione'
        : 'Impossibile creare la prenotazione',
      showError: true
    });
    
    //The BE does not return any status field if the call went good and the new/updated event has been returned.
    if (result && !result.status) {
      // Aggiungi il nome della risorsa al risultato
      const resourceName = resources.find(r => r.id === result.resourceId)?.name || 'Risorsa sconosciuta';
      const enrichedResult = { ...result, resourceName };
    
      if (processedBookingData.id) {
        // Aggiorna l'evento nella lista
        setEvents(events.map(event => event.id === enrichedResult.id ? enrichedResult : event));
        showNotification(`Prenotazione "${enrichedResult.title}" aggiornata con successo`);
      } else {
        // Aggiungi il nuovo evento alla lista
        setEvents([...events, enrichedResult]);
        showNotification(`Prenotazione "${enrichedResult.title}" creata con successo`);
      }
      setIsBookingModalOpen(false);
      setSelectedEvent(null);
    }
  };

  // Elimina una prenotazione
  const handleDeleteBooking = async (eventId) => {
    // Trova l'evento prima di eliminarlo per mostrare il titolo nella notifica
    const eventToDelete = events.find(e => e.id === eventId);
    const eventTitle = eventToDelete ? eventToDelete.title : 'selezionata';
    
    const success = await withErrorHandling(async () => {
      await deleteEvent(eventId);
      return true;
    }, {
      errorMessage: 'Impossibile eliminare la prenotazione',
      showError: true
    });
    
    if (success) {
      setEvents(events.filter(event => event.id !== eventId));
      setIsBookingModalOpen(false);
      setSelectedEvent(null);
      showNotification(`Prenotazione "${eventTitle}" eliminata con successo`, 'info');
    }
  };

  // Funzione per trovare eventi sovrapposti
  const findOverlappingEvents = (targetEvent) => {
    // Funzione che verifica se due eventi si sovrappongono temporalmente
    const eventsOverlap = (event1, event2) => {
      return (
        event1.start < event2.end && 
        event1.end > event2.start
      );
    };
    
    // Conta quanti eventi si sovrappongono con questo
    return filteredEvents.filter(event => 
      event.id !== targetEvent.id && 
      eventsOverlap(event, targetEvent)
    ).length;
  };

  // Stile per gli eventi nel calendario
  const eventStyleGetter = (event) => {
    // Usa il colore basato sulla risorsa
    const backgroundColor = resourceColors[event.resourceId] || '#1976d2';
    
    // Conta quanti eventi si sovrappongono con questo
    const overlappingCount = findOverlappingEvents(event);
    
    // Adatta lo stile in base al numero di eventi sovrapposti
    const compactMode = overlappingCount >= 2;
    const extremeCompactMode = overlappingCount >= 4;
    
    // Controlla se è l'evento che deve essere evidenziato
    const isHighlighted = bookingToHighlight === event.id;
    
    return {
      style: {
        backgroundColor,
        borderRadius: '3px',
        opacity: 0.9,
        color: 'white',
        border: isHighlighted ? '2px solid #ff5722' : '1px solid ' + backgroundColor, // Bordo più evidente per eventi evidenziati
        display: 'block',
        overflow: 'hidden',
        fontSize: extremeCompactMode ? '0.65rem' : (compactMode ? '0.7rem' : '0.75rem'),
        padding: extremeCompactMode ? '0px 1px' : '1px 2px',
        whiteSpace: 'nowrap', 
        textOverflow: 'ellipsis',
        marginTop: '1px',
        marginBottom: '1px',
        boxShadow: isHighlighted ? '0 0 8px rgba(255, 87, 34, 0.8)' : '0 1px 2px rgba(0,0,0,0.2)', // Ombra più evidente per eventi evidenziati
        // Imposta un'altezza minima in base al numero di eventi sovrapposti
        minHeight: extremeCompactMode ? '16px' : (compactMode ? '18px' : '20px'),
        // Aggiungi un attributo data- che il componente EventItem può leggere
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

  // Componente per visualizzare gli eventi nel calendario
  const EventItem = ({ event }) => {
    // Accedi alle proprietà di stile passate dall'eventStyleGetter
    const style = event.style || {};
    const compactMode = style['--compact-mode'] === 'true';
    const extremeCompactMode = style['--extreme-compact-mode'] === 'true';
    const isHighlighted = style['--is-highlighted'] === 'true';
    
    // In modalità compatta estrema, mostra tutto in un'unica riga
    if (extremeCompactMode) {
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
        </Box>
      );
    }
    
    // In modalità compatta, mostra titolo e risorsa su un'unica riga
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
    
    // Modalità normale, mostra su due righe
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

  // CSS personalizzato per migliorare la visualizzazione degli eventi
  useEffect(() => {
    // Aggiungi stili personalizzati per gestire meglio gli eventi sovrapposti
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Stili base per gli eventi */
      .rbc-event {
        min-height: 16px !important;
        margin-bottom: 1px !important;
        transition: height 0.2s ease, background-color 0.2s ease;
      }
      
      /* Migliora la visibilità degli eventi in vista mese */
      .rbc-month-view .rbc-event {
        border: 1px solid rgba(0, 0, 0, 0.2) !important;
        margin-top: 1px !important;
      }
      
      /* Riduce lo spazio tra gli slot temporali per avere più spazio per gli eventi */
      .rbc-timeslot-group {
        min-height: 40px;
      }
      
      /* Maggiore contrasto per gli eventi selezionati */
      .rbc-selected {
        filter: brightness(85%) !important;
        box-shadow: 0 0 0 2px #888 !important;
        z-index: 10 !important;
      }
      
      /* Aumenta l'altezza minima della cella in vista mese per contenere più eventi */
      .rbc-month-row {
        min-height: 90px;
      }
      
      /* Fix per evitare la sovrapposizione con il footer in vista mensile */
      .rbc-month-view {
        min-height: 0 !important;
        overflow: auto !important;
      }
      
      /* Stile per il popup di "mostra altri" */
      .rbc-overlay {
        z-index: 1000;
        background: white;
        border: 1px solid #ddd;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        padding: 10px;
        border-radius: 4px;
      }
      
      /* Rendi gli eventi al passaggio del mouse più evidenti */
      .rbc-event:hover {
        filter: brightness(90%);
        z-index: 5 !important;
      }
      
      /* Riduci ulteriormente lo spazio nella vista mensile */
      .rbc-month-view .rbc-event {
        padding: 1px !important;
      }
      
      /* Permetti agli eventi di essere molto compatti nella vista mensile */
      .rbc-month-view .rbc-event-content {
        padding: 0 !important;
        height: auto !important;
        min-height: 14px !important;
      }
      
      /* Rimuovi il padding all'interno del contenitore degli eventi nella vista mensile */
      .rbc-month-view .rbc-events-container {
        margin-right: 0 !important;
        padding-right: 0 !important;
      }
      
      /* Ridimensiona correttamente il calendario in tutte le viste */
      .rbc-calendar {
        height: 100% !important;
        max-height: 100% !important;
        display: flex !important;
        flex-direction: column !important;
      }
      
      /* Abilita lo scrolling quando necessario in vista mensile */
      .rbc-month-view {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 0 !important;
        overflow: auto !important;
      }
      
      /* Assicura che i contenitori interni nella vista mensile non crescano troppo */
      .rbc-month-view .rbc-month-header,
      .rbc-month-view .rbc-month-row {
        flex-shrink: 0 !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      // Rimuovi gli stili personalizzati quando il componente viene smontato
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
      <Box sx={{ p: 3, height: 'calc(100vh - 64px)' }}>
        <Paper
          elevation={2}
          sx={{
            height: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'  // Impedisce che il contenuto fuoriesca dal Paper
          }}
        >
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 2,
            flexShrink: 0  // Impedisce che i controlli si riducano
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

          <Box
            sx={{
              height: calendarHeight,
              flex: 1,
              overflow: 'hidden',  // Contiene il calendario in caso di sovrapposizione
              display: 'flex',
              flexDirection: 'column'
            }}
          >
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
                      noEventsInRange: 'Nessuna prenotazione in questo periodo',
                      showMore: (total) => `+ ${total} altre`
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

        {/* Notifica per le operazioni completate con successo */}
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