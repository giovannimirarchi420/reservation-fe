import React from 'react';
import {Box, Typography} from '@mui/material';

const EventItem = ({ event, title }) => {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{title}</Typography>
      <Typography variant="caption" display="block">
        {event.resourceName} - {event.user}
      </Typography>
    </Box>
  );
};

export default EventItem;
