// src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour injecter dynamiquement le token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('operateurToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;