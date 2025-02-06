// src\api\axiosInstance.ts:
// src/api/axiosInstance.ts
import axios from 'axios';
import { store } from '../redux/store';
import { setUser } from '../redux/userSlice';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'; // Sử dụng biến môi trường hoặc giá trị mặc định

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Cho phép gửi cookie (nếu cần thiết cho refresh token)
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log("Interceptor Response: Error Status", error.response?.status); // Log status code

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Interceptor Response: 401 Error intercepted, attempting refresh token..."); // Log 401 interception

      try {
        console.log("Interceptor Response: Calling refresh token API..."); // Log refresh token request
        const refreshTokenResponse = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        console.log("Interceptor Response: Refresh token API Status", refreshTokenResponse.status); // Log refresh token response status

        if (refreshTokenResponse.status === 200) {
          const newAccessToken = (refreshTokenResponse.data as { data: { accessToken: string, user: any } }).data.accessToken;
          const user = (refreshTokenResponse.data as { data: { accessToken: string, user: any } }).data.user;

          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('user', JSON.stringify(user));
          store.dispatch(setUser(user));

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } else {
          console.log("Interceptor Response: Refresh token failed (non-200 status), redirecting to login"); // Log refresh token failure
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/auth/signin';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error("Interceptor Response: Error during refresh token process:", refreshError); // Log refresh token error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;