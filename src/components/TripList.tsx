import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import TripForm from './TripForm'

export default function TripList() {
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
      <Typography variant="h3">Upcoming Trips</Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ ml: '20px' }}
        onClick={() => setOpen(!open)}
        startIcon={<AddIcon />}
      >
        Add Trip
      </Button>
      <TripForm
        open={open}
        handleClose={() => {
          setOpen(!open)
        }}
      />
    </Box>
  )
}
