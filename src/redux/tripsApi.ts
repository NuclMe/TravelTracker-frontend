// src/services/tripsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

type CreateTripRequest = {
  title: string
  content: string
}

export const tripsApi = createApi({
  reducerPath: 'tripsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
  }),
  endpoints: (builder) => ({
    createTrip: builder.mutation<void, CreateTripRequest>({
      query: (body) => ({
        url: '/feed/createTrip',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useCreateTripMutation } = tripsApi
