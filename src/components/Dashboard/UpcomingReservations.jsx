import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
  // If there are no reservations, show a message
  if (!reservations || reservations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Typography variant="body1" color="text.secondary">
          {t('upcomingReservations.noUpcomingBookings')}
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
                  {t('upcomingReservations.date')}: {formatDate(reservation.start)}
                </Typography>
                <Typography component="span" variant="body2">
                  {t('upcomingReservations.user')}: {reservation.userName || t('upcomingReservations.na')}
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