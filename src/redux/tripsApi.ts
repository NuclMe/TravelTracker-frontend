// src/services/tripsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type Trip = {
  id: string | number
  name: string
  date: string
  image?: string
}

type CreateTripRequest = {
  tripName: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  photos: File[]
}

export const tripsApi = createApi({
  reducerPath: 'tripsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
  }),
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
    }),
    getTrips: builder.query<Trip[] | { trips?: Trip[]; items?: Trip[] }, void>({
      query: () => ({
        url: '/feed/getTrips',
        method: 'GET',
      }),
    }),
  }),
})

export const { useCreateTripMutation, useGetTripsQuery } = tripsApi
