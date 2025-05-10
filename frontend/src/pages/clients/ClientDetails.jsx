import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Paper, Box, Grid, Button, IconButton,
  Card, CardContent, Divider, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Breadcrumbs, Link, Tab, Tabs
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Notes as NotesIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { clientsAPI, projectsAPI } from '../../services/api';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    fetchClientData();
  }, [id]);
  
  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Fetch client details
      const clientData = await clientsAPI.getById(id);
      setClient(clientData);
      
      // Fetch client projects
      try {
        const projectsData = await projectsAPI.getByClientId(id);
        setProjects(projectsData);
      } catch (projectError) {
        console.error('Error fetching client projects:', projectError);
        setProjects([]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching client details:', error);
      setError('Failed to load client details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditClient = () => {
    navigate(`/clients/edit/${id}`);
  };
  
  const handleDeleteClient = () => {
    // This would be better handled with a confirmation dialog
    // For now, we'll just navigate back after deletion
    if (window.confirm(`Are you sure you want to delete client "${client?.name}"?`)) {
      clientsAPI.delete(id).then(() => {
        navigate('/clients');
      }).catch(error => {
        console.error('Error deleting client:', error);
        setError('Failed to delete client. Please try again.');
      });
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
          <Button 
            component={RouterLink} 
            to="/clients"
            variant="outlined" 
            size="small"
            sx={{ ml: 2 }}
          >
            Go back to clients
          </Button>
        </Alert>
      </Container>
    );
  }
  
  if (!client) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 3 }}>
          Client not found
          <Button 
            component={RouterLink} 
            to="/clients"
            variant="outlined" 
            size="small"
            sx={{ ml: 2 }}
          >
            Go back to clients
          </Button>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/clients" underline="hover" color="inherit">
          Clients
        </Link>
        <Typography color="text.primary">{client.name}</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            component={RouterLink} 
            to="/clients"
            sx={{ mr: 1 }}
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {client.name}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditClient}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            color="error"
            onClick={handleDeleteClient}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Client Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {client.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1 }} color="action" />
                  <Typography variant="body2">{client.email}</Typography>
                </Box>
              )}
              
              {client.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1 }} color="action" />
                  <Typography variant="body2">{client.phone}</Typography>
                </Box>
              )}
              
              {client.address && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <BusinessIcon sx={{ mr: 1, mt: 0.5 }} color="action" />
                  <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                    {client.address}
                  </Typography>
                </Box>
              )}
              
              {client.notes && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Notes
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <NotesIcon sx={{ mr: 1, mt: 0.5 }} color="action" />
                    <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                      {client.notes}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Projects and Tasks */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Projects" />
              <Tab label="Tasks" />
              <Tab label="Invoices" />
            </Tabs>
            
            <Box sx={{ p: 2 }}>
              {tabValue === 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Projects</Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<AddIcon />}
                      component={RouterLink}
                      to={`/projects/new?clientId=${id}`}
                    >
                      New Project
                    </Button>
                  </Box>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Dates</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Est. Hours</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {projects.length > 0 ? (
                          projects.map((project) => (
                            <TableRow 
                              key={project.id} 
                              hover
                              onClick={() => navigate(`/projects/${project.id}`)}
                              sx={{ cursor: 'pointer' }}
                            >
                              <TableCell>{project.name}</TableCell>
                              <TableCell>
                                {formatDate(project.start_date)} - {formatDate(project.end_date)}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={project.status.replace('_', ' ')} 
                                  size="small"
                                  color={
                                    project.status === 'completed' ? 'success' :
                                    project.status === 'in_progress' ? 'primary' :
                                    project.status === 'on_hold' ? 'warning' :
                                    project.status === 'cancelled' ? 'error' :
                                    'default'
                                  }
                                />
                              </TableCell>
                              <TableCell align="right">
                                {project.estimated_hours}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No projects found for this client
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              
              {tabValue === 1 && (
                <>
                  <Typography variant="h6">Tasks</Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Typography color="textSecondary">
                      Task list will be implemented soon
                    </Typography>
                  </Box>
                </>
              )}
              
              {tabValue === 2 && (
                <>
                  <Typography variant="h6">Invoices</Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Typography color="textSecondary">
                      Invoice management will be implemented soon
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDetails;
