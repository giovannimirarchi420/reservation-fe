import React, { useMemo } from 'react';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  LinearProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ResourceStatus } from '../../services/resourceService';

const ResourceUtilizationTable = ({ resources, events, resourceTypes }) => {
  
  const { t } = useTranslation();

  // Genera i dati di utilizzo per ogni risorsa
  const utilizationData = useMemo(() => {
    if (!resources || !events) return [];

    return resources.map(resource => {
      // Trova il tipo di risorsa
      const resourceType = resourceTypes.find(type => type.id === resource.typeId);
      
      // Conta le prenotazioni per questa risorsa
      const resourceEvents = events.filter(event => event.resourceId === resource.id);
      
      // Calcola le ore totali di prenotazione
      let totalHours = 0;
      resourceEvents.forEach(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const diffMs = end - start;
        totalHours += diffMs / (1000 * 60 * 60); // Converti da millisecondi a ore
      });
      
      // Calcola ore al mese (per semplicità, consideriamo un mese di 30 giorni)
      const hoursPerMonth = 24 * 30;
      
      // Calcola la percentuale di utilizzo
      const utilizationRate = Math.min(100, Math.round((totalHours / hoursPerMonth) * 100));
      
      return {
        id: resource.id,
        name: resource.name,
        type: resourceType ? resourceType.name : 'N/D',
        status: resource.status,
        reservationsCount: resourceEvents.length,
        utilizationRate: utilizationRate
      };
    });
  }, [resources, events, resourceTypes]);

  // Ottiene l'etichetta e il colore per lo stato della risorsa
  const getStatusInfo = (status) => {
    switch (status) {
      case ResourceStatus.ACTIVE:
        return { label: t('utilization.active'), color: 'success' };
      case ResourceStatus.MAINTENANCE:
        return { label: t('utilization.maintenance'), color: 'warning' };
      case ResourceStatus.UNAVAILABLE:
        return { label: t('utilization.unavailable'), color: 'error' };
      default:
        return { label: t('utilization.unknown'), color: 'default' };
    }
  };

  // Determina il colore della barra di utilizzo
  const getUtilizationColor = (rate) => {
    if (rate < 30) return 'success';
    if (rate < 70) return 'primary';
    return 'error';
  };

  if (!utilizationData.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {t('utilization.noData')}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead sx={{ bgcolor: 'grey.100' }}>
          <TableRow>
            <TableCell>{t('utilization.resourceName')}</TableCell>
            <TableCell>{t('utilization.type')}</TableCell>
            <TableCell>{t('utilization.state')}</TableCell>
            <TableCell>{t('utilization.bookings')}</TableCell>
            <TableCell>{t('utilization.monthlyUtilizationRate')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {utilizationData.map((row) => {
            const statusInfo = getStatusInfo(row.status);
            const utilizationColor = getUtilizationColor(row.utilizationRate);
            
            return (
              <TableRow key={row.id} hover>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <Chip 
                    label={statusInfo.label} 
                    color={statusInfo.color}
                    size="small"
                  />
                </TableCell>
                <TableCell>{row.reservationsCount}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={row.utilizationRate} 
                        color={utilizationColor}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${row.utilizationRate}%`}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResourceUtilizationTable;