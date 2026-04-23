import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CameraOutdoorRoundedIcon from '@mui/icons-material/CameraOutdoorRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import HotelRoundedIcon from '@mui/icons-material/HotelRounded'
import MuseumRoundedIcon from '@mui/icons-material/MuseumRounded'
import ParkRoundedIcon from '@mui/icons-material/ParkRounded'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { divIcon } from 'leaflet'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import TripForm from './TripForm'
import {
  useAddPlaceMutation,
  useDeletePlaceMutation,
  useUpdatePlaceMutation,
  type Place as ApiPlace,
  type Trip,
} from '../redux/tripsApi'
import { formatDate } from '../utils'

type TripsListProps = {
  title: string
  trips: Trip[]
}

type PlaceCategory = 'cafe' | 'museum' | 'park' | 'hotel' | 'viewpoint'
type PlaceStatus = 'planned' | 'visited'

type Place = {
  id: string
  name: string
  address: string
  category: PlaceCategory
  status: PlaceStatus
  lat: number
  lng: number
}

type DraftPlace = Omit<Place, 'id' | 'status'>
type Coordinates = [number, number]

const defaultCenter: Coordinates = [48.8566, 2.3522]
const modalZoom = 12
const previewZoom = 9

const categoryIconMap = {
  cafe: RestaurantRoundedIcon,
  museum: MuseumRoundedIcon,
  park: ParkRoundedIcon,
  hotel: HotelRoundedIcon,
  viewpoint: CameraOutdoorRoundedIcon,
} as const

const categoryColorMap = {
  cafe: '#ff7f50',
  museum: '#4f46e5',
  park: '#169768',
  hotel: '#0066ff',
  viewpoint: '#da8d00',
} as const

const seedPlaces = [
  {
    name: 'Central Coffee Roasters',
    address: '12 Riverside Blvd',
    category: 'cafe' as const,
    lat: 48.8562,
    lng: 2.3498,
  },
  {
    name: 'City History Museum',
    address: '44 Old Town Ave',
    category: 'museum' as const,
    lat: 48.8608,
    lng: 2.3376,
  },
  {
    name: 'Skyline View Deck',
    address: '1 Panorama Hill',
    category: 'viewpoint' as const,
    lat: 48.8733,
    lng: 2.2945,
  },
  {
    name: 'Grand Park Garden',
    address: '77 Green Street',
    category: 'park' as const,
    lat: 48.8463,
    lng: 2.3371,
  },
  {
    name: 'Harbor Boutique Hotel',
    address: '9 Marina Drive',
    category: 'hotel' as const,
    lat: 48.8514,
    lng: 2.2873,
  },
]

const getTripKey = (trip: Trip, fallbackIndex: number) =>
  String(trip._id ?? trip.id ?? `trip-${fallbackIndex}`)

const getTripApiId = (trip: Trip) => {
  if (trip._id) {
    return String(trip._id)
  }

  if (trip.id !== undefined && trip.id !== null) {
    return String(trip.id)
  }

  return null
}

const mapApiPlaceToUi = (place: ApiPlace): Place | null => {
  const id = place._id ?? place.id

  if (!id) {
    return null
  }

  return {
    id: String(id),
    name: place.name,
    address: place.address,
    category: place.category,
    status: place.status,
    lat: place.lat,
    lng: place.lng,
  }
}

const getTripName = (trip: Trip) =>
  trip.tripName ?? trip.name ?? 'Untitled trip'
const getDestination = (trip: Trip) => trip.destination ?? 'Destination TBD'
const getBudget = (trip: Trip) => trip.budget ?? 0

