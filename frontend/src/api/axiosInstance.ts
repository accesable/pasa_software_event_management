// src/api/axiosInstance.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'; // Sử dụng biến môi trường hoặc giá trị mặc định

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Cho phép gửi cookie (nếu cần thiết cho refresh token)
});

export default axiosInstance;