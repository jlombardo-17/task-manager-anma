import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Client Pages
import ClientsList from './pages/clients/ClientsList';
import ClientDetails from './pages/clients/ClientDetails';
import ClientForm from './pages/clients/ClientForm';

// Create theme - Enhanced professional theme for accountants
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden'
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden'
        }
      }
    }
  },
  palette: {
    primary: {
      light: '#5682c4',
      main: '#205493', // Professional blue for accountants
      dark: '#0d3c6e',
      contrastText: '#fff',
    },
    secondary: {
      light: '#63b463',
      main: '#388e3c', // Professional green for finance
      dark: '#1e682a',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f7fa', // Slightly cooler tone for background
      paper: '#ffffff',
    },
    error: {
      light: '#e57373',
      main: '#d32f2f',
      dark: '#b71c1c',
      contrastText: '#fff',
    },
    warning: {
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      light: '#4dabf5',
      main: '#0288d1',
      dark: '#01579b',
      contrastText: '#fff',
    },
    success: {
      light: '#66bb6a',
      main: '#2e7d32',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#d5d5d5',
      A200: '#aaaaaa',
      A400: '#707070',
      A700: '#616161',
    },
    text: {
      primary: '#2c3e50', // Darker text for better readability
      secondary: '#546e7a', // More professional secondary text color
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600, // Slightly bolder heading
      fontSize: '2.4rem',
      letterSpacing: '-0.01562em',
      color: '#1f2937', // Darker heading color
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.00833em',
      color: '#1f2937',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '0em',
      color: '#1f2937',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '0.00735em',
      color: '#1f2937',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
      color: '#1f2937',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
      color: '#1f2937',
    },
    body1: {
      fontSize: '0.95rem', // Slightly larger body text
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none', // No uppercase transform for buttons
    },
  },
  shape: {
    borderRadius: 6, // Slightly more subtle border radius
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
          padding: '8px 18px', // Slightly more padding
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)', // Subtle lift effect on hover
          },
        },
        contained: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1a4880', // Slightly darker on hover
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#2e7d32', // Slightly darker on hover
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.06)',
          transition: 'box-shadow 0.2s ease-in-out',
        },
        elevation1: {
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.07)',
        },
        elevation3: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.06)',
          overflow: 'visible',
          transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)', // Subtle lift effect on hover
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f0f5fa', // Slightly more professional header color
          fontSize: '0.875rem',
          color: '#2c3e50',
          padding: '14px 20px', // Slightly more padding
        },
        root: {
          padding: '12px 20px', // Slightly more padding
          fontSize: '0.875rem',
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)', // Subtle hover effect
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
          width: '100%',
          overflowX: 'auto',
          maxWidth: '100%',
          boxSizing: 'border-box'
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '16px 0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          height: '28px',
          fontWeight: 500,
          borderRadius: '16px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return null; // Could show a loading spinner here
  }
  
  if (!currentUser) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                
                {/* Client Routes */}
                <Route path="/clients" element={<ClientsList />} />
                <Route path="/clients/new" element={<ClientForm />} />
                <Route path="/clients/:id" element={<ClientDetails />} />
                <Route path="/clients/edit/:id" element={<ClientForm />} />
                
                {/* Future Routes */}
                {/* <Route path="/projects" element={<Projects />} /> */}
                {/* <Route path="/tasks" element={<Tasks />} /> */}
                {/* <Route path="/resources" element={<Resources />} /> */}
                {/* <Route path="/schedule" element={<Schedule />} /> */}
              </Route>
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