const getDateRange = (trip: Trip) => {
  if (trip.startDate && trip.endDate) {
    return `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
  }

  return trip.date ?? 'Dates are not set'
}

const roundCoord = (value: number) => Math.round(value * 10000) / 10000

const asCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const makeMarkerIcon = (color: string, active = false) =>
  divIcon({
    className: '',
    html: `
      <div style="
        width:${active ? 18 : 14}px;
        height:${active ? 18 : 14}px;
        border-radius:999px;
        background:${color};
        border:2px solid #ffffff;
        box-shadow:0 0 0 5px ${active ? 'rgba(255, 122, 26, 0.20)' : 'rgba(0, 95, 196, 0.16)'};
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

function MapView({ center, zoom }: { center: Coordinates; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, map, zoom])

  return null
}

function MapClickHandler({
  onSelect,
}: {
  onSelect: (coords: Coordinates) => void
}) {
  useMapEvents({
    click(event: any) {
      onSelect([roundCoord(event.latlng.lat), roundCoord(event.latlng.lng)])
    },
  })

  return null
}

function LeafletMapStage({
  center,
  zoom,
  height,
  points,
  selected,
  onSelect,
  interactive,
}: {
  center: Coordinates
  zoom: number
  height: number
  points: Place[]
  selected?: DraftPlace | null
  onSelect?: (coords: Coordinates) => void
  interactive?: boolean
}) {
  return (
    <Box
      sx={{
        height,
        borderRadius: 2.5,
        overflow: 'hidden',
        border: '1px solid rgba(73, 132, 209, 0.4)',
        background:
          'radial-gradient(circle at 70% 24%, rgba(84, 177, 255, 0.45), transparent 45%), linear-gradient(170deg, #d7f1ff 0%, #cde9ff 35%, #f4fbff 100%)',
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={interactive}
        scrollWheelZoom={interactive}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapView center={center} zoom={zoom} />
        {interactive && onSelect && <MapClickHandler onSelect={onSelect} />}
        {points.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={makeMarkerIcon(
              categoryColorMap[place.category],
              place.status === 'visited',
            )}
          />
        ))}
        {selected && (
          <Marker
            position={[selected.lat, selected.lng]}
            icon={makeMarkerIcon('#ff7a1a', true)}
          />
        )}
      </MapContainer>
    </Box>
  )
}

export default function TripsList({ title, trips }: TripsListProps) {
  const [addPlaceMutation] = useAddPlaceMutation()
  const [updatePlaceMutation] = useUpdatePlaceMutation()
  const [deletePlaceMutation] = useDeletePlaceMutation()
  const [open, setOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [activeTripId, setActiveTripId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<DraftPlace | null>(null)
  const [selectedCenter, setSelectedCenter] =
    useState<Coordinates>(defaultCenter)
  const currentPlaces = useMemo(() => {
    if (!activeTripId) {
      return []
    }

    const trip = trips.find((item) => getTripApiId(item) === activeTripId)
    if (!trip?.places) {
      return []
    }

    return trip.places
      .map(mapApiPlaceToUi)
      .filter((item): item is Place => item !== null)
  }, [activeTripId, trips])

  const visiblePlaces = editingPlaceId
    ? currentPlaces.filter((place) => place.id !== editingPlaceId)
    : currentPlaces

  const filteredSuggestions = useMemo(
    () =>
      seedPlaces.filter(
        (item) =>
          searchValue.trim().length > 0 &&
          `${item.name} ${item.address}`
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()),
      ),
    [searchValue],
  )

  const openPlaceModal = (tripId: string, place?: Place) => {
    setActiveTripId(tripId)
    setMapOpen(true)

    if (place) {
      setEditingPlaceId(place.id)
      setSelectedPlace({
        name: place.name,
        address: place.address,
        category: place.category,
        lat: place.lat,
        lng: place.lng,
      })
      setSelectedCenter([place.lat, place.lng])
      setSearchValue(place.name)
      return
    }

    setEditingPlaceId(null)
    setSelectedPlace(null)
    setSelectedCenter(defaultCenter)
    setSearchValue('')
  }

  const closePlaceModal = () => {
    setMapOpen(false)
    setEditingPlaceId(null)
    setSelectedPlace(null)
    setSearchValue('')
    setIsSearching(false)
  }

  const handleSearch = (value: string) => {
    setSearchValue(value)
    setIsSearching(true)
    window.setTimeout(() => {
      setIsSearching(false)
    }, 250)
  }

  const applySuggestion = (suggestion: (typeof seedPlaces)[number]) => {
    setSelectedPlace({
      name: suggestion.name,
      address: suggestion.address,
      category: suggestion.category,
      lat: suggestion.lat,
      lng: suggestion.lng,
    })
    setSelectedCenter([suggestion.lat, suggestion.lng])
    setSearchValue(suggestion.name)
  }

  const handleMapClick = (coords: Coordinates) => {
    const fallback = filteredSuggestions[0] ?? seedPlaces[0]
    setSelectedPlace({
      name: searchValue.trim() || fallback.name || 'Pinned place',
      address: `Map pin · ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`,
      category: fallback.category,
      lat: coords[0],
      lng: coords[1],
    })
    setSelectedCenter(coords)
  }

  const savePlace = async () => {
    if (!activeTripId || !selectedPlace) {
      return
    }

    setIsSaving(true)
    try {
      if (editingPlaceId) {
        await updatePlaceMutation({
          tripId: activeTripId,
          placeId: editingPlaceId,
          patch: {
            name: selectedPlace.name,
            address: selectedPlace.address,
            category: selectedPlace.category,
            lat: selectedPlace.lat,
            lng: selectedPlace.lng,
          },
        }).unwrap()
      } else {
        await addPlaceMutation({
          tripId: activeTripId,
          place: {
            name: selectedPlace.name,
            address: selectedPlace.address,
            category: selectedPlace.category,
            status: 'planned',
            lat: selectedPlace.lat,
            lng: selectedPlace.lng,
          },
        }).unwrap()
      }

      closePlaceModal()
    } catch {
      // no-op: keep modal open so user can retry
    } finally {
      setIsSaving(false)
    }
  }

  const removePlace = async (tripId: string, placeId: string) => {
    try {
      await deletePlaceMutation({ tripId, placeId }).unwrap()
    } catch {
      // no-op
    }
  }

  const toggleVisited = async (tripId: string, place: Place) => {
    try {
      await updatePlaceMutation({
        tripId,
        placeId: place.id,
        patch: {
          status: place.status === 'visited' ? 'planned' : 'visited',
        },
      }).unwrap()
    } catch {
      // no-op
    }
  }

  return (
    <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: 'Sora, Manrope, Segoe UI, sans-serif',
              fontSize: { xs: 26, md: 34 },
              fontWeight: 700,
              color: '#0f2440',
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ color: '#4f607a', mt: 0.5 }}>
            Plan routes, save places, and keep your map-ready itinerary in one
            card.
          </Typography>
        </Box>

        <Chip
          label={`${trips.length} trips`}
          sx={{
            borderRadius: '999px',
            bgcolor: '#e7f5ff',
            color: '#0b4a8f',
            fontWeight: 700,
            px: 0.8,
          }}
        />
      </Stack>

      {title === 'Upcoming Trips' && (
        <Button
          variant="contained"
          sx={{
            mb: 3,
            borderRadius: '999px',
            px: 2.5,
            py: 1,
            bgcolor: '#0064d6',
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0, 100, 214, 0.35)',
            '&:hover': { bgcolor: '#0052af' },
          }}
          onClick={() => setOpen(!open)}
          startIcon={<AddIcon />}
        >
          Add Trip
        </Button>
      )}

      <Stack spacing={2.5}>
        {trips.map((trip, index) => {
          const tripId = getTripKey(trip, index)
          const tripApiId = getTripApiId(trip)
          const places = (trip.places ?? [])
            .map(mapApiPlaceToUi)
            .filter((item): item is Place => item !== null)

          return (
            <Box
              key={tripId}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                p: { xs: 2, md: 3 },
                background:
                  'linear-gradient(130deg, #f6fbff 0%, #ffffff 46%, #eef6ff 100%)',
                boxShadow:
                  '0 30px 60px rgba(16, 75, 134, 0.10), 0 10px 24px rgba(21, 87, 154, 0.08)',
                border: '1px solid rgba(92, 167, 255, 0.22)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 82% 18%, rgba(84, 196, 255, 0.22), transparent 43%), radial-gradient(circle at 12% 84%, rgba(0, 108, 212, 0.11), transparent 48%)',
                  pointerEvents: 'none',
                }}
              />

              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={2.5}
                sx={{ position: 'relative' }}
              >
                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: 'Sora, Manrope, Segoe UI, sans-serif',
                          fontSize: { xs: 22, md: 28 },
                          fontWeight: 700,
                          color: '#0f2747',
                        }}
                      >
                        {getTripName(trip)}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.6}
                        alignItems="center"
                        sx={{ mt: 0.6 }}
                      >
                        <PlaceOutlinedIcon
                          sx={{ color: '#0071db', fontSize: 18 }}
                        />
                        <Typography sx={{ color: '#304e74', fontWeight: 600 }}>
                          {getDestination(trip)}
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                      <Chip
                        label={asCurrency(getBudget(trip))}
                        sx={{
                          bgcolor: '#0d5ec9',
                          color: '#fff',
                          fontWeight: 700,
                          borderRadius: '999px',
                        }}
                      />
                      <Typography
                        sx={{ mt: 1, color: '#587195', fontSize: 14 }}
                      >
                        {getDateRange(trip)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      mt: 2,
                      borderRadius: 3,
                      p: 2,
                      border: '1px solid rgba(79, 151, 229, 0.22)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1.4 }}
                    >
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#12325b',
                        }}
                      >
                        Places
                      </Typography>
                      <Chip
                        size="small"
                        label={`${places.length} saved`}
                        sx={{
                          bgcolor: '#eaf3ff',
                          color: '#0c4f9b',
                          fontWeight: 700,
                        }}
                      />
                    </Stack>

                    {places.length === 0 ? (
                      <Box
                        sx={{
                          border: '1px dashed rgba(0, 104, 199, 0.35)',
                          borderRadius: '16px',
                          p: { xs: 2, md: 2.5 },
                          textAlign: 'left',
                          bgcolor: 'rgba(242, 249, 255, 0.8)',
                        }}
                      >
                        <Typography
                          sx={{ fontWeight: 700, color: '#1e3e67', mb: 0.5 }}
                        >
                          No places yet
                        </Typography>
                        <Typography sx={{ color: '#59759a', fontSize: 14 }}>
                          Start with cafes, viewpoints, or hotels. Click Add
                          place to pin your first stop on the map.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1.2}>
                        {places.map((place) => {
                          const IconComponent = categoryIconMap[place.category]
                          return (
                            <Box
                              key={place.id}
                              sx={{
                                borderRadius: '14px',
                                p: 1.2,
                                border: '1px solid rgba(85, 135, 197, 0.24)',
                                bgcolor: '#fff',
                              }}
                            >
                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                spacing={1}
                              >
                                <Stack direction="row" spacing={1.1}>
                                  <Avatar
                                    sx={{
                                      width: 34,
                                      height: 34,
                                      bgcolor: `${categoryColorMap[place.category]}20`,
                                      color: categoryColorMap[place.category],
                                    }}
                                  >
                                    <IconComponent sx={{ fontSize: 19 }} />
                                  </Avatar>

                                  <Box>
                                    <Typography
                                      sx={{ fontWeight: 700, color: '#15365e' }}
                                    >
                                      {place.name}
                                    </Typography>
                                    <Typography
                                      sx={{ color: '#5f789b', fontSize: 13 }}
                                    >
                                      {place.address}
                                    </Typography>
                                  </Box>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={0.6}
                                  alignItems="center"
                                >
                                  <Chip
                                    label={place.category}
                                    size="small"
                                    sx={{
                                      bgcolor: `${categoryColorMap[place.category]}14`,
                                      color: categoryColorMap[place.category],
                                      textTransform: 'capitalize',
                                      fontWeight: 700,
                                    }}
                                  />
                                  <Chip
                                    icon={<CheckCircleRoundedIcon />}
                                    label={place.status}
                                    size="small"
                                    onClick={() =>
                                      tripApiId &&
                                      toggleVisited(tripApiId, place)
                                    }
                                    sx={{
                                      cursor: 'pointer',
                                      bgcolor:
                                        place.status === 'visited'
                                          ? '#dff8ea'
                                          : '#eef2f7',
                                      color:
                                        place.status === 'visited'
                                          ? '#0f7a4e'
                                          : '#5d6f84',
                                      textTransform: 'capitalize',
                                      '& .MuiChip-icon': {
                                        color:
                                          place.status === 'visited'
                                            ? '#0f7a4e'
                                            : '#7b8a9b',
                                      },
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      tripApiId &&
                                      openPlaceModal(tripApiId, place)
                                    }
                                  >
                                    <EditOutlinedIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      tripApiId &&
                                      removePlace(tripApiId, place.id)
                                    }
                                  >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            </Box>
                          )
                        })}
                      </Stack>
                    )}

                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => tripApiId && openPlaceModal(tripApiId)}
                      disabled={!tripApiId}
                      sx={{
                        mt: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#0f6bdb',
                        '&:hover': { bgcolor: '#0656b5' },
                      }}
                    >
                      Add place
                    </Button>
                  </Box>
                </Box>

                <Box
                  sx={{
                    width: { xs: '100%', lg: 280 },
                    minWidth: { lg: 280 },
                    borderRadius: 3,
                    p: 1.4,
                    background:
                      'linear-gradient(160deg, rgba(0, 137, 223, 0.16), rgba(27, 74, 151, 0.12))',
                    border: '1px solid rgba(84, 160, 233, 0.3)',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#1f4676',
                      fontWeight: 700,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                    }}
                  >
                    <ExploreRoundedIcon sx={{ fontSize: 18 }} /> Map preview
                  </Typography>

                  {places.length > 0 ? (
                    <LeafletMapStage
                      center={[
                        places[0].lat ?? defaultCenter[0],
                        places[0].lng ?? defaultCenter[1],
                      ]}
                      zoom={previewZoom}
                      height={170}
                      points={places}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 170,
                        borderRadius: 2.5,
                        border: '1px solid rgba(73, 132, 209, 0.4)',
                        background:
                          'radial-gradient(circle at 70% 24%, rgba(84, 177, 255, 0.45), transparent 45%), linear-gradient(170deg, #d7f1ff 0%, #cde9ff 35%, #f4fbff 100%)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#4070a8',
                        textAlign: 'center',
                        px: 2,
                      }}
                    >
                      <Stack alignItems="center" spacing={0.8}>
                        <PlaceOutlinedIcon sx={{ fontSize: 22 }} />
                        <Typography sx={{ fontSize: 13.5 }}>
                          Places pinned on map appear here
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Stack>
            </Box>
          )
        })}
      </Stack>

      <Dialog
        open={mapOpen}
        onClose={closePlaceModal}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background:
              'linear-gradient(170deg, #fcfeff 0%, #f1f8ff 65%, #e9f3ff 100%)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700, color: '#173b65' }}>
          {editingPlaceId ? 'Edit place on map' : 'Select place on map'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Search place"
            value={searchValue}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Cafe, museum, park..."
            slotProps={{
              input: {
                startAdornment: (
                  <SearchRoundedIcon sx={{ mr: 1, color: '#6a7e96' }} />
                ),
              },
            }}
          />

          <Box sx={{ mt: 2 }}>
            <LeafletMapStage
              center={selectedCenter}
              zoom={modalZoom}
              height={340}
              points={visiblePlaces}
              selected={selectedPlace}
              onSelect={handleMapClick}
              interactive
            />
          </Box>

          {isSearching ? (
            <Typography sx={{ mt: 1.3, color: '#5d6f87' }}>
              Loading places...
            </Typography>
          ) : (
            filteredSuggestions.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1.4, flexWrap: 'wrap' }}
              >
                {filteredSuggestions.map((item) => (
                  <Chip
                    key={item.name}
                    label={item.name}
                    onClick={() => applySuggestion(item)}
                    sx={{ mb: 1, fontWeight: 600 }}
                  />
                ))}
              </Stack>
            )
          )}

          <Divider sx={{ my: 2 }} />

          {selectedPlace ? (
            <Box
              sx={{
                borderRadius: 2,
                border: '1px solid rgba(70, 133, 205, 0.28)',
                backgroundColor: 'rgba(255, 255, 255, 0.72)',
                p: 1.5,
              }}
            >
              <Typography sx={{ color: '#153a66', fontWeight: 700 }}>
                {selectedPlace.name}
              </Typography>
              <Typography sx={{ color: '#5e7798', fontSize: 14, mt: 0.4 }}>
                {selectedPlace.address}
              </Typography>
              <Typography sx={{ color: '#4d6687', fontSize: 13, mt: 0.6 }}>
                Coordinates: {selectedPlace.lat}, {selectedPlace.lng}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ color: '#617a9b' }}>
              Select a point on the map or choose from search suggestions.
            </Typography>
          )}

          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1}
            justifyContent="flex-end"
            sx={{ mt: 2.5 }}
          >
            <Button onClick={closePlaceModal} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={savePlace}
              disabled={!selectedPlace || isSaving}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#0a67d0',
                '&:hover': { bgcolor: '#0456ad' },
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <TripForm
        open={open}
        handleClose={() => {
          setOpen(!open)
        }}
      />
    </Box>
  )
}
