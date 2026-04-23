import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'

export default function Header() {
  return (
    <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 2 }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background:
            'linear-gradient(120deg, rgba(6, 91, 183, 0.92), rgba(0, 123, 216, 0.86))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ width: 'min(1160px, 100%)', mx: 'auto' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="travel tracker"
            sx={{ mr: 2 }}
          >
            <FlightTakeoffIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontFamily: 'Sora, Manrope, Segoe UI, sans-serif',
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          >
            TravelTracker
          </Typography>

          <Button
            color="inherit"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '999px',
              px: 2,
              border: '1px solid rgba(255, 255, 255, 0.42)',
            }}
          >
            My Account
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
