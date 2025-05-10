import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Divider, Box, Avatar, Menu, MenuItem
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard, 
  People, 
  Assignment, 
  Work, 
  Person, 
  Event, 
  Logout 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard color="primary" />, path: '/' },
    { text: 'Clients', icon: <People color="primary" />, path: '/clients' },
    { text: 'Projects', icon: <Work color="primary" />, path: '/projects' },
    { text: 'Tasks', icon: <Assignment color="primary" />, path: '/tasks' },
    { text: 'Resources', icon: <Person color="primary" />, path: '/resources' },
    { text: 'Schedule', icon: <Event color="primary" />, path: '/schedule' },
  ];
  
  const navigateTo = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar position="fixed" elevation={2} color="primary">
        <Toolbar sx={{ minHeight: { xs: '64px', sm: '70px' } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            Task Manager
          </Typography>
          
          {currentUser && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mr: 1.5, 
                    display: { xs: 'none', sm: 'block' }, 
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  {currentUser.username}
                </Typography>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{ 
                    p: 0.5,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'secondary.main', 
                      width: 36, 
                      height: 36,
                      fontWeight: 600 
                    }}
                  >
                    {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Box>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    borderRadius: '8px',
                    minWidth: '180px',
                    mt: 0.5,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                    }
                  }
                }}
              >
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Profile</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" color="primary" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 280, // Slightly wider drawer 
            bgcolor: '#ffffff',
            boxShadow: '2px 0 8px rgba(0,0,0,0.08)'
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%' 
        }}>
          {/* Drawer Header */}
          <Box 
            sx={{ 
              py: 2, 
              px: 3, 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: 'primary.main',
              color: 'white'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
              Task Manager
            </Typography>
          </Box>
          
          <Divider />
          
          {/* Menu Items */}
          <List sx={{ py: 2 }}>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                onClick={() => navigateTo(item.path)}
                sx={{
                  py: 1.5,
                  px: 2,
                  mx: 1,
                  mb: 0.5,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(32, 84, 147, 0.08)', // Light primary color
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: '46px' }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: 500, 
                    fontSize: '0.95rem',
                    color: 'text.primary'
                  }}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Footer */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              © 2023 Task Manager
            </Typography>
          </Box>
        </Box>
      </Drawer>
        <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default',
          minHeight: '100vh',
          width: '100%', // Asegura que utiliza el 100% del ancho disponible
          maxWidth: '100vw' // No exceder el ancho visible
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '64px', sm: '70px' } }} /> {/* Matching AppBar height */}
        
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            p: { xs: 1, sm: 2, md: 3 },
            width: '100%',
            boxSizing: 'border-box' // Asegura que el padding no añada al ancho total
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
