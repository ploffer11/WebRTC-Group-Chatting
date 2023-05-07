import axios from 'axios';

import useAuthStore from '../store/auth';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const { access_token } = useAuthStore.getState();

  if (access_token !== '') {
    config.headers.Authorization = `Bearer ${
      useAuthStore.getState().access_token
    }`;
  }
  return config;
});

export default axiosInstance;
