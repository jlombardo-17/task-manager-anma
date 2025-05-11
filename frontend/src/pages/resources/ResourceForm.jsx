import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography, Box, Paper, Button, TextField, Grid,
  FormControl, InputLabel, MenuItem, Select,
  FormHelperText, Alert, CircularProgress,
  IconButton, InputAdornment, Slider
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { resourcesAPI } from '../../services/api';

const initialFormState = {
  name: '',
  role: '',
  hourly_rate: '',
  email: '',
  phone: '',
  availability: 100
};

const roleOptions = [
  'Developer',
  'Designer',
  'Project Manager',
  'QA Engineer',
  'DevOps Engineer',
  'Business Analyst',
  'Product Manager',
  'UX Researcher',
  'Content Writer',
  'Marketing Specialist',
  'Other'
];

const ResourceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  useEffect(() => {
    if (isEditing) {
      fetchResource();
    }
  }, [isEditing, id]);
  
  const fetchResource = async () => {
    try {
      setLoading(true);
      const resource = await resourcesAPI.getById(id);
      setFormData(resource);
    } catch (error) {
      console.error('Error fetching resource details:', error);
      setServerError('Failed to load resource details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const handleSliderChange = (event, newValue) => {
    setFormData({ ...formData, availability: newValue });
    
    if (errors.availability) {
      setErrors({ ...errors, availability: null });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.hourly_rate || formData.hourly_rate <= 0) {
      newErrors.hourly_rate = 'Please provide a valid hourly rate';
    }
    
    // Email validation if provided
    if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    
    // Phone validation if provided (basic)
    if (formData.phone && !/^[0-9+\-() ]{7,}$/.test(formData.phone)) {
      newErrors.phone = 'Please provide a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }
    
    try {
      setSubmitting(true);
      setServerError(null);
      
      const resourceData = {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate),
        availability: parseInt(formData.availability)
      };
      
      let savedResource;
      
      if (isEditing) {
        savedResource = await resourcesAPI.update(id, resourceData);
      } else {
        savedResource = await resourcesAPI.create(resourceData);
      }
      
      // Navigate back to the resources list with success message
      const successMessage = isEditing 
        ? `Resource "${savedResource.name}" has been updated successfully.` 
        : `Resource "${savedResource.name}" has been created successfully.`;
      
      navigate('/resources', { 
        state: { successMessage } 
      });
    } catch (error) {
      console.error('Error saving resource:', error);
      
      // Enhanced error handling with more detailed messages
      let errorMessage = 'Failed to save resource. Please check your inputs and try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        // Format validation errors from the backend
        const validationErrors = error.response.data.errors.map(e => e.msg).join(', ');
        errorMessage = `Validation errors: ${validationErrors}`;
        
        // Also update the form errors to highlight problem fields
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          const fieldName = err.param;
          if (fieldName) {
            fieldErrors[fieldName] = err.msg;
          }
        });
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...fieldErrors }));
        }
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setServerError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header */}
      <Box 
        sx={{ 
          mb: 4, 
          py: 3,
          px: { xs: 2, sm: 3, md: 4 }, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)', 
          background: 'linear-gradient(to right, rgba(32, 84, 147, 0.05), rgba(32, 84, 147, 0.02))',
          borderRadius: '12px',
          width: '100%'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => navigate('/resources')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  mb: 0.5, 
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                {isEditing ? 'Edit Resource' : 'New Resource'}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ color: 'text.secondary' }}
              >
                {isEditing 
                  ? 'Update resource details, hourly rate, and availability' 
                  : 'Create a new resource person to assign to tasks'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ px: { xs: 0, sm: 1, md: 2 }, width: '100%', boxSizing: 'border-box' }}>
        {serverError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: 'inherit'
              },
              '& .MuiAlert-message': {
                fontWeight: 500
              }
            }}
            variant="filled"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setServerError(null)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <Typography variant="subtitle1" component="div">
              {serverError}
            </Typography>
            {serverError.includes("Validation errors:") && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                Please check the highlighted fields below.
              </Typography>
            )}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ mb: 3, fontWeight: 600 }}
            >
              Resource Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.role} required>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                  >
                    {roleOptions.map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                  {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hourly Rate"
                  name="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  error={!!errors.hourly_rate}
                  helperText={errors.hourly_rate}
                  required
                  InputProps={{
                    inputProps: { min: 0, step: "0.01" },
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ width: '100%' }}>
                  <Typography id="availability-slider" gutterBottom>
                    Availability: {formData.availability}%
                  </Typography>
                  <Slider
                    aria-labelledby="availability-slider"
                    value={formData.availability}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    step={5}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' }
                    ]}
                    min={0}
                    max={100}
                    sx={{
                      '& .MuiSlider-valueLabel': {
                        backgroundColor: 'primary.main',
                      },
                      color: formData.availability > 70 
                        ? 'success.main' 
                        : formData.availability > 30 
                          ? 'warning.main' 
                          : 'error.main',
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined"
                    onClick={() => navigate('/resources')}
                    startIcon={<CloseIcon />}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Resource'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </form>
      </Box>
    </Box>
  );
};

export default ResourceForm;
