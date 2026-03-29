import React from 'react'
import { useFormik } from 'formik'
import {
  FormControl,
  InputLabel,
  Input,
  DialogTitle,
  OutlinedInput,
  Dialog,
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

export default function TripForm({ open, handleClose }) {
  const formik = useFormik({
    initialValues: {
      tripName: '',
      destination: '',
      startDate: '',
      endDate: '',
      places: [],
      budget: 0,
    },
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2))
    },
  })
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  return (
    <Dialog fullWidth open={open} onClose={handleClose} fullScreen={fullScreen}>
      <DialogTitle>New Trip</DialogTitle>
      <FormControl sx={{ px: 3, pt: 1, pb: 2 }}>
        <TextField variant="outlined" label="Trip Name" />
      </FormControl>

      <FormControl sx={{ px: 3, pb: 2 }}>
        <TextField variant="outlined" label="Destination" />
      </FormControl>

      <FormControl sx={{ flexDirection: 'row', px: 3, pb: 2 }}>
        <TextField
          variant="outlined"
          label="Start Date"
          sx={{ mr: 2 }}
          slotProps={{
            input: {
              endAdornment: <CalendarMonthIcon />,
            },
          }}
        />
        <TextField
          variant="outlined"
          label="End Date"
          slotProps={{
            input: {
              endAdornment: <CalendarMonthIcon />,
            },
          }}
        />
      </FormControl>

      <FormControl sx={{ px: 3, pb: 2 }}>
        <TextField variant="outlined" label="Budget limit €" />
      </FormControl>
    </Dialog>
  )
}
