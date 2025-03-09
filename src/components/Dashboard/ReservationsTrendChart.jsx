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
    if (!props || !props.payload || props.payload.index === undefined || !data[props.payload.index]) {
      return ['N/A', 'N/A'];
    }
    
    const dataPoint = data[props.payload.index];
    return [`${value} prenotazioni`, `${dataPoint.name} ${dataPoint.year}`];
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