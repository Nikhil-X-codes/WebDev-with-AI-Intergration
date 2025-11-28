import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
      
      
      // You can add custom error handling based on status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login if needed
          
          break;
        case 403:
          
          break;
        case 404:
          
          break;
        case 500:
          
          break;
        default:
          
      }
    } else if (error.request) {
      // Request was made but no response received
      
    } else {
      // Something else happened
      
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
