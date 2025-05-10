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
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { clientsAPI } from '../../services/api';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchClients();
  }, []);
  
  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientsAPI.getAll();
      setClients(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleViewClient = (id) => {
    navigate(`/clients/${id}`);
  };
  
  const handleEditClient = (id) => {
    navigate(`/clients/edit/${id}`);
  };
  
  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    try {
      await clientsAPI.delete(clientToDelete.id);
      fetchClients(); // Refresh list after deletion
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('Failed to delete client. Please try again.');
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };
  
  // Filter clients based on search term
  const filteredClients = searchTerm
    ? clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.phone && client.phone.includes(searchTerm))
      )
    : clients;
  
  // Paginate clients
  const paginatedClients = filteredClients.slice(
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
              Clients
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ color: 'text.secondary' }}
            >
              Manage your clients and their associated projects
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            component={RouterLink} 
            to="/clients/new"
            size="medium"
            sx={{ 
              px: 3,
              py: 1,
              fontWeight: 500,
              boxShadow: 2
            }}
          >
            Add Client
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
        )}          <Paper 
          elevation={0} 
          sx={{ 
            width: '100%', 
            mb: 4,
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'auto', // Changed from 'hidden' to 'auto' to allow scrolling if needed
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
              placeholder="Search clients by name, email, or phone..."
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
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Client Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Contact Information</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Projects</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClients.length > 0 ? (
                  paginatedClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(32, 84, 147, 0.04)'
                        }
                      }}
                      onClick={() => handleViewClient(client.id)}
                    >
                      <TableCell 
                        sx={{ 
                          borderLeft: '4px solid transparent',
                          borderLeftColor: client.projectCount ? 'primary.main' : 'transparent',
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
                          {client.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {client.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" color="primary" sx={{ opacity: 0.8 }} />
                              <Typography variant="body2">{client.email}</Typography>
                            </Box>
                          )}
                          {client.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" color="primary" sx={{ opacity: 0.8 }} />
                              <Typography variant="body2">{client.phone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${client.projectCount || 0} projects`}
                          size="small"
                          color={client.projectCount ? "primary" : "default"}
                          variant={client.projectCount ? "filled" : "outlined"}
                          sx={{ 
                            fontWeight: 500,
                            borderRadius: '6px',
                            '& .MuiChip-label': {
                              px: 1.5
                            }
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
                                handleViewClient(client.id);
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
                          <Tooltip title="Edit Client">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClient(client.id);
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
                          <Tooltip title="Delete Client">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(client);
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
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        {searchTerm ? (
                          <>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                              No clients matching your search
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Try using different keywords or clearing your search
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                              No clients found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Add your first client to get started
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              component={RouterLink}
                              to="/clients/new"
                            >
                              Add Client
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            borderTop: '1px solid rgba(0,0,0,0.08)'
          }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredClients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Delete Client
          </Typography>
        </DialogTitle>
        <DialogContent>
          {clientToDelete && (
            <Typography sx={{ pt: 1 }}>
              Are you sure you want to delete the client <strong>"{clientToDelete.name}"</strong>? 
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

export default ClientsList;
