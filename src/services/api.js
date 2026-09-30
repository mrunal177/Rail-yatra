/**
 * RailConnect AI - API Communication Service
 * Built with Axios, includes request interceptors for JWT and error handling
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Attach Authorization Bearer token if present
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('railconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || error.message || 'Network request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;
