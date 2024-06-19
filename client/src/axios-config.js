import axios from 'axios';

const token = localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    Authorization: token ? `Bearer ${token}` : ''
  }
});

export default axiosInstance;
