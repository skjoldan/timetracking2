import axios from 'axios';

const token = localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  headers: {
    Authorization: token ? `Bearer ${token}` : ''
  }
});

export default axiosInstance;
