import Box from '@mui/material/Box'
import { useMemo } from 'react'
import Typography from '@mui/material/Typography'
import TripsList from './TripsList'
import { useGetTripsQuery, type Trip } from '../redux/tripsApi'
import { isPastTrip } from '../utils'

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

  const { upcomingTrips, pastTrips } = useMemo(() => {
    const upcoming: Trip[] = []
    const past: Trip[] = []

    for (const trip of trips) {
      if (isPastTrip(trip.endDate)) {
        past.push(trip)
      } else {
        upcoming.push(trip)
      }
    }

    return { upcomingTrips: upcoming, pastTrips: past }
  }, [trips])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
      {isLoading ? (
        <Typography sx={{ p: 2 }}>Loading trips...</Typography>
      ) : isError ? (
        <Typography sx={{ p: 2 }} color="error">
          Unable to load trips.
        </Typography>
      ) : (
        <Box>
          <TripsList title="Upcoming Trips" trips={upcomingTrips} />
          <TripsList title="Past Trips" trips={pastTrips} />
        </Box>
      )}
    </Box>
  )
}
