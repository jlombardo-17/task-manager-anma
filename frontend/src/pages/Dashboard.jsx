import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Grid, Typography, Paper, Box, CircularProgress, 
  Card, CardContent, CardActions, Button, Divider, Chip, Avatar
} from '@mui/material';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { clientsAPI, projectsAPI, tasksAPI, resourcesAPI } from '../services/api';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Status colors
const statusColors = {
  pending: '#FFBB28',
  in_progress: '#0088FE',
  completed: '#00C49F',
  on_hold: '#8884d8',
  cancelled: '#FF8042',
  blocked: '#FF0000'
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [dashboardData, setDashboardData] = useState({
    clientsCount: 0,
    projectsCount: 0,
    tasksCount: 0,
    resourcesCount: 0,
    recentProjects: [],
    upcomingTasks: [],
    recentTasks: [],
    recentResources: [],
    projectsByStatus: [],
    tasksByPriority: []
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {      try {
        setLoading(true);
        
        // Fetch clients
        const clients = await clientsAPI.getAll();
        
        // Fetch projects
        const projects = await projectsAPI.getAll();
        
        // Fetch tasks
        const tasks = await tasksAPI.getAll();

        // Fetch resources
        const resources = await resourcesAPI.getAll();
          
        // Process data
        const projectsByStatus = processProjectsByStatus(projects);
        const tasksByPriority = processTasksByPriority(tasks);
        const recentProjects = getRecentProjects(projects);
        const upcomingTasks = getUpcomingTasks(tasks);
        const recentTasks = getRecentTasks(tasks);
        const recentResources = getRecentResources(resources);
        
        setDashboardData({
          clientsCount: clients.length,
          projectsCount: projects.length,
          tasksCount: tasks.length,          resourcesCount: resources.length,
          recentProjects,
          upcomingTasks,
          recentTasks,
          recentResources,
          projectsByStatus,
          tasksByPriority
        });
        
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Helper functions for data processing
  const processProjectsByStatus = (projects) => {
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      on_hold: 0,
      cancelled: 0
    };
    
    projects.forEach(project => {
      if (statusCounts.hasOwnProperty(project.status)) {
        statusCounts[project.status]++;
      }
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
      value: statusCounts[status],
      color: statusColors[status]
    })).filter(item => item.value > 0);
  };
  
  const processTasksByPriority = (tasks) => {
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    tasks.forEach(task => {
      if (priorityCounts.hasOwnProperty(task.priority)) {
        priorityCounts[task.priority]++;
      }
    });
    
    return Object.keys(priorityCounts).map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      tasks: priorityCounts[priority]
    }));
  };
  
  const getRecentProjects = (projects) => {
    return [...projects]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };
    const getUpcomingTasks = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return [...tasks]
      .filter(task => {
        const endDate = new Date(task.end_date);
        endDate.setHours(0, 0, 0, 0);
        return endDate >= today && task.status !== 'completed';
      })
      .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
      .slice(0, 5);
  };
  
  // Get recently updated tasks
  const getRecentTasks = (tasks) => {
    return [...tasks]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5); // Get top 5 recent tasks
  };

  // Get recently added resources
  const getRecentResources = (resources) => {
    return [...resources]
      .sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at))
      .slice(0, 5); // Get top 5 recent resources
  };
  
  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        <Paper sx={{ p: 3, mt: 3, bgcolor: '#FFF3F3', borderRadius: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header with welcome message */}
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
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 1, 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Dashboard Overview
        </Typography>        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'text.secondary'
          }}
        >
          Welcome back! Here's a summary of your tasks, projects and clients. Track your progress and manage your workflow efficiently.
        </Typography>
      </Box>
        {/* Main Content */}
      <Box sx={{ px: { xs: 0, sm: 1, md: 2 }, width: '100%', boxSizing: 'border-box' }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                borderRadius: 3,
                borderTop: '4px solid',
                borderColor: 'primary.main',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>Clients</Typography>
              <Typography variant="h3" sx={{ my: 2, color: 'text.primary', fontWeight: 600 }}>
                {dashboardData.clientsCount}
              </Typography>
              <Button 
                component={RouterLink} 
                to="/clients"
                variant="outlined" 
                color="primary"
                size="small" 
                sx={{ mt: 'auto', alignSelf: 'center' }}
              >
                View All Clients
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                borderRadius: 3,
                borderTop: '4px solid',
                borderColor: 'secondary.main',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h6" color="secondary" fontWeight={600} gutterBottom>Projects</Typography>
              <Typography variant="h3" sx={{ my: 2, color: 'text.primary', fontWeight: 600 }}>
                {dashboardData.projectsCount}
              </Typography>
              <Button 
                component={RouterLink} 
                to="/projects"
                variant="outlined" 
                color="secondary"
                size="small" 
                sx={{ mt: 'auto', alignSelf: 'center' }}
              >
                View All Projects
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                borderRadius: 3,
                borderTop: '4px solid',
                borderColor: 'info.main',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h6" color="info.dark" fontWeight={600} gutterBottom>Tasks</Typography>
              <Typography variant="h3" sx={{ my: 2, color: 'text.primary', fontWeight: 600 }}>
                {dashboardData.tasksCount}
              </Typography>
              <Button 
                component={RouterLink} 
                to="/tasks"
                variant="outlined" 
                color="info"
                size="small" 
                sx={{ mt: 'auto', alignSelf: 'center' }}
              >
                View All Tasks
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                borderRadius: 3,
                borderTop: '4px solid',
                borderColor: 'warning.main',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h6" color="warning.dark" fontWeight={600} gutterBottom>Resources</Typography>
              <Typography variant="h3" sx={{ my: 2, color: 'text.primary', fontWeight: 600 }}>
                {dashboardData.resourcesCount}
              </Typography>
              <Button 
                component={RouterLink} 
                to="/resources"
                variant="outlined" 
                color="warning"
                size="small" 
                sx={{ mt: 'auto', alignSelf: 'center' }}
              >
                View Resources
              </Button>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Charts Section */}
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Analytics Overview
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Projects by Status
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
                {dashboardData.projectsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={320} minHeight={250} maxHeight={400}>
                  <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <Pie
                      data={dashboardData.projectsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.projectsByStatus.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || COLORS[index % COLORS.length]}
                          stroke="rgba(255,255,255,0.5)"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} projects`, 'Count']}
                      contentStyle={{ 
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                        border: 'none',
                        padding: '10px 14px'
                      }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No project data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Tasks by Priority
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
                {dashboardData.tasksByPriority.length > 0 ? (
                <ResponsiveContainer width="100%" height={320} minHeight={250} maxHeight={400}>
                  <BarChart data={dashboardData.tasksByPriority} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis 
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} tasks`, 'Count']}
                      contentStyle={{ 
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                        border: 'none',
                        padding: '10px 14px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="tasks" 
                      fill="#0288d1" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No task data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Recent Projects & Upcoming Tasks Section */}
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Activity Overview
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Recent Projects
                </Typography>
                {dashboardData.recentProjects.length > 0 && (
                  <Button 
                    component={RouterLink} 
                    to="/projects" 
                    size="small"
                    variant="text"
                    color="primary"
                  >
                    View All
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {dashboardData.recentProjects.length > 0 ? (
                dashboardData.recentProjects.map((project) => (
                  <Card 
                    key={project.id} 
                    elevation={0}
                    sx={{ 
                      mb: 2.5, 
                      border: '1px solid rgba(0,0,0,0.06)', 
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { 
                        borderColor: 'primary.main', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                      }
                    }}
                  >
                    <CardContent sx={{ pb: 1.5 }}>
                      <Typography variant="h6" fontWeight={600}>{project.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Client: {project.client_name}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 2 },
                        mb: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', mr: 0.5 }}>
                            Start:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(project.start_date)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', mr: 0.5 }}>
                            End:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(project.end_date)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)} 
                        size="small" 
                        sx={{ 
                          borderRadius: '6px',
                          bgcolor: statusColors[project.status] || 'grey',
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          height: '24px'
                        }} 
                      />
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button 
                        size="small" 
                        component={RouterLink} 
                        to={`/projects/${project.id}`}
                        variant="outlined"
                        color="primary"
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                ))
              ) : (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No recent projects available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Upcoming Tasks
                </Typography>
                {dashboardData.upcomingTasks.length > 0 && (
                  <Button 
                    component={RouterLink} 
                    to="/tasks" 
                    size="small"
                    variant="text"
                    color="primary"
                  >
                    View All
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {dashboardData.upcomingTasks.length > 0 ? (
                dashboardData.upcomingTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    elevation={0}
                    sx={{ 
                      mb: 2.5, 
                      border: '1px solid rgba(0,0,0,0.06)', 
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { 
                        borderColor: 'primary.main', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                      }
                    }}
                  >
                    <CardContent sx={{ pb: 1.5 }}>
                      <Typography variant="h6" fontWeight={600}>{task.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Project: {task.project_name}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <Chip 
                          label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} 
                          size="small" 
                          sx={{ 
                            borderRadius: '6px',
                            bgcolor: 
                              task.priority === 'critical' ? '#d32f2f' : 
                              task.priority === 'high' ? '#f57c00' : 
                              task.priority === 'medium' ? '#ffa000' : 
                              '#43a047',
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: '24px'
                          }} 
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', mr: 0.5 }}>
                            Due:
                          </Typography>
                          <Typography 
                            variant="body2"
                            fontWeight={600}
                            color={new Date(task.end_date) < new Date() ? 'error.main' : 'text.primary'}
                          >
                            {formatDate(task.end_date)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button 
                        size="small" 
                        component={RouterLink} 
                        to={`/tasks/${task.id}`}
                        variant="outlined"
                        color="primary"
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                ))
              ) : (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No upcoming tasks available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Recent Resources Section */}
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Resource Management
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Recent Resources
                </Typography>
                {dashboardData.recentResources && dashboardData.recentResources.length > 0 && (
                  <Button 
                    component={RouterLink} 
                    to="/resources" 
                    size="small"
                    variant="text"
                    color="primary"
                  >
                    View All
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {dashboardData.recentResources && dashboardData.recentResources.length > 0 ? (
                <Grid container spacing={2}>
                  {dashboardData.recentResources.map((resource) => (
                    <Grid item xs={12} sm={6} md={4} key={resource.id}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          border: '1px solid rgba(0,0,0,0.06)', 
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          '&:hover': { 
                            borderColor: 'warning.main', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                          }
                        }}
                      >
                        <Avatar 
                          alt={resource.name} 
                          sx={{ 
                            width: 56, 
                            height: 56, 
                            bgcolor: 'warning.main',
                            fontSize: '1.2rem'
                          }}
                        >
                          {resource.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600}>{resource.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {resource.role}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', mr: 0.5 }}>
                              Rate:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              ${resource.hourly_rate}/hr
                            </Typography>
                          </Box>
                        </Box>
                        <Button 
                          size="small" 
                          component={RouterLink} 
                          to={`/resources/${resource.id}`}
                          variant="outlined"
                          color="warning"
                          sx={{ ml: 1 }}
                        >
                          Details
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No resources available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;