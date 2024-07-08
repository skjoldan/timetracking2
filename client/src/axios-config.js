import axios from 'axios';

const token = localStorage.getItem('token');
const baseURL = process.env.VUE_APP_API_BASE_URL || '/api';

console.log("API base URL in axios-config.js:", baseURL);

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: token ? `Bearer ${token}` : ''
  }
});

export default axiosInstance;
