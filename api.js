import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // backend URL
  timeout: 10000,
});

// Automatically attach token
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers['Authorization'] = `Bearer ${token}`;
    return req;
  },
  (error) => Promise.reject(error)
);

// Global error handler (optional)
API.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;

