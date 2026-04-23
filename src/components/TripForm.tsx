import { useState, type ChangeEvent } from 'react'
import { useFormik } from 'formik'
import {
  FormControl,
  DialogTitle,
  Dialog,
  Box,
  TextField,
  Button,
  Typography,
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useCreateTripMutation } from '../redux/tripsApi'

type TripFormProps = {
  open: boolean
  handleClose: () => void
}

type TripFormValues = {
  tripName: string
  destination: string
  startDate: string
  endDate: string
  places: string[]
  budget: string
}

export default function TripForm({ open, handleClose }: TripFormProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [createTrip, { isLoading }] = useCreateTripMutation()

  const formik = useFormik({
    initialValues: {
      tripName: '',
      destination: '',
      startDate: '',
      endDate: '',
      places: [],
      photos: [],
      budget: '',
    } as TripFormValues,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined)

      try {
        await createTrip({
          tripName: values.tripName,
          destination: values.destination,
          startDate: values.startDate,
          endDate: values.endDate,
          budget: Number(values.budget) || 0,
          photos: selectedPhotos,
        }).unwrap()

        helpers.resetForm()
        setSelectedPhotos([])
        handleClose()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to save trip'
        helpers.setStatus(message)
      }
    },
  })

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setSelectedPhotos(files)
  }

  const handleCloseDialog = () => {
    setSelectedPhotos([])
    handleClose()
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleCloseDialog}
      fullScreen={fullScreen}
    >
      <DialogTitle>New Trip</DialogTitle>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <FormControl sx={{ px: 3, pt: 1, pb: 2 }}>
          <TextField
            variant="outlined"
            label="Trip Name"
            name="tripName"
            value={formik.values.tripName}
            onChange={formik.handleChange}
            required
          />
        </FormControl>
        <FormControl sx={{ px: 3, pb: 2 }}>
          <TextField
            variant="outlined"
            label="Destination"
            name="destination"
            value={formik.values.destination}
            onChange={formik.handleChange}
            required
          />
        </FormControl>
        <FormControl sx={{ flexDirection: 'row', px: 3, pb: 2 }}>
          <TextField
            variant="outlined"
            label="Start Date"
            type="date"
            name="startDate"
            sx={{ mr: 2 }}
            value={formik.values.startDate}
            onChange={formik.handleChange}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            required
          />
          <TextField
            variant="outlined"
            label="End Date"
            type="date"
            name="endDate"
            value={formik.values.endDate}
            onChange={formik.handleChange}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            required
          />
        </FormControl>
        <FormControl sx={{ px: 3, pb: 2 }}>
          <TextField
            variant="outlined"
            label="Budget limit EUR"
            type="number"
            name="budget"
            value={formik.values.budget}
            onChange={formik.handleChange}
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
          />
        </FormControl>
        <Box sx={{ px: 3, pb: 2 }}>
          <Button component="label" variant="outlined">
            Upload photos
            <input
              hidden
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp"
              multiple
              onChange={handlePhotoChange}
            />
          </Button>
          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
            {selectedPhotos.length > 0
              ? `${selectedPhotos.length} photo(s) selected`
              : 'JPG, PNG or WebP images'}
          </Typography>
          {selectedPhotos.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {selectedPhotos.map((file) => file.name).join(', ')}
            </Typography>
          )}
        </Box>
        {typeof formik.status === 'string' && (
          <Typography color="error" sx={{ px: 3, pb: 1 }}>
            {formik.status}
          </Typography>
        )}
        <Button
          sx={{
            maxWidth: '200px',
            margin: '0 auto 20px auto',
            display: 'block',
          }}
          variant="contained"
          type="submit"
          disabled={formik.isSubmitting || isLoading}
        >
          {formik.isSubmitting || isLoading ? 'Saving...' : 'Create Trip'}
        </Button>
      </Box>
    </Dialog>
  )
}
