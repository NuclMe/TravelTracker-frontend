import { configureStore } from '@reduxjs/toolkit'
import { tripsApi } from './tripsApi'

export const store = configureStore({
  reducer: {
    [tripsApi.reducerPath]: tripsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tripsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
