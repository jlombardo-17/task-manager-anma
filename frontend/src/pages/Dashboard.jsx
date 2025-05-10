import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, Grid, Typography, Paper, Box, CircularProgress, 
  Card, CardContent, CardActions, Button, Divider, Chip
} from '@mui/material';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { clientsAPI, projectsAPI, tasksAPI } from '../services/api';

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
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    clientsCount: 0,
    projectsCount: 0,
    tasksCount: 0,
    resourcesCount: 0,
    recentProjects: [],
    upcomingTasks: [],
    projectsByStatus: [],
    tasksByPriority: []
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch clients
        const clients = await clientsAPI.getAll();
        
        // Fetch projects
        const projects = await projectsAPI.getAll();
        
        // Fetch tasks
        const tasks = await tasksAPI.getAll();
        
        // Process data
        const projectsByStatus = processProjectsByStatus(projects);
        const tasksByPriority = processTasksByPriority(tasks);
        const recentProjects = getRecentProjects(projects);
        const upcomingTasks = getUpcomingTasks(tasks);
        
        setDashboardData({
          clientsCount: clients.length,
          projectsCount: projects.length,
          tasksCount: tasks.length,
          resourcesCount: 0, // Will be implemented later
          recentProjects,
          upcomingTasks,
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
  
  // Format date function
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
        <Paper sx={{ p: 3, mt: 3, bgcolor: '#FFF3F3' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#f3f8ff' }}>
            <Typography variant="h6" gutterBottom>Clients</Typography>
            <Typography variant="h3">{dashboardData.clientsCount}</Typography>
            <Button component={RouterLink} to="/clients" size="small" sx={{ mt: 2 }}>
              View All
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#f3fff8' }}>
            <Typography variant="h6" gutterBottom>Projects</Typography>
            <Typography variant="h3">{dashboardData.projectsCount}</Typography>
            <Button component={RouterLink} to="/projects" size="small" sx={{ mt: 2 }}>
              View All
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#fff8f3' }}>
            <Typography variant="h6" gutterBottom>Tasks</Typography>
            <Typography variant="h3">{dashboardData.tasksCount}</Typography>
            <Button component={RouterLink} to="/tasks" size="small" sx={{ mt: 2 }}>
              View All
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f3ff' }}>
            <Typography variant="h6" gutterBottom>Resources</Typography>
            <Typography variant="h3">{dashboardData.resourcesCount}</Typography>
            <Button component={RouterLink} to="/resources" size="small" sx={{ mt: 2 }}>
              View All
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Projects by Status</Typography>
            {dashboardData.projectsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.projectsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} projects`, 'Count']} />
                  <Legend />
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
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Tasks by Priority</Typography>
            {dashboardData.tasksByPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.tasksByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#8884d8" />
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
      
      {/* Recent Projects & Upcoming Tasks */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Projects</Typography>
            {dashboardData.recentProjects.length > 0 ? (
              dashboardData.recentProjects.map((project) => (
                <Card key={project.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="h6">{project.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Client: {project.client_name}
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 1 }}>
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        Start: {formatDate(project.start_date)}
                      </Typography>
                      <Typography variant="body2">
                        End: {formatDate(project.end_date)}
                      </Typography>
                    </Box>
                    <Chip 
                      label={project.status.replace('_', ' ')} 
                      size="small" 
                      sx={{ 
                        mt: 1, 
                        bgcolor: statusColors[project.status] || 'grey',
                        color: 'white'
                      }} 
                    />
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/projects/${project.id}`}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography color="text.secondary">No recent projects</Typography>
            )}
            
            {dashboardData.recentProjects.length > 0 && (
              <Button 
                component={RouterLink} 
                to="/projects" 
                sx={{ mt: 1 }}
              >
                View All Projects
              </Button>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Upcoming Tasks</Typography>
            {dashboardData.upcomingTasks.length > 0 ? (
              dashboardData.upcomingTasks.map((task) => (
                <Card key={task.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="h6">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Project: {task.project_name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Chip 
                        label={task.priority} 
                        size="small" 
                        sx={{ 
                          bgcolor: 
                            task.priority === 'critical' ? '#FF0000' : 
                            task.priority === 'high' ? '#FF8042' : 
                            task.priority === 'medium' ? '#FFBB28' : 
                            '#00C49F',
                          color: 'white'
                        }} 
                      />
                      <Typography variant="body2">
                        Due: {formatDate(task.end_date)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/tasks/${task.id}`}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography color="text.secondary">No upcoming tasks</Typography>
            )}
            
            {dashboardData.upcomingTasks.length > 0 && (
              <Button 
                component={RouterLink} 
                to="/tasks" 
                sx={{ mt: 1 }}
              >
                View All Tasks
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;