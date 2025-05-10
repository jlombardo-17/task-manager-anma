import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    fetchUserProfile();
  }, []);
  
  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await authAPI.getProfile();
      setCurrentUser(userData);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setError('Session expired. Please log in again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { token } = await authAPI.login(email, password);
      localStorage.setItem('token', token);
      
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Failed to login. Please try again.');
      setLoading(false);
      return false;
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const { token } = await authAPI.register(userData);
      localStorage.setItem('token', token);
      
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Failed to register. Please try again.');
      setLoading(false);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  // Clear any errors
  const clearError = () => {
    setError(null);
  };
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
