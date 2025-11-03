import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_NODE_ENV === 'production' ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5300/',
  });

  console.log(import.meta.env.VITE_NODE_ENV);
export default axiosInstance;