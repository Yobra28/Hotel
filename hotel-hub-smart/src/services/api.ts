import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies if needed
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hotelToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/refresh-token')) {
      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('hotelRefreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken: refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          
          // Update tokens
          localStorage.setItem('hotelToken', token);
          localStorage.setItem('hotelRefreshToken', newRefreshToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('hotelToken');
        localStorage.removeItem('hotelRefreshToken');
        localStorage.removeItem('hotelUser');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;