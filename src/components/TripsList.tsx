import { useState } from 'react'
import { Box, Button } from '@mui/material'
import TripForm from './TripForm'
import AddIcon from '@mui/icons-material/Add'
import type { Trip } from '../redux/tripsApi'
import { formatDate } from '../utils'
type TripsListProps = {
  title: string
  trips: Trip[]
}

export default function TripsList(props: TripsListProps) {
  const { title, trips } = props
  const [open, setOpen] = useState(false)

  return (
    <Box>
      <Box sx={{ borderBottom: '1px solid #000' }}>{title}</Box>
      {title === 'Upcoming Trips' && (
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: '20px' }}
          onClick={() => setOpen(!open)}
          startIcon={<AddIcon />}
        >
          Add Trip
        </Button>
      )}
      <Box>
        {trips.map((trip) => (
          <Box
            key={trip._id}
            sx={{
              height: 200,
              width: 200,
              backgroundImage: trip.photos?.[0]?.url
                ? `url(${trip.photos[0].url})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              color: '#fff',
            }}
          >
            <Box> {trip.tripName}</Box>
            <Box> {trip.destination}</Box>
            <Box>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Box>
            <Box>$10 / ${trip.budget}</Box>
          </Box>
        ))}
      </Box>
      <TripForm
        open={open}
        handleClose={() => {
          setOpen(!open)
        }}
      />
    </Box>
  )
}
