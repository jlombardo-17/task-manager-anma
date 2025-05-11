import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography, Box, Paper, Button, TextField, Grid,
  MenuItem, Select, FormControl, InputLabel,
  FormHelperText, Alert, CircularProgress,
  Divider, IconButton, InputAdornment, Chip, Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { projectsAPI, clientsAPI, resourcesAPI } from '../../services/api';

const initialFormState = {
  name: '',
  client_id: '',
  start_date: null,
  end_date: null,
  estimated_hours: '',
  estimated_cost: '',
  budgeted_cost: null,
  actual_cost: '0',
  description: '',
  status: 'pending'
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' }
];

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState(initialFormState);
  const [resources, setResources] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  useEffect(() => {
    fetchClients();
    fetchResources();
    
    if (isEditing) {
      fetchProject();
    }
  }, [isEditing, id]);
  
  const fetchProject = async () => {
    try {
      setLoading(true);
      const project = await projectsAPI.getById(id);
      
      // Convert date strings to Date objects for date picker
      const formattedProject = {
        ...project,
        start_date: new Date(project.start_date),
        end_date: new Date(project.end_date)
      };
      
      setFormData(formattedProject);
      
      // Fetch assigned resources for this project
      const projectResources = await projectsAPI.getResources(id);
      setSelectedResources(projectResources);
      
    } catch (error) {
      console.error('Error fetching project details:', error);
      setServerError('Failed to load project details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClients = async () => {
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setServerError('Failed to load clients. Please try again later.');
    }
  };
  
  const fetchResources = async () => {
    try {
      const data = await resourcesAPI.getAll();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setServerError('Failed to load resources. Please try again later.');
    }
  };    const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric fields - budgeted_cost can be null
    if (name === 'budgeted_cost') {
      if (value === '') {
        setFormData({ ...formData, [name]: null });
      } else {
        const numericValue = parseFloat(value);
        setFormData({ ...formData, [name]: isNaN(numericValue) ? null : numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
    const handleDateChange = (name, date) => {
    // Ensure we have a valid date object or null
    const validDate = date ? new Date(date) : null;
    setFormData({ ...formData, [name]: validDate });
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
    
    // If changing start date, check if we need to validate end date
    if (name === 'start_date' && formData.end_date) {
      if (validDate && new Date(formData.end_date) <= validDate) {
        setErrors({ ...errors, end_date: 'End date must be after start date' });
      } else if (errors.end_date === 'End date must be after start date') {
        setErrors({ ...errors, end_date: null });
      }
    }
  };
  
  const handleResourceSelect = (e) => {
    const resourceId = e.target.value;
    const resource = resources.find(r => r.id === parseInt(resourceId));
    
    if (resource && !selectedResources.some(r => r.id === resource.id)) {
      setSelectedResources([...selectedResources, {
        id: resource.id,
        name: resource.name,
        role: resource.role,
        hourly_rate: resource.hourly_rate,
        assigned_hours: 0
      }]);
    }
  };
  
  const handleResourceHoursChange = (id, hours) => {
    setSelectedResources(selectedResources.map(resource => 
      resource.id === id ? { ...resource, assigned_hours: hours } : resource
    ));
  };
  
  const handleRemoveResource = (id) => {
    setSelectedResources(selectedResources.filter(resource => resource.id !== id));
  };
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.client_id) {
      newErrors.client_id = 'Please select a client';
    }
    
    // Date validation
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    if (!formData.estimated_hours || formData.estimated_hours <= 0) {
      newErrors.estimated_hours = 'Please provide a valid number of hours';
    }
    
    if (!formData.estimated_cost || formData.estimated_cost <= 0) {
      newErrors.estimated_cost = 'Please provide a valid estimated cost';
    }
    
    // Budgeted cost is optional - only validate if a value is provided
    if (formData.budgeted_cost !== null && formData.budgeted_cost !== undefined && formData.budgeted_cost !== '' && parseFloat(formData.budgeted_cost) < 0) {
      newErrors.budgeted_cost = 'Budgeted cost must be a positive number if provided';
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
      
      // Format dates properly for the API
      const formattedStartDate = formData.start_date ? 
        new Date(formData.start_date).toISOString().split('T')[0] : null;
      const formattedEndDate = formData.end_date ? 
        new Date(formData.end_date).toISOString().split('T')[0] : null;
        
      const projectData = {
        ...formData,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        estimated_hours: parseFloat(formData.estimated_hours),
        estimated_cost: parseFloat(formData.estimated_cost),
        budgeted_cost: formData.budgeted_cost ? parseFloat(formData.budgeted_cost) : null,
        actual_cost: parseFloat(formData.actual_cost || 0)
      };
      
      let savedProject;
      
      if (isEditing) {
        savedProject = await projectsAPI.update(id, projectData);
        await projectsAPI.updateResources(id, { resources: selectedResources });
      } else {
        savedProject = await projectsAPI.create(projectData);
        if (selectedResources.length > 0) {
          await projectsAPI.updateResources(savedProject.id, { resources: selectedResources });
        }
      }
      
      // Navigate back to the project list or project details
      navigate(isEditing ? `/projects/${id}` : '/projects');    } catch (error) {
      console.error('Error saving project:', error);
      
      // Mostrar información más detallada sobre el error
      let errorMessage = 'Failed to save project. Please check your inputs and try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = `Validation errors: ${error.response.data.errors.map(e => e.msg).join(', ')}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setServerError(errorMessage);
      console.log('Project data sent:', projectData); // Para depuración
      
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
              onClick={() => navigate('/projects')}
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
                {isEditing ? 'Edit Project' : 'New Project'}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ color: 'text.secondary' }}
              >
                {isEditing 
                  ? 'Update project details, budget, and resources' 
                  : 'Create a new project, set budget and assign resources'}
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
              }
            }}
            variant="filled"
          >
            {serverError}
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
              Project Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.client_id} required>
                  <InputLabel id="client-select-label">Client</InputLabel>
                  <Select
                    labelId="client-select-label"
                    id="client-select"
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    label="Client"
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.client_id && <FormHelperText>{errors.client_id}</FormHelperText>}
                </FormControl>
              </Grid>
                <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  format="yyyy-MM-dd" 
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.start_date,
                      helperText: errors.start_date || 'Format: YYYY-MM-DD',
                      required: true
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  format="yyyy-MM-dd"
                  minDate={formData.start_date || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.end_date,
                      helperText: errors.end_date || 'Format: YYYY-MM-DD',
                      required: true
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.status} required>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimated Hours"
                  name="estimated_hours"
                  type="number"
                  value={formData.estimated_hours}
                  onChange={handleChange}
                  error={!!errors.estimated_hours}
                  helperText={errors.estimated_hours}
                  required
                  InputProps={{
                    inputProps: { min: 0, step: "0.5" },
                    endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  label="Description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Enter project description and details..."
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Budget Section */}
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
              Budget Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Estimated Cost"
                  name="estimated_cost"
                  type="number"
                  value={formData.estimated_cost}
                  onChange={handleChange}
                  error={!!errors.estimated_cost}
                  helperText={errors.estimated_cost}
                  required
                  InputProps={{
                    inputProps: { min: 0, step: "0.01" },
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
                <Grid item xs={12} sm={4}>                <TextField
                  fullWidth
                  label="Budgeted Cost (opcional)"
                  name="budgeted_cost"
                  type="number"
                  value={formData.budgeted_cost === null ? '' : formData.budgeted_cost}
                  onChange={handleChange}
                  error={!!errors.budgeted_cost}
                  helperText={errors.budgeted_cost || 'Opcional - Puede completarse más adelante'}
                  InputProps={{
                    inputProps: { min: 0, step: "0.01" },
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              {isEditing && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Actual Cost"
                    name="actual_cost"
                    type="number"
                    value={formData.actual_cost}
                    onChange={handleChange}
                    error={!!errors.actual_cost}
                    helperText={errors.actual_cost}
                    InputProps={{
                      inputProps: { min: 0, step: "0.01" },
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
            {/* Resources Section */}
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
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Assign Resources
            </Typography>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              sx={{ mb: 3 }}
            >
              Opcional - Los recursos pueden asignarse más adelante
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={10} md={8}>
                <FormControl fullWidth>
                  <InputLabel id="resource-select-label">Add Resource</InputLabel>
                  <Select
                    labelId="resource-select-label"
                    id="resource-select"
                    value=""
                    onChange={handleResourceSelect}
                    label="Add Resource"
                  >
                    {resources
                      .filter(resource => !selectedResources.some(r => r.id === resource.id))
                      .map((resource) => (
                        <MenuItem key={resource.id} value={resource.id}>
                          {resource.name} ({resource.role}) - ${resource.hourly_rate}/hr
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                {selectedResources.length > 0 ? (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      mt: 2, 
                      borderRadius: 2,
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={4} sm={5}>
                          <Typography variant="subtitle2" fontWeight={600}>Resource</Typography>
                        </Grid>
                        <Grid item xs={3} sm={3}>
                          <Typography variant="subtitle2" fontWeight={600}>Role</Typography>
                        </Grid>
                        <Grid item xs={3} sm={2}>
                          <Typography variant="subtitle2" fontWeight={600}>Hours</Typography>
                        </Grid>
                        <Grid item xs={2} sm={2}>
                          <Typography variant="subtitle2" fontWeight={600}>Actions</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                      
                    {selectedResources.map((resource, index) => (
                      <Box 
                        key={resource.id} 
                        sx={{ 
                          p: 2,
                          borderBottom: index < selectedResources.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                          bgcolor: index % 2 === 1 ? 'rgba(0,0,0,0.01)' : 'transparent'
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={4} sm={5}>
                            <Typography>{resource.name}</Typography>
                          </Grid>
                          <Grid item xs={3} sm={3}>
                            <Chip 
                              label={resource.role} 
                              size="small" 
                              sx={{ 
                                borderRadius: '6px',
                                bgcolor: 'rgba(32, 84, 147, 0.1)',
                                color: 'primary.main'
                              }} 
                            />
                          </Grid>
                          <Grid item xs={3} sm={2}>
                            <TextField
                              type="number"
                              size="small"
                              value={resource.assigned_hours || 0}
                              onChange={(e) => handleResourceHoursChange(resource.id, parseFloat(e.target.value))}
                              InputProps={{
                                inputProps: { min: 0, step: "0.5" },
                              }}
                              sx={{ width: '80px' }}
                            />
                          </Grid>
                          <Grid item xs={2} sm={2}>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRemoveResource(resource.id)}
                              aria-label="Remove resource"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Paper>
                ) : (
                  <Box sx={{ mt: 2, p: 3, textAlign: 'center', bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography color="text.secondary">
                      No resources assigned to this project yet.
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          {/* Submit Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/projects')}
              startIcon={<CloseIcon />}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={submitting}
              sx={{ px: 3 }}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ProjectForm;
