import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Typography, Box, Paper, Button, TextField, Grid,
  MenuItem, Select, FormControl, InputLabel,
  FormHelperText, Alert, CircularProgress,
  Divider, IconButton, InputAdornment, Chip, Autocomplete,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  DeleteOutline as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { tasksAPI, projectsAPI, resourcesAPI } from '../../services/api';

const initialFormState = {
  project_id: '',
  title: '',
  description: '',
  start_date: null,
  end_date: null,
  estimated_hours: '',
  hours_spent: '0',
  priority: 'medium',
  status: 'pending',
  resources: []
};

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' }
];

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);
  
  // Parse projectId from query string if present (for new task creation from project)
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromQuery = queryParams.get('projectId');
  
  const [formData, setFormData] = useState({
    ...initialFormState,
    project_id: projectIdFromQuery || ''
  });
  
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  useEffect(() => {
    fetchProjects();
    fetchResources();
    
    if (isEditing) {
      fetchTask();
    } 
  }, [isEditing, id]);
  
  const fetchTask = async () => {
    try {
      setLoading(true);
      const task = await tasksAPI.getById(id);
      
      // Convert date strings to Date objects for date picker
      const formattedTask = {
        ...task,
        start_date: new Date(task.start_date),
        end_date: new Date(task.end_date),
        resources: task.resources ? task.resources.map(r => r.id) : []
      };
      
      setFormData(formattedTask);
      
      // Set selected resources
      if (task.resources && task.resources.length > 0) {
        setSelectedResources(task.resources);
      }
      
    } catch (error) {
      console.error('Error fetching task details:', error);
      setServerError('Failed to load task details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setServerError('Failed to load projects. Please try again later.');
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
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const handleResourceChange = (event, newValue) => {
    setSelectedResources(newValue);
    setFormData({ 
      ...formData, 
      resources: newValue ? newValue.map(r => r.id) : []
    });
    
    if (errors.resources) {
      setErrors({ ...errors, resources: null });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.title.trim()) {
      newErrors.title = 'Task name is required';
    }
    
    if (!formData.project_id) {
      newErrors.project_id = 'Please select a project';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    if (!formData.estimated_hours || formData.estimated_hours <= 0) {
      newErrors.estimated_hours = 'Please provide a valid number of hours';
    }
    
    if (formData.hours_spent < 0) {
      newErrors.hours_spent = 'Hours spent cannot be negative';
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
      
      const taskData = {
        ...formData,
        estimated_hours: parseFloat(formData.estimated_hours),
        hours_spent: parseFloat(formData.hours_spent || 0),
        resources: formData.resources || []
      };
      
      let savedTask;
      
      if (isEditing) {
        savedTask = await tasksAPI.update(id, taskData);
      } else {
        savedTask = await tasksAPI.create(taskData);
      }
      
      // Navigate back to the project details or task list
      if (formData.project_id) {
        navigate(`/projects/${formData.project_id}`);
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      setServerError(
        error.response?.data?.message || 
        'Failed to save task. Please check your inputs and try again.'
      );
      
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
              onClick={() => formData.project_id ? navigate(`/projects/${formData.project_id}`) : navigate('/tasks')}
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
                {isEditing ? 'Edit Task' : 'New Task'}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ color: 'text.secondary' }}
              >
                {isEditing 
                  ? 'Update task details and assigned resources' 
                  : 'Create a new task and assign resources'}
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
              Task Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Task Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.project_id} required>
                  <InputLabel id="project-select-label">Project</InputLabel>
                  <Select
                    labelId="project-select-label"
                    id="project-select"
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    label="Project"
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.project_id && <FormHelperText>{errors.project_id}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="priority-select-label">Priority</InputLabel>
                  <Select
                    labelId="priority-select-label"
                    id="priority-select"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    label="Priority"
                  >
                    {priorityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.start_date,
                      helperText: errors.start_date,
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
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.end_date,
                      helperText: errors.end_date,
                      required: true
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
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
              
              {isEditing && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hours Spent"
                    name="hours_spent"
                    type="number"
                    value={formData.hours_spent}
                    onChange={handleChange}
                    error={!!errors.hours_spent}
                    helperText={errors.hours_spent}
                    InputProps={{
                      inputProps: { min: 0, step: "0.5" },
                      endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                    }}
                  />
                </Grid>
              )}
              
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
                  placeholder="Enter task description and details..."
                />
              </Grid>
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
              sx={{ mb: 3, fontWeight: 600 }}
            >
              Assign Resources
            </Typography>
            
            <Autocomplete
              multiple
              id="resource-autocomplete"
              options={resources}
              value={selectedResources}
              onChange={handleResourceChange}
              getOptionLabel={(option) => `${option.name} (${option.role})`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assigned Resources"
                  placeholder="Select resources"
                  error={!!errors.resources}
                  helperText={errors.resources}
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip
                    icon={<PersonIcon />}
                    label={`${option.name} (${option.role})`}
                    {...getTagProps({ index })}
                    sx={{
                      bgcolor: 'rgba(32, 84, 147, 0.1)',
                      color: 'primary.main',
                      '& .MuiChip-deleteIcon': {
                        color: 'primary.main',
                        '&:hover': { color: 'primary.dark' },
                      },
                    }}
                  />
                ))
              }
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <PersonIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="small" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.role} - ${option.hourly_rate}/hr
                      </Typography>
                    </Box>
                  </Box>
                </li>
              )}
              sx={{ width: '100%' }}
            />
            
            {selectedResources.length === 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  No resources assigned yet. Select resources from the dropdown above.
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Submit Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 4 }}>
            <Button
              variant="outlined"
              onClick={() => formData.project_id ? navigate(`/projects/${formData.project_id}`) : navigate('/tasks')}
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
              {submitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default TaskForm;
