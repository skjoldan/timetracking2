import axios from 'axios';

const token = localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  headers: {
    Authorization: token ? `Bearer ${token}` : ''
  }
});

console.log("VUE_APP_API_BASE_URL in axios-config.js:", process.env.VUE_APP_API_BASE_URL);

export default axiosInstance;
