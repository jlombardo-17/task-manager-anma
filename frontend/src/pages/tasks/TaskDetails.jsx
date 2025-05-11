import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography, Box, Paper, Button, Grid, Divider,
  Chip, Stack, CircularProgress, Alert, IconButton,
  Tabs, Tab, Card, CardContent, List, ListItem,
  ListItemText, ListItemIcon, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, InputAdornment,
  Avatar, AvatarGroup, LinearProgress, Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  ArrowBack as BackIcon,
  Flag as FlagIcon,
  Timer as TimerIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { tasksAPI, projectsAPI } from '../../services/api';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [hoursSpent, setHoursSpent] = useState('');
  const [hoursError, setHoursError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTaskData();
  }, [id]);

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch task details
      const taskData = await tasksAPI.getById(id);
      setTask(taskData);
      setHoursSpent(taskData.hours_spent.toString());
      
      // Fetch project details
      if (taskData.project_id) {
        const projectData = await projectsAPI.getById(taskData.project_id);
        setProject(projectData);
      }
      
    } catch (error) {
      console.error('Error fetching task details:', error);
      setError('Failed to load task details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await tasksAPI.delete(id);
      navigate('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
      setDeleteDialogOpen(false);
    }
  };

  const handleEditClick = () => {
    navigate(`/tasks/edit/${id}`);
  };

  const handleUpdateHoursClick = () => {
    setHoursDialogOpen(true);
  };

  const handleHoursDialogClose = () => {
    setHoursDialogOpen(false);
    setHoursError('');
  };

  const handleHoursChange = (e) => {
    setHoursSpent(e.target.value);
    setHoursError('');
  };

  const handleUpdateHoursSubmit = async () => {
    // Validate hours
    if (!hoursSpent || isNaN(hoursSpent) || parseFloat(hoursSpent) < 0) {
      setHoursError('Please enter a valid number of hours');
      return;
    }

    try {
      setSubmitting(true);
      const updatedTask = await tasksAPI.update(id, { 
        ...task, 
        hours_spent: parseFloat(hoursSpent)
      });
      
      // Update task state
      setTask(updatedTask);
      setHoursDialogOpen(false);
    } catch (error) {
      console.error('Error updating hours spent:', error);
      setHoursError('Failed to update hours. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      blocked: 'Blocked'
    };
    return statusMap[status] || status;
  };
  
  // Get priority label
  const getPriorityLabel = (priority) => {
    const priorityMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    };
    return priorityMap[priority] || priority;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  // Calculate progress percentage
  const calculateProgress = (hoursSpent, estimatedHours) => {
    if (!hoursSpent || !estimatedHours || estimatedHours <= 0) {
      return 0;
    }
    
    const percentage = (hoursSpent / estimatedHours) * 100;
    return Math.min(Math.round(percentage), 100); // Cap at 100%
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ m: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" onClick={() => navigate('/tasks')}>
              Back to Tasks
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ m: 3 }}>
        <Alert 
          severity="warning" 
          action={
            <Button color="inherit" onClick={() => navigate('/tasks')}>
              Back to Tasks
            </Button>
          }
        >
          Task not found.
        </Alert>
      </Box>
    );
  }

  const progressPercentage = calculateProgress(task.hours_spent, task.estimated_hours);

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
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton
                onClick={() => navigate('/tasks')}
                sx={{ mr: 1 }}
                aria-label="Back to tasks"
              >
                <BackIcon />
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {task.title}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={getStatusLabel(task.status)} 
                    color={getStatusColor(task.status)} 
                    size="medium"
                    sx={{ 
                      borderRadius: '8px',
                      fontWeight: 500,
                      height: '28px'
                    }}
                  />
                  
                  <Chip 
                    icon={<FlagIcon />}
                    label={getPriorityLabel(task.priority)} 
                    color={getPriorityColor(task.priority)} 
                    variant={task.priority === 'critical' ? 'filled' : 'outlined'}
                    size="medium"
                    sx={{ 
                      borderRadius: '8px',
                      fontWeight: 500,
                      height: '28px'
                    }}
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', ml: 5 }}>
              <BusinessIcon fontSize="small" />
              <Typography variant="subtitle1">
                Project: {project ? (
                  <RouterLink 
                    to={`/projects/${project.id}`} 
                    style={{ 
                      color: 'inherit', 
                      textDecoration: 'underline',
                      fontWeight: 500
                    }}
                  >
                    {project.name}
                  </RouterLink>
                ) : task.project_name}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<DeleteIcon />} 
              onClick={handleDeleteClick}
              color="error"
            >
              Delete
            </Button>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />} 
              onClick={handleEditClick}
              color="primary"
            >
              Edit
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 0, sm: 1, md: 2 }, width: '100%', boxSizing: 'border-box' }}>
        <Grid container spacing={3}>
          {/* Task Details Section */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Task Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Timeline
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <CalendarIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="small" />
                      <Typography>
                        {formatDate(task.start_date)} - {formatDate(task.end_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hours
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <AccessTimeIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="small" />
                      <Typography>
                        {task.hours_spent} / {task.estimated_hours} hours
                      </Typography>
                      <Tooltip title="Update hours spent">
                        <IconButton 
                          size="small" 
                          onClick={handleUpdateHoursClick}
                          sx={{ ml: 1 }}
                        >
                          <TimerIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ flexGrow: 1, mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={progressPercentage}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: progressPercentage >= 100 
                                ? (task.status === 'completed' ? 'success.main' : 'warning.main')
                                : 'primary.main'
                            }
                          }}
                        />
                      </Box>
                      <Typography 
                        variant="body2" 
                        color={
                          progressPercentage >= 100 && task.status !== 'completed'
                            ? 'warning.main'
                            : 'text.secondary'
                        }
                        fontWeight={500}
                      >
                        {progressPercentage}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        mt: 1, 
                        p: 2, 
                        borderRadius: 2, 
                        borderColor: 'rgba(0,0,0,0.08)',
                        bgcolor: 'background.default'
                      }}
                    >
                      <Typography>
                        {task.description || 'No description provided.'}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Resources Section */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)',
                height: '100%'
              }}
            >
              <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Assigned Resources
              </Typography>
              
              {task.resources && task.resources.length > 0 ? (
                <List sx={{ width: '100%', pt: 0 }}>
                  {task.resources.map((resource) => (
                    <ListItem 
                      key={resource.id} 
                      sx={{ 
                        px: 0, 
                        py: 1.5,
                        borderBottom: '1px solid rgba(0,0,0,0.04)'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: '40px' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.light',
                            width: 32,
                            height: 32
                          }}
                        >
                          {resource.name?.charAt(0).toUpperCase() || 'R'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={resource.name} 
                        secondary={resource.role}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography color="text.secondary">
                    No resources assigned to this task.
                  </Typography>
                  <Button 
                    variant="text"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                    sx={{ mt: 1 }}
                  >
                    Assign Resources
                  </Button>
                </Box>
              )}
              
              {task.resources && task.resources.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                  >
                    Manage Resources
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: { borderRadius: '12px', maxWidth: '450px' }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, fontWeight: 600 }}>
          Delete Task
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          <Typography>
            Are you sure you want to delete <strong>{task.title}</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ ml: 1 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Hours Dialog */}
      <Dialog
        open={hoursDialogOpen}
        onClose={handleHoursDialogClose}
        PaperProps={{
          sx: { borderRadius: '12px', maxWidth: '400px' }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, fontWeight: 600 }}>
          Update Hours Spent
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ mb: 2 }}>
            Enter the actual hours spent on this task.
          </Typography>
          <TextField
            fullWidth
            label="Hours Spent"
            variant="outlined"
            type="number"
            value={hoursSpent}
            onChange={handleHoursChange}
            error={!!hoursError}
            helperText={hoursError}
            InputProps={{
              endAdornment: <InputAdornment position="end">hours</InputAdornment>,
              inputProps: { min: 0, step: "0.5" }
            }}
          />
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
              Estimated:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {task.estimated_hours} hours
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleHoursDialogClose} 
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateHoursSubmit} 
            color="primary" 
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ ml: 1 }}
          >
            {submitting ? 'Updating...' : 'Update Hours'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetails;
