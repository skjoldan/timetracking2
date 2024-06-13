import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api', // Use environment variable or fallback to `/api`
});

export default axiosInstance;
