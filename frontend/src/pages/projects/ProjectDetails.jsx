import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography, Box, Paper, Button, Grid, Divider,
  Chip, Stack, CircularProgress, Alert, IconButton,
  Tabs, Tab, Card, CardContent, List, ListItem,
  ListItemText, ListItemIcon, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  CheckCircleOutline as CompletedIcon,
  HourglassEmpty as PendingIcon,
  Schedule as InProgressIcon,
  Pause as OnHoldIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';
import { projectsAPI, tasksAPI } from '../../services/api';

// Helper function to get status icon
const StatusIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CompletedIcon sx={{ color: 'success.main' }} />;
    case 'pending':
      return <PendingIcon sx={{ color: 'warning.main' }} />;
    case 'in_progress':
      return <InProgressIcon sx={{ color: 'info.main' }} />;
    case 'on_hold':
      return <OnHoldIcon sx={{ color: 'text.secondary' }} />;
    case 'cancelled':
      return <CancelledIcon sx={{ color: 'error.main' }} />;
    default:
      return <PendingIcon sx={{ color: 'warning.main' }} />;
  }
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [actualCost, setActualCost] = useState('');
  const [costError, setCostError] = useState('');
  const [costSubmitting, setCostSubmitting] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project details
      const projectData = await projectsAPI.getById(id);
      setProject(projectData);
      setActualCost(projectData.actual_cost.toString());
      
      // Fetch project resources
      const projectResources = await projectsAPI.getResources(id);
      setResources(projectResources);
      
      // Fetch tasks associated with project
      const projectTasks = await tasksAPI.getByProjectId(id);
      setTasks(projectTasks);

    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to load project details. Please try again later.');
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
      await projectsAPI.delete(id);
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
      setDeleteDialogOpen(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    navigate(`/projects/edit/${id}`);
  };

  const handleUpdateCostClick = () => {
    setCostDialogOpen(true);
  };

  const handleCostDialogClose = () => {
    setCostDialogOpen(false);
    setCostError('');
  };

  const handleActualCostChange = (e) => {
    setActualCost(e.target.value);
    setCostError('');
  };

  const handleUpdateCostSubmit = async () => {
    // Validate cost
    if (!actualCost || isNaN(actualCost) || parseFloat(actualCost) < 0) {
      setCostError('Please enter a valid amount');
      return;
    }

    try {
      setCostSubmitting(true);
      await projectsAPI.updateActualCost(id, parseFloat(actualCost));
      
      // Update project state
      setProject({
        ...project,
        actual_cost: parseFloat(actualCost)
      });
      
      setCostDialogOpen(false);
    } catch (error) {
      console.error('Error updating actual cost:', error);
      setCostError('Failed to update cost. Please try again.');
    } finally {
      setCostSubmitting(false);
    }
  };

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
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
      on_hold: 'On Hold',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'on_hold':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Calculate budget variance
  const calculateVariance = (actual, budgeted) => {
    if (!actual || actual === 0) return null;
    
    const variance = ((actual - budgeted) / budgeted) * 100;
    return {
      value: variance,
      formatted: `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`,
      isNegative: variance > 0 // For budgets, going over is negative
    };
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
            <Button color="inherit" onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ m: 3 }}>
        <Alert 
          severity="warning" 
          action={
            <Button color="inherit" onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          }
        >
          Project not found.
        </Alert>
      </Box>
    );
  }

  const budgetVariance = calculateVariance(project.actual_cost, project.budgeted_cost);

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
                onClick={() => navigate('/projects')}
                sx={{ mr: 1 }}
                aria-label="Back to projects"
              >
                <BackIcon />
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {project.name}
                </Typography>
                
                <Chip 
                  icon={<StatusIcon status={project.status} />}
                  label={getStatusLabel(project.status)} 
                  color={getStatusColor(project.status)} 
                  size="medium"
                  variant={project.status === 'on_hold' ? 'outlined' : 'filled'}
                  sx={{ 
                    borderRadius: '8px',
                    fontWeight: 500,
                    height: '28px',
                    ml: 1
                  }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', ml: 5 }}>
              <BusinessIcon fontSize="small" />
              <Typography variant="subtitle1">
                Client: {project.client_name}
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
              Edit Project
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 0, sm: 1, md: 2 }, width: '100%', boxSizing: 'border-box' }}>
        <Grid container spacing={3}>
          {/* Project Overview Section */}
          <Grid item xs={12} md={8}>
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
                Project Overview
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
                        {formatDate(project.start_date)} - {formatDate(project.end_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Hours
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <AccessTimeIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="small" />
                      <Typography>
                        {project.estimated_hours} hours
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
                        {project.description || 'No description provided.'}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Budget Information */}
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
                Budget Information
              </Typography>
              
              <List sx={{ width: '100%' }}>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: '40px' }}>
                    <AttachMoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Estimated Cost" 
                    secondary={formatCurrency(project.estimated_cost)} 
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'h6', color: 'text.primary', fontWeight: 500 }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: '40px' }}>
                    <AttachMoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Budgeted Cost" 
                    secondary={formatCurrency(project.budgeted_cost)} 
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'h6', color: 'text.primary', fontWeight: 500 }}
                  />
                </ListItem>
                
                <ListItem 
                  sx={{ 
                    px: 0, 
                    py: 1.5,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                    mt: 1
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '40px' }}>
                    <AttachMoneyIcon color={project.actual_cost > project.budgeted_cost ? 'error' : 'success'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Actual Cost
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={handleUpdateCostClick}
                          sx={{ ml: 1 }}
                        >
                          Update
                        </Button>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="h6" 
                          color={project.actual_cost > project.budgeted_cost ? 'error.main' : 'text.primary'} 
                          fontWeight={500}
                        >
                          {formatCurrency(project.actual_cost)}
                        </Typography>
                        
                        {budgetVariance && (
                          <Chip
                            label={budgetVariance.formatted}
                            size="small"
                            color={budgetVariance.isNegative ? 'error' : 'success'}
                            variant="outlined"
                            sx={{ height: '22px', fontWeight: 500 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs Section */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="project detail tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  minHeight: '48px',
                  py: 1.5
                }
              }}
            >
              <Tab label="Resources" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Tasks" id="tab-1" aria-controls="tabpanel-1" />
            </Tabs>
          </Box>

          {/* Resources Tab */}
          <div
            role="tabpanel"
            hidden={tabValue !== 0}
            id="tabpanel-0"
            aria-labelledby="tab-0"
          >
            {tabValue === 0 && (
              <Box sx={{ pt: 3 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 2, 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Assigned Resources
                    </Typography>
                    <Button 
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEditClick}
                    >
                      Manage Resources
                    </Button>
                  </Box>
                  
                  {resources.length > 0 ? (
                    <Box>
                      <Box sx={{ bgcolor: 'background.default', p: 2, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <Grid container>
                          <Grid item xs={4}>
                            <Typography variant="subtitle2" fontWeight={600}>Name</Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="subtitle2" fontWeight={600}>Role</Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="subtitle2" fontWeight={600}>Hours</Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="subtitle2" fontWeight={600}>Cost</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      {resources.map((resource, index) => (
                        <Box 
                          key={resource.id}
                          sx={{
                            p: 2,
                            borderBottom: index < resources.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                            bgcolor: index % 2 === 1 ? 'rgba(0,0,0,0.01)' : 'transparent'
                          }}
                        >
                          <Grid container alignItems="center">
                            <Grid item xs={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                                <Typography>{resource.name}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
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
                            <Grid item xs={2}>
                              <Typography>{resource.assigned_hours || 0}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography>
                                {formatCurrency((resource.hourly_rate || 0) * (resource.assigned_hours || 0))}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                      
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderTop: '1px solid rgba(0,0,0,0.08)',
                          bgcolor: 'background.default',
                          display: 'flex',
                          justifyContent: 'flex-end'
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          Total Hours: {resources.reduce((sum, r) => sum + (r.assigned_hours || 0), 0)}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        No resources assigned to this project yet.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />}
                        onClick={handleEditClick}
                      >
                        Assign Resources
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}
          </div>

          {/* Tasks Tab */}
          <div
            role="tabpanel"
            hidden={tabValue !== 1}
            id="tabpanel-1"
            aria-labelledby="tab-1"
          >
            {tabValue === 1 && (
              <Box sx={{ pt: 3 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 2, 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Project Tasks
                    </Typography>
                    <Button 
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      component={RouterLink}
                      to={`/tasks/new?projectId=${id}`}
                    >
                      Add Task
                    </Button>
                  </Box>
                  
                  {tasks.length > 0 ? (
                    <Box>
                      {tasks.map((task, index) => (
                        <Box 
                          key={task.id}
                          sx={{
                            p: 2,
                            borderBottom: index < tasks.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                            bgcolor: index % 2 === 1 ? 'rgba(0,0,0,0.01)' : 'transparent'
                          }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={8} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={500}>
                                    {task.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <CalendarIcon sx={{ fontSize: '0.875rem', mr: 0.5, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(task.due_date).toLocaleDateString()}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary"
                                      sx={{ mx: 1 }}
                                    >
                                      •
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {task.hours_spent || 0} / {task.estimated_hours} hours
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={4} sm={3}>
                              <Chip 
                                label={task.priority} 
                                size="small" 
                                color={
                                  task.priority === 'high' ? 'error' : 
                                  task.priority === 'medium' ? 'warning' : 'info'
                                }
                                sx={{ borderRadius: '6px' }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                              <Button
                                size="small"
                                component={RouterLink}
                                to={`/tasks/${task.id}`}
                                variant="outlined"
                              >
                                View Details
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        No tasks created for this project yet.
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        component={RouterLink}
                        to={`/tasks/new?projectId=${id}`}
                      >
                        Create Task
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}
          </div>
        </Box>
      </Box>

      {/* Delete Project Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: { borderRadius: '12px', maxWidth: '450px' }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, fontWeight: 600 }}>
          Delete Project
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          <Typography>
            Are you sure you want to delete <strong>{project.name}</strong>? 
            All tasks and resources associated with this project will be removed. 
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

      {/* Update Actual Cost Dialog */}
      <Dialog
        open={costDialogOpen}
        onClose={handleCostDialogClose}
        PaperProps={{
          sx: { borderRadius: '12px', maxWidth: '400px' }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, fontWeight: 600 }}>
          Update Actual Cost
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ mb: 2 }}>
            Enter the actual cost incurred for project <strong>{project.name}</strong>.
          </Typography>
          <TextField
            fullWidth
            label="Actual Cost"
            variant="outlined"
            type="number"
            value={actualCost}
            onChange={handleActualCostChange}
            error={!!costError}
            helperText={costError}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { min: 0, step: "0.01" }
            }}
          />
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
              Budget:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(project.budgeted_cost)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCostDialogClose} 
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateCostSubmit} 
            color="primary" 
            variant="contained"
            disabled={costSubmitting}
            startIcon={costSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ ml: 1 }}
          >
            {costSubmitting ? 'Updating...' : 'Update Cost'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;
