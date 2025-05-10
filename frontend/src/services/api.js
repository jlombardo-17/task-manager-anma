import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for adding auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Clients API calls
export const clientsAPI = {
  getAll: async () => {
    const response = await api.get('/clients');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },
  
  create: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },
  
  update: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};

// Projects API calls
export const projectsAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  getByClientId: async (clientId) => {
    const response = await api.get(`/projects/client/${clientId}`);
    return response.data;
  },
  
  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  
  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  
  getHours: async (id) => {
    const response = await api.get(`/projects/${id}/hours`);
    return response.data;
  }
};

// Tasks API calls
export const tasksAPI = {
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  getByProjectId: async (projectId) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },
  
  getByResourceId: async (resourceId) => {
    const response = await api.get(`/tasks/resource/${resourceId}`);
    return response.data;
  },
  
  getByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/tasks/dates?start=${startDate}&end=${endDate}`);
    return response.data;
  },
  
  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  
  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};

// Resources API calls
export const resourcesAPI = {
  getAll: async () => {
    const response = await api.get('/resources');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
  
  getByTaskId: async (taskId) => {
    const response = await api.get(`/resources/task/${taskId}`);
    return response.data;
  },
  
  getByRole: async (role) => {
    const response = await api.get(`/resources/role/${role}`);
    return response.data;
  },
  
  create: async (resourceData) => {
    const response = await api.post('/resources', resourceData);
    return response.data;
  },
  
  update: async (id, resourceData) => {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  }
};

export default api;
