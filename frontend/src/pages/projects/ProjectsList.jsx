import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Typography, Paper, Box, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Chip, Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { projectsAPI, clientsAPI } from '../../services/api';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);
  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again later.');
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
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleViewProject = (id) => {
    navigate(`/projects/${id}`);
  };
  
  const handleEditProject = (id) => {
    navigate(`/projects/edit/${id}`);
  };
  
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };
  
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      await projectsAPI.delete(projectToDelete.id);
      fetchProjects(); // Refresh list after deletion
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  // Helper function to get client name by ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };
  
  // Filter projects based on search term
  const filteredProjects = searchTerm
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : projects;
  
  // Paginate projects
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );
  
  // Helper function to get status chip color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'on_hold': return 'default';
      case 'cancelled': return 'error';
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
              Projects
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ color: 'text.secondary' }}
            >
              Manage your projects, budgets and resources
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            component={RouterLink} 
            to="/projects/new"
            size="medium"
            sx={{ 
              px: 3,
              py: 1,
              fontWeight: 500,
              boxShadow: 2
            }}
          >
            Add Project
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ px: { xs: 0, sm: 1, md: 2 }, width: '100%', boxSizing: 'border-box' }}>
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
            <TextField
              fullWidth
              size="medium"
              variant="outlined"
              placeholder="Search projects by name, client, or description..."
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
          </Box>
          
          <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Project Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Timeline</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Budget</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProjects.length > 0 ? (
                  paginatedProjects.map((project) => (
                    <TableRow 
                      key={project.id} 
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(32, 84, 147, 0.04)'
                        }
                      }}
                      onClick={() => handleViewProject(project.id)}
                    >
                      <TableCell 
                        sx={{ 
                          borderLeft: '4px solid transparent',
                          borderLeftColor: project.status === 'in_progress' ? 'primary.main' : 'transparent',
                          py: 2
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary' 
                          }}
                        >
                          {project.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{project.client_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatDate(project.start_date)} - {formatDate(project.end_date)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.estimated_hours} estimated hours
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(project.budgeted_cost)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={project.actual_cost > project.budgeted_cost ? 'error.main' : 'text.secondary'}
                          >
                            {project.actual_cost > 0 ? `Actual: ${formatCurrency(project.actual_cost)}` : 'No actual cost yet'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)} 
                          size="small" 
                          color={getStatusColor(project.status)}
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
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProject(project.id);
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
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Project">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project.id);
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
                          <Tooltip title="Delete Project">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(project);
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
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      {searchTerm ? (
                        <Typography color="text.secondary">No projects match your search criteria.</Typography>
                      ) : (
                        <Typography color="text.secondary">No projects available. Add a project to get started.</Typography>
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
            count={filteredProjects.length}
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
          Delete Project
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          {projectToDelete && (
            <Typography>
              Are you sure you want to delete <strong>{projectToDelete.name}</strong>? 
              All tasks associated with this project will be deleted. 
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

export default ProjectsList;
