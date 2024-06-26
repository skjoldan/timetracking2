import axios from 'axios';

const token = localStorage.getItem('token');
const baseURL = process.env.VUE_APP_API_BASE_URL || window.location.origin + '/api'; // Default to the origin if not set

console.log("VUE_APP_API_BASE_URL in axios-config.js:", baseURL);

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: token ? `Bearer ${token}` : ''
  }
});

export default axiosInstance;
