import axios from 'axios';

const token = localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: '/api', // Use relative path
  headers: {
    Authorization: token ? `Bearer ${token}` : ''
  }
});

export default axiosInstance;
