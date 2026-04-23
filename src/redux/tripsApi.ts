// src/services/tripsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type Place = {
  id?: string
  _id?: string
  name: string
  address: string
  category: 'cafe' | 'museum' | 'park' | 'hotel' | 'viewpoint'
  status: 'planned' | 'visited'
  lat: number
  lng: number
}

export type Trip = {
  id?: string | number
  _id?: string
  name?: string
  tripName?: string
  destination?: string
  date?: string
  startDate?: string
  endDate?: string
  budget?: number
  image?: string
  photos?: Array<{
    url: string
  }>
  places?: Place[]
}

type CreateTripRequest = {
  tripName: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  photos: File[]
}
type SavePlaceRequest = {
  tripId: string
  place: Omit<Place, 'id' | '_id'>
}

type UpdatePlaceRequest = {
  tripId: string
  placeId: string
  patch: Partial<Omit<Place, 'id' | '_id'>>
}

export const tripsApi = createApi({
  reducerPath: 'tripsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
  }),
  tagTypes: ['Trips'],
  endpoints: (builder) => ({
    createTrip: builder.mutation<void, CreateTripRequest>({
      query: ({ photos, ...trip }) => {
        const body = new FormData()

        body.append('tripName', trip.tripName)
        body.append('destination', trip.destination)
        body.append('startDate', trip.startDate)
        body.append('endDate', trip.endDate)
        body.append('budget', String(trip.budget))

        photos.forEach((photo) => {
          body.append('photos', photo)
        })

        return {
          url: '/feed/createTrip',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: [{ type: 'Trips', id: 'LIST' }],
    }),
    getTrips: builder.query<Trip[] | { trips?: Trip[]; items?: Trip[] }, void>({
      query: () => ({
        url: '/feed/getTrips',
        method: 'GET',
      }),
      providesTags: (result) => {
        const trips = Array.isArray(result)
          ? result
          : (result?.trips ?? result?.items ?? [])

        return [
          { type: 'Trips' as const, id: 'LIST' },
          ...trips.map((trip) => ({
            type: 'Trips' as const,
            id: String(trip._id ?? trip.id ?? ''),
          })),
        ]
      },
    }),
    addPlace: builder.mutation<Place, SavePlaceRequest>({
      query: ({ tripId, place }) => ({
        url: `/feed/trips/${tripId}/places`,
        method: 'POST',
        body: place,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Trips', id: 'LIST' },
        { type: 'Trips', id: arg.tripId },
      ],
    }),
    updatePlace: builder.mutation<Place, UpdatePlaceRequest>({
      query: ({ tripId, placeId, patch }) => ({
        url: `/feed/trips/${tripId}/places/${placeId}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Trips', id: 'LIST' },
        { type: 'Trips', id: arg.tripId },
      ],
    }),
    deletePlace: builder.mutation<void, { tripId: string; placeId: string }>({
      query: ({ tripId, placeId }) => ({
        url: `/feed/trips/${tripId}/places/${placeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Trips', id: 'LIST' },
        { type: 'Trips', id: arg.tripId },
      ],
    }),
  }),
})

export const {
  useCreateTripMutation,
  useGetTripsQuery,
  useAddPlaceMutation,
  useUpdatePlaceMutation,
  useDeletePlaceMutation,
} = tripsApi
