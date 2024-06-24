import axios from 'axios';

const token = localStorage.getItem('token');

console.log("VUE_APP_API_BASE_URL in axios-config.js:", process.env.VUE_APP_API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL, // Use environment variable for base URL
  headers: {
    Authorization: token ? `Bearer ${token}` : ''
  }
});

export default axiosInstance;
