import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AppRouterCacheProvider>
        <App />
      </AppRouterCacheProvider>
  </StrictMode>,
)
