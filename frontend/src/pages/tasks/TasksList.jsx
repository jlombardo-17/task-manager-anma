import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { 
  Typography, Paper, Box, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Chip, Tooltip,
  MenuItem, Select, FormControl, InputLabel,
  Grid, Divider, Card, CardContent, Avatar, AvatarGroup
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Clear as ClearIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { tasksAPI, projectsAPI, resourcesAPI } from '../../services/api';

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setFilterPriority] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
    useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchResources();
  }, []);
  
  // Efecto para capturar mensajes de éxito desde la redirección
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      
      // Limpiar el mensaje después de 5 segundos
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        // Limpiar el estado de ubicación para que el mensaje no persista en recargas
        navigate(location.pathname, { replace: true });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
    const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll();
      
      // Registro de depuración para verificar los datos recibidos
      console.log('=== DEBUG: Datos de tareas recibidos ===');
      console.log(`Total de tareas recibidas: ${data.length}`);
      data.forEach(task => {
        console.log(`Task ID: ${task.id}, Title: ${task.title}`);
        console.log(`Resources: ${task.resources ? task.resources.length : 'no resources'}`);
        if (task.resources && task.resources.length > 0) {
          console.log(task.resources);
        }
      });
      console.log('===============================');
      
      setTasks(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again later.');
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
    }
  };
  
  const fetchResources = async () => {
    try {
      const data = await resourcesAPI.getAll();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleProjectFilterChange = (event) => {
    setProjectFilter(event.target.value);
    setPage(0);
  };
  
  const handleResourceFilterChange = (event) => {
    setResourceFilter(event.target.value);
    setPage(0);
  };
  
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  const handlePriorityFilterChange = (event) => {
    setFilterPriority(event.target.value);
    setPage(0);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setProjectFilter('');
    setResourceFilter('');
    setStatusFilter('');
    setFilterPriority('');
    setPage(0);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleViewTask = (id) => {
    navigate(`/tasks/${id}`);
  };
  
  const handleEditTask = (id) => {
    navigate(`/tasks/edit/${id}`);
  };
  
  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };
  
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    
    try {
      await tasksAPI.delete(taskToDelete.id);
      fetchTasks(); // Refresh list after deletion
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Filter tasks based on all filters
  const filteredTasks = tasks.filter(task => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.project_name && task.project_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Project filter
    const matchesProject = projectFilter === '' || 
      task.project_id === parseInt(projectFilter);
    
    // Status filter
    const matchesStatus = statusFilter === '' || 
      task.status === statusFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === '' || 
      task.priority === priorityFilter;
    
    // Resource filter - more complex since it's a many-to-many relationship
    const matchesResource = resourceFilter === '' || 
      (task.resources && task.resources.some(r => r.id === parseInt(resourceFilter)));
    
    return matchesSearch && matchesProject && matchesStatus && matchesPriority && matchesResource;
  });
  
  // Paginate tasks
  const paginatedTasks = filteredTasks.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );
  
  // Helper function to get status chip color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };
  
  // Helper function to get priority chip color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
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
      {/* Header Section */}
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
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                mb: 0.5, 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Tasks
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ color: 'text.secondary' }}
            >
              Manage your tasks and track progress
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            component={RouterLink} 
            to="/tasks/new"
            size="medium"
            sx={{ 
              px: 3,
              py: 1,
              fontWeight: 500,
              boxShadow: 2
            }}
          >
            Add Task
          </Button>
        </Box>
      </Box>
        <Box sx={{ px: { xs: 0, sm: 1, md: 2 }, width: '100%', boxSizing: 'border-box' }}>
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: 'inherit'
              }
            }}
            variant="filled"
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}
        
        {error && (
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
            {error}
          </Alert>
        )}
        
        <Paper 
          elevation={0} 
          sx={{ 
            width: '100%', 
            mb: 4,
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'auto',
            boxSizing: 'border-box'
          }}
        >
          <Box 
            sx={{ 
              p: 3, 
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              bgcolor: 'background.paper' 
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="medium"
                  variant="outlined"
                  placeholder="Search tasks by name, description, or project..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      bgcolor: 'background.default'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    color="primary"
                    startIcon={filtersExpanded ? <ClearIcon /> : <FilterIcon />}
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    sx={{ mr: 1 }}
                  >
                    {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  {filtersExpanded && (
                    <Button
                      variant="text"
                      startIcon={<ClearIcon />}
                      onClick={handleClearFilters}
                      disabled={!projectFilter && !statusFilter && !priorityFilter && !resourceFilter}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
            
            {filtersExpanded && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Filter by Project</InputLabel>
                      <Select
                        value={projectFilter}
                        onChange={handleProjectFilterChange}
                        label="Filter by Project"
                      >
                        <MenuItem value="">All Projects</MenuItem>
                        {projects.map((project) => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Filter by Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        label="Filter by Status"
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="blocked">Blocked</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Filter by Priority</InputLabel>
                      <Select
                        value={priorityFilter}
                        onChange={handlePriorityFilterChange}
                        label="Filter by Priority"
                      >
                        <MenuItem value="">All Priorities</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Filter by Resource</InputLabel>
                      <Select
                        value={resourceFilter}
                        onChange={handleResourceFilterChange}
                        label="Filter by Resource"
                      >
                        <MenuItem value="">All Resources</MenuItem>
                        {resources.map((resource) => (
                          <MenuItem key={resource.id} value={resource.id}>
                            {resource.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
          
          <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ width: '100%' }}>
              <TableHead>                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Task</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Timeline</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Resources</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTasks.length > 0 ? (
                  paginatedTasks.map((task) => (
                    <TableRow 
                      key={task.id} 
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(32, 84, 147, 0.04)'
                        }
                      }}
                      onClick={() => handleViewTask(task.id)}
                    >
                      <TableCell 
                        sx={{ 
                          borderLeft: '4px solid transparent',
                          borderLeftColor: task.priority === 'high' || task.priority === 'critical' 
                            ? 'error.main'
                            : task.status === 'in_progress' 
                              ? 'primary.main' 
                              : 'transparent',
                          py: 1.5
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600,
                              color: 'text.primary' 
                            }}
                          >
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {task.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{task.project_name}</Typography>
                      </TableCell>                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(task.start_date)} - {formatDate(task.end_date)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {task.hours_spent || 0} / {task.estimated_hours} hours
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>                      <TableCell>
                        {task.resources && Array.isArray(task.resources) && task.resources.length > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AvatarGroup 
                              max={3}
                              sx={{ 
                                '& .MuiAvatar-root': { 
                                  width: 28, 
                                  height: 28, 
                                  fontSize: '0.8rem',
                                  borderWidth: 1
                                } 
                              }}
                            >
                              {task.resources.map(resource => (
                                <Tooltip 
                                  key={resource.id || Math.random()} 
                                  title={resource.name || 'Unknown resource'}
                                >
                                  <Avatar 
                                    alt={resource.name || 'Unknown'} 
                                    sx={{ 
                                      bgcolor: 'primary.main',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    {(resource.name && resource.name.charAt(0).toUpperCase()) || 'R'}
                                  </Avatar>
                                </Tooltip>
                              ))}
                            </AvatarGroup>
                            <Typography 
                              variant="caption" 
                              sx={{ ml: 1 }}
                              color="text.secondary"
                            >
                              {task.resources.length > 1 
                                ? `${task.resources.length} resources` 
                                : '1 resource'}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No resources assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} 
                          size="small" 
                          color={getPriorityColor(task.priority)}
                          variant={task.priority === 'critical' ? 'filled' : 'outlined'}
                          icon={task.priority === 'critical' || task.priority === 'high' ? <FlagIcon /> : undefined}
                          sx={{ 
                            borderRadius: '6px',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: '24px'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)} 
                          size="small" 
                          color={getStatusColor(task.status)}
                          sx={{ 
                            borderRadius: '6px',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: '24px'
                          }} 
                        />
                      </TableCell>
                      <TableCell 
                        align="right"
                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking on buttons
                      >
                        <Box sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Edit Task">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task.id);
                              }}
                              size="small"
                              color="primary"
                              sx={{ 
                                mx: 0.5,
                                '&:hover': { 
                                  bgcolor: 'rgba(32, 84, 147, 0.08)'
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Task">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(task);
                              }}
                              size="small"
                              color="error"
                              sx={{ 
                                mx: 0.5,
                                '&:hover': { 
                                  bgcolor: 'rgba(211, 47, 47, 0.08)'
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      {searchTerm || projectFilter || statusFilter || priorityFilter || resourceFilter ? (
                        <Box sx={{ py: 2 }}>
                          <Typography color="text.secondary" sx={{ mb: 1 }}>No tasks match your search criteria.</Typography>
                          <Button variant="text" startIcon={<ClearIcon />} onClick={handleClearFilters}>
                            Clear Filters
                          </Button>
                        </Box>
                      ) : (
                        <Typography color="text.secondary">No tasks available. Add a task to get started.</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            maxWidth: '450px'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1,
            pt: 2.5,
            fontWeight: 600
          }}
        >
          Delete Task
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          {taskToDelete && (
            <Typography>
              Are you sure you want to delete <strong>{taskToDelete.title}</strong>? 
              This action cannot be undone.
            </Typography>
          )}
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
    </Box>
  );
};

export default TasksList;
