import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReservationsTrendChart = ({ data }) => {
  const theme = useTheme();

  // Se non ci sono dati, mostra un messaggio
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="text.secondary">
          Nessun dato disponibile
        </Typography>
      </Box>
    );
  }

  // Funzione sicura per il tooltip che controlla se il dato esiste
  const formatTooltip = (value, name, props) => {
    // Verifica che i dati necessari siano disponibili
    if (!props || !props.payload) {
      return ['Nessun dato', ''];
    }
    
    // Ottieni i dati del punto dal payload
    const item = props.payload;
    
    // Restituisci array con valore e descrizione
    return [
      `${item.count} prenotazioni`, 
      `${item.name} ${item.year}`
    ];
  };

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            label={{ 
              value: 'Mese', 
              position: 'insideBottomRight', 
              offset: -5 
            }}
          />
          <YAxis 
            label={{ 
              value: 'Numero di prenotazioni', 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle' } 
            }} 
          />
          <Tooltip formatter={formatTooltip} />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke={theme.palette.primary.main} 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ReservationsTrendChart;