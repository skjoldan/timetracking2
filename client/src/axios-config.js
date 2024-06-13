import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // Use relative URL for API requests
});

export default axiosInstance;
