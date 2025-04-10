import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Card, 
  CardContent, 
  CircularProgress, 
  Divider, 
  Stack,
  Paper, 
  Typography,
  useTheme 
} from '@mui/material';
import { fetchEvents } from '../../services/bookingService';
import { SiteContext } from '../../context/SiteContext';
import { fetchResources } from '../../services/resourceService';
import { fetchResourceTypes } from '../../services/resourceTypeService';
import { ResourceStatus } from '../../services/resourceService';
import ReservationsByResourceChart from './ReservationsByResourceChart';
import ResourceStatusChart from './ResourceStatusChart';
import ReservationsTrendChart from './ReservationsTrendChart';
import UpcomingReservations from './UpcomingReservations';
import ResourceUtilizationTable from './ResourceUtilizationTable';
import useApiError from '../../hooks/useApiError';
import moment from 'moment';

const Dashboard = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { withErrorHandling } = useApiError();
  const { currentSite } = useContext(SiteContext)
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    activeResources: 0,
    upcomingReservations: 0,
    utilizationRate: 0
  });

  // Carica i dati necessari per la dashboard
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Utilizziamo withErrorHandling per ogni chiamata API individuale
        // in modo da gestire meglio gli errori parziali
        let filter = {}
        if(currentSite?.id){
          filter = {siteId: currentSite.id};
        }
        

        const eventsData = await withErrorHandling(async () => {
          return await fetchEvents(filter);
        }, {
          errorMessage: t('errors.unableToLoadBookingData'),
          showError: true,
          rethrowError: false
        }) || [];

        const resourcesData = await withErrorHandling(async () => {
          return await fetchResources(filter);
        }, {
          errorMessage: t('errors.unableToLoadResourceData'),
          showError: true,
          rethrowError: false
        }) || [];

        const resourceTypesData = await withErrorHandling(async () => {
          return await fetchResourceTypes(filter);
        }, {
          errorMessage: t('errors.unableToLoadResourceTypes'),
          showError: true,
          rethrowError: false
        }) || [];
        
        // Processiamo i dati anche se alcune chiamate API hanno fallito
        const processedEvents = eventsData.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        
        setEvents(processedEvents);
        setResources(resourcesData);
        setResourceTypes(resourceTypesData);
        
        // Calcola le statistiche
        calculateStats(processedEvents, resourcesData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [withErrorHandling, t, currentSite]);

  // Calcola le statistiche principali
  const calculateStats = (eventsData, resourcesData) => {
    const now = new Date();
    
    // Conteggio totale prenotazioni
    const totalReservations = eventsData.length;
    
    // Risorse attive
    const activeResources = resourcesData.filter(
      resource => resource.status === ResourceStatus.ACTIVE
    ).length;
    
    // Prenotazioni future
    const upcomingReservations = eventsData.filter(
      event => new Date(event.start) > now
    ).length;
    
    // Tasso di utilizzo (percentuale di risorse attualmente in uso)
    const currentlyInUseCount = resourcesData.length > 0 ? 
      eventsData.filter(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        return start <= now && end >= now;
      }).length : 0;
    
    const utilizationRate = resourcesData.length > 0 ? 
      Math.round((currentlyInUseCount / resourcesData.length) * 100) : 0;
    
    setStats({
      totalReservations,
      activeResources,
      upcomingReservations,
      utilizationRate
    });
  };

  // Prepara i dati per il grafico delle prenotazioni per risorsa
  const getReservationsByResourceData = () => {
    const data = [];
    
    if (resources.length && events.length) {
      resources.forEach(resource => {
        const count = events.filter(event => event.resourceId === resource.id).length;
        if (count > 0) {
          data.push({
            id: resource.id,
            name: resource.name,
            count: count
          });
        }
      });
    }
    
    // Ordina per numero di prenotazioni (decrescente)
    return data.sort((a, b) => b.count - a.count).slice(0, 10);
  };

  // Prepara i dati per il grafico dello stato delle risorse
  const getResourceStatusData = () => {
    const statusCounts = {
      [ResourceStatus.ACTIVE]: 0,
      [ResourceStatus.MAINTENANCE]: 0,
      [ResourceStatus.UNAVAILABLE]: 0
    };
    
    resources.forEach(resource => {
      if (statusCounts[resource.status] !== undefined) {
        statusCounts[resource.status]++;
      }
    });
    
    return [
      { name: t('statusChart.active'), value: statusCounts[ResourceStatus.ACTIVE], color: '#4caf50' },
      { name: t('statusChart.inMaintenance'), value: statusCounts[ResourceStatus.MAINTENANCE], color: '#ff9800' },
      { name: t('statusChart.notAvailable'), value: statusCounts[ResourceStatus.UNAVAILABLE], color: '#f44336' }
    ];
  };

  // Prepara i dati per il grafico del trend delle prenotazioni
  const getReservationTrendData = () => {
    const data = [];
    const today = moment();
    
    // Crea un array con gli ultimi 6 mesi
    for (let i = 5; i >= 0; i--) {
      const monthDate = moment(today).subtract(i, 'months');
      const monthName = monthDate.format('MMM');
      const monthYear = monthDate.format('YYYY');
      const startOfMonth = moment(monthDate).startOf('month');
      const endOfMonth = moment(monthDate).endOf('month');
      
      // Conta le prenotazioni in questo mese
      const count = events.filter(event => {
        const eventDate = moment(event.start);
        return eventDate.isBetween(startOfMonth, endOfMonth, null, '[]');
      }).length;

      data.push({
        name: monthName,
        count: count,
        year: monthYear
      });
    }
    
    return data;
  };

  // Ottenere le prenotazioni imminenti
  const getUpcomingReservations = () => {
    const now = new Date();
    
    // Filtra e ordina le prenotazioni future
    return events
      .filter(event => new Date(event.start) > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 5)
      .map(event => {
        // Trova il nome della risorsa
        const resource = resources.find(r => r.id === event.resourceId);
        return {
          ...event,
          resourceName: resource ? resource.name : t('resourceCard.unknown')
        };
      });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{t('dashboard.title')}</Typography>
      
      {/* Statistiche principali */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white', flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{t('dashboard.totalBookings')}</Typography>
            <Typography variant="h3">{stats.totalReservations}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.success.main, color: 'white', flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{t('dashboard.activeResources')}</Typography>
            <Typography variant="h3">{stats.activeResources}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.info.main, color: 'white', flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{t('dashboard.futureBookings')}</Typography>
            <Typography variant="h3">{stats.upcomingReservations}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: theme.palette.secondary.main, color: 'white', flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{t('dashboard.utilizationRate')}</Typography>
            <Typography variant="h3">{stats.utilizationRate}%</Typography>
          </CardContent>
        </Card>
      </Stack>
      
      {/* Prima riga di grafici */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Paper elevation={2} sx={{ p: 2, flex: { md: 2 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.bookingTrends')}</Typography>
          <Divider sx={{ mb: 2 }} />
          <ReservationsTrendChart data={getReservationTrendData()} />
        </Paper>
        <Paper elevation={2} sx={{ p: 2, flex: { md: 1 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.resourceStatus')}</Typography>
          <Divider sx={{ mb: 2 }} />
          <ResourceStatusChart data={getResourceStatusData()} />
        </Paper>
      </Stack>
      
      {/* Seconda riga di contenuti */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Paper elevation={2} sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.bookingsPerResource')}</Typography>
          <Divider sx={{ mb: 2 }} />
          <ReservationsByResourceChart data={getReservationsByResourceData()} />
        </Paper>
        <Paper elevation={2} sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.upcomingBookings')}</Typography>
          <Divider sx={{ mb: 2 }} />
          <UpcomingReservations reservations={getUpcomingReservations()} />
        </Paper>
      </Stack>
      
      {/* Tabella di utilizzo risorse */}
      <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.resourceUtilization')}</Typography>
        <Divider sx={{ mb: 2 }} />
        <ResourceUtilizationTable 
          resources={resources} 
          events={events} 
          resourceTypes={resourceTypes} 
        />
      </Paper>
    </Box>
  );
};

export default Dashboard;