import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://esportarena-q3t0.onrender.com/api';
// Creating a hepler function to get the access token from local storage
const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

// Creating a helper function to get the refresh token from local storage
const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

// Creating an axios instance with the base URL and default headers
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Creaed a request interceptor to add the access token to the Authorization header of each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Created a response interceptor to handle 401 errors and refresh the access token using the refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints to avoid redirect loops on login failures
    const isAuthEndpoint = originalRequest?.url?.includes('/accounts/login/') || originalRequest?.url?.includes('/accounts/register/') || originalRequest?.url?.includes('/accounts/token/refresh/');
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }
    
    // Checking if the error is a 401 Unauthorized and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/accounts/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        // Updating the Authorization header of the original request with the new access token and retrying the request
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If failed it send the user to login page clearing the local storage
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;