import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Typography, Paper, Box, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Chip, Tooltip,
  MenuItem, Select, FormControl, InputLabel,
  Grid, Divider, Card
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonOutline as PersonIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { resourcesAPI } from '../../services/api';

const ResourcesList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [uniqueRoles, setUniqueRoles] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
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
  
  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourcesAPI.getAll();
      setResources(data);
      
      // Extraer roles únicos para el filtro
      const roles = [...new Set(data.map(resource => resource.role))];
      setUniqueRoles(roles);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setPage(0);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleViewResource = (id) => {
    navigate(`/resources/${id}`);
  };
  
  const handleEditResource = (id) => {
    navigate(`/resources/${id}/edit`);
  };
  
  const handleDeleteClick = (resource) => {
    setResourceToDelete(resource);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;
    
    try {
      await resourcesAPI.delete(resourceToDelete.id);
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
      fetchResources();
      setSuccessMessage(`Resource "${resourceToDelete.name}" successfully deleted.`);
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError(`Failed to delete resource: ${error.message}`);
      setDeleteDialogOpen(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setResourceToDelete(null);
  };
  
  // Filter resources based on search term and role filter
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = searchTerm === '' || 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || resource.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Paginación
  const paginatedResources = filteredResources.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
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
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                mb: 0.5, 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Resources
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ color: 'text.secondary' }}
            >
              Manage people resources and their assignments
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/resources/new')}
            sx={{ 
              borderRadius: 8,
              px: 3,
              py: 1,
              boxShadow: 2
            }}
          >
            Add New Resource
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
              <Grid item xs={12} md={filtersExpanded ? 4 : 6}>
                <TextField
                  fullWidth
                  size="medium"
                  variant="outlined"
                  placeholder="Search resources by name, email, or role..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              {filtersExpanded && (
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="role-filter-label">Filter by Role</InputLabel>
                    <Select
                      labelId="role-filter-label"
                      id="role-filter"
                      value={roleFilter}
                      onChange={handleRoleFilterChange}
                      label="Filter by Role"
                    >
                      <MenuItem value="">
                        <em>All Roles</em>
                      </MenuItem>
                      {uniqueRoles.map((role) => (
                        <MenuItem key={role} value={role}>{role}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12} md={filtersExpanded ? 4 : 6} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: { xs: 'flex-start', md: 'flex-end' },
                      gap: 1
                    }}
              >
                <Button
                  startIcon={<FilterIcon />}
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  sx={{ 
                    minWidth: 110,
                    borderRadius: 8,
                  }}
                  color="secondary"
                >
                  {filtersExpanded ? 'Less Filters' : 'More Filters'}
                </Button>
                
                {filtersExpanded && (
                  <Button
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    sx={{ 
                      minWidth: 110,
                      borderRadius: 8,
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="resources table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rate (hourly)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Availability</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedResources.length > 0 ? (
                  paginatedResources.map((resource) => (
                    <TableRow 
                      key={resource.id} 
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="primary" />
                          <Typography fontWeight="medium">{resource.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={resource.role}
                          size="small"
                          icon={<WorkIcon sx={{ fontSize: '1rem !important' }} />}
                          sx={{ 
                            bgcolor: 'rgba(120, 144, 240, 0.1)',
                            color: 'primary.main',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(resource.hourly_rate)}</TableCell>
                      <TableCell>{resource.email || "-"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 100,
                              height: 10,
                              bgcolor: 'background.paper',
                              borderRadius: 5,
                              border: '1px solid rgba(0,0,0,0.1)',
                              mr: 1
                            }}
                          >
                            <Box
                              sx={{
                                width: `${resource.availability}%`,
                                height: '100%',
                                bgcolor: resource.availability > 70 
                                  ? 'success.main' 
                                  : resource.availability > 30 
                                    ? 'warning.main' 
                                    : 'error.main',
                                borderRadius: 5
                              }}
                            />
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            {resource.availability}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewResource(resource.id)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleEditResource(resource.id)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteClick(resource)}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      {resources.length === 0 ? (
                        <Typography variant="body1">No resources found. Add your first resource!</Typography>
                      ) : (
                        <Typography variant="body1">No resources match your search criteria.</Typography>
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
            count={filteredResources.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete the resource "{resourceToDelete?.name}"? 
              This action cannot be undone.
            </Typography>
            {resourceToDelete?.assigned_tasks_count > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This resource is assigned to {resourceToDelete.assigned_tasks_count} tasks.
                Deleting it will remove these assignments.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleDeleteCancel} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ResourcesList;
