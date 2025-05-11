import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, Button, Grid, Chip,
  IconButton, Divider, Alert, CircularProgress, Avatar,
  List, ListItem, ListItemText, ListItemIcon, Card,
  CardContent, CardHeader, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  WorkOutline as WorkIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Assignment as TaskIcon,
  EventNote as EventIcon
} from '@mui/icons-material';
import { resourcesAPI, tasksAPI } from '../../services/api';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [resource, setResource] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchResourceData();
  }, [id]);
  
  const fetchResourceData = async () => {
    try {
      setLoading(true);
      const resourceData = await resourcesAPI.getById(id);
      setResource(resourceData);
      
      // Fetch assignments for this resource
      const assignmentsData = await resourcesAPI.getAssignments(id);
      setAssignments(assignmentsData);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching resource details:', error);
      setError('Failed to load resource details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = () => {
    navigate(`/resources/${id}/edit`);
  };
  
  const handleDelete = async () => {
    try {
      await resourcesAPI.delete(id);
      navigate('/resources', { 
        state: { 
          successMessage: `Resource "${resource.name}" has been deleted successfully.` 
        } 
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError(`Failed to delete resource: ${error.message}`);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get resource initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          onClick={() => navigate('/resources')}
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Back to Resources
        </Button>
      </Box>
    );
  }
  
  if (!resource) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Resource not found.</Alert>
        <Button 
          onClick={() => navigate('/resources')}
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Back to Resources
        </Button>
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
                {resource.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                <Typography 
                  variant="subtitle1" 
                  sx={{ color: 'text.secondary' }}
                >
                  {formatCurrency(resource.hourly_rate)} per hour
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ px: { xs: 0, sm: 1, md: 2 }, width: '100%', boxSizing: 'border-box' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ 
              borderRadius: 3, 
              border: '1px solid rgba(0,0,0,0.08)', 
              height: '100%' 
            }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ backgroundColor: 'primary.main', width: 60, height: 60 }}>
                    {getInitials(resource.name)}
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                }
              />
              <CardContent>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <WorkIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Role" 
                      secondary={resource.role || "Not specified"} 
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <MoneyIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Hourly Rate" 
                      secondary={formatCurrency(resource.hourly_rate)} 
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={resource.email || "Not provided"} 
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Phone" 
                      secondary={resource.phone || "Not provided"} 
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <TimeIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Availability" 
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
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
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ 
              borderRadius: 3, 
              border: '1px solid rgba(0,0,0,0.08)', 
              height: '100%' 
            }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Task Assignments
                  </Typography>
                }
                action={
                  <Chip 
                    label={`${assignments.length} Assignments`} 
                    color="primary" 
                    variant="outlined"
                    icon={<TaskIcon />}
                  />
                }
              />
              <CardContent>
                {assignments.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <TaskIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      This resource is not assigned to any tasks yet.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Task</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Dates</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assignments.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>{task.project_name}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {formatDate(task.start_date)} - {formatDate(task.end_date)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.priority}
                                size="small"
                                color={
                                  task.priority === 'critical' ? 'error' :
                                  task.priority === 'high' ? 'warning' :
                                  task.priority === 'medium' ? 'info' : 'default'
                                }
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={task.status.replace('_', ' ')}
                                size="small"
                                color={
                                  task.status === 'completed' ? 'success' :
                                  task.status === 'in_progress' ? 'primary' :
                                  task.status === 'blocked' ? 'error' : 'default'
                                }
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="View Task">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/tasks/${task.id}`)}
                                >
                                  <TaskIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ResourceDetails;
