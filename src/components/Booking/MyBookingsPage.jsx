import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import {
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { fetchMyEvents } from '../../services/bookingService';
import { fetchResources } from '../../services/resourceService';
import useApiError from '../../hooks/useApiError';
import moment from 'moment';
import 'moment/locale/it';
import { formatDate } from '../../utils/dateUtils';

// Componente per mostrare il resoconto delle prenotazioni dell'utente loggato
const MyBookingsPage = () => {
  const theme = useTheme();
  const { currentUser } = useContext(AuthContext);
  const { withErrorHandling } = useApiError();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = future, 1 = passate
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    future: 0,
    past: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  // Carica le prenotazioni dell'utente
  useEffect(() => {
    const loadUserBookings = async () => {
      setIsLoading(true);
      try {
        // Utilizziamo withErrorHandling per ogni chiamata API individuale
        // per gestire meglio gli errori parziali
        const eventsData = await withErrorHandling(async () => {
          return await fetchMyEvents();
        }, {
          errorMessage: 'Impossibile caricare le tue prenotazioni',
          showError: true,
          rethrowError: false
        }) || [];

        const resourcesData = await withErrorHandling(async () => {
          return await fetchResources();
        }, {
          errorMessage: 'Impossibile caricare le risorse',
          showError: true,
          rethrowError: false
        }) || [];
          
        // Arricchisci i dati degli eventi con informazioni sulla risorsa
        const processedEvents = eventsData.map(event => {
          const resource = resourcesData.find(r => r.id === event.resourceId);
          return {
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            resourceName: resource ? resource.name : 'Risorsa sconosciuta'
          };
        });
        
        setBookings(processedEvents);
        setResources(resourcesData);
        
        // Calcola le statistiche
        calculateStats(processedEvents);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserBookings();
  }, [withErrorHandling, currentUser]);

  // Calcola le statistiche delle prenotazioni
  const calculateStats = (events) => {
    const now = new Date();
    const thisMonth = moment().startOf('month');
    const lastMonth = moment().subtract(1, 'month').startOf('month');
    
    // Prenotazioni future
    const futureEvents = events.filter(event => new Date(event.start) > now);
    
    // Prenotazioni passate
    const pastEvents = events.filter(event => new Date(event.end) < now);
    
    // Prenotazioni di questo mese
    const thisMonthEvents = events.filter(event => 
      moment(event.start).isSameOrAfter(thisMonth) && 
      moment(event.start).isBefore(moment(thisMonth).add(1, 'month'))
    );
    
    // Prenotazioni del mese scorso
    const lastMonthEvents = events.filter(event => 
      moment(event.start).isSameOrAfter(lastMonth) && 
      moment(event.start).isBefore(thisMonth)
    );
    
    setStats({
      total: events.length,
      future: futureEvents.length,
      past: pastEvents.length,
      thisMonth: thisMonthEvents.length,
      lastMonth: lastMonthEvents.length
    });
  };

  // Cambia la tab attiva
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filtra le prenotazioni in base alla tab attiva
  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    if (activeTab === 0) {
      // Future
      return new Date(booking.start) > now;
    } else {
      // Passate
      return new Date(booking.end) < now;
    }
  });

  // Ordina le prenotazioni
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (activeTab === 0) {
      // Future: ordina per data crescente (più vicine prima)
      return new Date(a.start) - new Date(b.start);
    } else {
      // Passate: ordina per data decrescente (più recenti prima)
      return new Date(b.end) - new Date(a.end);
    }
  });

  // Calcola la durata di una prenotazione in ore
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
      <Typography variant="h5" sx={{ mb: 3 }}>Le mie prenotazioni</Typography>
      
      {/* Statistiche principali */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Totali</Typography>
                <CalendarTodayIcon />
              </Box>
              <Typography variant="h3">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.success.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Future</Typography>
                <EventAvailableIcon />
              </Box>
              <Typography variant="h3">{stats.future}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.info.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Questo mese</Typography>
                <CalendarTodayIcon />
              </Box>
              <Typography variant="h3">{stats.thisMonth}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.secondary.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Completate</Typography>
                <EventBusyIcon />
              </Box>
              <Typography variant="h3">{stats.past}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs per scegliere tra prenotazioni future e passate */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`Prenotazioni Future (${stats.future})`} />
          <Tab label={`Prenotazioni Passate (${stats.past})`} />
        </Tabs>
      </Paper>
      
      {/* Lista delle prenotazioni */}
      <Paper sx={{ p: 0 }}>
        {sortedBookings.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {activeTab === 0 
                ? 'Non hai prenotazioni future'
                : 'Non hai prenotazioni passate'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {activeTab === 0 
                ? 'Le tue prossime prenotazioni appariranno qui'
                : 'La cronologia delle tue prenotazioni apparirà qui'}
            </Typography>
          </Box>
        ) : (
          sortedBookings.map((booking, index) => (
            <React.Fragment key={booking.id}>
              {index > 0 && <Divider />}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {/* Data e ora */}
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {formatDate(booking.start, 'dddd D MMMM YYYY')}
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(booking.start, 'HH:mm')} - {formatDate(booking.end, 'HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Durata: {calculateDuration(booking.start, booking.end)} ore
                    </Typography>
                  </Grid>
                  
                  {/* Titolo e risorsa */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">{booking.title}</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>Risorsa:</strong> {booking.resourceName}
                    </Typography>
                    {booking.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {booking.description}
                      </Typography>
                    )}
                  </Grid>
                  
                  {/* Stato */}
                  <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Chip
                      label={activeTab === 0 ? 'Futura' : 'Completata'}
                      color={activeTab === 0 ? 'primary' : 'default'}
                      variant={activeTab === 0 ? 'filled' : 'outlined'}
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ mt: 'auto' }}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => {
                          // Memorizza i dati della prenotazione nel localStorage per il passaggio tra pagine
                          localStorage.setItem('viewBookingInCalendar', JSON.stringify({
                            date: booking.start,
                            id: booking.id,
                            resourceId: booking.resourceId
                          }));
                          window.open('/calendar', '_self');
                        }}
                      >
                        Vedi nel calendario
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </React.Fragment>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default MyBookingsPage;