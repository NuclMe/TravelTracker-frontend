import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

export default function TripList() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
      <Typography variant="h3">Upcoming Trips</Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ ml: '20px' }}
        startIcon={<AddIcon />}
      >
        Add Trip
      </Button>
    </Box>
  );
}
