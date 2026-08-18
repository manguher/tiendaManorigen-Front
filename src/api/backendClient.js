import axios from 'axios';

const backendClient = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

backendClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Backend API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default backendClient;
