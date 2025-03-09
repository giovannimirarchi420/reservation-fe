import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography 
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { formatDate } from '../../utils/dateUtils';

const UpcomingReservations = ({ reservations }) => {
  
  // Se non ci sono prenotazioni, mostra un messaggio
  if (!reservations || reservations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Typography variant="body1" color="text.secondary">
          Nessuna prenotazione imminente
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
      {reservations.map((reservation) => (
        <ListItem key={reservation.id} alignItems="flex-start" divider>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <EventIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="subtitle1" component="span">
                {reservation.title}
              </Typography>
            }
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{ display: 'block' }}
                >
                  {reservation.resourceName}
                </Typography>
                <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                  Data: {formatDate(reservation.start)}
                </Typography>
                <Typography component="span" variant="body2">
                  Utente: {reservation.userName || 'N/D'}
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default UpcomingReservations;