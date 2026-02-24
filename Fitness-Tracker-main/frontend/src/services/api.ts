// src/services/api.ts - Axios client with JWT interceptors

import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: '/api', // Proxied through Vite to localhost:8080
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor. Add JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor. Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Clear tokens and force redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;