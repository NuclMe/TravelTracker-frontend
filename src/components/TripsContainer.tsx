import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TripsList from './TripsList'
import { useGetTripsQuery, type Trip } from '../redux/tripsApi'

function normalizeTrips(
  data: Trip[] | { trips?: Trip[]; items?: Trip[] } | undefined,
) {
  if (!data) {
    return []
  }

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data.trips)) {
    return data.trips
  }

  if (Array.isArray(data.items)) {
    return data.items
  }

  return []
}

export default function TripsContainer() {
  const { data, isLoading, isError } = useGetTripsQuery()
  const trips = normalizeTrips(data)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
      {isLoading ? (
        <Typography sx={{ p: 2 }}>Loading trips...</Typography>
      ) : isError ? (
        <Typography sx={{ p: 2 }} color="error">
          Unable to load trips.
        </Typography>
      ) : (
        <TripsList title="Upcoming Trips" trips={trips} />
      )}
    </Box>
  )
}
